import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";

const require = createRequire(import.meta.url);

async function loadSlideCanvas() {
  const source = await readFile(
    new URL("../app/(presentation-generator)/components/aippt-canvas/AipptSlideCanvas.tsx", import.meta.url),
    "utf8",
  );
  const result = buildSync({
    stdin: {
      contents: source,
      loader: "tsx",
      resolveDir: fileURLToPath(new URL("../app/(presentation-generator)/components/aippt-canvas/", import.meta.url)),
    },
    format: "cjs",
    platform: "node",
    target: "node20",
    bundle: true,
    external: ["react"],
    write: false,
  });
  const module = { exports: {} };
  new Function("module", "exports", "require", result.outputFiles[0].text)(module, module.exports, require);
  return module.exports;
}

test("uses transparent root background when rendered as overlay", async () => {
  const { resolveSlideCanvasBackground } = await loadSlideCanvas();

  assert.equal(resolveSlideCanvasBackground({}, true), "transparent");
  assert.equal(resolveSlideCanvasBackground({}, false), "#FFFFFF");
  assert.equal(
    resolveSlideCanvasBackground({ background: { type: "solid", color: "101820" } }, true),
    "#101820",
  );
});

test("can pass empty transparent canvas clicks through to legacy background", async () => {
  const { resolveSlideCanvasPointerEvents, resolveSlideElementPointerEvents } =
    await loadSlideCanvas();

  assert.equal(resolveSlideCanvasPointerEvents(true, true), "none");
  assert.equal(resolveSlideCanvasPointerEvents(true, false), undefined);
  assert.equal(resolveSlideCanvasPointerEvents(false, true), undefined);
  assert.equal(resolveSlideElementPointerEvents(true), "auto");
});
