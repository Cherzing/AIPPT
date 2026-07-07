import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { build } from "esbuild";

const repoRoot = path.resolve(import.meta.dirname, "..");
const sourceFile = path.join(
  repoRoot,
  "lib",
  "native-pptx",
  "coal-power-exporter.ts",
);

async function importExporter() {
  const outFile = path.join(
    os.tmpdir(),
    `coal-power-exporter-${Date.now()}.mjs`,
  );
  await build({
    entryPoints: [sourceFile],
    outfile: outFile,
    bundle: true,
    platform: "node",
    format: "esm",
    logLevel: "silent",
  });
  return import(pathToFileURL(outFile).href);
}

function listZipEntries(filePath) {
  const script = [
    "import sys, zipfile",
    "with zipfile.ZipFile(sys.argv[1]) as z:",
    "    print('\\n'.join(z.namelist()))",
  ].join("\n");
  return execFileSync("python", ["-c", script, filePath], {
    encoding: "utf8",
  })
    .split(/\r?\n/)
    .filter(Boolean);
}

function readZipEntry(filePath, entryName) {
  const script = [
    "import sys, zipfile",
    "with zipfile.ZipFile(sys.argv[1]) as z:",
    "    raw = z.read(sys.argv[2])",
    "    try:",
    "        text = raw.decode('utf-8')",
    "    except UnicodeDecodeError:",
    "        text = raw.decode('gb18030', errors='ignore')",
    "    sys.stdout.write(text)",
  ].join("\n");
  return execFileSync("python", ["-c", script, filePath, entryName], {
    encoding: "utf8",
  });
}

const presentation = {
  id: "native-coal-power-test",
  title: "煤电项目汇报",
  slides: [
    {
      index: 0,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-cover-slide",
      content: {
        title: "新投产煤电项目汇报",
        organization: "某能源开发有限公司",
        presenter: "汇报人：张三",
      },
    },
    {
      index: 1,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-agenda-slide",
      content: {
        title: "汇报提纲",
        items: [
          { number: "01", title: "项目概况" },
          { number: "02", title: "建设进展" },
        ],
      },
    },
    {
      index: 2,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-section-divider-slide",
      content: { number: "01", title: "项目概况", subtitle: "建设与投产情况" },
    },
    {
      index: 3,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-kpi-snapshot-slide",
      content: {
        title: "项目建设概况与关键节点总览",
        metrics: [{ value: "1000MW", label: "建设规模" }],
        leftBlock: { heading: "项目概况", body: "项目名称：测试项目\n建设单位：测试单位" },
        rightBlock: { heading: "建设成果", body: "质量、安全、进度总体受控" },
        timeline: [{ date: "2026.01", text: "完成投产移交" }],
        coreMetrics: [{ value: "100%", label: "完成率" }],
        conclusion: "项目建设、投产和运营工作总体受控。",
      },
    },
    {
      index: 4,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-two-column-progress-slide",
      content: {
        title: "建设收尾与整改工作按计划推进",
        leftItems: ["主体施工完成", "设备调试完成"],
        rightItems: ["资料移交推进", "现场整改闭环"],
      },
    },
    {
      index: 5,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-timeline-slide",
      content: {
        title: "专项工程节点明确",
        cards: [{ title: "专项工程一", status: "推进中", plan: "方案 → 审批 → 实施", desc: "按计划推进。" }],
      },
    },
    {
      index: 6,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-performance-comparison-slide",
      content: {
        title: "运行性能指标对标分析",
        rows: [["1", "锅炉效率", "设计值", "%", "实测值", "实测值"]],
      },
    },
    {
      index: 7,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-card-grid-slide",
      content: {
        title: "煤炭厂的作用与发展方向",
        columns: ["方面", "说明"],
        rows: [
          ["核心作用", "煤炭清洁高效利用的关键环节"],
          ["技术应用", "通过现代选煤技术提升煤炭品质"],
          ["产业服务", "满足下游产业需求"],
          ["发展约束", "在安全环保框架下运营"],
          ["未来趋势", "朝着智能化、绿色化的可持续发展方向迈进"],
        ],
        conclusion: "煤炭厂通过技术升级与可持续发展策略，在保障清洁高效利用的同时，推动产业升级。",
      },
    },
    {
      index: 8,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-settlement-dashboard-slide",
      content: {
        title: "智慧电厂建设稳步推进",
        body: "围绕生产管理、设备状态监测、智能巡检等场景展开。",
        placeholder: "系统界面 / 架构图占位",
      },
    },
    {
      index: 9,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-closing-slide",
      content: { title: "谢谢！", message: "汇报结束", organization: "某能源开发有限公司" },
    },
  ],
};

test("exports coal-power template through native PPTX primitives", async () => {
  const { canExportCoalPowerNative, exportCoalPowerNativePptx } =
    await importExporter();
  const outPath = path.join(
    os.tmpdir(),
    `coal-power-native-${Date.now()}.pptx`,
  );

  assert.equal(canExportCoalPowerNative(presentation), true);
  await exportCoalPowerNativePptx({ presentation, outPath, repoRoot });

  const stats = fs.statSync(outPath);
  assert.ok(stats.size > 10_000, `expected a non-trivial pptx, got ${stats.size}`);

  const signature = fs.readFileSync(outPath).subarray(0, 2).toString("utf8");
  assert.equal(signature, "PK");

  const entries = listZipEntries(outPath);
  assert.ok(entries.includes("[Content_Types].xml"));
  assert.ok(entries.includes("ppt/presentation.xml"));
  assert.ok(entries.includes("ppt/slides/slide1.xml"));
  assert.ok(entries.includes("ppt/slides/slide10.xml"));
});

test("does not native-export non coal-power layouts", async () => {
  const { canExportCoalPowerNative } = await importExporter();

  assert.equal(
    canExportCoalPowerNative({
      title: "苏州：东方威尼斯",
      slides: [
        {
          index: 0,
          layout_group: "product-overview",
          layout: "product-overview:cover-slide",
          content: { title: "苏州：东方威尼斯" },
        },
      ],
    }),
    false,
  );
});

test("keeps explicitly empty coal-power arrays empty", async () => {
  const { exportCoalPowerNativePptx } = await importExporter();
  const outPath = path.join(
    os.tmpdir(),
    `coal-power-empty-arrays-${Date.now()}.pptx`,
  );

  await exportCoalPowerNativePptx({
    outPath,
    repoRoot,
    presentation: {
      title: "空数组测试",
      slides: [
        {
          index: 0,
          layout_group: "taicang-coal-power-report",
          layout: "taicang-coal-power-report:coal-power-kpi-snapshot-slide",
          content: {
            title: "煤炭洗选工艺流程",
            metrics: [],
            leftBlock: {
              heading: "入料预处理",
              body: "原煤首先经过破碎和筛分。",
            },
            rightBlock: {
              heading: "分选与产品处理",
              body: "预处理后的煤进入洗选环节。",
            },
            timeline: [],
            coreMetrics: [],
            conclusion: "该工艺流程通过破碎、筛分、分选及脱水干燥等步骤。",
          },
        },
      ],
    },
  });

  const slideXml = readZipEntry(outPath, "ppt/slides/slide1.xml");
  assert.doesNotMatch(slideXml, /YYYY\\.MM/);
});

test("exports coal-power card-grid slide as table layout", async () => {
  const { exportCoalPowerNativePptx } = await importExporter();
  const outPath = path.join(
    os.tmpdir(),
    `coal-power-table-layout-${Date.now()}.pptx`,
  );

  await exportCoalPowerNativePptx({
    outPath,
    repoRoot,
    presentation: {
      title: "表格版式测试",
      slides: [
        {
          index: 0,
          layout_group: "taicang-coal-power-report",
          layout: "taicang-coal-power-report:coal-power-card-grid-slide",
          content: {
            title: "煤炭厂的作用与发展方向",
            columns: ["方面", "说明"],
            rows: [
              ["核心作用", "煤炭清洁高效利用的关键环节"],
              ["未来趋势", "朝着智能化、绿色化的可持续发展方向迈进"],
            ],
            conclusion: "煤炭厂通过技术升级与可持续发展策略，推动产业升级。",
          },
        },
      ],
    },
  });

  const slideXml = readZipEntry(outPath, "ppt/slides/slide1.xml");
  assert.match(slideXml, /<a:srgbClr val="057DC1"\/>/);
  assert.match(slideXml, /<a:srgbClr val="F1F4F7"\/>/);
  assert.match(slideXml, /<a:srgbClr val="18A34A"\/>/);
  assert.match(slideXml, /<a:off x="628650" y="1543050"\/>/);
  assert.match(slideXml, /<a:ext cx="10287000" cy="400050"\/>/);
  assert.doesNotMatch(slideXml, /sz="2400"/);
});
