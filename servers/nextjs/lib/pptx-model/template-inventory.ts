export type TemplateInventoryLevel = "A" | "B" | "C" | "D";

export type TemplateInventoryResult = {
  level: TemplateInventoryLevel;
  reason: string;
  supportedFields: string[];
  unsupportedFields: string[];
};

const LEGACY_CODE_FIELDS = new Set([
  "html",
  "jsx",
  "code",
  "componentCode",
  "reactCode",
]);

const SUPPORTED_FIELD_NAMES = new Set([
  "title",
  "subtitle",
  "subTitle",
  "description",
  "summary",
  "caption",
  "items",
  "image",
  "imageUrl",
  "img",
  "photo",
  "logo",
]);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSupportedPrimitive(value: unknown): boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  );
}

function isStructuredArray(value: unknown[]): boolean {
  return value.every((item) => isSupportedPrimitive(item) || isPlainRecord(item));
}

function isSupportedStructuredValue(field: string, value: unknown): boolean {
  if (SUPPORTED_FIELD_NAMES.has(field)) {
    return isSupportedPrimitive(value) || Array.isArray(value);
  }
  if (isSupportedPrimitive(value)) return true;
  if (Array.isArray(value)) return isStructuredArray(value);
  return false;
}

export function classifyTemplateContent(
  content: Record<string, unknown>
): TemplateInventoryResult {
  const supportedFields: string[] = [];
  const unsupportedFields: string[] = [];

  for (const [field, value] of Object.entries(content)) {
    if (LEGACY_CODE_FIELDS.has(field)) {
      unsupportedFields.push(field);
      continue;
    }

    if (isSupportedStructuredValue(field, value)) {
      supportedFields.push(field);
    } else {
      unsupportedFields.push(field);
    }
  }

  if (unsupportedFields.some((field) => LEGACY_CODE_FIELDS.has(field))) {
    return {
      level: "D",
      reason: "contains html/jsx/code/componentCode/reactCode legacy rendering field",
      supportedFields,
      unsupportedFields,
    };
  }

  if (supportedFields.length > 0) {
    return {
      level: "B",
      reason:
        unsupportedFields.length > 0
          ? "structured fields are convertible, with complex fields recorded as unsupported"
          : "contains structured text/image/list fields suitable for native conversion",
      supportedFields,
      unsupportedFields,
    };
  }

  return {
    level: "D",
    reason: "no supported structured fields found",
    supportedFields,
    unsupportedFields,
  };
}
