import type { NativePresentation } from "@/lib/native-pptx";
import {
  buildCoalPowerAipptSlideDocument,
  getCoalPowerStoredDocumentCandidate,
  isCoalPowerLayout,
  repairCoalPowerAipptSlideDocument,
} from "@/lib/pptx-model/coal-power-template";
import {
  buildGeneralAipptSlideDocument,
  getGeneralStoredDocumentCandidate,
  isGeneralLayout,
  repairGeneralAipptSlideDocument,
} from "@/lib/pptx-model/general-template";
import {
  buildModernAipptSlideDocument,
  getModernStoredDocumentCandidate,
  isModernLayout,
  repairModernAipptSlideDocument,
} from "@/lib/pptx-model/modern-template";
import {
  buildStandardAipptSlideDocument,
  getStandardStoredDocumentCandidate,
  isStandardLayout,
  repairStandardAipptSlideDocument,
} from "@/lib/pptx-model/standard-template";
import {
  buildSwiftAipptSlideDocument,
  getSwiftStoredDocumentCandidate,
  isSwiftLayout,
  repairSwiftAipptSlideDocument,
} from "@/lib/pptx-model/swift-template";
import {
  buildBuiltInTemplateAipptSlideDocument,
  getBuiltInTemplateStoredDocumentCandidate,
  isBuiltInTemplateLayout,
  repairBuiltInTemplateAipptSlideDocument,
} from "@/lib/pptx-model/built-in-template";
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
        if (isGeneralLayout(slide)) {
          const storedCandidate = getGeneralStoredDocumentCandidate(storedDocument);
          if (storedCandidate) {
            const repairedDocument = repairGeneralAipptSlideDocument(
              slide,
              storedCandidate,
            );
            if (!repairedDocument) return null;
            documents.push(repairedDocument);
            continue;
          }
        }
        if (isModernLayout(slide)) {
          const storedCandidate = getModernStoredDocumentCandidate(storedDocument);
          if (storedCandidate) {
            const repairedDocument = repairModernAipptSlideDocument(
              slide,
              storedCandidate,
            );
            if (!repairedDocument) return null;
            documents.push(repairedDocument);
            continue;
          }
        }
        if (isStandardLayout(slide)) {
          const storedCandidate = getStandardStoredDocumentCandidate(storedDocument);
          if (storedCandidate) {
            const repairedDocument = repairStandardAipptSlideDocument(
              slide,
              storedCandidate,
            );
            if (!repairedDocument) return null;
            documents.push(repairedDocument);
            continue;
          }
        }
        if (isSwiftLayout(slide)) {
          const storedCandidate = getSwiftStoredDocumentCandidate(storedDocument);
          if (storedCandidate) {
            const repairedDocument = repairSwiftAipptSlideDocument(
              slide,
              storedCandidate,
            );
            if (!repairedDocument) return null;
            documents.push(repairedDocument);
            continue;
          }
        }
        if (isBuiltInTemplateLayout(slide)) {
          const storedCandidate = getBuiltInTemplateStoredDocumentCandidate(storedDocument);
          if (storedCandidate) {
            const repairedDocument = repairBuiltInTemplateAipptSlideDocument(
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
        : isGeneralLayout(slide)
          ? repairGeneralAipptSlideDocument(slide, validation.document)
        : isModernLayout(slide)
          ? repairModernAipptSlideDocument(slide, validation.document)
        : isStandardLayout(slide)
          ? repairStandardAipptSlideDocument(slide, validation.document)
        : isSwiftLayout(slide)
          ? repairSwiftAipptSlideDocument(slide, validation.document)
        : isBuiltInTemplateLayout(slide)
          ? repairBuiltInTemplateAipptSlideDocument(slide, validation.document)
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

    if (isGeneralLayout(slide)) {
      const generalDocument = buildGeneralAipptSlideDocument(slide);
      if (!generalDocument || !isAipptSlideDocument(generalDocument)) return null;
      documents.push(generalDocument);
      continue;
    }

    if (isModernLayout(slide)) {
      const modernDocument = buildModernAipptSlideDocument(slide);
      if (!modernDocument || !isAipptSlideDocument(modernDocument)) return null;
      documents.push(modernDocument);
      continue;
    }

    if (isStandardLayout(slide)) {
      const standardDocument = buildStandardAipptSlideDocument(slide);
      if (!standardDocument || !isAipptSlideDocument(standardDocument)) return null;
      documents.push(standardDocument);
      continue;
    }

    if (isSwiftLayout(slide)) {
      const swiftDocument = buildSwiftAipptSlideDocument(slide);
      if (!swiftDocument || !isAipptSlideDocument(swiftDocument)) return null;
      documents.push(swiftDocument);
      continue;
    }

    if (isBuiltInTemplateLayout(slide)) {
      const builtInDocument = buildBuiltInTemplateAipptSlideDocument(slide);
      if (!builtInDocument || !isAipptSlideDocument(builtInDocument)) return null;
      documents.push(builtInDocument);
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
