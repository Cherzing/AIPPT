import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

async function loadLegacyOverlay() {
  const source = await readFile(new URL("../lib/pptx-model/legacy-overlay.ts", import.meta.url), "utf8");
  const result = buildSync({
    stdin: {
      contents: source,
      loader: "ts",
      resolveDir: fileURLToPath(new URL("../lib/pptx-model/", import.meta.url)),
    },
    format: "cjs",
    platform: "node",
    target: "node20",
    bundle: true,
    write: false,
  });
  const module = { exports: {} };
  new Function("module", "exports", result.outputFiles[0].text)(module, module.exports);
  return module.exports;
}

test("converts legacy template native document to visual background overlay", async () => {
  const { isLegacyTemplateOverlayDocument, toLegacyTemplateOverlayDocument } = await loadLegacyOverlay();
  const document = {
    id: "legacy-converted-slide",
    width: 1280,
    height: 720,
    meta: {
      version: 1,
      fidelity: "B",
      sourceRenderer: "legacy-template-converter",
      conversionStatus: "partial",
      sourceTemplate: "standard",
      sourceLayout: "IntroSlideLayout",
      warnings: [],
    },
    elements: [
      { id: "legacy-title", type: "text", text: "Title", x: 0, y: 0, w: 100, h: 20, style: { fontFace: "Microsoft YaHei", fontSize: 12, color: "111111" } },
      { id: "text-user-added", type: "text", text: "用户新增", x: 20, y: 30, w: 140, h: 40, style: { fontFace: "Microsoft YaHei", fontSize: 18, color: "FF0000" } },
    ],
  };

  assert.equal(isLegacyTemplateOverlayDocument(document), true);

  const overlay = toLegacyTemplateOverlayDocument(document);

  assert.equal(overlay.meta.fidelity, "D");
  assert.equal(overlay.meta.conversionStatus, "legacy-only");
  assert.deepEqual(overlay.elements.map((element) => element.id), ["text-user-added"]);
  assert.match(overlay.meta.warnings.at(-1), /visual background/);
});
