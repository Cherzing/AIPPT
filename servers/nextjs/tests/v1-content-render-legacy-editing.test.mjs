import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(
  new URL("../app/(presentation-generator)/components/V1ContentRender.tsx", import.meta.url),
);
const source = readFileSync(sourcePath, "utf8");
const editableWrapperSourcePath = fileURLToPath(
  new URL("../app/(presentation-generator)/components/EditableLayoutWrapper.tsx", import.meta.url),
);
const editableWrapperSource = readFileSync(editableWrapperSourcePath, "utf8");

test("legacy overlay background text is editable and writes changes back to slide content", () => {
  const legacyBlockStart = source.indexOf("if (legacyOverlayDocument) {");
  assert.notEqual(legacyBlockStart, -1, "legacy overlay render branch should exist");

  const legacyBlockEnd = source.indexOf("if (isEditMode) {", legacyBlockStart);
  assert.notEqual(legacyBlockEnd, -1, "legacy overlay branch should end before fallback edit branch");

  const legacyBlock = source.slice(legacyBlockStart, legacyBlockEnd);
  const backgroundContentStart = legacyBlock.indexOf("const renderLegacyBackgroundContent");
  assert.notEqual(backgroundContentStart, -1, "legacy background content renderer should be defined");

  const backgroundLayerStart = legacyBlock.indexOf("const legacyBackgroundLayer", backgroundContentStart);
  assert.notEqual(backgroundLayerStart, -1, "legacy background layer should be defined");

  const backgroundContent = legacyBlock.slice(backgroundContentStart, backgroundLayerStart);

  assert.match(
    backgroundContent,
    /onContentChange=\{readOnly \? undefined : handleLegacyTextContentChange\}/,
    "legacy background text replacer should receive an onContentChange handler",
  );
  assert.match(
    legacyBlock,
    /updateSlideContent\(/,
    "legacy text edits should be persisted through updateSlideContent",
  );
  assert.match(
    legacyBlock,
    /renderLegacyBackgroundContent\(false\)/,
    "legacy edit mode must render template text as editable",
  );
  assert.match(
    legacyBlock,
    /renderLegacyBackgroundContent\(true\)/,
    "legacy preview mode should keep template text read-only",
  );
});

test("explicit image edit paths are honored before URL-position matching", () => {
  assert.match(
    editableWrapperSource,
    /getAttribute\('data-edit-path'\)/,
    "editable images should be able to declare their data path directly",
  );
  assert.match(
    editableWrapperSource,
    /const explicitData = getExplicitEditableData\(imgElement, targetUrl\);[\s\S]*if \(explicitData\) return explicitData;/,
    "explicit edit paths should be preferred over repeated-image URL matching",
  );
  assert.match(
    editableWrapperSource,
    /__image_url__:\s*fallbackSrc/,
    "missing slide content should still open the image editor with fallback image data",
  );
});

test("V1 content render routes coal templates through AIPPT canvas before Tiptap fallback", () => {
  const coalRepairIndex = source.indexOf("repairCoalPowerAipptSlideDocument");
  const aipptBranchIndex = source.indexOf("if (aipptDocument) {");
  const tiptapFallbackIndex = source.indexOf("if (isEditMode) {", aipptBranchIndex);

  assert.notEqual(coalRepairIndex, -1, "coal template repair/build path should exist");
  assert.notEqual(aipptBranchIndex, -1, "native AIPPT branch should exist");
  assert.notEqual(tiptapFallbackIndex, -1, "Tiptap fallback branch should exist");
  assert.ok(
    coalRepairIndex < aipptBranchIndex && aipptBranchIndex < tiptapFallbackIndex,
    "coal templates should build native documents before the Tiptap fallback is reached",
  );
});

test("V1 content render routes general templates through AIPPT canvas before Tiptap fallback", () => {
  const generalRepairIndex = source.indexOf("repairGeneralAipptSlideDocument");
  const aipptBranchIndex = source.indexOf("if (aipptDocument) {");
  const tiptapFallbackIndex = source.indexOf("if (isEditMode) {", aipptBranchIndex);

  assert.notEqual(generalRepairIndex, -1, "general template repair/build path should exist");
  assert.notEqual(aipptBranchIndex, -1, "native AIPPT branch should exist");
  assert.notEqual(tiptapFallbackIndex, -1, "Tiptap fallback branch should exist");
  assert.ok(
    generalRepairIndex < aipptBranchIndex && aipptBranchIndex < tiptapFallbackIndex,
    "general templates should build native documents before the Tiptap fallback is reached",
  );
});

test("V1 content render routes modern templates through AIPPT canvas before Tiptap fallback", () => {
  const modernRepairIndex = source.indexOf("repairModernAipptSlideDocument");
  const aipptBranchIndex = source.indexOf("if (aipptDocument) {");
  const tiptapFallbackIndex = source.indexOf("if (isEditMode) {", aipptBranchIndex);

  assert.notEqual(modernRepairIndex, -1, "modern template repair/build path should exist");
  assert.notEqual(aipptBranchIndex, -1, "native AIPPT branch should exist");
  assert.notEqual(tiptapFallbackIndex, -1, "Tiptap fallback branch should exist");
  assert.ok(
    modernRepairIndex < aipptBranchIndex && aipptBranchIndex < tiptapFallbackIndex,
    "modern templates should build native documents before the Tiptap fallback is reached",
  );
});

test("V1 content render routes standard templates through AIPPT canvas before Tiptap fallback", () => {
  const standardRepairIndex = source.indexOf("repairStandardAipptSlideDocument");
  const aipptBranchIndex = source.indexOf("if (aipptDocument) {");
  const tiptapFallbackIndex = source.indexOf("if (isEditMode) {", aipptBranchIndex);

  assert.notEqual(standardRepairIndex, -1, "standard template repair/build path should exist");
  assert.notEqual(aipptBranchIndex, -1, "native AIPPT branch should exist");
  assert.notEqual(tiptapFallbackIndex, -1, "Tiptap fallback branch should exist");
  assert.ok(
    standardRepairIndex < aipptBranchIndex && aipptBranchIndex < tiptapFallbackIndex,
    "standard templates should build native documents before the Tiptap fallback is reached",
  );
});

test("V1 content render routes swift templates through AIPPT canvas before Tiptap fallback", () => {
  const swiftRepairIndex = source.indexOf("repairSwiftAipptSlideDocument");
  const aipptBranchIndex = source.indexOf("if (aipptDocument) {");
  const tiptapFallbackIndex = source.indexOf("if (isEditMode) {", aipptBranchIndex);

  assert.notEqual(swiftRepairIndex, -1, "swift template repair/build path should exist");
  assert.notEqual(aipptBranchIndex, -1, "native AIPPT branch should exist");
  assert.notEqual(tiptapFallbackIndex, -1, "Tiptap fallback branch should exist");
  assert.ok(
    swiftRepairIndex < aipptBranchIndex && aipptBranchIndex < tiptapFallbackIndex,
    "swift templates should build native documents before the Tiptap fallback is reached",
  );
});

test("V1 content render routes remaining built-in templates through AIPPT canvas before Tiptap fallback", () => {
  const builtInRepairIndex = source.indexOf("repairBuiltInTemplateAipptSlideDocument");
  const aipptBranchIndex = source.indexOf("if (aipptDocument) {");
  const tiptapFallbackIndex = source.indexOf("if (isEditMode) {", aipptBranchIndex);

  assert.notEqual(builtInRepairIndex, -1, "remaining built-in template repair/build path should exist");
  assert.notEqual(aipptBranchIndex, -1, "native AIPPT branch should exist");
  assert.notEqual(tiptapFallbackIndex, -1, "Tiptap fallback branch should exist");
  assert.ok(
    builtInRepairIndex < aipptBranchIndex && aipptBranchIndex < tiptapFallbackIndex,
    "remaining built-in templates should build native documents before the Tiptap fallback is reached",
  );
});
