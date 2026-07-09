import type { AipptSlideDocument, AipptTextStyle } from "./types";

const IMPORTED_SLIDE_WARNING =
  "Original PPT elements are preserved as background; only extracted overlays are editable.";

export type ImportedTextBox = {
  text: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fontFace?: string;
  fontSize?: number;
  color?: string;
  align?: AipptTextStyle["align"];
  valign?: AipptTextStyle["valign"];
};

export type BuildImportedBackgroundSlideParams = {
  backgroundSrc: string;
  extractedTexts?: ImportedTextBox[];
};

const DEFAULT_TEXT_STYLE: AipptTextStyle = {
  fontFace: "Microsoft YaHei",
  fontSize: 22,
  color: "111827",
  align: "left",
  valign: "top",
  margin: [0, 0, 0, 0],
  lineSpacingMultiple: 1.2,
};

export function buildImportedBackgroundSlide({
  backgroundSrc,
  extractedTexts = [],
}: BuildImportedBackgroundSlideParams): AipptSlideDocument {
  return {
    id: "imported-background-slide",
    width: 1280,
    height: 720,
    meta: {
      version: 1,
      fidelity: "C",
      sourceRenderer: "ppt-importer",
      conversionStatus: "background-fallback",
      warnings: [IMPORTED_SLIDE_WARNING],
    },
    elements: [
      {
        id: "imported-background",
        type: "image",
        src: backgroundSrc,
        x: 0,
        y: 0,
        w: 1280,
        h: 720,
        fit: "cover",
        locked: true,
      },
      ...extractedTexts
        .filter((textBox) => textBox.text.trim().length > 0)
        .map((textBox, index) => ({
          id: `imported-text-${index + 1}`,
          type: "text" as const,
          text: textBox.text,
          x: textBox.x ?? 86,
          y: textBox.y ?? 96 + index * 72,
          w: textBox.w ?? 860,
          h: textBox.h ?? 56,
          style: {
            ...DEFAULT_TEXT_STYLE,
            fontFace: textBox.fontFace ?? DEFAULT_TEXT_STYLE.fontFace,
            fontSize: textBox.fontSize ?? DEFAULT_TEXT_STYLE.fontSize,
            color: textBox.color ?? DEFAULT_TEXT_STYLE.color,
            align: textBox.align ?? DEFAULT_TEXT_STYLE.align,
            valign: textBox.valign ?? DEFAULT_TEXT_STYLE.valign,
            margin: DEFAULT_TEXT_STYLE.margin,
            lineSpacingMultiple: DEFAULT_TEXT_STYLE.lineSpacingMultiple,
          },
        })),
    ],
  };
}
