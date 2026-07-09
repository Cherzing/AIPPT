import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformSync } from "esbuild";

async function loadSchema() {
  const source = await readFile(new URL("../lib/pptx-model/native-schema.ts", import.meta.url), "utf8");
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

async function loadCapabilities() {
  const sources = new Map([
    [
      "../lib/pptx-model/template-capabilities",
      await readFile(new URL("../lib/pptx-model/template-capabilities.ts", import.meta.url), "utf8"),
    ],
    [
      "./native-schema",
      await readFile(new URL("../lib/pptx-model/native-schema.ts", import.meta.url), "utf8"),
    ],
    [
      "./template-inventory",
      await readFile(new URL("../lib/pptx-model/template-inventory.ts", import.meta.url), "utf8"),
    ],
  ]);
  const cache = new Map();

  function loadModule(moduleId) {
    if (cache.has(moduleId)) return cache.get(moduleId).exports;
    const source = sources.get(moduleId);
    if (!source) throw new Error(`Unexpected module import: ${moduleId}`);
    const { code } = transformSync(source, {
      loader: "ts",
      format: "cjs",
      platform: "node",
      target: "node20",
    });
    const module = { exports: {} };
    cache.set(moduleId, module);
    new Function("module", "exports", "require", code)(module, module.exports, loadModule);
    return module.exports;
  }

  return loadModule("../lib/pptx-model/template-capabilities");
}

const validADocument = {
  id: "slide-1",
  width: 1280,
  height: 720,
  meta: {
    version: 1,
    fidelity: "A",
    sourceRenderer: "native",
    conversionStatus: "complete",
  },
  elements: [],
};

test("valid native slide document requires size, elements, and metadata", async () => {
  const { validateNativeSlideDocument } = await loadSchema();
  const result = validateNativeSlideDocument(validADocument);
  assert.equal(result.valid, true);
});

test("invalid native slide reports exact reason", async () => {
  const { validateNativeSlideDocument } = await loadSchema();
  const result = validateNativeSlideDocument({ id: "slide-1", width: 1280, height: 720, elements: [] });
  assert.equal(result.valid, false);
  assert.equal(result.errors.includes("meta.version is required"), true);
});

test("classifies valid A native model as native level A", async () => {
  const { getSlideNativeCapability, canUseNativeEditor } = await loadCapabilities();
  const capability = getSlideNativeCapability({ content: { __aippt: validADocument } });

  assert.equal(capability.level, "A");
  assert.equal(capability.mode, "native");
  assert.equal(capability.reason, "valid native model exists");
  assert.equal(canUseNativeEditor({ content: { __aippt: validADocument } }), true);
});

test("classifies coal-power slide as native level A", async () => {
  const { getSlideNativeCapability } = await loadCapabilities();
  const capability = getSlideNativeCapability({
    layout_group: "taicang-coal-power-report",
    content: {},
  });

  assert.equal(capability.level, "A");
  assert.equal(capability.mode, "native");
  assert.equal(capability.reason, "dedicated coal-power native builder exists");
});

test("classifies modern structured title content as convertible level B", async () => {
  const { getSlideNativeCapability } = await loadCapabilities();
  const capability = getSlideNativeCapability({
    layout_group: "modern",
    content: { title: "标题" },
  });

  assert.equal(capability.level, "B");
  assert.equal(capability.mode, "convertible");
});

test("classifies imported background as level C", async () => {
  const { getSlideNativeCapability } = await loadCapabilities();
  const capability = getSlideNativeCapability({
    content: { __imported_background: "/slide.png" },
  });

  assert.equal(capability.level, "C");
  assert.equal(capability.mode, "imported-background");
});

test("classifies html raw content as legacy-only level D", async () => {
  const { getSlideNativeCapability, canUseNativeEditor } = await loadCapabilities();
  const slide = { content: { html: "<div />" } };
  const capability = getSlideNativeCapability(slide);

  assert.equal(capability.level, "D");
  assert.equal(capability.mode, "legacy-only");
  assert.equal(canUseNativeEditor(slide), true);
});
