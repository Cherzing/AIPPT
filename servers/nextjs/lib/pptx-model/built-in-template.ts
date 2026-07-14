import type {
  AipptChartElement,
  AipptNativeMeta,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableCell,
  AipptTextStyle,
} from "./types";

const WIDTH = 1280;
const HEIGHT = 720;
const WHITE = "FFFFFF";
const TEXT = "111827";
const MUTED = "64748B";
const STROKE = "DDE5EF";
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIHJ4PSIxOCIgZmlsbD0iI0Y4RkFGQyIvPjxwYXRoIGQ9Ik0xMTQgMjU0aDQxMmwtMTE4LTEyMi04NiAxMDAtNjgtNzgtMTQwIDEwMHoiIGZpbGw9IiNERUU3RjMiLz48Y2lyY2xlIGN4PSI0OTIiIGN5PSI5NCIgcj0iNDIiIGZpbGw9IiNDN0QyRkUiLz48dGV4dCB4PSIzMjAiIHk9IjMxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY0NzQ4QiIgZm9udC1mYW1pbHk9IkFyaWFsIj5FZGl0YWJsZSBpbWFnZTwvdGV4dD48L3N2Zz4=";

type BuiltInGroup =
  | "code"
  | "education"
  | "product-overview"
  | "report"
  | "pitch-deck"
  | "neo-general"
  | "neo-standard"
  | "neo-modern"
  | "neo-swift";

type BuiltInSlideLike = {
  id?: string | null;
  index?: number;
  layout?: string | null;
  layout_group?: string | null;
  content?: Record<string, any> | null;
};

type Theme = {
  font: string;
  bg: string;
  primary: string;
  accent: string;
  soft: string;
  dark: string;
  text: string;
  muted: string;
  card: string;
};

const LAYOUTS: Record<BuiltInGroup, Set<string>> = {
  code: new Set([
    "cover-slide",
    "code-explanation-split-slide",
    "api-request-response-slide",
    "cards-grid-slide",
    "table-slide",
    "workflow-slide",
    "bullet-list-slide",
    "description-text-slide",
    "table-of-content-slide",
    "description-and-metrics-slide",
    "metrics-grid-slide",
    "full-code-block-slide",
    "code-diff-comparison-slide",
    "terminal-command-slide",
    "file-tree-structure-slide",
    "code-output-slide",
  ]),
  education: new Set([
    "cover-slide",
    "table-of-contents-slide",
    "about-slide",
    "content-split-slide",
    "image-gallery-slide",
    "report-chart-slide",
    "services-split-slide",
    "statistics-grid-slide",
    "timeline-slide",
    "numbered-outcome-cards-slide",
    "module-grid-slide",
    "agenda-timeline-slide",
    "evaluation-matrix-slide",
    "closing-contact-slide",
  ]),
  "product-overview": new Set([
    "title-description-with-cards-text-slide",
    "title-with-blocks-text-slide",
    "comparison-status-table-slide",
    "title-description-with-table-slide",
    "cover-slide",
    "card-grid-with-labels-slide",
    "title-description-with-image-gallery-slide",
    "introduction-slide",
    "title-with-kpi-cards-slide",
    "title-description-with-cards-slide",
    "text-blocks-with-image-block-slide",
    "closing-actions-contact-slide",
    "title-description-with-image-block-slide",
    "two-panel-contrast-metrics-slide",
    "title-cards-list-with-text-slide",
    "title-with-process-steps-slide",
    "phase-timeline-cards-slide",
    "title-description-with-chart-and-kpi-cards-slide",
    "table-of-content-slide",
    "segment-cards-slide",
    "scenario-cards-slide",
  ]),
  report: new Set([
    "intro-slide",
    "section-index-slide",
    "summary-cards-slide",
    "title-description-image-slide",
    "method-source-panels-slide",
    "metrics-slide",
    "title-image-bullet-cards-slide",
    "milestone-slide",
    "bullet-list-with-icon-title-description-slide",
    "bar-chart-with-bullet-list-title-description-icon-slide",
    "title-description-chart-slide",
    "title-chart-metrics-cards-slide",
    "data-analysis-dashboard-slide",
    "finding-cards-slide",
    "title-metrics-slide",
    "recommendation-cards-slide",
    "action-plan-table-slide",
    "risk-limitation-matrix-slide",
    "appendix-notes-slide",
    "closing-contact-slide",
    "horizontal-height-spanning-images-with-title-slide",
    "title-workflow-with-title-description-slide",
  ]),
  "pitch-deck": new Set([
    "centered-cover-with-footer-meta",
    "problem-evidence-slide",
    "value-proposition-slide",
    "market-size-slide",
    "product-workflow-slide",
    "go-to-market-slide",
    "business-model-slide",
    "traction-metrics-slide",
    "competitive-positioning-slide",
    "defensibility-slide",
    "financial-projection-slide",
    "funding-ask-slide",
    "team-credentials-slide",
    "closing-contact-slide",
    "adaptive-value-card-grid",
    "adaptive-media-card-grid",
    "cards-with-chart-split",
    "full-width-statement",
    "headline-with-detail-columns",
    "horizontal-timeline",
    "media-and-text-split",
    "numbered-multi-column-overview",
    "overlapping-circle-cards",
    "panel-list-with-media",
    "text-and-chart-split-layout",
  ]),
  "neo-general": new Set([
    "bullet-icons-only-slide",
    "bullet-with-icons-slide",
    "chart-with-bullets-slide",
    "title-challenge-outcome-customer-card",
    "headline-description-with-image-layout",
    "headline-description-with-double-image-layout",
    "performance-grid-snapshot-slide",
    "headline-text-with-stats-layout",
    "title-three-columns-with-labels",
    "left-align-quote",
    "layout-text-block-with-metric-cards",
    "metrics-with-image-slide",
    "multi-chart-grid-slide",
    "numbered-bullets-slide",
    "quote-slide",
    "team-slide",
    "title-two-column-numbered-list",
    "thank-you-contact-info-footer-image-slide-layout",
    "timeline-alternating-cards-slide",
    "title-description-multi-chart-grid-bullets",
    "title-description-multi-chart-grid-metrics",
    "title-description-three-columns-table",
    "title-description-team-grid",
    "title-with-full-width-chart",
    "title-metricValue-metricLabel-funnelStages",
    "title-three-column-risk-constraints-slide-layout",
    "title-six-card-grid-slide-layout",
    "title-metrics-with-chart",
    "title-side-insight-slide",
  ]),
  "neo-standard": new Set([
    "title-description-bullet-list",
    "title-description-contact-cards",
    "title-description-icon-list",
    "title-description-image-right",
    "title-description-multi-chart-grid",
    "title-description-multi-chart-grid-bullets",
    "title-description-multi-chart-grid-metrics",
    "title-description-radial-cards",
    "title-description-table",
    "title-description-timeline",
    "title-dual-charts-comparison",
    "title-dual-comparison-cards",
    "title-kpi-grid",
    "title-metrics-chart",
    "title-metrics-image",
    "title-points-donut-grid",
    "title-badge-chart",
  ]),
  "neo-modern": new Set([
    "title-description-bullet-list",
    "title-description-contact-list",
    "title-description-dual-metrics-grid",
    "title-description-icon-timeline",
    "title-description-image-right",
    "title-description-metrics-chart",
    "title-description-metrics-image",
    "title-description-multi-chart-grid",
    "title-description-multi-chart-grid-bullets",
    "title-description-multi-chart-grid-metrics",
    "title-description-table",
    "title-dual-comparison-cards",
    "title-dual-comparison-charts",
    "title-horizontal-alternating-timeline",
    "title-kpi-snapshot-grid",
    "title-subtitles-chart",
    "title-two-column-numbered-list",
  ]),
  "neo-swift": new Set([
    "title-chart-metrics-sidebar",
    "title-centered-chart",
    "title-description-bullet-list",
    "title-description-three-column-table",
    "title-description-four-charts-six-bullets",
    "title-description-large-image-right",
    "title-description-eight-metrics-grid",
    "title-description-metrics-grid-large-image",
    "title-description-six-charts-four-metrics",
    "title-description-six-charts-grid",
    "title-dual-comparison-blocks-numbered",
    "title-label-description-cascading-stats",
    "title-subtitle-four-team-member-cards",
    "title-tagline-description-numbered-steps",
    "title-three-by-three-metrics-grid",
  ]),
};

const THEMES: Record<BuiltInGroup, Theme> = {
  code: {
    font: "Nunito Sans",
    bg: "101B37",
    primary: "2B7FFF",
    accent: "51A2FF",
    soft: "1D293D",
    dark: "0F172B",
    text: "E5ECFF",
    muted: "9DB4D6",
    card: "14213D",
  },
  education: {
    font: "Source Serif 4",
    bg: "EFEFF1",
    primary: "1A1752",
    accent: "3B0BB6",
    soft: "E6E7E8",
    dark: "272272",
    text: "1A1752",
    muted: "55516F",
    card: "FFFFFF",
  },
  "product-overview": {
    font: "Bricolage Grotesque",
    bg: "DAE1DE",
    primary: "15342D",
    accent: "15342D",
    soft: "D7DEDB",
    dark: "15342D",
    text: "15342D",
    muted: "3A554D",
    card: "FEFEFF",
  },
  report: {
    font: "Source Sans 3",
    bg: "F9F8F8",
    primary: "157CFF",
    accent: "4D4EF3",
    soft: "EAF2FF",
    dark: "232223",
    text: "232223",
    muted: "4A4D53",
    card: "FFFFFF",
  },
  "pitch-deck": {
    font: "DM Serif Display",
    bg: "27292D",
    primary: "DDDAC7",
    accent: "D7D3BE",
    soft: "3A3B3F",
    dark: "27292D",
    text: "DDDAC7",
    muted: "CBC7B2",
    card: "33353A",
  },
  "neo-general": {
    font: "Poppins",
    bg: "FFFFFF",
    primary: "9234EB",
    accent: "8B5CF6",
    soft: "F3E8FF",
    dark: "4C1D95",
    text: "111827",
    muted: "6B7280",
    card: "FFFFFF",
  },
  "neo-standard": {
    font: "Playfair Display",
    bg: "FFFFFF",
    primary: "1F8A2E",
    accent: "55B567",
    soft: "E7F5E9",
    dark: "14521D",
    text: "111111",
    muted: "4B5563",
    card: "FFFFFF",
  },
  "neo-modern": {
    font: "Montserrat",
    bg: "FFFFFF",
    primary: "002BB2",
    accent: "244CD9",
    soft: "F7F8FF",
    dark: "001E7C",
    text: "111827",
    muted: "4B5563",
    card: "FFFFFF",
  },
  "neo-swift": {
    font: "Albert Sans",
    bg: "FFFFFF",
    primary: "BEF4FE",
    accent: "4D5463",
    soft: "E9FBFF",
    dark: "000000",
    text: TEXT,
    muted: "55626E",
    card: "FFFFFF",
  },
};

const GROUP_LABELS: Record<BuiltInGroup, string> = {
  code: "CODE",
  education: "EDUCATION",
  "product-overview": "PRODUCT",
  report: "REPORT",
  "pitch-deck": "PITCH",
  "neo-general": "NEO GENERAL",
  "neo-standard": "NEO STANDARD",
  "neo-modern": "NEO MODERN",
  "neo-swift": "NEO SWIFT",
};

function layoutKey(layout: string) {
  return layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
}

function groupKey(group: unknown): BuiltInGroup | null {
  if (typeof group !== "string") return null;
  return group in LAYOUTS ? (group as BuiltInGroup) : null;
}

export function isBuiltInTemplateLayout(slide: BuiltInSlideLike): boolean {
  const group = groupKey(slide.layout_group);
  if (!group) return false;
  const layout = typeof slide.layout === "string" ? layoutKey(slide.layout) : "";
  return LAYOUTS[group].has(layout);
}

export function getBuiltInTemplateGroups() {
  return Object.keys(LAYOUTS) as BuiltInGroup[];
}

function meta(group: BuiltInGroup, layout: string): AipptNativeMeta {
  return {
    version: 1,
    fidelity: "A",
    sourceRenderer: "built-in-template-builder",
    conversionStatus: "complete",
    sourceTemplate: group,
    sourceLayout: layout,
  };
}

function str(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function num(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function arr<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function cleanColor(value: unknown, fallback: string) {
  return str(value, fallback).replace(/^#/, "").toUpperCase();
}

function readableTextOn(hexColor: string) {
  const color = cleanColor(hexColor, "FFFFFF");
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "111827" : WHITE;
}

function style(
  theme: Theme,
  fontSize: number,
  color = theme.text,
  extra: Partial<AipptTextStyle> = {},
): AipptTextStyle {
  return {
    fontFace: theme.font,
    fontSize,
    color,
    align: "left",
    valign: "top",
    margin: [0, 0, 0, 0],
    lineSpacingMultiple: 1.18,
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
  options: { radius?: number; locked?: boolean; transparency?: number; opacity?: number } = {},
): AipptSlideElement {
  return {
    id,
    type: "shape",
    shape: options.radius ? "roundRect" : "rect",
    x,
    y,
    w,
    h,
    radius: options.radius,
    locked: options.locked,
    opacity: options.opacity,
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
  locked = true,
): AipptSlideElement {
  return {
    ...rect(id, x, y, w, h, fill, line, { locked }),
    shape: "ellipse",
  } as AipptSlideElement;
}

function line(
  id: string,
  x: number,
  y: number,
  x2: number,
  y2: number,
  color: string,
  width = 2,
): AipptSlideElement {
  return {
    id,
    type: "line",
    x,
    y,
    w: Math.abs(x2 - x),
    h: Math.abs(y2 - y),
    x2,
    y2,
    line: { color, width },
  };
}

function imageValue(value: unknown, fallbackPrompt: string) {
  const data = record(value);
  const src = str(data.__image_url__ ?? data.url ?? data.src ?? value, "");
  return {
    src: src || FALLBACK_IMAGE,
    prompt: str(data.__image_prompt__ ?? data.prompt, fallbackPrompt),
  };
}

function image(
  id: string,
  value: unknown,
  x: number,
  y: number,
  w: number,
  h: number,
  prompt: string,
  fit: "cover" | "contain" | "stretch" = "cover",
): AipptSlideElement {
  const resolved = imageValue(value, prompt);
  return {
    id,
    type: "image",
    src: resolved.src,
    prompt: resolved.prompt,
    fit,
    x,
    y,
    w,
    h,
  };
}

function firstImage(data: Record<string, any>) {
  const media = record(data.media);
  const images = arr(data.images);
  const gallery = arr(data.gallery ?? data.galleryImages);
  return (
    data.image ??
    data.mainImage ??
    data.firstImage ??
    data.secondImage ??
    data.footerImage ??
    media.image ??
    data.heroImage ??
    data.featureImage ??
    data.topFeatureImage ??
    data.bottomFeatureImage ??
    data.sideImage ??
    data.portraitImage ??
    data.backgroundImage ??
    data.photo ??
    data.logo ??
    data._logo_url__ ??
    record(images[0]).image ??
    images[0] ??
    record(gallery[0]).image ??
    gallery[0] ??
    undefined
  );
}

function titleOf(data: Record<string, any>, fallback: string) {
  return str(data.title ?? data.headline ?? data.heading ?? data.name ?? data.problemStatement ?? data.valueStatement, fallback);
}

function subtitleOf(data: Record<string, any>) {
  return str(data.subtitle ?? data.subTitle ?? data.tagline ?? data.taglineLabel ?? data.label ?? data.companyName, "");
}

function bodyOf(data: Record<string, any>, fallback = "Editable content") {
  return str(
    data.description ??
      data.paragraph ??
      data.body ??
      data.summary ??
      data.intro ??
      data.statement ??
      data.message ??
      data.leadText ??
      data.supportingText ??
      data.taglineBody ??
      data.problemStatement ??
      data.valueStatement ??
      data.quote ??
      data.askContext ??
      data.conclusion ??
      data.caption ??
      data.overview,
    fallback,
  );
}

function itemTitle(item: unknown, index: number) {
  const data = record(item);
  return str(data.title ?? data.heading ?? data.label ?? data.name ?? data.activity ?? data.criterion ?? data.method, `Item ${index + 1}`);
}

function itemBody(item: unknown) {
  const data = record(item);
  return str(
    data.description ??
      data.body ??
      data.summary ??
      data.text ??
      data.detail ??
      data.method ??
      data.impact ??
      data.note ??
      data.subtext,
    "",
  );
}

function itemValue(item: unknown) {
  const data = record(item);
  return str(data.value ?? data.metric ?? data.number ?? data.year ?? data.amount ?? data.runway ?? data.askAmount, "");
}

function collectItems(data: Record<string, any>) {
  const pools = [
    data.items,
    data.bullets,
    data.bulletPoints,
    data.listItems,
    data.processItems,
    data.cards,
    data.features,
    data.blocks,
    data.findings,
    data.recommendations,
    data.painPoints,
    data.pillars,
    data.channels,
    data.revenueStreams,
    data.allocations,
    data.points,
    data.steps,
    data.agenda,
    data.sections,
    data.modules,
    data.outcomes,
    data.highlights,
    data.criteria,
    data.notes,
    data.footnotes,
    data.limitations,
    data.audience,
    data.layers,
    data.funnel,
    data.axes,
    data.competitors,
    data.plans,
    data.phases,
    data.segments,
    data.useCases,
    data.risks,
    data.contacts,
    data.contactItems,
    data.team,
    data.teamMembers,
    data.members,
    data.milestones,
    data.timelineItems,
    data.funnelStages,
    data.comparisonSections,
    data.comparisonBlocks,
    data.sources,
    data.parameters,
    data.actions,
  ];
  const collected = pools.flatMap((pool) => arr(pool));
  if (collected.length) return collected.slice(0, 8);
  return [
    { title: "Editable item", description: "Add or replace this content." },
    { title: "Second item", description: "Native text, shapes, and images can be edited." },
    { title: "Third item", description: "Drag, resize, restyle, duplicate, or delete elements." },
  ];
}

function collectMetrics(data: Record<string, any>) {
  const metrics = arr(
    data.metrics ??
      data.kpis ??
      data.kpiList ??
      data.kpiCards ??
      data.metricCards ??
      data.primaryMetrics ??
      data.secondaryMetrics ??
      data.stats ??
      data.statistics ??
      data.statColumns ??
      data.unitMetrics ??
      data.miniBars,
  ).slice(0, 8);
  if (metrics.length) return metrics;
  return [
    { value: "42%", label: "Editable metric" },
    { value: "18", label: "Editable count" },
    { value: "3x", label: "Editable lift" },
  ];
}

function tableFrom(data: Record<string, any>) {
  const table = record(data.table ?? data.tableData ?? data.comparisonTable ?? data.rubric);
  const criteria = arr(data.criteria);
  const columns = arr<string>(
    data.columns ??
      data.tableColumns ??
      table.columns ??
      table.headers ??
      (criteria.length ? ["Criterion", "Beginner", "Developing", "Proficient", "Advanced"] : undefined),
  );
  const rawRows = criteria.length ? criteria : arr(data.rows ?? table.rows);
  if (!columns.length && !rawRows.length) return null;

  const header = (columns.length ? columns : ["Column 1", "Column 2", "Column 3"]).map((cell) =>
    str(cell, "Column"),
  );
  const rows = rawRows.length
    ? rawRows
    : [
        ["Editable", "Value", "Notes"],
        ["Row", "42", "Description"],
      ];
  return {
    columns: header,
    rows: rows.map((row) => {
      if (Array.isArray(row)) return row.map((cell) => str(cell, ""));
      const rowRecord = record(row);
      const cells = arr(rowRecord.cells);
      if (cells.length) return cells.map((cell) => str(cell, ""));
      if (criteria.length) {
        return [
          str(rowRecord.criterion ?? rowRecord.title, ""),
          str(rowRecord.beginner, ""),
          str(rowRecord.developing, ""),
          str(rowRecord.proficient, ""),
          str(rowRecord.advanced, ""),
        ];
      }
      return header.map((column) => str(rowRecord[column] ?? rowRecord[column.toLowerCase()], ""));
    }),
  };
}

function tableElement(
  id: string,
  theme: Theme,
  data: ReturnType<typeof tableFrom>,
  x: number,
  y: number,
  w: number,
  h: number,
): AipptSlideElement {
  const table = data ?? {
    columns: ["A", "B"],
    rows: [["1", "2"]],
  };
  const columnWidth = Math.floor(w / Math.max(table.columns.length, 1));
  const headerRows: AipptTableCell[] = table.columns.map((cell) => ({
    text: cell,
    fill: theme.primary,
    color: readableTextOn(theme.primary),
    bold: true,
    align: "center",
    valign: "middle",
  }));
  const bodyRows: AipptTableCell[][] = table.rows.slice(0, 8).map((row, rowIndex) =>
    table.columns.map((_, index) => ({
      text: str(row[index], ""),
      fill: rowIndex % 2 === 0 ? theme.card : theme.soft,
      color: theme.text,
      align: "center",
      valign: "middle",
    })),
  );
  const rows: AipptTableCell[][] = [
    headerRows,
    ...bodyRows,
  ];
  return {
    id,
    type: "table",
    x,
    y,
    w,
    h,
    columns: table.columns.map(() => columnWidth),
    rows,
    style: {
      fontFace: theme.font,
      fontSize: 12,
      color: theme.text,
      borderColor: STROKE,
      headerFill: theme.primary,
      margin: [6, 6, 6, 6],
    },
  };
}

function chartData(data: Record<string, any>) {
  const chart = record(data.chart ?? data.charts ?? data.chartData ?? data.graphData ?? data.graph ?? data.donutData ?? data.groupedBars ?? data.trendLines);
  const raw = arr(chart.data ?? chart.values ?? data.chartData ?? data.series ?? data.charts ?? data.donutData ?? data.groupedBars ?? data.trendLines);
  const points = raw.length
    ? raw
    : [
        { label: "A", value: 42 },
        { label: "B", value: 58 },
        { label: "C", value: 36 },
      ];
  return {
    type: str(chart.type ?? data.chartType, "bar").toLowerCase(),
    categories: points.map((point, index) => str(record(point).label ?? record(point).name, `Q${index + 1}`)),
    values: points.map((point) => {
      const pointRecord = record(point);
      const values = arr(pointRecord.values);
      return num(
        pointRecord.value ??
          pointRecord.amount ??
          pointRecord.positive ??
          pointRecord.y ??
          values[0],
        0,
      );
    }),
  };
}

function chartElement(
  id: string,
  theme: Theme,
  data: Record<string, any>,
  x: number,
  y: number,
  w: number,
  h: number,
): AipptChartElement {
  const chart = chartData(data);
  const chartType =
    chart.type === "line" ? "line" : chart.type === "pie" || chart.type === "donut" ? "pie" : "bar";
  return {
    id,
    type: "chart",
    chartType,
    title: str(data.chartTitle, ""),
    categories: chart.categories,
    series: [{ name: "Series", values: chart.values, color: theme.primary }],
    x,
    y,
    w,
    h,
    style: {
      fontFace: theme.font,
      fontSize: 11,
      color: theme.text,
      axisColor: "94A3B8",
      gridColor: "E2E8F0",
      backgroundColor: WHITE,
    },
  };
}

function codeBlockText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(codeBlockText).filter(Boolean).join("\n");
  const data = record(value);
  const commands = arr(data.commands);
  const headers = data.headers ? JSON.stringify(data.headers, null, 2) : "";
  const parts = [
    str(data.label, ""),
    str(data.language, ""),
    str(data.fileName, ""),
    str(data.method, ""),
    str(data.endpoint, ""),
    commands.length ? commands.map((command) => `$ ${str(command, "")}`).join("\n") : "",
    str(data.content ?? data.code ?? data.body ?? data.text ?? data.output ?? data.request ?? data.response, ""),
    headers,
  ].filter(Boolean);
  return parts.join("\n");
}

function codeText(data: Record<string, any>) {
  const blocks = [
    data.codeSnippet,
    data.requestSnippet,
    data.responseSnippet,
    data.terminal,
    data.before,
    data.after,
    data.code,
    data.command,
    data.commands,
    data.request,
    data.response,
    data.output,
    data.tree,
  ]
    .map(codeBlockText)
    .filter(Boolean);

  return blocks.join("\n\n") || "const editable = true;\nfunction buildNativeSlide() {\n  return { text: 'Edit me' };\n}";
}

function header(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const title = titleOf(data, "Editable title");
  const subtitle = subtitleOf(data);
  const body = bodyOf(data, "Editable description text.");
  const elements: AipptSlideElement[] = [
    rect("top-rule", 0, 0, WIDTH, 8, theme.primary, theme.primary, { locked: true }),
    rect("brand-pill", 64, 42, 150, 28, theme.soft, theme.soft, { radius: 14 }),
    text("brand-label", GROUP_LABELS[group], 82, 48, 120, 16, style(theme, 9, theme.primary, { bold: true, align: "center" })),
    text("title", title, 64, 88, 760, 76, style(theme, 34, theme.text, { bold: true })),
  ];
  if (subtitle) {
    elements.push(text("subtitle", subtitle, 64, 166, 660, 30, style(theme, 16, theme.primary, { bold: true })));
  }
  elements.push(text("description", body, 64, subtitle ? 204 : 174, 690, 58, style(theme, 15, theme.muted)));
  elements.push(
    text("layout-key", layout, 1040, 52, 160, 18, style(theme, 9, theme.muted, { align: "right" })),
  );
  return elements;
}

function footer(theme: Theme) {
  return [
    line("footer-line", 64, 676, 1216, 676, STROKE, 1),
    ellipse("footer-dot", 1194, 664, 24, 24, theme.primary, theme.primary, true),
  ];
}

function coverLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const img = firstImage(data);
  return [
    rect("cover-accent", 0, 0, 420, HEIGHT, theme.dark, theme.dark, { locked: true }),
    rect("cover-soft", 420, 0, 860, HEIGHT, theme.bg, theme.bg, { locked: true }),
    text("brand-label", GROUP_LABELS[group], 74, 66, 220, 28, style(theme, 12, theme.accent, { bold: true })),
    text("title", titleOf(data, "Editable title"), 74, 142, 430, 150, style(theme, 42, WHITE, { bold: true })),
    text("description", bodyOf(data), 76, 318, 380, 92, style(theme, 17, "E2E8F0")),
    image("hero-image", img, 560, 96, 572, 400, `${group} hero image`),
    rect("meta-card", 560, 532, 360, 72, theme.card, theme.card, { radius: 12 }),
    text("subtitle", subtitleOf(data) || "Native editable template", 586, 554, 310, 28, style(theme, 15, theme.text, { bold: true })),
    line("cover-line", 76, 560, 324, 560, theme.accent, 4),
  ];
}

function cardGridLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const elements = header(group, layout, theme, data);
  const items = collectItems(data).slice(0, 6);
  const cols = items.length > 3 ? 3 : Math.max(items.length, 1);
  const cardW = cols === 3 ? 340 : 510;
  const cardH = items.length > 3 ? 112 : 150;
  const startX = 64;
  const startY = 292;
  items.forEach((item, index) => {
    const x = startX + (index % cols) * (cardW + 26);
    const y = startY + Math.floor(index / cols) * (cardH + 26);
    const value = itemValue(item);
    elements.push(rect(`card-${index}`, x, y, cardW, cardH, theme.card, theme.soft, { radius: 14 }));
    elements.push(rect(`card-accent-${index}`, x, y, 8, cardH, index % 2 ? theme.accent : theme.primary));
    if (value) {
      elements.push(text(`card-value-${index}`, value, x + 26, y + 20, 90, 28, style(theme, 18, theme.primary, { bold: true })));
    }
    elements.push(
      text(`card-title-${index}`, itemTitle(item, index), x + 26, y + (value ? 52 : 24), cardW - 52, 28, style(theme, 16, theme.text, { bold: true })),
    );
    elements.push(
      text(`card-body-${index}`, itemBody(item), x + 26, y + (value ? 82 : 58), cardW - 52, 46, style(theme, 12, theme.muted)),
    );
  });
  elements.push(image("support-image", firstImage(data), 1032, 114, 164, 104, `${group} editable image`));
  elements.push(...footer(theme));
  return elements;
}

function metricsLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const elements = header(group, layout, theme, data);
  const metrics = collectMetrics(data).slice(0, 6);
  metrics.forEach((metric, index) => {
    const x = 70 + (index % 3) * 300;
    const y = 302 + Math.floor(index / 3) * 132;
    elements.push(rect(`metric-card-${index}`, x, y, 260, 104, theme.card, theme.soft, { radius: 16 }));
    elements.push(text(`metric-value-${index}`, itemValue(metric) || itemTitle(metric, index), x + 24, y + 20, 190, 34, style(theme, 26, theme.primary, { bold: true })));
    elements.push(text(`metric-label-${index}`, str(record(metric).label ?? itemBody(metric), "Editable metric"), x + 24, y + 62, 204, 28, style(theme, 12, theme.muted)));
  });
  elements.push(chartElement("metrics-chart", theme, data, 950, 286, 250, 200));
  elements.push(image("support-image", firstImage(data), 962, 512, 214, 110, `${group} metric image`));
  elements.push(...footer(theme));
  return elements;
}

function imageLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const elements = header(group, layout, theme, data);
  const items = collectItems(data).slice(0, 4);
  elements.push(image("main-image", firstImage(data), 760, 156, 420, 342, `${group} main image`));
  items.forEach((item, index) => {
    const y = 288 + index * 78;
    elements.push(ellipse(`point-dot-${index}`, 78, y + 8, 22, 22, index % 2 ? theme.accent : theme.primary));
    elements.push(text(`point-title-${index}`, itemTitle(item, index), 118, y, 470, 24, style(theme, 15, theme.text, { bold: true })));
    elements.push(text(`point-body-${index}`, itemBody(item), 118, y + 28, 540, 36, style(theme, 12, theme.muted)));
  });
  elements.push(...footer(theme));
  return elements;
}

function tableLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const elements = header(group, layout, theme, data);
  elements.push(tableElement("data-table", theme, tableFrom(data), 88, 278, 780, 306));
  elements.push(rect("table-side-card", 912, 278, 250, 196, theme.soft, theme.soft, { radius: 16 }));
  elements.push(text("table-side-title", "Editable notes", 936, 306, 196, 24, style(theme, 16, theme.primary, { bold: true })));
  elements.push(text("table-side-body", bodyOf(data), 936, 344, 188, 88, style(theme, 12, theme.muted)));
  elements.push(image("support-image", firstImage(data), 936, 498, 196, 90, `${group} table image`));
  elements.push(...footer(theme));
  return elements;
}

function chartLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const elements = header(group, layout, theme, data);
  elements.push(rect("chart-panel", 70, 274, 726, 318, theme.card, theme.soft, { radius: 16 }));
  elements.push(chartElement("chart", theme, data, 104, 306, 660, 248));
  const metrics = collectMetrics(data).slice(0, 3);
  metrics.forEach((metric, index) => {
    const y = 282 + index * 100;
    elements.push(rect(`chart-metric-${index}`, 850, y, 296, 74, theme.card, theme.soft, { radius: 14 }));
    elements.push(text(`chart-metric-value-${index}`, itemValue(metric), 874, y + 14, 92, 24, style(theme, 18, theme.primary, { bold: true })));
    elements.push(text(`chart-metric-label-${index}`, str(record(metric).label ?? itemTitle(metric, index)), 874, y + 42, 222, 20, style(theme, 11, theme.muted)));
  });
  elements.push(image("support-image", firstImage(data), 878, 592, 214, 66, `${group} chart image`));
  elements.push(...footer(theme));
  return elements;
}

function timelineLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const elements = header(group, layout, theme, data);
  const items = collectItems(data).slice(0, 5);
  elements.push(line("timeline-line", 138, 398, 1116, 398, theme.primary, 4));
  items.forEach((item, index) => {
    const x = 118 + index * 224;
    const up = index % 2 === 0;
    const cardY = up ? 288 : 430;
    elements.push(ellipse(`timeline-dot-${index}`, x + 32, 386, 24, 24, WHITE, theme.primary));
    elements.push(rect(`timeline-card-${index}`, x, cardY, 182, 86, theme.card, theme.soft, { radius: 14 }));
    elements.push(text(`timeline-value-${index}`, itemValue(item) || `0${index + 1}`, x + 18, cardY + 12, 54, 20, style(theme, 14, theme.primary, { bold: true })));
    elements.push(text(`timeline-title-${index}`, itemTitle(item, index), x + 18, cardY + 36, 142, 20, style(theme, 13, theme.text, { bold: true })));
    elements.push(text(`timeline-body-${index}`, itemBody(item), x + 18, cardY + 58, 142, 20, style(theme, 9, theme.muted)));
  });
  elements.push(image("support-image", firstImage(data), 1012, 96, 164, 104, `${group} timeline image`));
  elements.push(...footer(theme));
  return elements;
}

function codeLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  const elements = header(group, layout, theme, data);
  const code = codeText(data);
  elements.push(rect("code-panel", 62, 286, 720, 292, theme.dark, theme.dark, { radius: 18 }));
  elements.push(ellipse("code-dot-red", 88, 312, 12, 12, "EF4444", "EF4444"));
  elements.push(ellipse("code-dot-yellow", 110, 312, 12, 12, "F59E0B", "F59E0B"));
  elements.push(ellipse("code-dot-green", 132, 312, 12, 12, "22C55E", "22C55E"));
  elements.push(text("code-text", code, 92, 344, 642, 196, style(theme, 15, "E2E8F0", { fontFace: "JetBrains Mono" })));
  collectItems(data).slice(0, 3).forEach((item, index) => {
    const y = 300 + index * 86;
    elements.push(rect(`code-note-${index}`, 834, y, 314, 68, theme.card, theme.soft, { radius: 14 }));
    elements.push(text(`code-note-title-${index}`, itemTitle(item, index), 858, y + 14, 260, 20, style(theme, 13, theme.text, { bold: true })));
    elements.push(text(`code-note-body-${index}`, itemBody(item), 858, y + 38, 250, 20, style(theme, 10, theme.muted)));
  });
  elements.push(image("support-image", firstImage(data), 858, 558, 196, 76, `${group} code image`));
  elements.push(...footer(theme));
  return elements;
}

function selectLayout(group: BuiltInGroup, layout: string, theme: Theme, data: Record<string, any>) {
  if (layout.includes("cover") || layout.includes("intro") || layout.includes("statement")) {
    return coverLayout(group, layout, theme, data);
  }
  if (group === "code" || layout.includes("code") || layout.includes("terminal") || layout.includes("api") || layout.includes("file-tree")) {
    return codeLayout(group, layout, theme, data);
  }
  if (
    layout.includes("table") ||
    layout.includes("matrix") ||
    layout.includes("rubric") ||
    layout.includes("projection") ||
    layout.includes("action") ||
    layout.includes("risk") ||
    layout.includes("comparison") ||
    layout.includes("evaluation")
  ) {
    return tableLayout(group, layout, theme, data);
  }
  if (layout.includes("chart") || layout.includes("donut") || layout.includes("dashboard") || layout.includes("snapshot")) {
    return chartLayout(group, layout, theme, data);
  }
  if (layout.includes("metric") || layout.includes("kpi") || layout.includes("stat") || layout.includes("traction")) {
    return metricsLayout(group, layout, theme, data);
  }
  if (
    layout.includes("timeline") ||
    layout.includes("workflow") ||
    layout.includes("process") ||
    layout.includes("steps") ||
    layout.includes("agenda") ||
    layout.includes("roadmap")
  ) {
    return timelineLayout(group, layout, theme, data);
  }
  if (
    layout.includes("image") ||
    layout.includes("media") ||
    layout.includes("gallery") ||
    layout.includes("team") ||
    layout.includes("contact")
  ) {
    return imageLayout(group, layout, theme, data);
  }
  return cardGridLayout(group, layout, theme, data);
}

export function buildBuiltInTemplateAipptSlideDocument(
  slide: BuiltInSlideLike,
): AipptSlideDocument | null {
  const group = groupKey(slide.layout_group);
  const layout = typeof slide.layout === "string" ? layoutKey(slide.layout) : "";
  if (!group || !LAYOUTS[group].has(layout)) return null;

  const content = slide.content && typeof slide.content === "object" ? slide.content : {};
  const theme = THEMES[group];
  const elements = selectLayout(group, layout, theme, content);

  return {
    id: str(slide.id, `built-in-${group}-${slide.index ?? 0}`),
    width: WIDTH,
    height: HEIGHT,
    background: { type: "solid", color: theme.bg },
    meta: meta(group, layout),
    elements,
  };
}

export function getBuiltInTemplateStoredDocumentCandidate(
  value: unknown,
): AipptSlideDocument | null {
  if (!value || typeof value !== "object") return null;
  const document = value as Partial<AipptSlideDocument>;
  if (
    document.width === WIDTH &&
    document.height === HEIGHT &&
    Array.isArray(document.elements)
  ) {
    return document as AipptSlideDocument;
  }
  return null;
}

function collectElementById(
  elements: AipptSlideElement[],
  result = new Map<string, AipptSlideElement>(),
) {
  for (const element of elements) {
    result.set(element.id, element);
    if (element.type === "group") collectElementById(element.elements, result);
  }
  return result;
}

function collectElementIds(elements: AipptSlideElement[], ids = new Set<string>()) {
  for (const element of elements) {
    ids.add(element.id);
    if (element.type === "group") collectElementIds(element.elements, ids);
  }
  return ids;
}

function applyStoredElementOverrides(
  elements: AipptSlideElement[],
  storedById: Map<string, AipptSlideElement>,
): AipptSlideElement[] {
  return elements.map((element) => {
    const stored = storedById.get(element.id);
    const next = stored ? ({ ...element, ...stored, id: element.id, type: element.type } as AipptSlideElement) : element;
    if (next.type === "group" && element.type === "group") {
      return {
        ...next,
        elements: applyStoredElementOverrides(element.elements, storedById),
      };
    }
    return next;
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

export function repairBuiltInTemplateAipptSlideDocument(
  slide: BuiltInSlideLike,
  storedDocument: AipptSlideDocument | null,
): AipptSlideDocument | null {
  const rebuiltDocument = buildBuiltInTemplateAipptSlideDocument(slide);
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
