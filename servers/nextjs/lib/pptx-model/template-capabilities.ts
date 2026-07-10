import { isNativeSlideDocument } from "./native-schema";
import { classifyTemplateContent, type TemplateInventoryLevel } from "./template-inventory";
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

export function isCoalPowerLayout(slide: SlideLike): boolean {
  const layoutGroup = typeof slide.layout_group === "string" ? slide.layout_group : "";
  const layout = typeof slide.layout === "string" ? slide.layout : "";
  const layoutKey = layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
  return (
    layoutGroup === "taicang-coal-power-report" &&
    (layoutKey.startsWith("coal-power-") ||
      layoutKey.startsWith("coal-blue-white-"))
  );
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
