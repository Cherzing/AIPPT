import type { AipptSlideDocument, AipptSlideElement } from "./types";

export function createLegacyOnlyAipptDocument({
  id,
  layout,
  layoutGroup,
}: {
  id?: string | number;
  layout: string;
  layoutGroup: string;
}): AipptSlideDocument {
  return {
    id: `legacy-overlay-${id ?? layoutGroup}-${layout}`,
    width: 1280,
    height: 720,
    meta: {
      version: 1,
      fidelity: "D",
      sourceRenderer: "legacy-template-converter",
      conversionStatus: "legacy-only",
      sourceTemplate: layoutGroup,
      sourceLayout: layout,
      warnings: [
        "legacy template is rendered as a visual background; added elements are editable overlays",
      ],
    },
    elements: [],
  };
}

export function isLegacyTemplateOverlayDocument(document: AipptSlideDocument): boolean {
  return document.meta?.sourceRenderer === "legacy-template-converter";
}

function isGeneratedLegacyElement(element: AipptSlideElement): boolean {
  return element.id.startsWith("legacy-");
}

function keepUserOverlayElements(elements: AipptSlideElement[]): AipptSlideElement[] {
  return elements
    .filter((element) => !isGeneratedLegacyElement(element))
    .map((element) =>
      element.type === "group"
        ? { ...element, elements: keepUserOverlayElements(element.elements) }
        : element,
    );
}

export function toLegacyTemplateOverlayDocument(
  document: AipptSlideDocument,
): AipptSlideDocument {
  return {
    ...document,
    meta: {
      ...document.meta,
      version: 1,
      fidelity: "D",
      sourceRenderer: "legacy-template-converter",
      conversionStatus: "legacy-only",
      warnings: [
        ...(document.meta?.warnings ?? []),
        "legacy template is rendered as a visual background; generated fallback elements are hidden",
      ],
    },
    elements: keepUserOverlayElements(document.elements),
  };
}
