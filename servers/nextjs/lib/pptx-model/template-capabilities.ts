import { isNativeSlideDocument } from "./native-schema";
import { classifyTemplateContent, type TemplateInventoryLevel } from "./template-inventory";
import { isBuiltInTemplateLayout } from "./built-in-template";
import type { AipptNativeMeta } from "./types";

export type SlideLike = {
  layout?: string | null;
  layout_group?: string | null;
  content?: Record<string, unknown> | null;
};

export type SlideNativeCapability = {
  level: TemplateInventoryLevel;
  mode: "native" | "convertible" | "imported-background" | "legacy-only";
  reason: string;
};

type ValidNativeContent = {
  meta: AipptNativeMeta;
};

const GENERAL_LAYOUTS = new Set([
  "general-intro-slide",
  "basic-info-slide",
  "bullet-icons-only-slide",
  "bullet-with-icons-slide",
  "chart-with-bullets-slide",
  "metrics-slide",
  "metrics-with-image-slide",
  "numbered-bullets-slide",
  "quote-slide",
  "table-info-slide",
  "table-of-contents-slide",
  "team-slide",
]);

const MODERN_LAYOUTS = new Set([
  "intro-pitchdeck-slide",
  "IntroSlideLayout",
  "bullet-with-icons-description-grid",
  "BulletsWithIconsDescriptionGrid",
  "bullet-with-icons",
  "BulletWithIconsSlideLayout",
  "chart-or-table-with-description",
  "ChartOrTableWithDescription",
  "chart-with-metrics",
  "ChartOrTableWithMetricsDescription",
  "image-and-description",
  "ImageAndDescriptionLayout",
  "image-list-with-description",
  "ImageListWithDescriptionSlideLayout",
  "images-with-description",
  "ImagesWithDescriptionLayout",
  "metrics-with-description-image",
  "MetricsWithDescription",
  "table-of-contents",
  "TableOfContentsLayout",
]);

const STANDARD_LAYOUTS = new Set([
  "header-counter-two-column-image-text-slide",
  "IntroSlideLayout",
  "chart-left-text-right-layout",
  "ChartLeftTextRightLayout",
  "header-left-media-contact-info-slide",
  "ContactLayout",
  "split-left-strip-header-title-subtitle-cards-slide",
  "HeadingBulletImageDescriptionLayout",
  "header-bullets-title-description-image-slide",
  "IconBulletDescriptionLayout",
  "header-title-card-slide",
  "IconImageDescriptionLayout",
  "header-smallbar-title-team-cards-slide",
  "ImageListWithDescriptionLayout",
  "header-tagline-cards-grid-slide",
  "MetricsDescriptionLayout",
  "header-bullets-image-split-slide",
  "NumberedBulletSingleImageLayout",
  "table-of-contents-layout",
  "TableOfContentsLayout",
  "visual-metrics",
  "VisualMetricsSlideLayout",
]);

const SWIFT_LAYOUTS = new Set([
  "IntroSlideLayout",
  "bullet-with-icons-title-description",
  "icon-bullet-list-description-slide",
  "image-list-description-slide",
  "MetricsNumbers",
  "SwiftTableOfContents",
  "simple-bullet-points-layout",
  "tableorChart",
  "Timeline",
]);

function layoutKey(layout: string) {
  return layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
}

export function isCoalPowerLayout(slide: SlideLike): boolean {
  const layoutGroup = typeof slide.layout_group === "string" ? slide.layout_group : "";
  const layout = typeof slide.layout === "string" ? slide.layout : "";
  return (
    layoutGroup === "taicang-coal-power-report" &&
    (layoutKey(layout).startsWith("coal-power-") ||
      layoutKey(layout).startsWith("coal-blue-white-"))
  );
}

export function isGeneralLayout(slide: SlideLike): boolean {
  const layoutGroup = typeof slide.layout_group === "string" ? slide.layout_group : "";
  const layout = typeof slide.layout === "string" ? slide.layout : "";
  return layoutGroup === "general" && GENERAL_LAYOUTS.has(layoutKey(layout));
}

export function isModernLayout(slide: SlideLike): boolean {
  const layoutGroup = typeof slide.layout_group === "string" ? slide.layout_group : "";
  const layout = typeof slide.layout === "string" ? slide.layout : "";
  return layoutGroup === "modern" && MODERN_LAYOUTS.has(layoutKey(layout));
}

export function isStandardLayout(slide: SlideLike): boolean {
  const layoutGroup = typeof slide.layout_group === "string" ? slide.layout_group : "";
  const layout = typeof slide.layout === "string" ? slide.layout : "";
  return layoutGroup === "standard" && STANDARD_LAYOUTS.has(layoutKey(layout));
}

export function isSwiftLayout(slide: SlideLike): boolean {
  const layoutGroup = typeof slide.layout_group === "string" ? slide.layout_group : "";
  const layout = typeof slide.layout === "string" ? slide.layout : "";
  return layoutGroup === "swift" && SWIFT_LAYOUTS.has(layoutKey(layout));
}

export function getSlideNativeCapability(slide: SlideLike): SlideNativeCapability {
  const content = slide.content && typeof slide.content === "object" ? slide.content : {};

  if (isNativeSlideDocument(content.__aippt)) {
    const nativeDocument = content.__aippt as typeof content.__aippt & ValidNativeContent;
    if (nativeDocument.meta.sourceRenderer === "legacy-template-converter") {
      return {
        level: "D",
        mode: "legacy-only",
        reason: "legacy template overlay is web-editable but not native-exportable",
      };
    }

    return {
      level: nativeDocument.meta.fidelity,
      mode: "native",
      reason: "valid native model exists",
    };
  }

  if (isCoalPowerLayout(slide)) {
    return {
      level: "A",
      mode: "native",
      reason: "dedicated coal-power native builder exists",
    };
  }

  if (isGeneralLayout(slide)) {
    return {
      level: "A",
      mode: "native",
      reason: "dedicated general native builder exists",
    };
  }

  if (isModernLayout(slide)) {
    return {
      level: "A",
      mode: "native",
      reason: "dedicated modern native builder exists",
    };
  }

  if (isStandardLayout(slide)) {
    return {
      level: "A",
      mode: "native",
      reason: "dedicated standard native builder exists",
    };
  }

  if (isSwiftLayout(slide)) {
    return {
      level: "A",
      mode: "native",
      reason: "dedicated swift native builder exists",
    };
  }

  if (isBuiltInTemplateLayout(slide)) {
    return {
      level: "A",
      mode: "native",
      reason: "dedicated built-in native builder exists",
    };
  }

  if (typeof content.__imported_background === "string") {
    return {
      level: "C",
      mode: "imported-background",
      reason: "imported slide background fallback exists",
    };
  }

  const inventory = classifyTemplateContent(content);
  if (inventory.level === "B") {
    return {
      level: "B",
      mode: "convertible",
      reason: inventory.reason,
    };
  }

  return {
    level: "D",
    mode: "legacy-only",
    reason: inventory.reason,
  };
}

export function canUseNativeEditor(slide: SlideLike): boolean {
  const capability = getSlideNativeCapability(slide);
  return (
    capability.level !== "D" ||
    capability.mode === "legacy-only"
  );
}
