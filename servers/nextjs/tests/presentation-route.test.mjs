import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { build } from "esbuild";

const repoRoot = path.resolve(import.meta.dirname, "..");

async function importModule(sourceRelativePath) {
  const sourceFile = path.join(repoRoot, sourceRelativePath);
  const outFile = path.join(
    os.tmpdir(),
    `aippt-route-${path.basename(sourceRelativePath)}-${Date.now()}.mjs`,
  );
  await build({
    entryPoints: [sourceFile],
    outfile: outFile,
    bundle: true,
    platform: "node",
    format: "esm",
    logLevel: "silent",
  });
  return import(pathToFileURL(outFile).href);
}

test("builds presentation editor href with selected built-in template type", async () => {
  const { buildPresentationEditorHref } = await importModule(
    "app/(presentation-generator)/utils/presentationRoute.ts",
  );

  assert.equal(
    buildPresentationEditorHref({
      presentationId: "presentation-1",
      templateType: "modern",
      stream: true,
    }),
    "/presentation?id=presentation-1&stream=true&type=modern",
  );
});

test("infers editor href type from saved presentation slide layout group", async () => {
  const { buildPresentationEditorHref, inferPresentationTemplateType } =
    await importModule("app/(presentation-generator)/utils/presentationRoute.ts");

  const presentation = {
    slides: [
      {
        layout_group: "modern",
        layout: "modern:intro-pitchdeck-slide",
      },
    ],
  };

  assert.equal(inferPresentationTemplateType(presentation), "modern");
  assert.equal(
    buildPresentationEditorHref({
      presentationId: "presentation-2",
      presentation,
    }),
    "/presentation?id=presentation-2&type=modern",
  );
});
