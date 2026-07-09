import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformSync } from "esbuild";

async function loadConverter() {
  const source = await readFile(new URL("../lib/pptx-model/legacy-template-converter.ts", import.meta.url), "utf8");
  const { code } = transformSync(source, {
    loader: "ts",
    format: "cjs",
    platform: "node",
    target: "node20",
  });
  const module = { exports: {} };
  new Function("module", "exports", code)(module, module.exports);
  return module.exports;
}

test("converts structured legacy title and description to AIPPT native document", async () => {
  const { convertLegacyTemplateSlideToAippt } = await loadConverter();
  const document = convertLegacyTemplateSlideToAippt({
    layout_group: "modern",
    layout: "TitleDescription",
    content: {
      title: "产品概览",
      description: "面向电厂三期的进度说明",
    },
  });

  assert.equal(document.width, 1280);
  assert.equal(document.height, 720);
  assert.deepEqual(document.meta, {
    version: 1,
    fidelity: "B",
    sourceRenderer: "legacy-template-converter",
    conversionStatus: "partial",
    sourceTemplate: "modern",
    sourceLayout: "TitleDescription",
    warnings: [],
  });
  assert.deepEqual(document.elements[0], {
    id: "legacy-title",
    type: "text",
    text: "产品概览",
    x: 86,
    y: 96,
    w: 860,
    h: 72,
    style: {
      fontFace: "Microsoft YaHei",
      fontSize: 34,
      color: "111827",
      align: "left",
      valign: "top",
      margin: [0, 0, 0, 0],
      lineSpacingMultiple: 1.18,
      bold: true,
    },
  });
  assert.deepEqual(document.elements[1], {
    id: "legacy-subtitle",
    type: "text",
    text: "面向电厂三期的进度说明",
    x: 86,
    y: 178,
    w: 760,
    h: 56,
    style: {
      fontFace: "Microsoft YaHei",
      fontSize: 20,
      color: "4B5563",
      align: "left",
      valign: "top",
      margin: [0, 0, 0, 0],
      lineSpacingMultiple: 1.22,
    },
  });
});

test("converts array and image fields into bullet-like text and image elements", async () => {
  const { convertLegacyTemplateSlideToAippt } = await loadConverter();
  const document = convertLegacyTemplateSlideToAippt({
    layout_group: "modern",
    layout: "BulletsImage",
    content: {
      heading: "关键事项",
      items: ["主机安装", "并网调试"],
      imageUrl: "https://example.test/power-plant.png",
    },
  });

  assert.equal(document.elements[1].id, "legacy-items");
  assert.equal(document.elements[1].type, "text");
  assert.equal(document.elements[1].text, "• 主机安装\n• 并网调试");
  assert.deepEqual(document.elements[1].style, {
    fontFace: "Microsoft YaHei",
    fontSize: 22,
    color: "374151",
    align: "left",
    valign: "top",
    margin: [0, 0, 0, 0],
    lineSpacingMultiple: 1.26,
  });
  assert.deepEqual(document.elements[2], {
    id: "legacy-image-imageUrl",
    type: "image",
    src: "https://example.test/power-plant.png",
    x: 860,
    y: 132,
    w: 334,
    h: 420,
    fit: "cover",
  });
});

test("records unsupported non-empty complex fields in metadata warnings", async () => {
  const { convertLegacyTemplateSlideToAippt } = await loadConverter();
  const document = convertLegacyTemplateSlideToAippt({
    layout_group: "modern",
    layout: "TitleDescription",
    content: {
      name: "风险提示",
      metrics: { value: 7 },
      emptyString: "",
      emptyArray: [],
      emptyObject: {},
    },
  });

  assert.deepEqual(document.meta.warnings, ["unsupported non-empty field: metrics"]);
});

test("records known fields when their non-empty values cannot be converted", async () => {
  const { convertLegacyTemplateSlideToAippt } = await loadConverter();
  const document = convertLegacyTemplateSlideToAippt({
    layout_group: "modern",
    layout: "TitleDescription",
    content: {
      title: { text: "not a supported title shape" },
      image: { url: "https://example.test/not-converted.png" },
      items: [{ label: "not a supported bullet shape" }],
    },
  });

  assert.deepEqual(document.meta.warnings, [
    "unsupported non-empty field: title",
    "unsupported non-empty field: image",
    "unsupported non-empty field: items",
  ]);
});
