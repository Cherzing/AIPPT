import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transformSync } from "esbuild";

async function loadInventory() {
  const source = await readFile(new URL("../lib/pptx-model/template-inventory.ts", import.meta.url), "utf8");
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

test("classifies simple title and description content as structured native", async () => {
  const { classifyTemplateContent } = await loadInventory();
  const result = classifyTemplateContent({ title: "标题", description: "说明" });

  assert.equal(result.level, "B");
  assert.deepEqual(result.supportedFields, ["title", "description"]);
  assert.deepEqual(result.unsupportedFields, []);
});

test("classifies mixed structured and complex content as structured with unsupported fields", async () => {
  const { classifyTemplateContent } = await loadInventory();
  const result = classifyTemplateContent({ title: "Title", metrics: { value: 1 } });

  assert.equal(result.level, "B");
  assert.deepEqual(result.supportedFields, ["title"]);
  assert.deepEqual(result.unsupportedFields, ["metrics"]);
});

test("classifies html content as legacy only", async () => {
  const { classifyTemplateContent } = await loadInventory();
  const result = classifyTemplateContent({ html: "<div />" });

  assert.equal(result.level, "D");
  assert.equal(result.supportedFields.length, 0);
  assert.deepEqual(result.unsupportedFields, ["html"]);
});
