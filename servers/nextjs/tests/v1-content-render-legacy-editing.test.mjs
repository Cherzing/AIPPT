import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(
  new URL("../app/(presentation-generator)/components/V1ContentRender.tsx", import.meta.url),
);
const source = readFileSync(sourcePath, "utf8");

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
    /onContentChange=\{handleLegacyTextContentChange\}/,
    "legacy background text replacer should receive an onContentChange handler",
  );
  assert.match(
    backgroundContent,
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
