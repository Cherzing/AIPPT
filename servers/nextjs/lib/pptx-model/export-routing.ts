import type { NativePresentation } from "@/lib/native-pptx";
import {
  buildCoalPowerAipptSlideDocument,
  getCoalPowerStoredDocumentCandidate,
  isCoalPowerLayout,
  repairCoalPowerAipptSlideDocument,
} from "@/lib/pptx-model/coal-power-template";
import { isAipptSlideDocument } from "@/lib/pptx-model/export-pptx";
import { validateNativeSlideDocument } from "@/lib/pptx-model/native-schema";
import type {
  AipptPresentationDocument,
  AipptSlideDocument,
} from "@/lib/pptx-model/types";

export function presentationToAipptDocument(
  presentation: NativePresentation,
): AipptPresentationDocument | null {
  const slides = presentation.slides ?? [];
  if (!slides.length) return null;

  const documents: AipptSlideDocument[] = [];
  for (const [slideIndex, slide] of slides.entries()) {
    const storedDocument = slide.content?.__aippt;
    if (storedDocument !== undefined) {
      const validation = validateNativeSlideDocument(storedDocument);
      if (!validation.valid) {
        if (isCoalPowerLayout(slide)) {
          const storedCandidate = getCoalPowerStoredDocumentCandidate(storedDocument);
          if (storedCandidate) {
            const repairedDocument = repairCoalPowerAipptSlideDocument(
              slide,
              storedCandidate,
            );
            if (!repairedDocument) return null;
            documents.push(repairedDocument);
            continue;
          }
        }
        console.info("[export-presentation] native export rejected", {
          slideIndex,
          layout: slide.layout,
          layoutGroup: slide.layout_group,
          errors: validation.errors,
        });
        return null;
      }
      if (validation.document.meta?.fidelity === "D") {
        console.info("[export-presentation] native export rejected", {
          slideIndex,
          layout: slide.layout,
          layoutGroup: slide.layout_group,
          reason: "level D native documents require fallback export",
        });
        return null;
      }
      const document = isCoalPowerLayout(slide)
        ? repairCoalPowerAipptSlideDocument(slide, validation.document)
        : validation.document;
      if (!document) return null;
      documents.push(document);
      continue;
    }

    if (isCoalPowerLayout(slide)) {
      const coalDocument = buildCoalPowerAipptSlideDocument(slide);
      if (!coalDocument || !isAipptSlideDocument(coalDocument)) return null;
      documents.push(coalDocument);
      continue;
    }

    console.info("[export-presentation] native export rejected", {
      slideIndex,
      layout: slide.layout,
      layoutGroup: slide.layout_group,
      reason: "missing native slide document",
    });
    return null;
  }

  return {
    title: presentation.title ?? "AIPPT",
    slides: documents,
  };
}
