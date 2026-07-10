import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import { build } from "esbuild";

const validNativeDocument = {
  id: "native-slide",
  width: 1280,
  height: 720,
  meta: {
    version: 1,
    fidelity: "B",
    sourceRenderer: "legacy-template-converter",
    conversionStatus: "partial",
  },
  elements: [],
};

async function loadRouteHelper() {
  const tempDir = await mkdtemp(path.join(tmpdir(), "export-routing-test-"));
  const outfile = path.join(tempDir, "export-routing.mjs");
  await build({
    entryPoints: [
      fileURLToPath(
        new URL("../lib/pptx-model/export-routing.ts", import.meta.url),
      ),
    ],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    logLevel: "silent",
  });
  const module = await import(pathToFileURL(outfile).href);
  await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  return module.presentationToAipptDocument;
}

test("allows native export when every slide has a valid native document", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "valid deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      {
        id: "slide-2",
        content: {
          __aippt: {
            ...validNativeDocument,
            id: "native-slide-2",
            meta: { ...validNativeDocument.meta, fidelity: "C", conversionStatus: "background-fallback" },
          },
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 2);
  assert.equal(document?.slides[0].id, "native-slide");
});

test("rejects native export when any non-coal slide is missing native document", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "legacy deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      { id: "slide-2", layout_group: "modern", content: { title: "legacy only" } },
    ],
  });

  assert.equal(document, null);
});

test("rejects native export when any native document is invalid", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "invalid deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      {
        id: "slide-2",
        content: {
          __aippt: {
            id: "invalid-slide",
            width: 1280,
            height: 720,
            elements: [],
          },
        },
      },
    ],
  });

  assert.equal(document, null);
});

test("rejects native export when any native document is Level D", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "level d deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      {
        id: "slide-2",
        content: {
          __aippt: {
            ...validNativeDocument,
            id: "level-d-slide",
            meta: {
              version: 1,
              fidelity: "D",
              sourceRenderer: "native",
              conversionStatus: "legacy-only",
            },
          },
        },
      },
    ],
  });

  assert.equal(document, null);
});

test("allows coal-power slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "coal deck",
    slides: [
      {
        id: "coal-cover",
        layout_group: "taicang-coal-power-report",
        layout: "taicang-coal-power-report:coal-power-cover-slide",
        content: { title: "煤电项目" },
      },
    ],
  });

  assert.equal(document?.slides.length, 1);
  assert.equal(document?.slides[0].width, 1280);
});

test("allows blue-white coal slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "blue-white coal deck",
    slides: [
      {
        id: "coal-blue-white-image",
        layout_group: "taicang-coal-power-report",
        layout: "taicang-coal-power-report:coal-blue-white-image-showcase-slide",
        content: {
          title: "Images",
          images: [
            {
              label: "Slot",
              caption: "Caption",
              image: { __image_url__: "/slot.png", __image_prompt__: "slot prompt" },
            },
          ],
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 1);
  assert.equal(document?.slides[0].meta.sourceRenderer, "coal-power-builder");
  assert.ok(document?.slides[0].elements.some((element) => element.type === "image"));
});

test("repairs legacy coal-power stored documents without native metadata", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "coal deck",
    slides: [
      {
        id: "coal-cover",
        layout_group: "taicang-coal-power-report",
        layout: "taicang-coal-power-report:coal-power-cover-slide",
        content: {
          title: "鐓ょ數椤圭洰",
          __aippt: {
            id: "coal-cover",
            width: 1280,
            height: 720,
            elements: [
              {
                id: "cover-title",
                type: "text",
                x: 230,
                y: 210,
                w: 780,
                h: 88,
                text: "鐢ㄦ埛淇敼鏍囬",
                style: {
                  fontFace: "Microsoft YaHei",
                  fontSize: 34,
                  color: "C2410C",
                },
              },
            ],
          },
        },
      },
    ],
  });

  const title = document?.slides[0].elements.find(
    (element) => element.id === "cover-title",
  );
  assert.equal(document?.slides[0].meta.sourceRenderer, "coal-power-builder");
  assert.equal(title?.text, "鐢ㄦ埛淇敼鏍囬");
  assert.equal(title?.x, 230);
  assert.equal(title?.style.color, "C2410C");
});
