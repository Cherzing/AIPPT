import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "path";

import { sanitizeFilename } from "@/app/(presentation-generator)/utils/others";
import {
  BundledPresentationExportFormat,
  bundledExportPackageAvailable,
  runBundledPresentationExport,
} from "@/lib/run-bundled-presentation-export";
import {
  canExportCoalPowerNative,
  exportCoalPowerNativePptx,
  type NativePresentation,
} from "@/lib/native-pptx";
import { presentationToAipptDocument } from "@/lib/pptx-model/export-routing";
import { exportAipptModelPptx } from "@/lib/pptx-model/export-pptx";

function isValidFormat(value: unknown): value is BundledPresentationExportFormat {
  return value === "pdf" || value === "pptx";
}

async function readExportRequestBody(req: NextRequest): Promise<{
  format?: unknown;
  id?: unknown;
  mode?: unknown;
  title?: unknown;
}> {
  const rawBody = await req.text();
  if (!rawBody.trim()) {
    throw new Error("EMPTY_BODY");
  }

  const parsed = JSON.parse(rawBody) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("INVALID_BODY");
  }

  return parsed as { format?: unknown; id?: unknown; mode?: unknown; title?: unknown };
}

function buildExportDownloadUrl(outPath: string): string {
  const appDataDirectory = process.env.APP_DATA_DIRECTORY?.trim();
  if (!appDataDirectory) {
    throw new Error("APP_DATA_DIRECTORY is required to download exported files.");
  }

  const exportsDirectory = path.join(appDataDirectory, "exports");
  const relativePath = path.relative(exportsDirectory, outPath);
  if (
    !relativePath ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("Export finished outside the configured exports directory.");
  }

  return `/api/export-presentation/file?name=${encodeURIComponent(relativePath)}`;
}

function getFastApiBaseUrl(): string {
  const internal = process.env.FAST_API_INTERNAL_URL?.trim();
  if (internal) {
    return internal.replace(/\/+$/, "");
  }

  const configured = process.env.NEXT_PUBLIC_FAST_API?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:8000";
}

async function fetchPresentationForNativeExport(
  id: string,
  cookieHeader: string,
): Promise<NativePresentation | null> {
  if (!cookieHeader.trim()) {
    return null;
  }

  const response = await fetch(
    `${getFastApiBaseUrl()}/api/v1/ppt/presentation/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as NativePresentation;
}

async function tryNativePptxExport(params: {
  id: string;
  title?: string;
  cookieHeader: string;
}): Promise<string | null> {
  const presentation = await fetchPresentationForNativeExport(
    params.id,
    params.cookieHeader,
  );
  if (!presentation || !canExportCoalPowerNative(presentation)) {
    return null;
  }

  const appDataDirectory = process.env.APP_DATA_DIRECTORY?.trim();
  if (!appDataDirectory) {
    throw new Error("APP_DATA_DIRECTORY is required to export native PPTX files.");
  }

  const exportsDirectory = path.join(appDataDirectory, "exports");
  const safeTitle = sanitizeFilename(
    params.title || presentation.title || "coal-power-presentation",
  ).replace(/\.pptx$/i, "");
  const fileName = `${safeTitle || "coal-power-presentation"}-${Date.now()}.pptx`;
  const outPath = path.join(exportsDirectory, fileName);

  const { path: exportedPath } = await exportCoalPowerNativePptx({
    presentation,
    outPath,
    repoRoot: process.cwd(),
  });

  return exportedPath;
}

async function tryAipptModelPptxExport(params: {
  id: string;
  title?: string;
  cookieHeader: string;
}): Promise<string | null> {
  const presentation = await fetchPresentationForNativeExport(
    params.id,
    params.cookieHeader,
  );
  if (!presentation) return null;

  const document = presentationToAipptDocument(presentation);
  if (!document) return null;

  const appDataDirectory = process.env.APP_DATA_DIRECTORY?.trim();
  if (!appDataDirectory) {
    throw new Error("APP_DATA_DIRECTORY is required to export native PPTX files.");
  }

  const exportsDirectory = path.join(appDataDirectory, "exports");
  await fs.mkdir(exportsDirectory, { recursive: true });

  const safeTitle = sanitizeFilename(
    params.title || presentation.title || "aippt-presentation",
  ).replace(/\.pptx$/i, "");
  const fileName = `${safeTitle || "aippt-presentation"}-${Date.now()}.pptx`;
  const outPath = path.join(exportsDirectory, fileName);

  await exportAipptModelPptx({ document, outPath });
  return outPath;
}

async function waitForFile(filePath: string, timeoutMs = 60000): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const stats = await fs.stat(filePath);
      if (stats.isFile() && stats.size > 0) return;
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Export timed out before output file was created: ${filePath}`);
}

async function runLibreOfficePptxToPdf(params: {
  pptxPath: string;
  pdfPath: string;
  workDir: string;
}): Promise<void> {
  const sofficePath =
    process.env.LIBREOFFICE_PATH?.trim() ||
    process.env.SOFFICE_PATH?.trim() ||
    (process.platform === "win32" ? "soffice.exe" : "soffice");

  const profileDir = await fs.mkdtemp(
    path.join(params.workDir, "libreoffice-profile-"),
  );
  const outputDir = path.dirname(params.pdfPath);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      sofficePath,
      [
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--nodefault",
        "--nolockcheck",
        `-env:UserInstallation=file://${profileDir.replace(/\\/g, "/")}`,
        "--convert-to",
        "pdf",
        "--outdir",
        outputDir,
        params.pptxPath,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 8000) stdout = stdout.slice(-8000);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });
    child.on("error", (error) => {
      reject(
        new Error(
          `LibreOffice 启动失败，无法把 PPTX 转为 PDF。请确认镜像中已安装 libreoffice-impress。原始错误：${error.message}`,
        ),
      );
    });
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `LibreOffice PPTX 转 PDF 失败，退出码 ${code ?? "unknown"}${
            signal ? `，信号 ${signal}` : ""
          }。stdout: ${stdout || "(empty)"} stderr: ${stderr || "(empty)"}`,
        ),
      );
    });
  });

  const convertedPath = path.join(
    outputDir,
    `${path.basename(params.pptxPath, path.extname(params.pptxPath))}.pdf`,
  );
  await waitForFile(convertedPath);
  if (convertedPath !== params.pdfPath) {
    await fs.rename(convertedPath, params.pdfPath);
  }
  await fs.rm(profileDir, { recursive: true, force: true }).catch(() => undefined);
}

async function tryPptxBackedPdfExport(params: {
  id: string;
  title?: string;
  cookieHeader: string;
}): Promise<string> {
  const appDataDirectory = process.env.APP_DATA_DIRECTORY?.trim();
  if (!appDataDirectory) {
    throw new Error("APP_DATA_DIRECTORY is required to export PDF files.");
  }

  const exportsDirectory = path.join(appDataDirectory, "exports");
  await fs.mkdir(exportsDirectory, { recursive: true });

  const safeTitle = sanitizeFilename(
    params.title || "aippt-presentation",
  ).replace(/\.pdf$/i, "");
  const outPath = path.join(
    exportsDirectory,
    `${safeTitle || "aippt-presentation"}-${Date.now()}.pdf`,
  );

  const workDir = await fs.mkdtemp(
    path.join(process.env.TEMP_DIRECTORY?.trim() || exportsDirectory, "pdf-export-"),
  );

  try {
    let pptxPath = await tryAipptModelPptxExport({
      id: params.id,
      title: params.title,
      cookieHeader: params.cookieHeader,
    });

    if (!pptxPath) {
      pptxPath = await tryNativePptxExport({
        id: params.id,
        title: params.title,
        cookieHeader: params.cookieHeader,
      });
    }

    if (!pptxPath) {
      const { path: bundledPptxPath } = await runBundledPresentationExport({
        format: "pptx",
        presentationId: params.id,
        title: params.title,
        cookieHeader: params.cookieHeader,
      });
      pptxPath = bundledPptxPath;
    }

    await runLibreOfficePptxToPdf({
      pptxPath,
      pdfPath: outPath,
      workDir,
    });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }

  await waitForFile(outPath);
  return outPath;
}

export async function POST(req: NextRequest) {
  let body: Awaited<ReturnType<typeof readExportRequestBody>>;
  try {
    body = await readExportRequestBody(req);
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      (error instanceof Error &&
        (error.message === "EMPTY_BODY" || error.message === "INVALID_BODY"))
    ) {
      return NextResponse.json(
        { error: "Invalid export request JSON body" },
        { status: 400 }
      );
    }
    throw error;
  }

  const { format, id, mode, title } = body;
  const cookieHeader = req.headers.get("cookie") ?? "";

  if (typeof id !== "string" || !id.trim()) {
    return NextResponse.json(
      { error: "Missing Presentation ID" },
      { status: 400 }
    );
  }

  if (!isValidFormat(format)) {
    return NextResponse.json(
      { error: "Invalid export format" },
      { status: 400 }
    );
  }

  try {
    if (format === "pdf") {
      const outPath = await tryPptxBackedPdfExport({
        id: id.trim(),
        title: typeof title === "string" ? title : undefined,
        cookieHeader,
      });
      return NextResponse.json({
        success: true,
        path: buildExportDownloadUrl(outPath),
        exporter: "aippt-pptx-to-pdf",
      });
    }

    if (format === "pptx") {
      if (mode === "image") {
        return NextResponse.json(
          {
            error:
              "图片版 PPTX 导出需要浏览器截图服务，当前接口已预留但尚未启用。",
            success: false,
          },
          { status: 501 },
        );
      }

      const modelOutPath = await tryAipptModelPptxExport({
        id: id.trim(),
        title: typeof title === "string" ? title : undefined,
        cookieHeader,
      });
      if (modelOutPath) {
        return NextResponse.json({
          success: true,
          path: buildExportDownloadUrl(modelOutPath),
          exporter: "aippt-model-pptx",
        });
      }

      const nativeOutPath = await tryNativePptxExport({
        id: id.trim(),
        title: typeof title === "string" ? title : undefined,
        cookieHeader,
      });
      if (nativeOutPath) {
        return NextResponse.json({
          success: true,
          path: buildExportDownloadUrl(nativeOutPath),
          exporter: "native-pptx",
        });
      }
    }

    if (!(await bundledExportPackageAvailable())) {
      throw new Error(
        "presentation-export runtime is not available. Run scripts/sync-presentation-export.cjs to install it."
      );
    }

    const { path: outPath } = await runBundledPresentationExport({
      format,
      presentationId: id.trim(),
      title: typeof title === "string" ? title : undefined,
      cookieHeader,
    });

    return NextResponse.json({
      success: true,
      path: buildExportDownloadUrl(outPath),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[export-presentation:${format}]`, message);
    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    );
  }
}
