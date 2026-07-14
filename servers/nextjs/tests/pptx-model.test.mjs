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
  const { validateNativeSlideDocument } = await importModule(
    "lib/pptx-model/native-schema.ts",
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
    const validation = validateNativeSlideDocument(document);
    assert.equal(validation.valid, true);
    assert.equal(document.meta.sourceRenderer, "coal-power-builder");
  }
});

test("converts blue-white coal layouts into editable AIPPT elements", async () => {
  const { buildCoalPowerAipptSlideDocument } = await importModule(
    "lib/pptx-model/coal-power-template.ts",
  );
  const { validateNativeSlideDocument } = await importModule(
    "lib/pptx-model/native-schema.ts",
  );
  const layouts = [
    "coal-blue-white-cover-slide",
    "coal-blue-white-agenda-slide",
    "coal-blue-white-section-slide",
    "coal-blue-white-standard-content-slide",
    "coal-blue-white-two-column-slide",
    "coal-blue-white-metrics-slide",
    "coal-blue-white-table-slide",
    "coal-blue-white-timeline-slide",
    "coal-blue-white-card-grid-slide",
    "coal-blue-white-image-showcase-slide",
    "coal-blue-white-process-slide",
    "coal-blue-white-closing-slide",
  ];

  for (const [index, layout] of layouts.entries()) {
    const document = buildCoalPowerAipptSlideDocument({
      id: `blue-white-${index}`,
      index,
      layout_group: "taicang-coal-power-report",
      layout: `taicang-coal-power-report:${layout}`,
      content: {
        title: "Editable blue-white title",
        organization: "Editable organization",
        presenter: "Editable presenter",
        number: "01",
        subtitle: "Editable subtitle",
        items: [{ number: "01", title: "Editable agenda item" }],
        points: [{ number: "1", title: "Editable point", body: "Editable body" }],
        leftTitle: "Left title",
        leftBody: "Left body",
        leftImage: { __image_url__: "/left.png", __image_prompt__: "left prompt" },
        rightTitle: "Right title",
        rightBody: "Right body",
        rightImage: { __image_url__: "/right.png", __image_prompt__: "right prompt" },
        metrics: [{ value: "100", label: "Editable metric" }],
        conclusion: "Editable conclusion",
        columns: ["A", "B", "C"],
        rows: [["1", "2", "3"]],
        cards: [{ number: "01", title: "Card", body: "Card body" }],
        images: [
          {
            label: "Image slot",
            caption: "Editable caption",
            image: { __image_url__: "/slot.png", __image_prompt__: "slot prompt" },
          },
        ],
        steps: [{ number: "01", title: "Step" }],
        note: "Editable note",
        summary: "Editable summary",
      },
    });

    assert.equal(document.width, 1280);
    assert.equal(document.height, 720);
    assert.ok(document.elements.length > 0);
    assert.equal(validateNativeSlideDocument(document).valid, true);
    assert.equal(document.meta.sourceRenderer, "coal-power-builder");
  }

  const imageDocument = buildCoalPowerAipptSlideDocument({
    id: "blue-white-image",
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
  });
  assert.ok(imageDocument.elements.some((element) => element.type === "image"));
  assert.ok(imageDocument.elements.some((element) => element.type === "text"));

  const tableDocument = buildCoalPowerAipptSlideDocument({
    id: "blue-white-table",
    layout_group: "taicang-coal-power-report",
    layout: "taicang-coal-power-report:coal-blue-white-table-slide",
    content: {
      title: "Table",
      columns: ["A", "B"],
      rows: [["1", "2"]],
    },
  });
  assert.ok(tableDocument.elements.some((element) => element.type === "table"));
});

test("converts general layouts into high-fidelity editable AIPPT elements", async () => {
  const { buildGeneralAipptSlideDocument } = await importModule(
    "lib/pptx-model/general-template.ts",
  );
  const { validateNativeSlideDocument } = await importModule(
    "lib/pptx-model/native-schema.ts",
  );
  const layouts = [
    "general-intro-slide",
    "basic-info-slide",
    "bullet-icons-only-slide",
    "bullet-with-icons-slide",
    "chart-with-bullets-slide",
    "metrics-slide",
    "metrics-with-image-slide",
    "numbered-bullets-slide",
    "quote-slide",
    "table-info-slide",
    "table-of-contents-slide",
    "team-slide",
  ];

  for (const [index, layout] of layouts.entries()) {
    const document = buildGeneralAipptSlideDocument({
      id: `general-${index}`,
      index,
      layout_group: "general",
      layout: `general:${layout}`,
      content: {
        title: "Editable general title",
        heading: "Editable quote heading",
        description: "Editable description text for the general native template.",
        presenterName: "Jane Doe",
        presentationDate: "July 2026",
        quote: "Editable quotation text that remains selectable.",
        author: "Author Name",
        image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
        backgroundImage: { __image_url__: "/background.png", __image_prompt__: "background prompt" },
        bulletPoints: [
          {
            title: "Editable point",
            subtitle: "Editable subtitle",
            description: "Editable point description.",
            icon: { __icon_url__: "/static/icons/bold/checks-bold.svg", __icon_query__: "check" },
          },
          {
            title: "Second point",
            subtitle: "Second subtitle",
            description: "Second point description.",
            icon: { __icon_url__: "/static/icons/bold/code-bold.svg", __icon_query__: "code" },
          },
        ],
        metrics: [
          { label: "Clients", value: "200+", description: "Editable metric description." },
          { label: "Growth", value: "35%", description: "Second metric description." },
        ],
        chartData: {
          type: "bar",
          data: [
            { name: "Q1", value: 12 },
            { name: "Q2", value: 18 },
            { name: "Q3", value: 24 },
          ],
        },
        tableData: {
          headers: ["Company", "Revenue", "Growth"],
          rows: [
            ["A", "$2M", "15%"],
            ["B", "$3M", "20%"],
          ],
        },
        sections: [
          { number: 1, title: "Problem", pageNumber: "03" },
          { number: 2, title: "Solution", pageNumber: "04" },
        ],
        companyDescription: "Editable company description.",
        teamMembers: [
          {
            name: "Alex Chen",
            position: "CEO",
            description: "Editable team member description.",
            image: { __image_url__: "/alex.png", __image_prompt__: "headshot" },
          },
          {
            name: "Sam Lee",
            position: "CTO",
            description: "Editable team member description.",
            image: { __image_url__: "/sam.png", __image_prompt__: "headshot" },
          },
        ],
      },
    });

    assert.equal(document.width, 1280);
    assert.equal(document.height, 720);
    assert.ok(document.elements.length > 0);
    assert.equal(validateNativeSlideDocument(document).valid, true);
    assert.equal(document.meta.sourceRenderer, "general-template-builder");
    assert.equal(document.meta.sourceTemplate, "general");
    assert.equal(document.meta.fidelity, "A");
  }

  const imageDocument = buildGeneralAipptSlideDocument({
    id: "general-image",
    layout_group: "general",
    layout: "general:metrics-with-image-slide",
    content: {
      title: "Image slide",
      description: "Description",
      image: { __image_url__: "/editable-image.png", __image_prompt__: "editable image" },
      metrics: [{ label: "Metric", value: "100" }],
    },
  });
  assert.ok(imageDocument.elements.some((element) => element.type === "image" && element.id === "main-image"));

  const chartDocument = buildGeneralAipptSlideDocument({
    id: "general-chart",
    layout_group: "general",
    layout: "general:chart-with-bullets-slide",
    content: {
      title: "Chart slide",
      description: "Description",
      chartData: {
        type: "bar",
        data: [
          { name: "A", value: 1 },
          { name: "B", value: 2 },
        ],
      },
      bulletPoints: [{ title: "Point", description: "Description", icon: {} }],
    },
  });
  assert.ok(chartDocument.elements.some((element) => element.type === "chart"));

  const tableDocument = buildGeneralAipptSlideDocument({
    id: "general-table",
    layout_group: "general",
    layout: "general:table-info-slide",
    content: {
      title: "Table slide",
      description: "Description",
      tableData: {
        headers: ["A", "B"],
        rows: [["1", "2"]],
      },
    },
  });
  assert.ok(tableDocument.elements.some((element) => element.type === "table"));
});

test("converts modern layouts into high-fidelity editable AIPPT elements", async () => {
  const { buildModernAipptSlideDocument } = await importModule(
    "lib/pptx-model/modern-template.ts",
  );
  const { validateNativeSlideDocument } = await importModule(
    "lib/pptx-model/native-schema.ts",
  );
  const layouts = [
    "intro-pitchdeck-slide",
    "bullet-with-icons-description-grid",
    "bullet-with-icons",
    "chart-or-table-with-description",
    "chart-with-metrics",
    "image-and-description",
    "image-list-with-description",
    "images-with-description",
    "metrics-with-description-image",
    "table-of-contents",
  ];

  for (const [index, layout] of layouts.entries()) {
    const document = buildModernAipptSlideDocument({
      id: `modern-${index}`,
      index,
      layout_group: "modern",
      layout: `modern:${layout}`,
      content: {
        title: "Editable modern title",
        description: "Editable description text for the modern native template.",
        introCard: { enabled: true, name: "Jane Doe", date: "July 2026" },
        image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
        mapImage: { __image_url__: "/map.png", __image_prompt__: "map prompt" },
        content: "Editable content paragraph for the image-and-description layout.",
        mainDescription: "Editable main description for the icon grid layout.",
        subtitle: "Editable subtitle",
        problemCategories: [
          {
            title: "Inefficiency",
            description: "Businesses struggle with fragmented processes.",
            icon: { __icon_url__: "/static/icons/bold/checks-bold.svg", __icon_query__: "check" },
          },
          {
            title: "High Costs",
            description: "Legacy systems increase operating costs.",
            icon: { __icon_url__: "/static/icons/bold/video-bold.svg", __icon_query__: "cost" },
          },
        ],
        sections: [
          {
            title: "Market",
            description: "Data-driven market positioning.",
            icon: { __icon_url__: "/static/icons/bold/checks-bold.svg", __icon_query__: "market" },
          },
          {
            title: "Industry",
            description: "Operational improvements at scale.",
            icon: { __icon_url__: "/static/icons/bold/video-bold.svg", __icon_query__: "industry" },
          },
        ],
        mode: "chart",
        columns: ["Column 1", "Column 2", "Column 3"],
        rows: [{ cells: ["Row A", "Value", "123"] }],
        chart: {
          type: "bar",
          data: [
            { label: "A", value: 60 },
            { label: "B", value: 42 },
            { label: "C", value: 75 },
          ],
          showLabels: true,
        },
        growthStats: [
          { year: "2022", artificialIntelligence: 10, internetOfThings: 20, others: 15 },
          { year: "2023", artificialIntelligence: 18, internetOfThings: 28, others: 22 },
          { year: "2024", artificialIntelligence: 26, internetOfThings: 36, others: 30 },
        ],
        tableMode: false,
        tableColumns: ["Metric", "Value"],
        tableRows: [["Users", "10K+"], ["Revenue", "$1.2M"]],
        products: [
          {
            title: "Internet of Things",
            description: "Connected devices coordinated through one platform.",
            image: { __image_url__: "/product-1.png", __image_prompt__: "iot" },
            isBlueBackground: true,
          },
          {
            title: "Analytics Dashboard",
            description: "Interactive dashboards for decision makers.",
            image: { __image_url__: "/product-2.png", __image_prompt__: "dashboard" },
            isBlueBackground: true,
          },
        ],
        teamMembers: [
          {
            name: "Sarah Johnson",
            description: "Strategic leader with 15 years of experience.",
            linkedIn: "https://linkedin.com/in/sarah",
            image: { __image_url__: "/sarah.png", __image_prompt__: "headshot" },
          },
          {
            name: "Michael Chen",
            description: "Technology expert focused on scalable systems.",
            image: { __image_url__: "/michael.png", __image_prompt__: "headshot" },
          },
        ],
        marketStats: [
          {
            label: "Total Available Market (TAM)",
            value: "1.4 Billion",
            description: "Overall addressable market size.",
          },
          {
            label: "Serviceable Available Market (SAM)",
            value: "194 Million",
            description: "Reachable market based on product fit.",
          },
        ],
        items: [
          { title: "Section 1", description: "Brief description for this section." },
          { title: "Section 2", description: "Brief description for this section." },
        ],
      },
    });

    assert.equal(document.width, 1280);
    assert.equal(document.height, 720);
    assert.ok(document.elements.length > 0);
    assert.equal(validateNativeSlideDocument(document).valid, true);
    assert.equal(document.meta.sourceRenderer, "modern-template-builder");
    assert.equal(document.meta.sourceTemplate, "modern");
    assert.equal(document.meta.fidelity, "A");
  }

  const imageDocument = buildModernAipptSlideDocument({
    id: "modern-image",
    layout_group: "modern",
    layout: "modern:image-and-description",
    content: {
      title: "Image slide",
      content: "Description",
      image: { __image_url__: "/editable-image.png", __image_prompt__: "editable image" },
    },
  });
  assert.ok(imageDocument.elements.some((element) => element.type === "image" && element.id === "main-image"));

  const chartDocument = buildModernAipptSlideDocument({
    id: "modern-chart",
    layout_group: "modern",
    layout: "modern:chart-or-table-with-description",
    content: {
      title: "Chart slide",
      description: "Description",
      mode: "chart",
      chart: {
        type: "bar",
        data: [
          { label: "A", value: 1 },
          { label: "B", value: 2 },
        ],
        showLabels: true,
      },
    },
  });
  assert.ok(chartDocument.elements.some((element) => element.type === "chart"));

  const tableDocument = buildModernAipptSlideDocument({
    id: "modern-table",
    layout_group: "modern",
    layout: "modern:chart-or-table-with-description",
    content: {
      title: "Table slide",
      description: "Description",
      mode: "table",
      columns: ["A", "B"],
      rows: [{ cells: ["1", "2"] }],
    },
  });
  assert.ok(tableDocument.elements.some((element) => element.type === "table"));
});

test("converts standard layouts into high-fidelity editable AIPPT elements", async () => {
  const { buildStandardAipptSlideDocument } = await importModule(
    "lib/pptx-model/standard-template.ts",
  );
  const { validateNativeSlideDocument } = await importModule(
    "lib/pptx-model/native-schema.ts",
  );
  const layouts = [
    "header-counter-two-column-image-text-slide",
    "chart-left-text-right-layout",
    "ContactLayout",
    "HeadingBulletImageDescriptionLayout",
    "IconBulletDescriptionLayout",
    "IconImageDescriptionLayout",
    "ImageListWithDescriptionLayout",
    "MetricsDescriptionLayout",
    "NumberedBulletSingleImageLayout",
    "TableOfContentsLayout",
    "VisualMetricsSlideLayout",
  ];

  for (const [index, layout] of layouts.entries()) {
    const document = buildStandardAipptSlideDocument({
      id: `standard-${index}`,
      index,
      layout_group: "standard",
      layout: `standard:${layout}`,
      content: {
        title: "Editable standard title",
        titleBreakAfter: 8,
        paragraph: "Editable paragraph text for the standard native template.",
        description: "Editable description text for a standard slide.",
        heading: "Editable heading",
        header: { counter: String(index + 1) },
        media: {
          type: "image",
          image: { __image_url__: "/media.png", __image_prompt__: "media prompt" },
        },
        image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
        introCard: {
          enabled: true,
          initials: "JD",
          name: "Jane Doe",
          date: "July 2026",
        },
        chart: {
          type: "line",
          data: [
            { label: "A", value: 60 },
            { label: "B", value: 42 },
            { label: "C", value: 75 },
          ],
          showLabels: true,
        },
        bulletPoints: [
          {
            title: "Editable point",
            description: "Editable point description.",
            icon: { __icon_url__: "/static/icons/regular/checks.svg", __icon_query__: "check" },
          },
          {
            title: "Second point",
            description: "Second point description.",
            icon: { __icon_url__: "/static/icons/regular/code.svg", __icon_query__: "code" },
          },
        ],
        items: [
          { title: "Section one", description: "Section one description." },
          { title: "Section two", description: "Section two description." },
        ],
        metrics: [
          { label: "Clients", value: "200+", description: "Editable metric description." },
          { label: "Growth", value: "35%", description: "Second metric description." },
        ],
        contact: {
          email: "hello@example.com",
          website: "example.com",
        },
      },
    });

    assert.equal(document.width, 1280);
    assert.equal(document.height, 720);
    assert.ok(document.elements.length > 0);
    assert.equal(validateNativeSlideDocument(document).valid, true);
    assert.equal(document.meta.sourceRenderer, "standard-template-builder");
    assert.equal(document.meta.sourceTemplate, "standard");
    assert.equal(document.meta.fidelity, "A");
  }

  const imageDocument = buildStandardAipptSlideDocument({
    id: "standard-image",
    layout_group: "standard",
    layout: "standard:IconImageDescriptionLayout",
    content: {
      title: "Image slide",
      description: "Description",
      image: { __image_url__: "/editable-image.png", __image_prompt__: "editable image" },
    },
  });
  assert.ok(imageDocument.elements.some((element) => element.type === "image"));

  const chartDocument = buildStandardAipptSlideDocument({
    id: "standard-chart",
    layout_group: "standard",
    layout: "standard:chart-left-text-right-layout",
    content: {
      title: "Chart slide",
      paragraph: "Description",
      chart: {
        type: "bar",
        data: [
          { label: "A", value: 1 },
          { label: "B", value: 2 },
        ],
      },
    },
  });
  assert.ok(chartDocument.elements.some((element) => element.type === "chart"));
});

test("converts swift layouts into high-fidelity editable AIPPT elements", async () => {
  const { buildSwiftAipptSlideDocument } = await importModule(
    "lib/pptx-model/swift-template.ts",
  );
  const { validateNativeSlideDocument } = await importModule(
    "lib/pptx-model/native-schema.ts",
  );
  const layouts = [
    "IntroSlideLayout",
    "bullet-with-icons-title-description",
    "icon-bullet-list-description-slide",
    "image-list-description-slide",
    "MetricsNumbers",
    "SwiftTableOfContents",
    "simple-bullet-points-layout",
    "tableorChart",
    "Timeline",
  ];

  for (const [index, layout] of layouts.entries()) {
    const document = buildSwiftAipptSlideDocument({
      id: `swift-${index}`,
      index,
      layout_group: "swift",
      layout: `swift:${layout}`,
      content: {
        title: "Editable swift title",
        subtitlePrefix: "Presentation",
        subtitleAccent: "Template",
        subtitle: "Editable subtitle text for the swift timeline template.",
        paragraph: "Editable paragraph text for the swift native template.",
        description: "Editable description text for a swift slide.",
        statement: "Editable statement text for the swift bullet layout.",
        sideHeading: "Editable side heading",
        sideParagraph: "Editable side paragraph for the swift icon layout.",
        titleLine1: "Meet Our",
        titleLine2: "Team",
        leftTitle: "Proven Results\nThrough Data",
        leftBody: "Editable body text for the metrics layout.",
        website: "www.example.com",
        introCard: { enabled: true, name: "Jane Doe", date: "July 2026" },
        media: {
          type: "image",
          image: { __image_url__: "/media.png", __image_prompt__: "media prompt" },
        },
        image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
        items: [
          {
            title: "Editable item",
            description: "Editable item description.",
            year: "2026",
            heading: "Editable milestone",
            body: "Editable milestone body.",
            icon: { __icon_url__: "/static/icons/bold/checks-bold.svg", __icon_query__: "check" },
            image: { __image_url__: "/item.png", __image_prompt__: "item image" },
          },
          {
            title: "Second item",
            description: "Second item description.",
            year: "2027",
            heading: "Second milestone",
            body: "Second milestone body.",
            icon: { __icon_url__: "/static/icons/bold/user-bold.svg", __icon_query__: "user" },
            image: { __image_url__: "/item-2.png", __image_prompt__: "item image" },
          },
        ],
        features: [
          {
            title: "Customizable Workflows",
            body: "Editable feature body.",
            icon: { __icon_url__: "/static/icons/bold/file-text-bold.svg", __icon_query__: "file" },
          },
          {
            title: "Detailed Reports",
            body: "Second feature body.",
            icon: { __icon_url__: "/static/icons/bold/checks-bold.svg", __icon_query__: "check" },
          },
        ],
        points: [
          { title: "First point", body: "Editable point body for the swift bullet layout." },
          { title: "Second point", body: "Second editable point body." },
        ],
        metrics: [
          { value: "10K+", line1: "Total", line2: "Users", description: "Editable metric description." },
          { value: "95%", line1: "Customer", line2: "Satisfaction", description: "Second metric description." },
        ],
        mode: "chart",
        columns: ["Column 1", "Column 2"],
        rows: [{ cells: ["Row A", "Value"] }],
        chart: {
          type: "line",
          data: [
            { label: "A", value: 60 },
            { label: "B", value: 42 },
            { label: "C", value: 75 },
          ],
          showLabels: true,
        },
      },
    });

    assert.equal(document.width, 1280);
    assert.equal(document.height, 720);
    assert.ok(document.elements.length > 0);
    assert.equal(validateNativeSlideDocument(document).valid, true);
    assert.equal(document.meta.sourceRenderer, "swift-template-builder");
    assert.equal(document.meta.sourceTemplate, "swift");
    assert.equal(document.meta.fidelity, "A");
  }

  const imageDocument = buildSwiftAipptSlideDocument({
    id: "swift-image",
    layout_group: "swift",
    layout: "swift:IntroSlideLayout",
    content: {
      title: "Image slide",
      paragraph: "Editable paragraph text.",
      media: {
        type: "image",
        image: { __image_url__: "/editable-image.png", __image_prompt__: "editable image" },
      },
    },
  });
  assert.ok(imageDocument.elements.some((element) => element.type === "image"));

  const chartDocument = buildSwiftAipptSlideDocument({
    id: "swift-chart",
    layout_group: "swift",
    layout: "swift:tableorChart",
    content: {
      title: "Chart slide",
      description: "Description",
      mode: "chart",
      chart: {
        type: "bar",
        data: [
          { label: "A", value: 1 },
          { label: "B", value: 2 },
        ],
      },
    },
  });
  assert.ok(chartDocument.elements.some((element) => element.type === "chart"));

  const tableDocument = buildSwiftAipptSlideDocument({
    id: "swift-table",
    layout_group: "swift",
    layout: "swift:tableorChart",
    content: {
      title: "Table slide",
      description: "Description",
      mode: "table",
      columns: ["A", "B"],
      rows: [{ cells: ["1", "2"] }],
    },
  });
  assert.ok(tableDocument.elements.some((element) => element.type === "table"));
});

test("converts remaining built-in template layouts into editable AIPPT elements", async () => {
  const { buildBuiltInTemplateAipptSlideDocument } = await importModule(
    "lib/pptx-model/built-in-template.ts",
  );
  const { validateNativeSlideDocument } = await importModule(
    "lib/pptx-model/native-schema.ts",
  );
  const groups = {
    code: [
      "cover-slide",
      "code-explanation-split-slide",
      "api-request-response-slide",
      "cards-grid-slide",
      "table-slide",
      "workflow-slide",
      "bullet-list-slide",
      "description-text-slide",
      "table-of-content-slide",
      "description-and-metrics-slide",
      "metrics-grid-slide",
      "full-code-block-slide",
      "code-diff-comparison-slide",
      "terminal-command-slide",
      "file-tree-structure-slide",
      "code-output-slide",
    ],
    education: [
      "cover-slide",
      "table-of-contents-slide",
      "about-slide",
      "content-split-slide",
      "image-gallery-slide",
      "report-chart-slide",
      "services-split-slide",
      "statistics-grid-slide",
      "timeline-slide",
      "numbered-outcome-cards-slide",
      "module-grid-slide",
      "agenda-timeline-slide",
      "evaluation-matrix-slide",
      "closing-contact-slide",
    ],
    "product-overview": [
      "title-description-with-cards-text-slide",
      "title-with-blocks-text-slide",
      "comparison-status-table-slide",
      "title-description-with-table-slide",
      "cover-slide",
      "card-grid-with-labels-slide",
      "title-description-with-image-gallery-slide",
      "introduction-slide",
      "title-with-kpi-cards-slide",
      "title-description-with-cards-slide",
      "text-blocks-with-image-block-slide",
      "closing-actions-contact-slide",
      "title-description-with-image-block-slide",
      "two-panel-contrast-metrics-slide",
      "title-cards-list-with-text-slide",
      "title-with-process-steps-slide",
      "phase-timeline-cards-slide",
      "title-description-with-chart-and-kpi-cards-slide",
      "table-of-content-slide",
      "segment-cards-slide",
      "scenario-cards-slide",
    ],
    report: [
      "intro-slide",
      "section-index-slide",
      "summary-cards-slide",
      "title-description-image-slide",
      "method-source-panels-slide",
      "metrics-slide",
      "title-image-bullet-cards-slide",
      "milestone-slide",
      "bullet-list-with-icon-title-description-slide",
      "bar-chart-with-bullet-list-title-description-icon-slide",
      "title-description-chart-slide",
      "title-chart-metrics-cards-slide",
      "data-analysis-dashboard-slide",
      "finding-cards-slide",
      "title-metrics-slide",
      "recommendation-cards-slide",
      "action-plan-table-slide",
      "risk-limitation-matrix-slide",
      "appendix-notes-slide",
      "closing-contact-slide",
      "horizontal-height-spanning-images-with-title-slide",
      "title-workflow-with-title-description-slide",
    ],
    "pitch-deck": [
      "centered-cover-with-footer-meta",
      "problem-evidence-slide",
      "value-proposition-slide",
      "market-size-slide",
      "product-workflow-slide",
      "go-to-market-slide",
      "business-model-slide",
      "traction-metrics-slide",
      "competitive-positioning-slide",
      "defensibility-slide",
      "financial-projection-slide",
      "funding-ask-slide",
      "team-credentials-slide",
      "closing-contact-slide",
      "adaptive-value-card-grid",
      "adaptive-media-card-grid",
      "cards-with-chart-split",
      "full-width-statement",
      "headline-with-detail-columns",
      "horizontal-timeline",
      "media-and-text-split",
      "numbered-multi-column-overview",
      "overlapping-circle-cards",
      "panel-list-with-media",
      "text-and-chart-split-layout",
    ],
    "neo-general": [
      "bullet-icons-only-slide",
      "bullet-with-icons-slide",
      "chart-with-bullets-slide",
      "title-challenge-outcome-customer-card",
      "headline-description-with-image-layout",
      "headline-description-with-double-image-layout",
      "performance-grid-snapshot-slide",
      "headline-text-with-stats-layout",
      "title-three-columns-with-labels",
      "left-align-quote",
      "layout-text-block-with-metric-cards",
      "metrics-with-image-slide",
      "multi-chart-grid-slide",
      "numbered-bullets-slide",
      "quote-slide",
      "team-slide",
      "title-two-column-numbered-list",
      "thank-you-contact-info-footer-image-slide-layout",
      "timeline-alternating-cards-slide",
      "title-description-multi-chart-grid-bullets",
      "title-description-multi-chart-grid-metrics",
      "title-description-three-columns-table",
      "title-description-team-grid",
      "title-with-full-width-chart",
      "title-metricValue-metricLabel-funnelStages",
      "title-three-column-risk-constraints-slide-layout",
      "title-six-card-grid-slide-layout",
      "title-metrics-with-chart",
      "title-side-insight-slide",
    ],
    "neo-standard": [
      "title-description-bullet-list",
      "title-description-contact-cards",
      "title-description-icon-list",
      "title-description-image-right",
      "title-description-multi-chart-grid",
      "title-description-multi-chart-grid-bullets",
      "title-description-multi-chart-grid-metrics",
      "title-description-radial-cards",
      "title-description-table",
      "title-description-timeline",
      "title-dual-charts-comparison",
      "title-dual-comparison-cards",
      "title-kpi-grid",
      "title-metrics-chart",
      "title-metrics-image",
      "title-points-donut-grid",
      "title-badge-chart",
    ],
    "neo-modern": [
      "title-description-bullet-list",
      "title-description-contact-list",
      "title-description-dual-metrics-grid",
      "title-description-icon-timeline",
      "title-description-image-right",
      "title-description-metrics-chart",
      "title-description-metrics-image",
      "title-description-multi-chart-grid",
      "title-description-multi-chart-grid-bullets",
      "title-description-multi-chart-grid-metrics",
      "title-description-table",
      "title-dual-comparison-cards",
      "title-dual-comparison-charts",
      "title-horizontal-alternating-timeline",
      "title-kpi-snapshot-grid",
      "title-subtitles-chart",
      "title-two-column-numbered-list",
    ],
    "neo-swift": [
      "title-chart-metrics-sidebar",
      "title-centered-chart",
      "title-description-bullet-list",
      "title-description-three-column-table",
      "title-description-four-charts-six-bullets",
      "title-description-large-image-right",
      "title-description-eight-metrics-grid",
      "title-description-metrics-grid-large-image",
      "title-description-six-charts-four-metrics",
      "title-description-six-charts-grid",
      "title-dual-comparison-blocks-numbered",
      "title-label-description-cascading-stats",
      "title-subtitle-four-team-member-cards",
      "title-tagline-description-numbered-steps",
      "title-three-by-three-metrics-grid",
    ],
  };

  for (const [group, layouts] of Object.entries(groups)) {
    for (const [index, layout] of layouts.entries()) {
      const document = buildBuiltInTemplateAipptSlideDocument({
        id: `${group}-${index}`,
        index,
        layout_group: group,
        layout: `${group}:${layout}`,
        content: {
          title: `Editable ${group} title`,
          subtitle: "Editable subtitle",
          description: "Editable description text for the native template.",
          paragraph: "Editable paragraph text.",
          image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
          media: {
            type: "image",
            image: { __image_url__: "/media.png", __image_prompt__: "media prompt" },
          },
          items: [
            { title: "Editable item", description: "Editable item description.", value: "42%" },
            { title: "Second item", description: "Second editable item.", value: "18" },
          ],
          cards: [
            { title: "Editable card", description: "Editable card description.", value: "A" },
            { title: "Second card", description: "Second card description.", value: "B" },
          ],
          metrics: [
            { value: "42%", label: "Editable metric" },
            { value: "18", label: "Editable count" },
          ],
          steps: [
            { title: "Step one", description: "Editable step description." },
            { title: "Step two", description: "Second step description." },
          ],
          columns: ["A", "B"],
          rows: [["1", "2"]],
          chart: {
            type: "bar",
            data: [
              { label: "A", value: 1 },
              { label: "B", value: 2 },
            ],
          },
        },
      });

      assert.equal(document.width, 1280);
      assert.equal(document.height, 720);
      assert.equal(validateNativeSlideDocument(document).valid, true);
      assert.equal(document.meta.sourceRenderer, "built-in-template-builder");
      assert.equal(document.meta.sourceTemplate, group);
      assert.equal(document.meta.sourceLayout, layout);
      assert.equal(document.meta.fidelity, "A");
      assert.ok(document.elements.some((element) => element.type === "text"));
      assert.ok(document.elements.some((element) => element.type === "image"));
    }
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

test("preserves user edits to repaired coal-power template elements", async () => {
  const { repairCoalPowerAipptSlideDocument } = await importModule(
    "lib/pptx-model/coal-power-template.ts",
  );

  const repaired = repairCoalPowerAipptSlideDocument(
    {
      id: "coal-cover",
      index: 0,
      layout_group: "taicang-coal-power-report",
      layout: "taicang-coal-power-report:coal-power-cover-slide",
      content: { title: "璇箟鏍囬" },
    },
    {
      id: "coal-cover",
      width: 1280,
      height: 720,
      elements: [
        {
          id: "cover-title",
          type: "text",
          x: 220,
          y: 180,
          w: 760,
          h: 96,
          text: "鐢ㄦ埛缂栬緫鏍囬",
          style: {
            fontFace: "Microsoft YaHei",
            fontSize: 36,
            color: "C2410C",
            bold: false,
            align: "left",
            valign: "middle",
            margin: [4, 8, 4, 8],
          },
        },
      ],
    },
  );

  const title = repaired.elements.find((element) => element.id === "cover-title");
  assert.equal(title.text, "鐢ㄦ埛缂栬緫鏍囬");
  assert.equal(title.x, 220);
  assert.equal(title.y, 180);
  assert.equal(title.w, 760);
  assert.equal(title.h, 96);
  assert.equal(title.style.color, "C2410C");
  assert.equal(title.style.fontSize, 36);
  assert.equal(title.style.bold, false);
  assert.equal(title.style.align, "left");
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
