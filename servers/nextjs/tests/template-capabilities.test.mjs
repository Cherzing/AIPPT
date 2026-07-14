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
    layout_group: "legacy-standard",
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

test("classifies general templates as dedicated native layouts", async () => {
  const { canUseNativeEditor, getSlideNativeCapability } = await loadCapabilities();
  const slide = {
    layout_group: "general",
    layout: "general:general-intro-slide",
    content: {
      title: "Product Overview",
      description: "A concise description for the introduction slide.",
      presenterName: "Jane Doe",
      presentationDate: "July 2026",
      image: { __image_url__: "/image.png", __image_prompt__: "business team" },
    },
  };

  const capability = getSlideNativeCapability(slide);

  assert.equal(capability.level, "A");
  assert.equal(capability.mode, "native");
  assert.equal(canUseNativeEditor(slide), true);
});

test("classifies modern templates as dedicated native layouts", async () => {
  const { canUseNativeEditor, getSlideNativeCapability } = await loadCapabilities();
  const slide = {
    layout_group: "modern",
    layout: "modern:intro-pitchdeck-slide",
    content: {
      title: "Pitch Deck",
      description: "A concise description for the introduction slide.",
      introCard: {
        enabled: true,
        name: "Jane Doe",
        date: "July 2026",
      },
      image: {
        __image_url__: "/image.png",
        __image_prompt__: "business background",
      },
    },
  };

  const capability = getSlideNativeCapability(slide);

  assert.equal(capability.level, "A");
  assert.equal(capability.mode, "native");
  assert.equal(canUseNativeEditor(slide), true);
});

test("classifies standard templates as dedicated native layouts", async () => {
  const { canUseNativeEditor, getSlideNativeCapability } = await loadCapabilities();
  const slide = {
    layout_group: "standard",
    layout: "standard:header-counter-two-column-image-text-slide",
    content: {
      title: "Introduction Our Pitchdeck",
      paragraph: "A concise description for the standard introduction slide.",
      media: {
        type: "image",
        image: {
          __image_url__: "/image.png",
          __image_prompt__: "business background",
        },
      },
    },
  };

  const capability = getSlideNativeCapability(slide);

  assert.equal(capability.level, "A");
  assert.equal(capability.mode, "native");
  assert.equal(canUseNativeEditor(slide), true);
});

test("classifies swift templates as dedicated native layouts", async () => {
  const { canUseNativeEditor, getSlideNativeCapability } = await loadCapabilities();
  const slide = {
    layout_group: "swift",
    layout: "swift:IntroSlideLayout",
    content: {
      title: "Pitch Deck",
      paragraph: "A concise paragraph for the swift introduction slide.",
      media: {
        type: "image",
        image: {
          __image_url__: "/image.png",
          __image_prompt__: "business background",
        },
      },
    },
  };

  const capability = getSlideNativeCapability(slide);

  assert.equal(capability.level, "A");
  assert.equal(capability.mode, "native");
  assert.equal(canUseNativeEditor(slide), true);
});

test("classifies remaining built-in templates as dedicated native layouts", async () => {
  const { canUseNativeEditor, getSlideNativeCapability } = await loadCapabilities();
  const cases = [
    ["code", "code:cover-slide"],
    ["education", "education:cover-slide"],
    ["product-overview", "product-overview:cover-slide"],
    ["report", "report:intro-slide"],
    ["pitch-deck", "pitch-deck:centered-cover-with-footer-meta"],
    ["neo-general", "neo-general:headline-description-with-image-layout"],
    ["neo-standard", "neo-standard:title-description-image-right"],
    ["neo-modern", "neo-modern:title-description-image-right"],
    ["neo-swift", "neo-swift:title-description-large-image-right"],
  ];

  for (const [layoutGroup, layout] of cases) {
    const capability = getSlideNativeCapability({
      layout_group: layoutGroup,
      layout,
      content: {
        title: "Editable title",
        description: "Editable description",
        image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
      },
    });

    assert.equal(capability.level, "A", `${layoutGroup} should be level A`);
    assert.equal(capability.mode, "native", `${layoutGroup} should use native mode`);
    assert.equal(canUseNativeEditor({
      layout_group: layoutGroup,
      layout,
      content: { title: "Editable title" },
    }), true);
  }
});
