import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(
  new URL("../app/(presentation-generator)/components/aippt-canvas/AipptEditableCanvas.tsx", import.meta.url),
);
const source = readFileSync(sourcePath, "utf8");

test("native image single-click opens the image editor after double-click window", () => {
  assert.match(
    source,
    /const IMAGE_CLICK_DELAY_MS = \d+;/,
    "image click should use a short delay so dblclick can cancel the single-click action",
  );
  assert.match(
    source,
    /const scheduleImageEditorOpen = \(\s*elementId: string,\s*\) => \{/,
    "image click should schedule editor opening by element id",
  );
  assert.match(
    source,
    /setImageEditorElementId\(elementId\);/,
    "scheduled image click should open ImageEditor for the clicked image",
  );
  assert.match(
    source,
    /window\.setTimeout\(\(\) => \{[\s\S]*setImageEditorElementId\(elementId\);[\s\S]*\}, IMAGE_CLICK_DELAY_MS\)/,
    "ImageEditor opening should be delayed until the double-click window has passed",
  );
});

test("native image double-click cancels image editor and leaves design panel selected", () => {
  assert.match(
    source,
    /const cancelPendingImageEditorOpen = \(\) => \{/,
    "there should be an explicit cancellation path for pending image editor opens",
  );
  assert.match(
    source,
    /const onImageDoubleClick = \(\s*event: React\.MouseEvent<HTMLElement>,\s*element: AipptImageElement,\s*\) => \{/,
    "native image double click should have a dedicated handler",
  );
  assert.match(
    source,
    /onImageDoubleClick[\s\S]*cancelPendingImageEditorOpen\(\);[\s\S]*setSelectedId\(element\.id\);[\s\S]*setImageEditorElementId\(null\);/,
    "double-click should cancel the single-click editor and keep the image selected for the design panel",
  );
});

test("native image drag does not open the image editor", () => {
  assert.match(
    source,
    /type ImageClickState = \{[\s\S]*moved: boolean;[\s\S]*\};/,
    "image click state should track whether pointer movement turned the interaction into a drag",
  );
  assert.match(
    source,
    /(imageClickStateRef\.current|imageClickState)\.moved = true;/,
    "drag movement should mark the pending image click as moved",
  );
  assert.match(
    source,
    /if \(!clickState \|\| clickState\.moved\) \{[\s\S]*imageElementIdToOpen = null;[\s\S]*\} else \{[\s\S]*imageElementIdToOpen = drag\.id;[\s\S]*\}/,
    "image mouseup should not schedule editor opening after a drag",
  );
  assert.match(
    source,
    /if \(imageElementIdToOpen\) \{[\s\S]*scheduleImageEditorOpen\(imageElementIdToOpen\);[\s\S]*\}/,
    "image editor should only be scheduled when the image click did not become a drag",
  );
});
