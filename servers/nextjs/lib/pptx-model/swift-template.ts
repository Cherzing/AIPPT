import type {
  AipptChartElement,
  AipptNativeMeta,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableCell,
  AipptTextStyle,
} from "./types";

const GROUP = "swift";
const WHITE = "FFFFFF";
const BG = "FFFFFF";
const TEXT = "111827";
const MUTED = "6B7280";
const STROKE = "E5E7EB";
const CARD = "F3F4F6";
const PRIMARY = "BFF4FF";
const FONT = "Albert Sans";
const DEFAULT_ICON = "/static/icons/bold/checks-bold.svg";
const CHART_COLORS = ["3B82F6", "EF4444", "10B981", "F59E0B", "8B5CF6", "06B6D4"];
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIHJ4PSIxNiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0xMjAgMjUwaDQwMGwtMTEyLTEyMC04OCA5OC02NC03NC0xMzYgOTZ6IiBmaWxsPSIjQkZGNEZGIi8+PGNpcmNsZSBjeD0iNDkwIiBjeT0iOTQiIHI9IjQ0IiBmaWxsPSIjMTExODI3IiBvcGFjaXR5PSIuMTUiLz48dGV4dCB4PSIzMjAiIHk9IjMxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIj5FZGl0YWJsZSBpbWFnZTwvdGV4dD48L3N2Zz4=";

const SWIFT_LAYOUT_ALIASES: Record<string, string> = {
  IntroSlideLayout: "intro",
  "bullet-with-icons-title-description": "icon-row",
  "icon-bullet-list-description-slide": "feature-cards",
  "image-list-description-slide": "image-list",
  MetricsNumbers: "metrics",
  SwiftTableOfContents: "toc",
  "simple-bullet-points-layout": "simple-points",
  tableorChart: "table-chart",
  Timeline: "timeline",
};

type SwiftSlideLike = {
  id?: string | null;
  index?: number;
  layout?: string | null;
  layout_group?: string | null;
  content?: Record<string, any> | null;
};

function rawLayout(slide: SwiftSlideLike) {
  const layout = slide.layout ?? "";
  return layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
}

function key(slide: SwiftSlideLike) {
  const raw = rawLayout(slide);
  return SWIFT_LAYOUT_ALIASES[raw] ?? raw;
}

function swiftMeta(layout: string): AipptNativeMeta {
  return {
    version: 1,
    fidelity: "A",
    sourceRenderer: "swift-template-builder",
    conversionStatus: "complete",
    sourceTemplate: GROUP,
    sourceLayout: layout,
  };
}

function withSwiftMeta(
  document: AipptSlideDocument,
  layout: string,
): AipptSlideDocument {
  return {
    ...document,
    meta: swiftMeta(layout),
  };
}

function str(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function num(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function arr<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function cleanColor(value: unknown, fallback: string) {
  return str(value, fallback).replace(/^#/, "").toUpperCase();
}

function primary(data: Record<string, any>) {
  return cleanColor(data.__primaryColor__ ?? data.primaryColor, PRIMARY);
}

function style(
  fontSize: number,
  color = TEXT,
  extra: Partial<AipptTextStyle> = {},
): AipptTextStyle {
  return {
    fontFace: FONT,
    fontSize,
    color,
    align: "left",
    valign: "top",
    margin: [0, 0, 0, 0],
    lineSpacingMultiple: 1.22,
    ...extra,
  };
}

function text(
  id: string,
  value: string,
  x: number,
  y: number,
  w: number,
  h: number,
  textStyle: AipptTextStyle,
): AipptSlideElement {
  return { id, type: "text", text: value, x, y, w, h, style: textStyle };
}

function rect(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  line = fill,
  options: {
    radius?: number;
    locked?: boolean;
    opacity?: number;
    transparency?: number;
  } = {},
): AipptSlideElement {
  return {
    id,
    type: "shape",
    shape: options.radius ? "roundRect" : "rect",
    x,
    y,
    w,
    h,
    opacity: options.opacity,
    locked: options.locked,
    radius: options.radius,
    fill: { color: fill, transparency: options.transparency },
    line: {
      color: line,
      width: line === fill ? 0 : 1,
      transparency: options.transparency,
    },
  };
}

function ellipse(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  line = fill,
  options: { locked?: boolean; transparency?: number } = {},
): AipptSlideElement {
  return {
    ...rect(id, x, y, w, h, fill, line, options),
    shape: "ellipse",
  } as AipptSlideElement;
}

function diamond(
  id: string,
  x: number,
  y: number,
  size: number,
  color = TEXT,
): AipptSlideElement {
  return {
    ...rect(id, x, y, size, size, color, color, { locked: true }),
    shape: "diamond",
  } as AipptSlideElement;
}

function locked(element: AipptSlideElement): AipptSlideElement {
  return { ...element, locked: true };
}

function imageValue(value: unknown, fallbackPrompt: string) {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const src = str(record.__image_url__ ?? record.url ?? record.src, "");
    return {
      src: src || FALLBACK_IMAGE,
      prompt: str(record.__image_prompt__ ?? record.prompt, fallbackPrompt),
    };
  }
  if (typeof value === "string" && value.trim()) {
    return { src: value.trim(), prompt: fallbackPrompt };
  }
  return { src: FALLBACK_IMAGE, prompt: fallbackPrompt };
}

function iconValue(value: unknown) {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return {
      src: str(record.__icon_url__ ?? record.url ?? record.src, DEFAULT_ICON) || DEFAULT_ICON,
      prompt: str(record.__icon_query__ ?? record.prompt, "icon"),
    };
  }
  return { src: DEFAULT_ICON, prompt: "icon" };
}

function image(
  id: string,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    fit?: "stretch" | "cover" | "contain";
    prompt?: string;
    name?: string;
    locked?: boolean;
    opacity?: number;
  } = {},
): AipptSlideElement {
  return {
    id,
    type: "image",
    src,
    x,
    y,
    w,
    h,
    fit: options.fit ?? "cover",
    prompt: options.prompt,
    name: options.name,
    locked: options.locked,
    opacity: options.opacity,
  };
}

function line(
  id: string,
  x: number,
  y: number,
  x2: number,
  y2: number,
  color = TEXT,
  width = 2,
): AipptSlideElement {
  return {
    id,
    type: "line",
    x,
    y,
    w: Math.max(1, Math.abs(x2 - x)),
    h: Math.max(1, Math.abs(y2 - y)),
    x2,
    y2,
    line: { color, width },
    locked: true,
  };
}

function document(id: string, elements: AipptSlideElement[]): AipptSlideDocument {
  return {
    id,
    width: 1280,
    height: 720,
    background: { type: "solid", color: BG },
    elements,
  };
}

function slideId(slide: SwiftSlideLike, name: string) {
  return slide.id ?? `swift-${name}-${slide.index ?? 0}`;
}

function brand(data: Record<string, any>): AipptSlideElement[] {
  const logo = str(data._logo_url__, "");
  const company = str(data.__companyName__, "");
  const elements: AipptSlideElement[] = [diamond("brand-diamond", 48, 28, 12)];
  if (logo) {
    elements.push(image("brand-logo", logo, 70, 22, 24, 24, { fit: "contain", locked: true }));
  }
  if (company) {
    elements.push(text("brand-company", company, logo ? 102 : 70, 23, 260, 24, style(16, MUTED)));
  }
  return elements.map(locked);
}

function footer(data: Record<string, any>): AipptSlideElement[] {
  return [
    text("footer-website", str(data.website, "www.yourwebsite.com"), 48, 654, 190, 22, style(14, MUTED)),
    line("footer-line", 260, 666, 1192, 666, TEXT, 2),
    diamond("footer-diamond", 1220, 658, 32),
  ];
}

function chartElement(
  id: string,
  chartData: unknown,
  x: number,
  y: number,
  w: number,
  h: number,
): AipptChartElement {
  const source = chartData && typeof chartData === "object" ? (chartData as Record<string, any>) : {};
  const chartType = source.type === "pie" ? "pie" : source.type === "line" ? "line" : "bar";
  const points = arr<Record<string, any>>(source.data);
  const categories = points.length
    ? points.map((point, index) => str(point.label ?? point.name ?? point.x, `Item ${index + 1}`))
    : ["A", "B", "C"];
  const values = points.length
    ? points.map((point) => num(point.value ?? point.y, 0))
    : [60, 42, 75];

  return {
    id,
    type: "chart",
    chartType,
    x,
    y,
    w,
    h,
    categories,
    series: [{ name: "Value", values, color: CHART_COLORS[0] }],
    style: {
      fontFace: FONT,
      fontSize: 12,
      color: MUTED,
      axisColor: "CBD5E1",
      gridColor: STROKE,
      backgroundColor: WHITE,
    },
  };
}

function tableElement(
  id: string,
  columns: string[],
  rows: Array<{ cells?: unknown[] }>,
  x: number,
  y: number,
  w: number,
  data: Record<string, any>,
): AipptSlideElement {
  const resolvedColumns = columns.length ? columns : ["Column 1", "Column 2", "Column 3"];
  const resolvedRows = rows.length ? rows : [{ cells: ["Row A", "Value", "123"] }];
  const tableRows: AipptTableCell[][] = [
    resolvedColumns.map((column) => ({
      text: str(column, "-"),
      fill: primary(data),
      color: TEXT,
      bold: true,
    })),
    ...resolvedRows.map((row, rowIndex) =>
      resolvedColumns.map((_, cellIndex) => ({
        text: str(arr(row.cells)[cellIndex], ""),
        fill: rowIndex % 2 === 0 ? primary(data) : CARD,
        color: MUTED,
      })),
    ),
  ];
  return {
    id,
    type: "table",
    x,
    y,
    w,
    h: Math.max(96, 44 * tableRows.length),
    columns: resolvedColumns.map(() => w / resolvedColumns.length),
    rows: tableRows,
    style: {
      fontFace: FONT,
      fontSize: 13,
      color: MUTED,
      borderColor: STROKE,
      margin: [4, 8, 4, 8],
    },
  };
}

function buildIntro(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const mainImage = imageValue(data.media?.image ?? data.image, "business cover image");
  const introCard = data.introCard && typeof data.introCard === "object" ? data.introCard : {};
  const showIntro = introCard.enabled !== false;
  const elements: AipptSlideElement[] = [
    ...brand(data),
    image("hero-image", mainImage.src, 819, 0, 461, 520, {
      prompt: mainImage.prompt,
      name: "Hero image",
    }),
    diamond("right-diamond-0", 786, 34, 12),
    diamond("right-diamond-1", 786, 58, 12),
    diamond("right-diamond-2", 786, 82, 12),
    text("title", str(data.title, "Pitch Deck"), 48, 114, 700, 156, style(64, TEXT, { bold: true, lineSpacingMultiple: 1.05 })),
    text("paragraph", str(data.paragraph ?? data.description, "Concise paragraph describing the presentation."), 48, 292, 620, 92, style(16, MUTED, { lineSpacingMultiple: 1.6 })),
  ];
  if (showIntro) {
    elements.push(
      rect("intro-card", 48, 420, 420, 58, primary(data), primary(data), { radius: 4 }),
      rect("intro-card-bar", 64, 437, 8, 24, TEXT, TEXT, { locked: true }),
      text("intro-name", str(introCard.name, "John Doe"), 92, 434, 170, 22, style(16, TEXT, { bold: true })),
      text("intro-date", str(introCard.date, "Jan 1, 2025"), 278, 436, 150, 20, style(14, MUTED)),
    );
  }
  elements.push(...footer(data));
  return document(slideId(slide, "intro"), elements);
}

function buildIconRow(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const items = arr<Record<string, any>>(data.items);
  const count = Math.max(1, Math.min(4, items.length || 4));
  const cardW = 260;
  const gap = 32;
  const startX = (1280 - count * cardW - (count - 1) * gap) / 2;
  return document(slideId(slide, "icon-row"), [
    ...brand(data),
    text("title", str(data.title, "Our Infographic"), 48, 92, 650, 128, style(56, TEXT, { bold: true, lineSpacingMultiple: 1.05 })),
    text("side-heading", str(data.sideHeading, "Lorem ipsum dolor sit amet,"), 760, 104, 380, 24, style(16, TEXT, { bold: true })),
    text("side-paragraph", str(data.sideParagraph, "Concise paragraph describing context."), 760, 134, 380, 66, style(14, MUTED, { lineSpacingMultiple: 1.6 })),
    ...items.slice(0, 4).flatMap((item, index) => {
      const left = startX + index * (cardW + gap);
      const icon = iconValue(item.icon);
      return [
        ellipse(`item-circle-${index}`, left + 50, 272, 160, 160, primary(data), primary(data)),
        image(`item-icon-${index}`, icon.src, left + 102, 324, 56, 56, {
          fit: "contain",
          prompt: icon.prompt,
          name: "Icon",
        }),
        text(`item-title-${index}`, str(item.title, "Lorem ipsum dolor"), left, 458, cardW, 28, style(16, TEXT, { bold: true, align: "center" })),
        text(`item-description-${index}`, str(item.description, "Concise supporting text."), left, 496, cardW, 62, style(13, MUTED, { align: "center", lineSpacingMultiple: 1.55 })),
      ];
    }),
    ...footer(data),
  ]);
}

function buildFeatureCards(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const features = arr<Record<string, any>>(data.features);
  const count = Math.max(1, Math.min(4, features.length || 4));
  const cardW = 260;
  const gap = 24;
  const startX = (1280 - count * cardW - (count - 1) * gap) / 2;
  return document(slideId(slide, "feature-cards"), [
    ...brand(data),
    text("title", str(data.title, "Key Product Features"), 48, 92, 760, 64, style(48, TEXT, { bold: true })),
    text("description", str(data.description, "Concise description for this feature overview."), 48, 162, 760, 48, style(16, MUTED)),
    rect("cyan-band", 0, 480, 1280, 160, primary(data), primary(data), { locked: true }),
    ...features.slice(0, 4).flatMap((feature, index) => {
      const left = startX + index * (cardW + gap);
      const icon = iconValue(feature.icon);
      return [
        rect(`feature-card-${index}`, left, 250, cardW, 240, primary(data), primary(data), { radius: 22 }),
        rect(`feature-icon-bg-${index}`, left + 24, 274, 40, 40, WHITE, WHITE, { radius: 4 }),
        image(`feature-icon-${index}`, icon.src, left + 32, 282, 24, 24, {
          fit: "contain",
          prompt: icon.prompt,
          name: "Icon",
        }),
        text(`feature-title-${index}`, str(feature.title, "Customizable Workflows"), left + 24, 342, cardW - 48, 48, style(18, TEXT, { bold: true })),
        text(`feature-body-${index}`, str(feature.body ?? feature.description, "Editable feature body."), left + 24, 404, cardW - 48, 58, style(14, MUTED, { lineSpacingMultiple: 1.55 })),
      ];
    }),
    ...footer(data),
  ]);
}

function buildImageList(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const items = arr<Record<string, any>>(data.items);
  return document(slideId(slide, "image-list"), [
    ...brand(data),
    text("title-line-1", str(data.titleLine1, "Meet Our"), 48, 116, 430, 62, style(56, TEXT, { bold: true })),
    text("title-line-2", str(data.titleLine2, "Team"), 48, 178, 430, 62, style(56, TEXT, { bold: true })),
    text("description", str(data.description, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."), 48, 300, 320, 104, style(16, MUTED, { lineSpacingMultiple: 1.75 })),
    ...items.slice(0, 3).flatMap((item, index) => {
      const left = 520 + index * 226;
      const itemImage = imageValue(item.image, str(item.title, "item image"));
      return [
        image(`item-image-${index}`, itemImage.src, left, 124, 184, 180, {
          prompt: itemImage.prompt,
          name: str(item.title, "Image"),
        }),
        rect(`item-panel-${index}`, left, 304, 184, 224, primary(data), primary(data), { radius: 28 }),
        text(`item-title-${index}`, str(item.title, "Sample Title"), left + 24, 334, 136, 50, style(20, TEXT, { bold: true })),
        text(`item-description-${index}`, str(item.description, "Short description for the image or item."), left + 24, 404, 136, 86, style(14, MUTED, { lineSpacingMultiple: 1.55 })),
      ];
    }),
    ...footer(data),
  ]);
}

function buildMetrics(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const metrics = arr<Record<string, any>>(data.metrics);
  return document(slideId(slide, "metrics"), [
    ...brand(data),
    line("center-divider", 640, 0, 640, 720, "E5E7EB", 1),
    text("title", str(data.title, "Our Impact in Numbers"), 48, 92, 430, 118, style(48, TEXT, { bold: true, lineSpacingMultiple: 1.1 })),
    ellipse("left-dot", 48, 270, 20, 20, TEXT, TEXT, { locked: true }),
    text("left-title", str(data.leftTitle, "Proven Results\nThrough Data"), 84, 254, 320, 64, style(20, TEXT, { bold: true, lineSpacingMultiple: 1.1 })),
    text("left-body", str(data.leftBody, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."), 48, 350, 360, 104, style(16, MUTED, { lineSpacingMultiple: 1.75 })),
    ellipse("decorative-ring", 1080, 118, 220, 220, WHITE, TEXT, { locked: true, transparency: 80 }),
    ...metrics.slice(0, 3).flatMap((metric, index) => {
      const top = 120 + index * 146;
      return [
        rect(`metric-card-${index}`, 700, top, 480, 112, primary(data), primary(data), { radius: 18 }),
        text(`metric-value-${index}`, str(metric.value, "10K+"), 724, top + 24, 156, 42, style(40, TEXT, { bold: true })),
        text(`metric-line-1-${index}`, str(metric.line1 ?? metric.label, "Total"), 898, top + 20, 220, 22, style(16, TEXT, { bold: true })),
        text(`metric-line-2-${index}`, str(metric.line2, "Users"), 898, top + 42, 220, 22, style(16, TEXT, { bold: true })),
        text(`metric-description-${index}`, str(metric.description, "active users across multiple industries"), 898, top + 74, 230, 28, style(12, MUTED, { lineSpacingMultiple: 1.35 })),
      ];
    }),
    ...footer(data),
  ]);
}

function buildToc(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const items = arr<Record<string, any>>(data.items);
  return document(slideId(slide, "toc"), [
    ...brand(data),
    text("title", str(data.title, "Table of Contents"), 48, 92, 760, 64, style(48, TEXT, { bold: true })),
    ...items.slice(0, 10).flatMap((item, index) => {
      const right = index >= 5;
      const slot = right ? index - 5 : index;
      const left = right ? 640 : 48;
      const top = 198 + slot * 84;
      return [
        text(`toc-number-${index}`, String(index + 1).padStart(2, "0"), left, top, 74, 54, style(48, primary(data), { bold: true })),
        text(`toc-title-${index}`, str(item.title, `Section ${index + 1}`), left + 96, top + 4, 370, 28, style(22, TEXT, { bold: true })),
        text(`toc-description-${index}`, str(item.description, "A brief overview of the section."), left + 96, top + 38, 400, 22, style(14, MUTED)),
        line(`toc-rule-${index}`, left, top + 74, left + 540, top + 74, STROKE, 1),
      ];
    }),
    ...footer(data),
  ]);
}

function buildSimplePoints(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const points = arr<Record<string, any>>(data.points);
  return document(slideId(slide, "simple-points"), [
    ...brand(data),
    ellipse("background-glow", 190, 360, 900, 260, TEXT, TEXT, { locked: true, transparency: 94 }),
    text("title", str(data.title, "Our Commitment"), 48, 112, 540, 128, style(56, TEXT, { bold: true, lineSpacingMultiple: 1.05 })),
    text("statement", str(data.statement, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."), 48, 314, 520, 100, style(16, MUTED, { lineSpacingMultiple: 1.75 })),
    ...points.slice(0, 4).flatMap((point, index) => {
      const top = 120 + index * 118;
      return [
        text(`point-title-${index}`, str(point.title, "Your Title Here"), 660, top, 480, 30, style(24, TEXT, { bold: true })),
        text(`point-body-${index}`, str(point.body, "Editable point body."), 660, top + 46, 500, 58, style(16, MUTED, { lineSpacingMultiple: 1.65 })),
      ];
    }),
    ...footer(data),
  ]);
}

function buildTableOrChart(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const mode = str(data.mode, "table");
  const columns = arr<string>(data.columns);
  const rows = arr<{ cells?: unknown[] }>(data.rows);
  const visual =
    mode === "chart"
      ? [
          chartElement("chart", data.chart, 80, 240, 1120, 330),
        ]
      : [
          rect("table-shell", 48, 226, 1184, 356, primary(data), primary(data), { radius: 12 }),
          tableElement("table", columns, rows, 76, 258, 1128, data),
        ];

  return document(slideId(slide, "table-chart"), [
    ...brand(data),
    text("title", str(data.title, "Data Table or Chart"), 48, 92, 760, 62, style(48, TEXT, { bold: true })),
    text("description", str(data.description, "Present structured information in a flexible table or visualize it with a chart."), 48, 162, 900, 48, style(16, MUTED)),
    ...visual,
    ...footer(data),
  ]);
}

function buildTimeline(slide: SwiftSlideLike, data: Record<string, any>): AipptSlideDocument {
  const items = arr<Record<string, any>>(data.items);
  const count = Math.max(1, Math.min(4, items.length || 4));
  const cardW = 260;
  const gap = 40;
  const startX = (1280 - count * cardW - (count - 1) * gap) / 2;
  return document(slideId(slide, "timeline"), [
    ...brand(data),
    diamond("timeline-diamond-0", 1224, 64, 12),
    diamond("timeline-diamond-1", 1224, 88, 12),
    diamond("timeline-diamond-2", 1224, 112, 12),
    text("title", str(data.title, "Our Journey at a Glance"), 220, 92, 840, 60, style(48, TEXT, { bold: true, align: "center" })),
    rect("subtitle-banner", 280, 174, 720, 70, primary(data), primary(data), { radius: 8 }),
    text("subtitle", str(data.subtitle, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."), 310, 192, 660, 28, style(16, MUTED, { align: "center", valign: "middle" })),
    line("timeline-line", 48, 356, 1232, 356, primary(data), 4),
    ...items.slice(0, 4).flatMap((item, index) => {
      const left = startX + index * (cardW + gap);
      const icon = iconValue(item.icon);
      return [
        rect(`year-badge-${index}`, left + 65, 280, 130, 40, TEXT, TEXT, { radius: 6 }),
        text(`year-text-${index}`, str(item.year, String(2026 + index)), left + 65, 291, 130, 16, style(16, WHITE, { bold: true, align: "center", valign: "middle" })),
        ellipse(`timeline-dot-${index}`, left + 120, 344, 20, 20, WHITE, primary(data), { locked: true }),
        rect(`timeline-card-${index}`, left, 384, cardW, 176, WHITE, WHITE, { radius: 16 }),
        ellipse(`timeline-icon-bg-${index}`, left + 106, 410, 48, 48, primary(data), primary(data)),
        image(`timeline-icon-${index}`, icon.src, left + 118, 422, 24, 24, {
          fit: "contain",
          prompt: icon.prompt,
          name: "Icon",
        }),
        text(`timeline-heading-${index}`, str(item.heading ?? item.title, "Founded in 2020"), left + 24, 476, cardW - 48, 24, style(18, TEXT, { bold: true, align: "center" })),
        text(`timeline-body-${index}`, str(item.body ?? item.description, "Lorem ipsum dolor"), left + 24, 516, cardW - 48, 32, style(14, MUTED, { align: "center", lineSpacingMultiple: 1.35 })),
      ];
    }),
    ...footer(data),
  ]);
}

export function isSwiftLayout(slide: SwiftSlideLike) {
  return slide.layout_group === GROUP && Boolean(SWIFT_LAYOUT_ALIASES[rawLayout(slide)]);
}

export function getSwiftStoredDocumentCandidate(
  value: unknown,
): AipptSlideDocument | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<AipptSlideDocument>;
  if (
    typeof candidate.id !== "string" ||
    candidate.width !== 1280 ||
    candidate.height !== 720 ||
    !Array.isArray(candidate.elements)
  ) {
    return null;
  }
  return candidate as AipptSlideDocument;
}

export function buildSwiftAipptSlideDocument(
  slide: SwiftSlideLike,
): AipptSlideDocument | null {
  if (!isSwiftLayout(slide)) return null;
  const data = slide.content ?? {};
  const layout = key(slide);
  let result: AipptSlideDocument | null = null;

  if (layout === "intro") result = buildIntro(slide, data);
  if (layout === "icon-row") result = buildIconRow(slide, data);
  if (layout === "feature-cards") result = buildFeatureCards(slide, data);
  if (layout === "image-list") result = buildImageList(slide, data);
  if (layout === "metrics") result = buildMetrics(slide, data);
  if (layout === "toc") result = buildToc(slide, data);
  if (layout === "simple-points") result = buildSimplePoints(slide, data);
  if (layout === "table-chart") result = buildTableOrChart(slide, data);
  if (layout === "timeline") result = buildTimeline(slide, data);

  return result ? withSwiftMeta(result, rawLayout(slide)) : null;
}

function collectElementById(
  elements: AipptSlideElement[],
  elementMap = new Map<string, AipptSlideElement>(),
) {
  for (const element of elements) {
    elementMap.set(element.id, element);
    if (element.type === "group") collectElementById(element.elements, elementMap);
  }
  return elementMap;
}

function applyStoredElementOverrides(
  elements: AipptSlideElement[],
  storedElements: Map<string, AipptSlideElement>,
): AipptSlideElement[] {
  return elements.map((element) => {
    const storedElement = storedElements.get(element.id);
    if (element.type === "group") {
      return {
        ...element,
        ...(storedElement?.type === "group" ? storedElement : {}),
        elements: applyStoredElementOverrides(element.elements, storedElements),
      };
    }
    if (!storedElement || storedElement.type !== element.type) return element;
    return { ...storedElement };
  });
}

function filterDeletedElements(
  elements: AipptSlideElement[],
  deletedElementIds: Set<string>,
): AipptSlideElement[] {
  return elements
    .filter((element) => !deletedElementIds.has(element.id))
    .map((element) =>
      element.type === "group"
        ? {
            ...element,
            elements: filterDeletedElements(element.elements, deletedElementIds),
          }
        : element,
    );
}

function collectElementIds(elements: AipptSlideElement[], ids = new Set<string>()) {
  for (const element of elements) {
    ids.add(element.id);
    if (element.type === "group") collectElementIds(element.elements, ids);
  }
  return ids;
}

function collectUserAddedElements(
  storedElements: AipptSlideElement[],
  rebuiltElementIds: Set<string>,
  result: AipptSlideElement[] = [],
) {
  for (const element of storedElements) {
    if (!rebuiltElementIds.has(element.id)) {
      result.push(element);
      continue;
    }
    if (element.type === "group") collectUserAddedElements(element.elements, rebuiltElementIds, result);
  }
  return result;
}

export function repairSwiftAipptSlideDocument(
  slide: SwiftSlideLike,
  storedDocument: AipptSlideDocument | null,
): AipptSlideDocument | null {
  const rebuiltDocument = buildSwiftAipptSlideDocument(slide);
  if (!rebuiltDocument) return storedDocument;
  if (!storedDocument) return rebuiltDocument;

  const rebuiltElementIds = collectElementIds(rebuiltDocument.elements);
  const deletedElementIds = new Set(storedDocument.deletedElementIds ?? []);
  const userAddedElements = collectUserAddedElements(
    storedDocument.elements,
    rebuiltElementIds,
  );
  const repairedTemplateElements = filterDeletedElements(
    applyStoredElementOverrides(
      rebuiltDocument.elements,
      collectElementById(storedDocument.elements),
    ),
    deletedElementIds,
  );

  return {
    ...rebuiltDocument,
    deletedElementIds: storedDocument.deletedElementIds,
    elements: [...repairedTemplateElements, ...userAddedElements],
  };
}
