import type { AipptSlideDocument, AipptSlideElement, AipptTextElement, AipptTextStyle } from "./types";

type LegacyTemplateSlide = {
  layout?: string | null;
  layout_group?: string | null;
  content?: Record<string, unknown> | null;
};

const TITLE_FIELDS = new Set(["title", "heading", "headline", "name"]);
const SUBTITLE_FIELDS = new Set(["subtitle", "subTitle", "description", "summary", "caption"]);
const IMAGE_FIELDS = new Set(["image", "imageUrl", "img", "photo", "logo"]);
const IGNORED_SLIDE_FIELDS = new Set(["layout", "layout_group", "content"]);

const TITLE_STYLE: AipptTextStyle = {
  fontFace: "Microsoft YaHei",
  fontSize: 34,
  color: "111827",
  align: "left",
  valign: "top",
  margin: [0, 0, 0, 0],
  lineSpacingMultiple: 1.18,
  bold: true,
};

const SUBTITLE_STYLE: AipptTextStyle = {
  fontFace: "Microsoft YaHei",
  fontSize: 20,
  color: "4B5563",
  align: "left",
  valign: "top",
  margin: [0, 0, 0, 0],
  lineSpacingMultiple: 1.22,
};

const BODY_STYLE: AipptTextStyle = {
  fontFace: "Microsoft YaHei",
  fontSize: 22,
  color: "374151",
  align: "left",
  valign: "top",
  margin: [0, 0, 0, 0],
  lineSpacingMultiple: 1.26,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(isNonEmptyValue);
  if (typeof value === "object") return Object.values(value).some(isNonEmptyValue);
  return true;
}

function firstStringField(content: Record<string, unknown>, fields: Set<string>): string | null {
  for (const [key, value] of Object.entries(content)) {
    if (fields.has(key) && typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

function toBulletText(value: unknown): string | null {
  if (!Array.isArray(value)) return null;

  const lines = value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "number" || typeof item === "boolean") return String(item);
      if (isRecord(item) && typeof item.text === "string") return item.text.trim();
      return "";
    })
    .filter(Boolean)
    .map((text) => `• ${text}`);

  return lines.length > 0 ? lines.join("\n") : null;
}

function textElement(
  id: string,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  style: AipptTextStyle,
): AipptTextElement {
  return {
    id,
    type: "text",
    text,
    x,
    y,
    w,
    h,
    style: { ...style },
  };
}

function collectUnsupportedWarnings(
  slide: LegacyTemplateSlide,
  content: Record<string, unknown>,
  convertedContentFields: Set<string>,
): string[] {
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(slide as Record<string, unknown>)) {
    if (!IGNORED_SLIDE_FIELDS.has(key) && isNonEmptyValue(value)) {
      warnings.push(`unsupported non-empty field: ${key}`);
    }
  }

  for (const [key, value] of Object.entries(content)) {
    const isKnown =
      TITLE_FIELDS.has(key) ||
      SUBTITLE_FIELDS.has(key) ||
      IMAGE_FIELDS.has(key) ||
      key === "items" ||
      Array.isArray(value);

    if (isKnown && !convertedContentFields.has(key) && isNonEmptyValue(value)) {
      warnings.push(`unsupported non-empty field: ${key}`);
      continue;
    }

    if (!isKnown && isNonEmptyValue(value)) {
      warnings.push(`unsupported non-empty field: ${key}`);
    }
  }

  return warnings;
}

export function convertLegacyTemplateSlideToAippt(slide: LegacyTemplateSlide): AipptSlideDocument {
  const content = isRecord(slide.content) ? slide.content : {};
  const elements: AipptSlideElement[] = [];
  const convertedContentFields = new Set<string>();
  const title = firstStringField(content, TITLE_FIELDS);
  const subtitle = firstStringField(content, SUBTITLE_FIELDS);

  if (title) {
    elements.push(textElement("legacy-title", title, 86, 96, 860, 72, TITLE_STYLE));
    for (const [key, value] of Object.entries(content)) {
      if (TITLE_FIELDS.has(key) && value === title) {
        convertedContentFields.add(key);
        break;
      }
    }
  }

  if (subtitle) {
    elements.push(textElement("legacy-subtitle", subtitle, 86, 178, 760, 56, SUBTITLE_STYLE));
    for (const [key, value] of Object.entries(content)) {
      if (SUBTITLE_FIELDS.has(key) && value === subtitle) {
        convertedContentFields.add(key);
        break;
      }
    }
  }

  for (const [key, value] of Object.entries(content)) {
    const bulletText = key === "items" ? toBulletText(value) : Array.isArray(value) ? toBulletText(value) : null;
    if (bulletText) {
      elements.push(textElement(key === "items" ? "legacy-items" : `legacy-items-${key}`, bulletText, 86, 272, 720, 260, BODY_STYLE));
      convertedContentFields.add(key);
      break;
    }
  }

  for (const [key, value] of Object.entries(content)) {
    if (IMAGE_FIELDS.has(key) && typeof value === "string" && value.trim().length > 0) {
      elements.push({
        id: `legacy-image-${key}`,
        type: "image",
        src: value,
        x: 860,
        y: 132,
        w: 334,
        h: 420,
        fit: "cover",
      });
      convertedContentFields.add(key);
    }
  }

  return {
    id: "legacy-converted-slide",
    width: 1280,
    height: 720,
    meta: {
      version: 1,
      fidelity: "B",
      sourceRenderer: "legacy-template-converter",
      conversionStatus: "partial",
      sourceTemplate: typeof slide.layout_group === "string" ? slide.layout_group : undefined,
      sourceLayout: typeof slide.layout === "string" ? slide.layout : undefined,
      warnings: collectUnsupportedWarnings(slide, content, convertedContentFields),
    },
    elements,
  };
}
