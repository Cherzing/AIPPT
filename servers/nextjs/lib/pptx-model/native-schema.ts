import type { AipptSlideDocument } from "./types";

export type NativeValidationResult =
  | { valid: true; document: AipptSlideDocument }
  | { valid: false; errors: string[] };

const FIDELITY = new Set(["A", "B", "C", "D"]);
const SOURCE = new Set([
  "native",
  "coal-power-builder",
  "general-template-builder",
  "modern-template-builder",
  "standard-template-builder",
  "swift-template-builder",
  "built-in-template-builder",
  "legacy-template-converter",
  "ppt-importer",
  "manual-template-authoring",
]);
const STATUS = new Set(["complete", "partial", "background-fallback", "legacy-only"]);

export function validateNativeSlideDocument(value: unknown): NativeValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== "object") {
    return { valid: false, errors: ["document must be an object"] };
  }

  const document = value as Partial<AipptSlideDocument>;

  if (document.width !== 1280) errors.push("width must be 1280");
  if (document.height !== 720) errors.push("height must be 720");
  if (!Array.isArray(document.elements)) errors.push("elements must be an array");

  if (!document.meta || typeof document.meta !== "object") {
    errors.push("meta.version is required");
    errors.push("meta.fidelity is required");
    errors.push("meta.sourceRenderer is required");
    errors.push("meta.conversionStatus is required");
  }
  else {
    if (document.meta.version !== 1) errors.push("meta.version is required");
    if (!FIDELITY.has(document.meta.fidelity)) errors.push("meta.fidelity is invalid");
    if (!SOURCE.has(document.meta.sourceRenderer)) errors.push("meta.sourceRenderer is invalid");
    if (!STATUS.has(document.meta.conversionStatus)) errors.push("meta.conversionStatus is invalid");
  }

  if (errors.length > 0) return { valid: false, errors };

  return { valid: true, document: document as AipptSlideDocument };
}

export function isNativeSlideDocument(value: unknown): value is AipptSlideDocument {
  return validateNativeSlideDocument(value).valid;
}
