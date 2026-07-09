import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { build } from "esbuild";

const repoRoot = path.resolve(import.meta.dirname, "..");

async function importModule(sourceRelativePath) {
  const sourceFile = path.join(repoRoot, sourceRelativePath);
  const outFile = path.join(
    os.tmpdir(),
    `aippt-model-${path.basename(sourceRelativePath)}-${Date.now()}.mjs`,
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

function readZipEntry(filePath, entryName) {
  const script = [
    "import sys, zipfile",
    "with zipfile.ZipFile(sys.argv[1]) as z:",
    "    sys.stdout.write(z.read(sys.argv[2]).decode('utf-8', errors='ignore'))",
  ].join("\n");
  return execFileSync("python", ["-c", script, filePath, entryName], {
    encoding: "utf8",
  });
}

test("converts 1280x720 pixel boxes to 16:9 PPTX inches", async () => {
  const { boxToPptx, pxToIn, ptToPx } = await importModule(
    "lib/pptx-model/geometry.ts",
  );

  assert.equal(pxToIn(0), 0);
  assert.equal(pxToIn(1280), 13.3333);
  assert.equal(pxToIn(720), 7.5);
  assert.deepEqual(boxToPptx({ x: 64, y: 72, w: 640, h: 360 }), {
    x: 0.6667,
    y: 0.75,
    w: 6.6667,
    h: 3.75,
  });
  assert.equal(ptToPx(18), 24);
});

test("exports model text, shape, and table as native pptx elements", async () => {
  const { exportAipptModelPptx } = await importModule(
    "lib/pptx-model/export-pptx.ts",
  );
  const outPath = path.join(os.tmpdir(), `aippt-model-${Date.now()}.pptx`);

  await exportAipptModelPptx({
    outPath,
    document: {
      title: "模型导出测试",
      slides: [
        {
          id: "slide-1",
          width: 1280,
          height: 720,
          background: { type: "solid", color: "FFFFFF" },
          elements: [
            {
              id: "title",
              type: "text",
              x: 80,
              y: 60,
              w: 600,
              h: 60,
              text: "模型标题",
              style: {
                fontFace: "Microsoft YaHei",
                fontSize: 28,
                color: "123456",
                bold: true,
                align: "left",
                valign: "middle",
                margin: [0, 0, 0, 0],
              },
            },
            {
              id: "panel",
              type: "shape",
              shape: "rect",
              x: 80,
              y: 150,
              w: 400,
              h: 120,
              fill: { color: "EDF6FF" },
              line: { color: "057DC1", width: 1 },
            },
            {
              id: "table",
              type: "table",
              x: 80,
              y: 320,
              w: 700,
              h: 120,
              columns: [220, 240, 240],
              rows: [
                [
                  { text: "指标", fill: "057DC1", color: "FFFFFF", bold: true },
                  { text: "计划", fill: "057DC1", color: "FFFFFF", bold: true },
                  { text: "完成", fill: "057DC1", color: "FFFFFF", bold: true },
                ],
                [
                  { text: "进度" },
                  { text: "按期" },
                  { text: "完成" },
                ],
              ],
              style: {
                fontFace: "Microsoft YaHei",
                fontSize: 13,
                color: "111827",
                borderColor: "D6DDE3",
              },
            },
          ],
        },
      ],
    },
  });

  assert.equal(fs.existsSync(outPath), true);
  const slideXml = readZipEntry(outPath, "ppt/slides/slide1.xml");
  assert.match(slideXml, /模型标题/);
  assert.match(slideXml, /模型导出测试|模型标题/);
  assert.match(slideXml, /057DC1/);
  assert.match(slideXml, /EDF6FF/);
});

test("converts coal-power layouts into unified AIPPT slide documents", async () => {
  const { buildCoalPowerAipptSlideDocument } = await importModule(
    "lib/pptx-model/coal-power-template.ts",
  );
  const layouts = [
    "coal-power-cover-slide",
    "coal-power-agenda-slide",
    "coal-power-section-divider-slide",
    "coal-power-kpi-snapshot-slide",
    "coal-power-two-column-progress-slide",
    "coal-power-timeline-slide",
    "coal-power-performance-comparison-slide",
    "coal-power-card-grid-slide",
    "coal-power-settlement-dashboard-slide",
    "coal-power-closing-slide",
  ];

  for (const [index, layout] of layouts.entries()) {
    const document = buildCoalPowerAipptSlideDocument({
      id: `slide-${index}`,
      index,
      layout_group: "taicang-coal-power-report",
      layout: `taicang-coal-power-report:${layout}`,
      content: {
        title: "测试标题",
        items: [{ number: "01", title: "测试章节" }],
        metrics: [{ value: "1000MW", label: "装机容量" }],
        rows: [["1", "锅炉效率", "设计值", "%", "实测值", "实测值"]],
        columns: ["序号", "指标名称", "设计值", "单位", "A", "B"],
        cards: [{ title: "测试卡片", lines: ["测试内容"], desc: "测试说明" }],
      },
    });

    assert.equal(document.width, 1280);
    assert.equal(document.height, 720);
    assert.ok(document.elements.length > 0);
  }
});

test("exports converted coal-power model slides with template background assets", async () => {
  const { buildCoalPowerAipptSlideDocument } = await importModule(
    "lib/pptx-model/coal-power-template.ts",
  );
  const { exportAipptModelPptx } = await importModule(
    "lib/pptx-model/export-pptx.ts",
  );
  const cover = buildCoalPowerAipptSlideDocument({
    id: "coal-cover",
    index: 0,
    layout_group: "taicang-coal-power-report",
    layout: "taicang-coal-power-report:coal-power-cover-slide",
    content: { title: "煤电项目汇报", organization: "测试单位" },
  });
  const performance = buildCoalPowerAipptSlideDocument({
    id: "coal-performance",
    index: 1,
    layout_group: "taicang-coal-power-report",
    layout: "taicang-coal-power-report:coal-power-performance-comparison-slide",
    content: {
      title: "运行性能指标",
      rows: [["1", "锅炉效率", "设计值", "%", "实测值", "实测值"]],
    },
  });
  const outPath = path.join(os.tmpdir(), `aippt-coal-model-${Date.now()}.pptx`);

  await exportAipptModelPptx({
    outPath,
    document: { title: "煤电模型导出", slides: [cover, performance] },
  });

  assert.equal(fs.existsSync(outPath), true);
  const slide1Xml = readZipEntry(outPath, "ppt/slides/slide1.xml");
  const slide2Xml = readZipEntry(outPath, "ppt/slides/slide2.xml");
  assert.match(slide1Xml, /煤电项目汇报/);
  assert.match(slide2Xml, /运行性能指标/);
  assert.match(slide2Xml, /锅炉效率/);
});

test("repairs stale coal-power cover documents with invisible white text", async () => {
  const { repairCoalPowerAipptSlideDocument } = await importModule(
    "lib/pptx-model/coal-power-template.ts",
  );

  const repaired = repairCoalPowerAipptSlideDocument(
    {
      id: "coal-cover",
      index: 0,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-cover-slide",
      content: { title: "语义标题" },
    },
    {
      id: "coal-cover",
      width: 1280,
      height: 720,
      background: { type: "image", src: "/template-assets/taicang-coal-power-report/chapter-bg.png" },
      elements: [
        {
          id: "cover-title",
          type: "text",
          x: 84,
          y: 206,
          w: 820,
          h: 78,
          text: "用户编辑标题",
          style: {
            fontFace: "Microsoft YaHei",
            fontSize: 40,
            color: "FFFFFF",
          },
        },
      ],
    },
  );

  const title = repaired.elements.find((element) => element.id === "cover-title");
  assert.equal(title.text, "用户编辑标题");
  assert.equal(title.style.color, "0B3B78");
  assert.equal(title.x, 140);
  assert.equal(title.y, 240);
});

test("repairs coal-power cover documents without dropping inserted elements", async () => {
  const { repairCoalPowerAipptSlideDocument } = await importModule(
    "lib/pptx-model/coal-power-template.ts",
  );

  const repaired = repairCoalPowerAipptSlideDocument(
    {
      id: "coal-cover",
      index: 0,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-cover-slide",
      content: { title: "语义标题" },
    },
    {
      id: "coal-cover",
      width: 1280,
      height: 720,
      elements: [
        {
          id: "cover-title",
          type: "text",
          x: 84,
          y: 206,
          w: 820,
          h: 78,
          text: "用户编辑标题",
          style: {
            fontFace: "Microsoft YaHei",
            fontSize: 40,
            color: "FFFFFF",
          },
        },
        {
          id: "text-user-inserted",
          type: "text",
          x: 300,
          y: 360,
          w: 280,
          h: 52,
          text: "双击编辑文本",
          style: {
            fontFace: "Microsoft YaHei",
            fontSize: 22,
            color: "111827",
          },
        },
      ],
    },
  );

  const inserted = repaired.elements.find(
    (element) => element.id === "text-user-inserted",
  );
  assert.equal(inserted?.text, "双击编辑文本");
  assert.equal(inserted?.x, 300);
  assert.equal(inserted?.y, 360);
});

test("edits slide documents with duplicate, reorder, and style operations", async () => {
  const {
    addAipptElement,
    createAipptChartElement,
    createAipptFormulaElement,
    createAipptImageElement,
    createAipptLineElement,
    createAipptMediaElement,
    createAipptShapeElement,
    createAipptTableElement,
    createAipptTextElement,
    deleteAipptElement,
    duplicateAipptElement,
    moveAipptElementLayer,
    updateAipptElement,
  } = await importModule("lib/pptx-model/editing.ts");
  const document = {
    id: "slide-edit",
    width: 1280,
    height: 720,
    elements: [
      {
        id: "title",
        type: "text",
        x: 80,
        y: 80,
        w: 300,
        h: 60,
        text: "标题",
        style: { fontFace: "Microsoft YaHei", fontSize: 24, color: "111827" },
      },
      {
        id: "panel",
        type: "shape",
        shape: "rect",
        x: 120,
        y: 180,
        w: 240,
        h: 120,
        fill: { color: "F1F6FB" },
        line: { color: "057DC1", width: 1 },
      },
    ],
  };

  const updated = updateAipptElement(document, "title", (element) => ({
    ...element,
    x: 100,
  }));
  assert.equal(updated.elements[0].x, 100);
  assert.equal(document.elements[0].x, 80);

  const duplicated = duplicateAipptElement(document, "title");
  assert.equal(duplicated.elements.length, 3);
  assert.match(duplicated.elements[1].id, /^title-copy-/);
  assert.equal(duplicated.elements[1].x, 104);
  assert.equal(duplicated.elements[1].y, 104);

  const sentBackward = moveAipptElementLayer(document, "panel", "backward");
  assert.equal(sentBackward.elements[0].id, "panel");
  assert.equal(sentBackward.elements[1].id, "title");

  const added = addAipptElement(document, {
    id: "new-text",
    type: "text",
    x: 20,
    y: 20,
    w: 200,
    h: 40,
    text: "新文本",
    style: { fontFace: "Microsoft YaHei", fontSize: 18, color: "057DC1" },
  });
  assert.equal(added.elements.at(-1).id, "new-text");

  const deleted = deleteAipptElement(document, "title");
  assert.deepEqual(
    deleted.elements.map((element) => element.id),
    ["panel"],
  );

  const inserted = [
    createAipptTextElement("insert-text"),
    createAipptShapeElement("insert-shape"),
    createAipptImageElement("insert-image"),
    createAipptLineElement("insert-line"),
    createAipptChartElement("insert-chart"),
    createAipptTableElement("insert-table"),
    createAipptFormulaElement("insert-formula"),
    createAipptMediaElement("insert-media", "video"),
    createAipptMediaElement("insert-audio", "audio"),
    { ...createAipptShapeElement("insert-diamond"), shape: "diamond" },
    { ...createAipptShapeElement("insert-arrow"), shape: "rightArrow" },
    {
      ...createAipptLineElement("insert-polyline"),
      lineType: "polyline",
      points: [{ x: 180, y: 260 }],
    },
    {
      ...createAipptLineElement("insert-curve"),
      lineType: "curve",
      controlPoints: [{ x: 340, y: 120 }],
    },
  ];

  assert.deepEqual(
    inserted.map((element) => element.type),
    [
      "text",
      "shape",
      "image",
      "line",
      "chart",
      "table",
      "formula",
      "media",
      "media",
      "shape",
      "shape",
      "line",
      "line",
    ],
  );
  assert.equal(inserted[4].chartType, "bar");
  assert.equal(inserted[5].rows.length, 3);
  assert.equal(inserted[6].latex.includes("E=mc"), true);
  assert.equal(inserted[7].mediaType, "video");
  assert.equal(inserted[8].mediaType, "audio");
  assert.equal(inserted[9].shape, "diamond");
  assert.equal(inserted[10].shape, "rightArrow");
  assert.equal(inserted[11].lineType, "polyline");
  assert.equal(inserted[12].lineType, "curve");
});

test("updates native image source and prompt without changing other elements", async () => {
  const { updateAipptImageElementSource } = await importModule("lib/pptx-model/editing.ts");
  const document = {
    id: "slide-image-edit",
    width: 1280,
    height: 720,
    elements: [
      {
        id: "hero-image",
        type: "image",
        x: 100,
        y: 120,
        w: 420,
        h: 240,
        src: "/old.png",
        fit: "cover",
        prompt: "old image prompt",
      },
      {
        id: "title",
        type: "text",
        x: 80,
        y: 80,
        w: 300,
        h: 60,
        text: "Title",
        style: { fontFace: "Microsoft YaHei", fontSize: 24, color: "111827" },
      },
    ],
  };

  const updated = updateAipptImageElementSource(
    document,
    "hero-image",
    "/new.png",
    "new generated prompt",
  );

  assert.equal(updated.elements[0].src, "/new.png");
  assert.equal(updated.elements[0].prompt, "new generated prompt");
  assert.equal(updated.elements[0].fit, "cover");
  assert.equal(updated.elements[1], document.elements[1]);
  assert.equal(document.elements[0].src, "/old.png");
});
