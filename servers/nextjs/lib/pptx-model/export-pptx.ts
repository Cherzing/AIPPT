import pptxgen from "pptxgenjs";
import path from "node:path";

import { boxToPptx, PPTX_HEIGHT_IN, PPTX_WIDTH_IN, pxToIn } from "./geometry";
import type {
  AipptFill,
  AipptLine,
  AipptPresentationDocument,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableCell,
  AipptTextStyle,
} from "./types";

type Pptx = pptxgen;
type PptxSlide = ReturnType<pptxgen["addSlide"]>;

export type ExportAipptModelPptxParams = {
  document: AipptPresentationDocument;
  outPath: string;
};

function cleanColor(value: string | undefined, fallback = "000000") {
  return (value || fallback).replace(/^#/, "").toUpperCase();
}

function resolveAssetPath(src: string) {
  if (/^data:image\//.test(src)) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (path.isAbsolute(src) && !src.startsWith("/")) return src;
  if (src.startsWith("/")) return path.join(process.cwd(), "public", src);
  return src;
}

function normalizeTransparency(value: number | undefined) {
  if (value === undefined) return undefined;
  return Math.max(0, Math.min(100, value));
}

function fillOption(fill?: AipptFill) {
  if (!fill) return undefined;
  return {
    color: cleanColor(fill.color),
    transparency: normalizeTransparency(fill.transparency),
  };
}

function lineOption(line?: AipptLine) {
  if (!line || line.width <= 0) return { color: "FFFFFF", transparency: 100 };
  const arrow = (type?: AipptLine["beginArrowType"]) => {
    if (type === "triangle") return "triangle" as const;
    if (type === "oval") return "oval" as const;
    return "none" as const;
  };
  return {
    color: cleanColor(line.color),
    width: line.width,
    transparency: normalizeTransparency(line.transparency),
    dash: line.dash === "dash" ? "dash" : line.dash === "dot" ? "sysDot" : "solid",
    beginArrowType: arrow(line.beginArrowType),
    endArrowType: arrow(line.endArrowType),
  };
}

function marginOption(margin?: [number, number, number, number]) {
  if (!margin) return [0, 0, 0, 0] as [number, number, number, number];
  return margin.map((value) => pxToIn(value)) as [number, number, number, number];
}

function addText(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "text" }>) {
  const style = element.style;
  slide.addText(element.text, {
    ...boxToPptx(element),
    rotate: element.rotate,
    margin: marginOption(style.margin),
    fontFace: style.fontFace,
    fontSize: style.fontSize,
    color: cleanColor(style.color),
    bold: style.bold ?? false,
    italic: style.italic ?? false,
    underline: style.underline ? { color: cleanColor(style.color) } : undefined,
    align: style.align ?? "left",
    valign: style.valign ?? "top",
    breakLine: false,
    fit: "shrink",
  });
}

function addImage(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "image" }>) {
  const imageOptions = {
    ...boxToPptx(element),
    rotate: element.rotate,
  };
  if (/^data:image\//.test(element.src)) {
    slide.addImage({ ...imageOptions, data: element.src });
    return;
  }
  slide.addImage({ ...imageOptions, path: resolveAssetPath(element.src) });
}

function shapeType(shape: Extract<AipptSlideElement, { type: "shape" }>["shape"]) {
  const shapeMap: Record<typeof shape, string> = {
    rect: "rect",
    roundRect: "roundRect",
    ellipse: "ellipse",
    triangle: "triangle",
    diamond: "diamond",
    parallelogram: "parallelogram",
    trapezoid: "trapezoid",
    pentagon: "pentagon",
    hexagon: "hexagon",
    plus: "plus",
    rightArrow: "rightArrow",
    leftArrow: "leftArrow",
    upArrow: "upArrow",
    downArrow: "downArrow",
    cloud: "cloud",
    heart: "heart",
    star5: "star5",
  };
  return shapeMap[shape] ?? "rect";
}

function addShape(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "shape" }>) {
  slide.addShape(shapeType(element.shape) as any, {
    ...boxToPptx(element),
    rotate: element.rotate,
    fill: fillOption(element.fill) ?? { color: "FFFFFF", transparency: 100 },
    line: lineOption(element.line),
  });
}

function addLine(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "line" }>) {
  const drawSegment = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    slide.addShape("line" as any, {
      x: pxToIn(start.x),
      y: pxToIn(start.y),
      w: pxToIn(end.x - start.x),
      h: pxToIn(end.y - start.y),
      line: lineOption(element.line),
    });
  };

  if (element.lineType === "polyline" || element.lineType === "elbow") {
    const points = [{ x: element.x, y: element.y }, ...(element.points ?? []), { x: element.x2, y: element.y2 }];
    points.slice(0, -1).forEach((point, index) => drawSegment(point, points[index + 1]));
    return;
  }

  if (element.lineType === "curve" || element.lineType === "cubic") {
    const samplePoints: Array<{ x: number; y: number }> = [];
    const control = element.controlPoints?.[0] ?? {
      x: (element.x + element.x2) / 2,
      y: Math.min(element.y, element.y2) - 80,
    };
    const control2 = element.controlPoints?.[1] ?? control;
    for (let step = 0; step <= 16; step += 1) {
      const t = step / 16;
      if (element.lineType === "cubic") {
        const mt = 1 - t;
        samplePoints.push({
          x: mt ** 3 * element.x + 3 * mt ** 2 * t * control.x + 3 * mt * t ** 2 * control2.x + t ** 3 * element.x2,
          y: mt ** 3 * element.y + 3 * mt ** 2 * t * control.y + 3 * mt * t ** 2 * control2.y + t ** 3 * element.y2,
        });
      } else {
        const mt = 1 - t;
        samplePoints.push({
          x: mt ** 2 * element.x + 2 * mt * t * control.x + t ** 2 * element.x2,
          y: mt ** 2 * element.y + 2 * mt * t * control.y + t ** 2 * element.y2,
        });
      }
    }
    samplePoints.slice(0, -1).forEach((point, index) => drawSegment(point, samplePoints[index + 1]));
    return;
  }

  drawSegment({ x: element.x, y: element.y }, { x: element.x2, y: element.y2 });
}

function tableCell(
  cell: AipptTableCell,
  style: Extract<AipptSlideElement, { type: "table" }>["style"],
) {
  return {
    text: cell.text,
    options: {
      fontFace: style.fontFace,
      fontSize: style.fontSize,
      color: cleanColor(cell.color ?? style.color),
      bold: cell.bold ?? false,
      align: cell.align ?? "center",
      valign: cell.valign ?? "middle",
      margin: marginOption(style.margin ?? [6, 6, 6, 6]),
      fill: cell.fill ? { color: cleanColor(cell.fill) } : undefined,
    },
  };
}

function addTable(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "table" }>) {
  slide.addTable(
    element.rows.map((row) => row.map((cell) => tableCell(cell, element.style))),
    {
      ...boxToPptx(element),
      colW: element.columns.map((column) => pxToIn(column)),
      border: {
        type: "solid",
        pt: 0.75,
        color: cleanColor(element.style.borderColor, "D6DDE3"),
      },
    },
  );
}

function addChart(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "chart" }>) {
  const chartType =
    element.chartType === "line"
      ? (pptxgen.ChartType.line as any)
      : element.chartType === "pie"
        ? (pptxgen.ChartType.pie as any)
        : (pptxgen.ChartType.bar as any);

  slide.addChart(
    chartType,
    element.series.map((series) => ({
      name: series.name,
      labels: element.categories,
      values: series.values,
    })),
    {
      ...boxToPptx(element),
      showTitle: Boolean(element.title),
      title: element.title,
      showLegend: true,
      showValue: false,
      catAxisLabelFontFace: element.style.fontFace,
      catAxisLabelFontSize: element.style.fontSize,
      valAxisLabelFontFace: element.style.fontFace,
      valAxisLabelFontSize: element.style.fontSize,
      valAxisLineColor: cleanColor(element.style.axisColor, "94A3B8"),
      catAxisLineColor: cleanColor(element.style.axisColor, "94A3B8"),
      showCatName: true,
      showLeaderLines: true,
    } as any,
  );
}

function addFormula(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "formula" }>) {
  slide.addShape("roundRect" as any, {
    ...boxToPptx(element),
    fill: { color: cleanColor(element.style.backgroundColor, "FFFFFF") },
    line: { color: cleanColor(element.style.borderColor, "CBD5E1"), width: 1 },
    radius: 0.12,
  } as any);
  slide.addText(element.displayText, {
    ...boxToPptx(element),
    margin: marginOption(element.style.margin ?? [8, 8, 8, 8]),
    fontFace: element.style.fontFace,
    fontSize: element.style.fontSize,
    color: cleanColor(element.style.color),
    align: element.style.align ?? "center",
    valign: element.style.valign ?? "middle",
    fit: "shrink",
  });
}

function addMediaPlaceholder(slide: PptxSlide, element: Extract<AipptSlideElement, { type: "media" }>) {
  slide.addShape("roundRect" as any, {
    ...boxToPptx(element),
    fill: { color: cleanColor(element.style.backgroundColor) },
    line: { color: cleanColor(element.style.borderColor), width: 1, dash: "dash" },
    radius: 0.16,
  } as any);
  slide.addText(`${element.mediaType === "video" ? "▶" : "♫"}  ${element.title}`, {
    ...boxToPptx(element),
    margin: [0.08, 0.08, 0.08, 0.08],
    fontFace: element.style.fontFace,
    fontSize: element.style.fontSize,
    color: cleanColor(element.style.color),
    bold: true,
    align: "center",
    valign: "middle",
    fit: "shrink",
  });
}

function addElement(slide: PptxSlide, element: AipptSlideElement) {
  if (element.type === "text") addText(slide, element);
  if (element.type === "image") addImage(slide, element);
  if (element.type === "shape") addShape(slide, element);
  if (element.type === "line") addLine(slide, element);
  if (element.type === "table") addTable(slide, element);
  if (element.type === "chart") addChart(slide, element);
  if (element.type === "formula") addFormula(slide, element);
  if (element.type === "media") addMediaPlaceholder(slide, element);
  if (element.type === "group") {
    for (const child of element.elements) addElement(slide, child);
  }
}

function addBackground(slide: PptxSlide, document: AipptSlideDocument) {
  if (!document.background) {
    slide.background = { color: "FFFFFF" };
    return;
  }
  if (document.background.type === "solid") {
    slide.background = { color: cleanColor(document.background.color, "FFFFFF") };
    return;
  }
  const backgroundSrc = resolveAssetPath(document.background.src);
  if (/^data:image\//.test(backgroundSrc)) {
    slide.addImage({
      data: backgroundSrc,
      x: 0,
      y: 0,
      w: PPTX_WIDTH_IN,
      h: PPTX_HEIGHT_IN,
    });
    return;
  }
  slide.addImage({
    path: backgroundSrc,
    x: 0,
    y: 0,
    w: PPTX_WIDTH_IN,
    h: PPTX_HEIGHT_IN,
  });
}

export async function exportAipptModelPptx({
  document,
  outPath,
}: ExportAipptModelPptxParams) {
  const pptx = new pptxgen();
  pptx.author = "AIPPT";
  pptx.subject = document.title ?? "AIPPT";
  pptx.title = document.title ?? "AIPPT";
  pptx.company = "AIPPT";
  pptx.defineLayout({
    name: "AIPPT_WIDE",
    width: PPTX_WIDTH_IN,
    height: PPTX_HEIGHT_IN,
  });
  pptx.layout = "AIPPT_WIDE";
  pptx.theme = {
    headFontFace: "Microsoft YaHei",
    bodyFontFace: "Microsoft YaHei",
  };

  for (const slideDocument of document.slides) {
    const slide = pptx.addSlide();
    addBackground(slide, slideDocument);
    for (const element of slideDocument.elements) {
      addElement(slide, element);
    }
  }

  await pptx.writeFile({ fileName: outPath });
}

export function isAipptModelDocument(value: unknown): value is AipptPresentationDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as AipptPresentationDocument;
  return Array.isArray(document.slides) && document.slides.every(isAipptSlideDocument);
}

export function isAipptSlideDocument(value: unknown): value is AipptSlideDocument {
  if (!value || typeof value !== "object") return false;
  const slide = value as AipptSlideDocument;
  return (
    typeof slide.id === "string" &&
    slide.width === 1280 &&
    slide.height === 720 &&
    Array.isArray(slide.elements)
  );
}
