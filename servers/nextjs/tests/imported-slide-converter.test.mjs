import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformSync } from "esbuild";

async function loadConverter() {
  const source = await readFile(new URL("../lib/pptx-model/imported-slide-converter.ts", import.meta.url), "utf8");
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

test("builds imported PPT background fallback slide with locked full-slide image", async () => {
  const { buildImportedBackgroundSlide } = await loadConverter();
  const document = buildImportedBackgroundSlide({
    backgroundSrc: "/uploads/imported/slide-1.png",
    extractedTexts: [
      {
        text: "项目进展",
        x: 100,
        y: 120,
        w: 420,
        h: 56,
      },
    ],
  });

  assert.equal(document.width, 1280);
  assert.equal(document.height, 720);
  assert.deepEqual(document.meta, {
    version: 1,
    fidelity: "C",
    sourceRenderer: "ppt-importer",
    conversionStatus: "background-fallback",
    warnings: [
      "Original PPT elements are preserved as background; only extracted overlays are editable.",
    ],
  });
  assert.deepEqual(document.elements[0], {
    id: "imported-background",
    type: "image",
    src: "/uploads/imported/slide-1.png",
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    fit: "cover",
    locked: true,
  });
  assert.deepEqual(document.elements[1], {
    id: "imported-text-1",
    type: "text",
    text: "项目进展",
    x: 100,
    y: 120,
    w: 420,
    h: 56,
    style: {
      fontFace: "Microsoft YaHei",
      fontSize: 22,
      color: "111827",
      align: "left",
      valign: "top",
      margin: [0, 0, 0, 0],
      lineSpacingMultiple: 1.2,
    },
  });
});
