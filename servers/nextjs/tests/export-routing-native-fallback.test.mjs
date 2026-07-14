import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import { build } from "esbuild";

const validNativeDocument = {
  id: "native-slide",
  width: 1280,
  height: 720,
  meta: {
    version: 1,
    fidelity: "B",
    sourceRenderer: "legacy-template-converter",
    conversionStatus: "partial",
  },
  elements: [],
};

async function loadRouteHelper() {
  const tempDir = await mkdtemp(path.join(tmpdir(), "export-routing-test-"));
  const outfile = path.join(tempDir, "export-routing.mjs");
  await build({
    entryPoints: [
      fileURLToPath(
        new URL("../lib/pptx-model/export-routing.ts", import.meta.url),
      ),
    ],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    logLevel: "silent",
  });
  const module = await import(pathToFileURL(outfile).href);
  await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  return module.presentationToAipptDocument;
}

test("allows native export when every slide has a valid native document", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "valid deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      {
        id: "slide-2",
        content: {
          __aippt: {
            ...validNativeDocument,
            id: "native-slide-2",
            meta: { ...validNativeDocument.meta, fidelity: "C", conversionStatus: "background-fallback" },
          },
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 2);
  assert.equal(document?.slides[0].id, "native-slide");
});

test("rejects native export when any non-coal slide is missing native document", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "legacy deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      { id: "slide-2", layout_group: "modern", content: { title: "legacy only" } },
    ],
  });

  assert.equal(document, null);
});

test("rejects native export when any native document is invalid", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "invalid deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      {
        id: "slide-2",
        content: {
          __aippt: {
            id: "invalid-slide",
            width: 1280,
            height: 720,
            elements: [],
          },
        },
      },
    ],
  });

  assert.equal(document, null);
});

test("rejects native export when any native document is Level D", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "level d deck",
    slides: [
      { id: "slide-1", content: { __aippt: validNativeDocument } },
      {
        id: "slide-2",
        content: {
          __aippt: {
            ...validNativeDocument,
            id: "level-d-slide",
            meta: {
              version: 1,
              fidelity: "D",
              sourceRenderer: "native",
              conversionStatus: "legacy-only",
            },
          },
        },
      },
    ],
  });

  assert.equal(document, null);
});

test("allows coal-power slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "coal deck",
    slides: [
      {
        id: "coal-cover",
        layout_group: "taicang-coal-power-report",
        layout: "taicang-coal-power-report:coal-power-cover-slide",
        content: { title: "煤电项目" },
      },
    ],
  });

  assert.equal(document?.slides.length, 1);
  assert.equal(document?.slides[0].width, 1280);
});

test("allows blue-white coal slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "blue-white coal deck",
    slides: [
      {
        id: "coal-blue-white-image",
        layout_group: "taicang-coal-power-report",
        layout: "taicang-coal-power-report:coal-blue-white-image-showcase-slide",
        content: {
          title: "Images",
          images: [
            {
              label: "Slot",
              caption: "Caption",
              image: { __image_url__: "/slot.png", __image_prompt__: "slot prompt" },
            },
          ],
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 1);
  assert.equal(document?.slides[0].meta.sourceRenderer, "coal-power-builder");
  assert.ok(document?.slides[0].elements.some((element) => element.type === "image"));
});

test("allows general slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "general deck",
    slides: [
      {
        id: "general-intro",
        layout_group: "general",
        layout: "general:general-intro-slide",
        content: {
          title: "Editable general title",
          description: "Editable description text.",
          presenterName: "Jane Doe",
          presentationDate: "July 2026",
          image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
        },
      },
      {
        id: "general-table",
        layout_group: "general",
        layout: "general:table-info-slide",
        content: {
          title: "Editable table",
          description: "Editable table description.",
          tableData: {
            headers: ["A", "B"],
            rows: [["1", "2"]],
          },
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 2);
  assert.equal(document?.slides[0].meta.sourceRenderer, "general-template-builder");
  assert.equal(document?.slides[1].meta.sourceRenderer, "general-template-builder");
  assert.ok(document?.slides[0].elements.some((element) => element.type === "image"));
  assert.ok(document?.slides[1].elements.some((element) => element.type === "table"));
});

test("allows modern slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "modern deck",
    slides: [
      {
        id: "modern-intro",
        layout_group: "modern",
        layout: "modern:intro-pitchdeck-slide",
        content: {
          title: "Editable modern title",
          description: "Editable description text.",
          introCard: {
            enabled: true,
            name: "Jane Doe",
            date: "July 2026",
          },
          image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
        },
      },
      {
        id: "modern-table",
        layout_group: "modern",
        layout: "modern:chart-or-table-with-description",
        content: {
          title: "Editable table",
          description: "Editable table description.",
          mode: "table",
          columns: ["A", "B"],
          rows: [{ cells: ["1", "2"] }],
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 2);
  assert.equal(document?.slides[0].meta.sourceRenderer, "modern-template-builder");
  assert.equal(document?.slides[1].meta.sourceRenderer, "modern-template-builder");
  assert.ok(document?.slides[0].elements.some((element) => element.type === "image"));
  assert.ok(document?.slides[1].elements.some((element) => element.type === "table"));
});

test("allows standard slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "standard deck",
    slides: [
      {
        id: "standard-intro",
        layout_group: "standard",
        layout: "standard:header-counter-two-column-image-text-slide",
        content: {
          title: "Editable standard title",
          paragraph: "Editable standard paragraph.",
          media: {
            type: "image",
            image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
          },
        },
      },
      {
        id: "standard-chart",
        layout_group: "standard",
        layout: "standard:chart-left-text-right-layout",
        content: {
          title: "Editable chart",
          paragraph: "Editable chart description.",
          chart: {
            type: "bar",
            data: [
              { label: "A", value: 1 },
              { label: "B", value: 2 },
            ],
          },
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 2);
  assert.equal(document?.slides[0].meta.sourceRenderer, "standard-template-builder");
  assert.equal(document?.slides[1].meta.sourceRenderer, "standard-template-builder");
  assert.ok(document?.slides[0].elements.some((element) => element.type === "image"));
  assert.ok(document?.slides[1].elements.some((element) => element.type === "chart"));
});

test("allows swift slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "swift deck",
    slides: [
      {
        id: "swift-intro",
        layout_group: "swift",
        layout: "swift:IntroSlideLayout",
        content: {
          title: "Editable swift title",
          paragraph: "Editable swift paragraph.",
          media: {
            type: "image",
            image: { __image_url__: "/image.png", __image_prompt__: "image prompt" },
          },
        },
      },
      {
        id: "swift-chart",
        layout_group: "swift",
        layout: "swift:tableorChart",
        content: {
          title: "Editable chart",
          description: "Editable chart description.",
          mode: "chart",
          chart: {
            type: "bar",
            data: [
              { label: "A", value: 1 },
              { label: "B", value: 2 },
            ],
          },
        },
      },
    ],
  });

  assert.equal(document?.slides.length, 2);
  assert.equal(document?.slides[0].meta.sourceRenderer, "swift-template-builder");
  assert.equal(document?.slides[1].meta.sourceRenderer, "swift-template-builder");
  assert.ok(document?.slides[0].elements.some((element) => element.type === "image"));
  assert.ok(document?.slides[1].elements.some((element) => element.type === "chart"));
});

test("allows remaining built-in template slides without stored native document through dedicated builder", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const slides = [
    ["code", "code:cover-slide"],
    ["education", "education:cover-slide"],
    ["product-overview", "product-overview:cover-slide"],
    ["report", "report:intro-slide"],
    ["pitch-deck", "pitch-deck:centered-cover-with-footer-meta"],
    ["neo-general", "neo-general:headline-description-with-image-layout"],
    ["neo-standard", "neo-standard:title-description-image-right"],
    ["neo-modern", "neo-modern:title-description-image-right"],
    ["neo-swift", "neo-swift:title-description-large-image-right"],
  ].map(([layoutGroup, layout], index) => ({
    id: `${layoutGroup}-${index}`,
    layout_group: layoutGroup,
    layout,
    content: {
      title: `Editable ${layoutGroup} title`,
      description: `Editable ${layoutGroup} description.`,
      image: { __image_url__: `/${layoutGroup}.png`, __image_prompt__: `${layoutGroup} image` },
      items: [
        { title: "Editable item 1", description: "Editable item description 1" },
        { title: "Editable item 2", description: "Editable item description 2" },
      ],
      metrics: [
        { value: "42%", label: "Editable metric" },
        { value: "18", label: "Editable count" },
      ],
      chart: {
        type: "bar",
        data: [
          { label: "A", value: 1 },
          { label: "B", value: 2 },
        ],
      },
      columns: ["A", "B"],
      rows: [["1", "2"]],
    },
  }));

  const document = presentationToAipptDocument({
    title: "remaining built-in deck",
    slides,
  });

  assert.equal(document?.slides.length, slides.length);
  for (const [index, slide] of document.slides.entries()) {
    assert.equal(slide.meta.sourceRenderer, "built-in-template-builder");
    assert.equal(slide.meta.sourceTemplate, slides[index].layout_group);
    assert.equal(slide.width, 1280);
    assert.equal(slide.height, 720);
    assert.ok(slide.elements.some((element) => element.type === "text"));
    assert.ok(slide.elements.some((element) => element.type === "image"));
  }
});

test("repairs legacy coal-power stored documents without native metadata", async () => {
  const presentationToAipptDocument = await loadRouteHelper();
  const document = presentationToAipptDocument({
    title: "coal deck",
    slides: [
      {
        id: "coal-cover",
        layout_group: "taicang-coal-power-report",
        layout: "taicang-coal-power-report:coal-power-cover-slide",
        content: {
          title: "鐓ょ數椤圭洰",
          __aippt: {
            id: "coal-cover",
            width: 1280,
            height: 720,
            elements: [
              {
                id: "cover-title",
                type: "text",
                x: 230,
                y: 210,
                w: 780,
                h: 88,
                text: "鐢ㄦ埛淇敼鏍囬",
                style: {
                  fontFace: "Microsoft YaHei",
                  fontSize: 34,
                  color: "C2410C",
                },
              },
            ],
          },
        },
      },
    ],
  });

  const title = document?.slides[0].elements.find(
    (element) => element.id === "cover-title",
  );
  assert.equal(document?.slides[0].meta.sourceRenderer, "coal-power-builder");
  assert.equal(title?.text, "鐢ㄦ埛淇敼鏍囬");
  assert.equal(title?.x, 230);
  assert.equal(title?.style.color, "C2410C");
});
