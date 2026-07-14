const DEFAULT_TEMPLATE_TYPE = "standard";

function cleanTemplateType(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function inferPresentationTemplateType(presentation: any): string {
  const slide = Array.isArray(presentation?.slides)
    ? presentation.slides.find((candidate: any) =>
        cleanTemplateType(candidate?.layout_group),
      )
    : null;
  return (
    cleanTemplateType(slide?.layout_group) ??
    cleanTemplateType(presentation?.template_type) ??
    cleanTemplateType(presentation?.type) ??
    DEFAULT_TEMPLATE_TYPE
  );
}

export function buildPresentationEditorHref({
  presentationId,
  templateType,
  presentation,
  stream = false,
}: {
  presentationId: string;
  templateType?: string | null;
  presentation?: any;
  stream?: boolean;
}) {
  const params = new URLSearchParams();
  params.set("id", presentationId);
  if (stream) params.set("stream", "true");
  params.set(
    "type",
    cleanTemplateType(templateType) ??
      (presentation ? inferPresentationTemplateType(presentation) : DEFAULT_TEMPLATE_TYPE),
  );
  return `/presentation?${params.toString()}`;
}
