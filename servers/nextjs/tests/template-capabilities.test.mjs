import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

async function loadCapabilities() {
  const source = await readFile(new URL("../lib/pptx-model/template-capabilities.ts", import.meta.url), "utf8");
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
  const code = result.outputFiles[0].text;
  const module = { exports: {} };
  new Function("module", "exports", code)(module, module.exports);
  return module.exports;
}

test("allows web editing for legacy-only slides while keeping them legacy-only", async () => {
  const { canUseNativeEditor, getSlideNativeCapability } = await loadCapabilities();
  const slide = {
    layout_group: "standard",
    layout: "IntroSlideLayout",
    content: {
      html: "<div>legacy renderer</div>",
    },
  };

  const capability = getSlideNativeCapability(slide);

  assert.equal(capability.level, "D");
  assert.equal(capability.mode, "legacy-only");
  assert.equal(canUseNativeEditor(slide), true);
});

test("keeps persisted legacy overlay slides web-editable", async () => {
  const { canUseNativeEditor, getSlideNativeCapability } = await loadCapabilities();
  const slide = {
    layout_group: "modern-blue",
    layout: "CoverSlideLayout",
    content: {
      __aippt: {
        id: "legacy-overlay-slide",
        width: 1280,
        height: 720,
        meta: {
          version: 1,
          fidelity: "D",
          sourceRenderer: "legacy-template-converter",
          conversionStatus: "legacy-only",
          sourceTemplate: "modern-blue",
          sourceLayout: "CoverSlideLayout",
          warnings: [],
        },
        elements: [],
      },
    },
  };

  const capability = getSlideNativeCapability(slide);

  assert.equal(capability.level, "D");
  assert.equal(capability.mode, "legacy-only");
  assert.equal(canUseNativeEditor(slide), true);
});
