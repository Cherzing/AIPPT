import type {
  AipptChartElement,
  AipptNativeMeta,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableCell,
  AipptTextStyle,
} from "./types";

const GROUP = "modern";
const WHITE = "FFFFFF";
const BACKGROUND = "FFFFFF";
const PRIMARY = "1E4CD9";
const TITLE = "234CD9";
const BODY = "334155";
const DARK = "111827";
const CARD = "F5F8FE";
const STROKE = "E5E7EB";
const MAP_CARD = "CBE3CC";
const FONT = "Montserrat";
const DEFAULT_ICON = "/static/icons/bold/checks-bold.svg";
const CHART_COLORS = ["1E4CD9", "3B82F6", "F59E0B", "10B981", "EF4444"];
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIHJ4PSIyNCIgZmlsbD0iI0Y1RjhGRSIvPjxwYXRoIGQ9Ik0xMjAgMjUwaDQwMGwtMTEyLTEyMC04OCA5OC02NC03NC0xMzYgOTZ6IiBmaWxsPSIjQ0ZEQUZGIi8+PGNpcmNsZSBjeD0iNDkwIiBjeT0iOTQiIHI9IjQ0IiBmaWxsPSIjOUZCRUZGIi8+PHRleHQgeD0iMzIwIiB5PSIzMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMyMzRDRDkiIGZvbnQtZmFtaWx5PSJBcmlhbCI+RWRpdGFibGUgaW1hZ2U8L3RleHQ+PC9zdmc+";

const MODERN_LAYOUT_ALIASES: Record<string, string> = {
  "intro-pitchdeck-slide": "intro-pitchdeck-slide",
  IntroSlideLayout: "intro-pitchdeck-slide",
  "bullet-with-icons-description-grid": "bullet-with-icons-description-grid",
  BulletsWithIconsDescriptionGrid: "bullet-with-icons-description-grid",
  "bullet-with-icons": "bullet-with-icons",
  BulletWithIconsSlideLayout: "bullet-with-icons",
  "chart-or-table-with-description": "chart-or-table-with-description",
  ChartOrTableWithDescription: "chart-or-table-with-description",
  "chart-with-metrics": "chart-with-metrics",
  ChartOrTableWithMetricsDescription: "chart-with-metrics",
  "image-and-description": "image-and-description",
  ImageAndDescriptionLayout: "image-and-description",
  "image-list-with-description": "image-list-with-description",
  ImageListWithDescriptionSlideLayout: "image-list-with-description",
  "images-with-description": "images-with-description",
  ImagesWithDescriptionLayout: "images-with-description",
  "metrics-with-description-image": "metrics-with-description-image",
  MetricsWithDescription: "metrics-with-description-image",
  "table-of-contents": "table-of-contents",
  TableOfContentsLayout: "table-of-contents",
};

type ModernSlideLike = {
  id?: string | null;
  index?: number;
  layout?: string | null;
  layout_group?: string | null;
  content?: Record<string, any> | null;
};

function key(slide: ModernSlideLike) {
  const layout = slide.layout ?? "";
  const raw = layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
  return MODERN_LAYOUT_ALIASES[raw] ?? raw;
}

function modernMeta(layout: string): AipptNativeMeta {
  return {
    version: 1,
    fidelity: "A",
    sourceRenderer: "modern-template-builder",
    conversionStatus: "complete",
    sourceTemplate: GROUP,
    sourceLayout: layout,
  };
}

function withModernMeta(
  document: AipptSlideDocument,
  layout: string,
): AipptSlideDocument {
  return {
    ...document,
    meta: modernMeta(layout),
  };
}

function str(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function arr<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function style(
  fontSize: number,
  color = BODY,
  extra: Partial<AipptTextStyle> = {},
): AipptTextStyle {
  return {
    fontFace: FONT,
    fontSize,
    color,
    align: "left",
    valign: "top",
    margin: [0, 0, 0, 0],
    lineSpacingMultiple: 1.24,
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
    locked: options.locked,
    radius: options.radius,
    fill: { color: fill, transparency: options.transparency },
    line: { color: line, width: line === fill ? 0 : 1, transparency: options.transparency },
  };
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
  color = PRIMARY,
  width = 4,
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
  };
}

function document(id: string, elements: AipptSlideElement[]): AipptSlideDocument {
  return {
    id,
    width: 1280,
    height: 720,
    background: { type: "solid", color: BACKGROUND },
    elements,
  };
}

function slideId(slide: ModernSlideLike, name: string) {
  return slide.id ?? `modern-${name}-${slide.index ?? 0}`;
}

function brand(data: Record<string, any>): AipptSlideElement[] {
  const logo = str(data._logo_url__, "");
  const company = str(data.__companyName__, "");
  const elements: AipptSlideElement[] = [];
  if (logo) {
    elements.push(image("brand-logo", logo, 80, 16, 24, 24, { fit: "contain", locked: true }));
  }
  if (company) {
    elements.push(
      locked(
        text(
          "brand-company",
          company,
          logo ? 112 : 80,
          18,
          280,
          20,
          style(14, DARK, { bold: true, valign: "middle" }),
        ),
      ),
    );
  }
  return elements;
}

function bottomBorder() {
  return locked(rect("bottom-border", 0, 716, 1280, 4, PRIMARY));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

function humanizeKey(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function simpleChartElement(
  id: string,
  chartData: unknown,
  x: number,
  y: number,
  w: number,
  h: number,
): AipptChartElement {
  const source = chartData && typeof chartData === "object" ? (chartData as Record<string, any>) : {};
  const type = source.type === "pie" ? "pie" : source.type === "line" ? "line" : "bar";
  const points = arr<Record<string, any>>(source.data);
  const categories = points.length
    ? points.map((point, index) => str(point.label ?? point.name ?? point.x, `Item ${index + 1}`))
    : ["A", "B", "C"];
  const values = points.length
    ? points.map((point) => {
        const value = Number(point.value ?? point.y ?? 0);
        return Number.isFinite(value) ? value : 0;
      })
    : [40, 60, 80];

  return {
    id,
    type: "chart",
    chartType: type,
    x,
    y,
    w,
    h,
    categories,
    series: [{ name: "Value", values, color: PRIMARY }],
    style: {
      fontFace: FONT,
      fontSize: 12,
      color: BODY,
      axisColor: "CBD5E1",
      gridColor: "E2E8F0",
      backgroundColor: WHITE,
    },
  };
}

function growthChartElement(
  id: string,
  growthStats: unknown,
  x: number,
  y: number,
  w: number,
  h: number,
): AipptChartElement {
  const rows = arr<Record<string, any>>(growthStats);
  const categories = rows.length ? rows.map((row) => str(row.year, "")) : ["2022", "2023", "2024"];
  const keys = rows.length
    ? Object.keys(rows[0]).filter((entry) => entry !== "year" && typeof rows[0][entry] === "number")
    : ["seriesA", "seriesB", "seriesC"];
  const series = keys.map((seriesKey, index) => ({
    name: humanizeKey(seriesKey),
    values: rows.length
      ? rows.map((row) => {
          const value = Number(row[seriesKey] ?? 0);
          return Number.isFinite(value) ? value : 0;
        })
      : [10 + index * 5, 20 + index * 5, 30 + index * 5],
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return {
    id,
    type: "chart",
    chartType: "line",
    x,
    y,
    w,
    h,
    categories,
    series,
    style: {
      fontFace: FONT,
      fontSize: 12,
      color: TITLE,
      axisColor: "CBD5E1",
      gridColor: "E2E8F0",
      backgroundColor: WHITE,
    },
  };
}

function computeGrowthCards(growthStats: unknown) {
  const rows = arr<Record<string, any>>(growthStats);
  if (!rows.length) {
    return [
      {
        label: "Series A",
        value: "+25% growth",
        description: "Growth measured across the selected reporting window.",
      },
    ];
  }
  const first = rows[0];
  const last = rows[rows.length - 1];
  return Object.keys(first)
    .filter((entry) => entry !== "year" && typeof first[entry] === "number")
    .slice(0, 3)
    .map((entry) => {
      const start = Number(first[entry] ?? 0);
      const end = Number(last[entry] ?? 0);
      const growth = start === 0 ? 0 : ((end - start) / Math.abs(start)) * 100;
      const label = humanizeKey(entry);
      return {
        label,
        value: `${growth >= 0 ? "+" : ""}${Math.round(growth)}% growth`,
        description: `${label} growth across the reporting period.`,
      };
    });
}

function cardTable(
  id: string,
  x: number,
  y: number,
  w: number,
  columns: string[],
  rows: AipptTableCell[][],
): AipptSlideElement {
  return {
    id,
    type: "table",
    x,
    y,
    w,
    h: Math.max(88, 44 * rows.length),
    columns: columns.map(() => w / columns.length),
    rows,
    style: {
      fontFace: FONT,
      fontSize: 12,
      color: BODY,
      borderColor: STROKE,
      margin: [4, 8, 4, 8],
    },
  };
}

function buildIntro(slide: ModernSlideLike, data: Record<string, any>): AipptSlideDocument {
  const hero = imageValue(data.image, "Abstract business background");
  const introCard = data.introCard && typeof data.introCard === "object" ? data.introCard : {};
  const name = str(introCard.name, "John Doe");
  const showIntroCard = introCard.enabled !== false;

  return document(slideId(slide, "intro"), [
    ...brand(data),
    text(
      "title",
      str(data.title, "Pitch Deck"),
      64,
      210,
      540,
      98,
      style(48, TITLE, { bold: true, lineSpacingMultiple: 1.02 }),
    ),
    locked(rect("title-accent", 64, 322, 168, 4, PRIMARY)),
    text(
      "description",
      str(
        data.description,
        "Add a short subtitle or description here.",
      ),
      64,
      354,
      520,
      110,
      style(18, TITLE, { lineSpacingMultiple: 1.46 }),
    ),
    ...(showIntroCard
      ? [
          rect("intro-card", 64, 500, 400, 72, WHITE, STROKE, { radius: 8 }),
          rect("intro-avatar", 84, 516, 40, 40, CARD, CARD, { radius: 20 }),
          text(
            "intro-initials",
            initials(name) || "JD",
            84,
            526,
            40,
            16,
            style(14, TITLE, { bold: true, align: "center", valign: "middle" }),
          ),
          text("intro-name", name, 140, 514, 200, 22, style(16, TITLE, { bold: true })),
          text("intro-date", str(introCard.date, "December 2025"), 140, 538, 200, 18, style(14, TITLE)),
        ]
      : []),
    image("main-image", hero.src, 702, 64, 538, 592, {
      prompt: hero.prompt,
      name: "Hero image",
    }),
  ]);
}

function buildBulletWithIcons(
  slide: ModernSlideLike,
  data: Record<string, any>,
): AipptSlideDocument {
  const categories = arr<Record<string, any>>(data.problemCategories);

  return document(slideId(slide, "bullet-icons"), [
    ...brand(data),
    text("title", str(data.title, "Problem"), 64, 198, 480, 64, style(48, TITLE, { bold: true })),
    text(
      "description",
      str(
        data.description,
        "Describe the core problem with concise supporting text.",
      ),
      64,
      286,
      500,
      172,
      style(18, TITLE, { lineSpacingMultiple: 1.5 }),
    ),
    ...categories.slice(0, 4).flatMap((category, index) => {
      const top = 138 + index * 126;
      const icon = iconValue(category.icon);
      return [
        rect(`category-card-${index}`, 706, top, 510, 102, CARD, CARD, { radius: 12 }),
        image(`category-icon-${index}`, icon.src, 732, top + 27, 48, 48, {
          fit: "contain",
          prompt: icon.prompt,
          name: "Icon",
        }),
        text(
          `category-title-${index}`,
          str(category.title, "Category"),
          800,
          top + 23,
          360,
          24,
          style(20, TITLE, { bold: true }),
        ),
        text(
          `category-description-${index}`,
          str(category.description, "Describe the category."),
          800,
          top + 52,
          360,
          34,
          style(14, TITLE, { lineSpacingMultiple: 1.36 }),
        ),
      ];
    }),
    bottomBorder(),
  ]);
}

function buildIconGrid(slide: ModernSlideLike, data: Record<string, any>): AipptSlideDocument {
  const sections = arr<Record<string, any>>(data.sections);
  const cards = sections.length ? sections : [{ title: "Market", description: "Focused and relevant.", icon: {} }];

  return document(slideId(slide, "icon-grid"), [
    ...brand(data),
    text("title", str(data.title, "Businesses struggle"), 64, 176, 480, 70, style(48, PRIMARY, { bold: true })),
    text(
      "description",
      str(
        data.mainDescription,
        "Show that we offer a solution that solves the problems previously described and identified.",
      ),
      64,
      272,
      470,
      176,
      style(18, BODY, { lineSpacingMultiple: 1.5 }),
    ),
    ...cards.slice(0, 6).flatMap((section, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const left = 700 + col * 250;
      const top = 118 + row * 174;
      const icon = iconValue(section.icon);
      return [
        rect(`section-card-${index}`, left, top, 228, 148, CARD, CARD, { radius: 10 }),
        image(`section-icon-${index}`, icon.src, left + 90, top + 18, 48, 48, {
          fit: "contain",
          prompt: icon.prompt,
          name: "Icon",
        }),
        text(
          `section-title-${index}`,
          str(section.title, "Section"),
          left + 18,
          top + 76,
          192,
          22,
          style(18, TITLE, { bold: true, align: "center" }),
        ),
        locked(rect(`section-accent-${index}`, left + 98, top + 106, 32, 4, PRIMARY)),
        text(
          `section-description-${index}`,
          str(section.description, "Section description."),
          left + 18,
          top + 120,
          192,
          20,
          style(12, TITLE, { align: "center", lineSpacingMultiple: 1.3 }),
        ),
      ];
    }),
    bottomBorder(),
  ]);
}

function buildChartOrTable(
  slide: ModernSlideLike,
  data: Record<string, any>,
): AipptSlideDocument {
  const mode = str(data.mode, "chart");
  const columns = arr<string>(data.columns);
  const rowData = arr<Record<string, any>>(data.rows);
  const resolvedColumns = columns.length ? columns : ["Column 1", "Column 2", "Column 3"];
  const tableRows: AipptTableCell[][] = [
    resolvedColumns.map((column) => ({
      text: str(column, "-"),
      fill: WHITE,
      color: PRIMARY,
      bold: true,
    })),
    ...(rowData.length
      ? rowData
      : [{ cells: ["Row A", "Value", "123"] }]).map((row) =>
      resolvedColumns.map((_, cellIndex) => ({
        text: str(arr<string>(row.cells)?.[cellIndex], ""),
        fill: WHITE,
        color: BODY,
      })),
    ),
  ];

  return document(slideId(slide, "chart-table"), [
    ...brand(data),
    text("title", str(data.title, "Data Table or Chart"), 64, 206, 520, 64, style(48, TITLE, { bold: true })),
    text(
      "description",
      str(
        data.description,
        "Present structured information in a flexible table or visualize it with a chart.",
      ),
      64,
      292,
      500,
      96,
      style(16, TITLE, { lineSpacingMultiple: 1.45 }),
    ),
    rect("visual-card", 698, 150, 522, 392, WHITE, STROKE, { radius: 12 }),
    ...(mode === "table"
      ? [
          cardTable("table", 726, 178, 466, resolvedColumns, tableRows),
        ]
      : [
          rect("chart-bg", 718, 170, 482, 352, CARD, CARD, { radius: 10 }),
          simpleChartElement("chart", data.chart, 742, 196, 434, 300),
        ]),
    bottomBorder(),
  ]);
}

function buildChartWithMetrics(
  slide: ModernSlideLike,
  data: Record<string, any>,
): AipptSlideDocument {
  const chart = growthChartElement("chart", data.growthStats, 92, 228, 444, 250);
  const stats = computeGrowthCards(data.growthStats);
  const tableColumns = arr<string>(data.tableColumns);
  const tableRowsData = arr<string[]>(data.tableRows);
  const resolvedColumns = tableColumns.length ? tableColumns : ["Metric", "Value"];
  const resolvedRows: AipptTableCell[][] = [
    resolvedColumns.map((column) => ({
      text: str(column, "-"),
      fill: WHITE,
      color: PRIMARY,
      bold: true,
    })),
    ...(tableRowsData.length ? tableRowsData : [["Users", "10K+"]]).map((row) =>
      resolvedColumns.map((_, cellIndex) => ({
        text: str(row?.[cellIndex], ""),
        fill: WHITE,
        color: BODY,
      })),
    ),
  ];
  const cards = stats.length ? stats : [{ label: "Series A", value: "+25% growth", description: "Growth measured across the reporting window." }];
  const count = Math.max(1, Math.min(3, cards.length));
  const cardGap = 16;
  const cardW = (500 - cardGap * (count - 1)) / count;

  return document(slideId(slide, "chart-metrics"), [
    ...brand(data),
    text("title", str(data.title, "Company Traction"), 64, 118, 520, 64, style(48, TITLE, { bold: true })),
    rect("chart-card", 64, 196, 500, 320, WHITE, STROKE, { radius: 12 }),
    chart,
    text(
      "description",
      str(
        data.description,
        "Traction is a period where the company is feeling momentum during its development period.",
      ),
      700,
      188,
      500,
      120,
      style(16, TITLE, { lineSpacingMultiple: 1.46 }),
    ),
    ...(data.tableMode
      ? [
          rect("metrics-table-card", 700, 326, 500, 222, WHITE, STROKE, { radius: 12 }),
          cardTable("metrics-table", 724, 350, 452, resolvedColumns, resolvedRows),
        ]
      : cards.slice(0, 3).flatMap((card, index) => {
          const left = 700 + index * (cardW + cardGap);
          return [
            rect(`metric-card-${index}`, left, 354, cardW, 162, CARD, CARD, { radius: 10 }),
            rect(`metric-pill-${index}`, left + 16, 372, 90, 24, TITLE, TITLE, { radius: 4 }),
            text(
              `metric-label-${index}`,
              card.label,
              left + 24,
              378,
              74,
              12,
              style(11, WHITE, { bold: true, align: "center", valign: "middle" }),
            ),
            text(
              `metric-value-${index}`,
              card.value,
              left + 16,
              410,
              cardW - 32,
              28,
              style(24, TITLE, { bold: true }),
            ),
            text(
              `metric-description-${index}`,
              card.description,
              left + 16,
              448,
              cardW - 32,
              50,
              style(13, TITLE, { lineSpacingMultiple: 1.34 }),
            ),
          ];
        })),
    bottomBorder(),
  ]);
}

function buildImageAndDescription(
  slide: ModernSlideLike,
  data: Record<string, any>,
): AipptSlideDocument {
  const mainImage = imageValue(data.image, "Abstract business background");

  return document(slideId(slide, "image-description"), [
    ...brand(data),
    image("main-image", mainImage.src, 64, 168, 520, 384, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    text("title", str(data.title, "Image With Description"), 700, 216, 470, 72, style(48, PRIMARY, { bold: true })),
    text(
      "content",
      str(
        data.content,
        "Use this section for a concise explanation paired with the visual on the left.",
      ),
      700,
      332,
      450,
      176,
      style(18, BODY, { lineSpacingMultiple: 1.52 }),
    ),
  ]);
}

function buildImageList(slide: ModernSlideLike, data: Record<string, any>): AipptSlideDocument {
  const products = arr<Record<string, any>>(data.products).slice(0, 4);
  const count = Math.max(1, products.length || 1);
  const cardW = count === 1 ? 360 : count === 2 ? 300 : count === 3 ? 250 : 220;
  const gap = count === 4 ? 32 : 36;
  const totalW = count * cardW + (count - 1) * gap;
  const startX = (1280 - totalW) / 2;

  return document(slideId(slide, "image-list"), [
    ...brand(data),
    text("title", str(data.title, "Product Overview"), 64, 96, 520, 64, style(48, TITLE, { bold: true })),
    ...products.flatMap((product, index) => {
      const left = startX + index * (cardW + gap);
      const top = 220;
      const imageBoxH = 150;
      const textBoxH = 222;
      const productImage = imageValue(product.image, str(product.title, "Product image"));
      const title = str(product.title, "Product");
      const description = str(product.description, "Product description.");
      return index % 2 === 0
        ? [
            rect(`product-text-bg-${index}`, left, top, cardW, textBoxH, CARD, CARD, { radius: 8 }),
            text(`product-title-${index}`, title, left + 18, top + 34, cardW - 36, 48, style(20, TITLE, { bold: true, align: "center" })),
            text(
              `product-description-${index}`,
              description,
              left + 18,
              top + 88,
              cardW - 36,
              82,
              style(14, TITLE, { align: "center", lineSpacingMultiple: 1.42 }),
            ),
            image(`product-image-${index}`, productImage.src, left, top + textBoxH, cardW, imageBoxH, {
              prompt: productImage.prompt,
              name: title,
            }),
          ]
        : [
            image(`product-image-${index}`, productImage.src, left, top, cardW, imageBoxH, {
              prompt: productImage.prompt,
              name: title,
            }),
            rect(`product-text-bg-${index}`, left, top + imageBoxH, cardW, textBoxH, CARD, CARD, { radius: 8 }),
            text(`product-title-${index}`, title, left + 18, top + imageBoxH + 34, cardW - 36, 48, style(20, TITLE, { bold: true, align: "center" })),
            text(
              `product-description-${index}`,
              description,
              left + 18,
              top + imageBoxH + 88,
              cardW - 36,
              82,
              style(14, TITLE, { align: "center", lineSpacingMultiple: 1.42 }),
            ),
          ];
    }),
    bottomBorder(),
  ]);
}

function buildTeam(slide: ModernSlideLike, data: Record<string, any>): AipptSlideDocument {
  const members = arr<Record<string, any>>(data.teamMembers).slice(0, 4);
  const count = Math.max(1, members.length || 1);
  const cardW = count === 4 ? 248 : count === 3 ? 280 : 340;
  const gap = 24;
  const totalW = count * cardW + (count - 1) * gap;
  const startX = (1280 - totalW) / 2;

  return document(slideId(slide, "team"), [
    ...brand(data),
    text("title", str(data.title, "Our Team"), 64, 92, 520, 62, style(48, TITLE, { bold: true })),
    text(
      "subtitle",
      str(data.subtitle, ""),
      64,
      158,
      520,
      74,
      style(18, TITLE, { lineSpacingMultiple: 1.44 }),
    ),
    ...members.flatMap((member, index) => {
      const left = startX + index * (cardW + gap);
      const top = 246;
      const memberImage = imageValue(member.image, str(member.name, "Team member"));
      return [
        rect(`member-card-${index}`, left, top, cardW, 356, CARD, CARD, { radius: 12 }),
        image(`member-image-${index}`, memberImage.src, left + 20, top + 20, cardW - 40, 160, {
          prompt: memberImage.prompt,
          name: `${str(member.name, "Team member")} photo`,
        }),
        text(
          `member-name-${index}`,
          str(member.name, "Team Member"),
          left + 16,
          top + 196,
          cardW - 32,
          24,
          style(18, TITLE, { bold: true, align: "center" }),
        ),
        text(
          `member-description-${index}`,
          str(member.description, "Brief description."),
          left + 18,
          top + 232,
          cardW - 36,
          70,
          style(13, TITLE, { align: "center", lineSpacingMultiple: 1.36 }),
        ),
        ...(str(member.linkedIn, "")
          ? [
              text(
                `member-linkedin-${index}`,
                "LinkedIn",
                left + 18,
                top + 312,
                cardW - 36,
                18,
                style(12, TITLE, { align: "center", underline: true }),
              ),
            ]
          : []),
      ];
    }),
    bottomBorder(),
  ]);
}

function buildMetricsWithImage(
  slide: ModernSlideLike,
  data: Record<string, any>,
): AipptSlideDocument {
  const map = imageValue(data.mapImage, "World map with location pins or points");
  const stats = arr<Record<string, any>>(data.marketStats).slice(0, 4);

  return document(slideId(slide, "metrics-image"), [
    ...brand(data),
    text("title", str(data.title, "Market Size"), 64, 116, 520, 62, style(48, PRIMARY, { bold: true })),
    rect("map-card", 64, 212, 520, 226, MAP_CARD, MAP_CARD, { radius: 8 }),
    image("map-image", map.src, 86, 228, 476, 186, {
      fit: "contain",
      prompt: map.prompt,
      name: "Map image",
    }),
    text(
      "description",
      str(
        data.description,
        "Market size is the total amount of sales and customers visible to stakeholders.",
      ),
      64,
      474,
      500,
      118,
      style(14, TITLE, { lineSpacingMultiple: 1.48 }),
    ),
    ...stats.flatMap((stat, index) => {
      const top = 140 + index * 120;
      return [
        rect(`stat-pill-${index}`, 700, top, 220, 24, TITLE, TITLE, { radius: 4 }),
        text(
          `stat-label-${index}`,
          str(stat.label, "Metric"),
          708,
          top + 6,
          204,
          12,
          style(12, WHITE, { bold: true, valign: "middle" }),
        ),
        text(
          `stat-value-${index}`,
          str(stat.value, "0"),
          700,
          top + 36,
          280,
          32,
          style(28, PRIMARY, { bold: true }),
        ),
        text(
          `stat-description-${index}`,
          str(stat.description, "Metric description."),
          700,
          top + 76,
          470,
          46,
          style(13, BODY, { lineSpacingMultiple: 1.34 }),
        ),
      ];
    }),
  ]);
}

function buildToc(slide: ModernSlideLike, data: Record<string, any>): AipptSlideDocument {
  const items = arr<Record<string, any>>(data.items).slice(0, 10);
  const mid = Math.ceil(items.length / 2) || 1;

  return document(slideId(slide, "toc"), [
    ...brand(data),
    text("title", str(data.title, "Table Of Contents"), 64, 92, 560, 62, style(48, TITLE, { bold: true })),
    ...items.flatMap((item, index) => {
      const right = index >= mid;
      const slot = right ? index - mid : index;
      const left = right ? 658 : 64;
      const top = 206 + slot * 94;
      return [
        rect(`toc-bubble-${index}`, left, top, 40, 40, PRIMARY, PRIMARY, { radius: 20 }),
        text(
          `toc-number-${index}`,
          String(index + 1),
          left,
          top + 11,
          40,
          18,
          style(16, WHITE, { bold: true, align: "center", valign: "middle" }),
        ),
        rect(`toc-card-${index}`, left + 56, top - 2, 500, 56, CARD, CARD, { radius: 8 }),
        text(
          `toc-title-${index}`,
          str(item.title, `Section ${index + 1}`),
          left + 72,
          top + 8,
          220,
          20,
          style(18, PRIMARY, { bold: true }),
        ),
        text(
          `toc-description-${index}`,
          str(item.description, "Brief description for this section."),
          left + 72,
          top + 30,
          460,
          16,
          style(14, TITLE),
        ),
      ];
    }),
    bottomBorder(),
  ]);
}

export function isModernLayout(slide: ModernSlideLike) {
  return slide.layout_group === GROUP && Boolean(MODERN_LAYOUT_ALIASES[key(slide)]);
}

export function getModernStoredDocumentCandidate(
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

export function buildModernAipptSlideDocument(
  slide: ModernSlideLike,
): AipptSlideDocument | null {
  if (!isModernLayout(slide)) return null;
  const data = slide.content ?? {};
  const layout = key(slide);
  let result: AipptSlideDocument | null = null;

  if (layout === "intro-pitchdeck-slide") result = buildIntro(slide, data);
  if (layout === "bullet-with-icons") result = buildBulletWithIcons(slide, data);
  if (layout === "bullet-with-icons-description-grid") result = buildIconGrid(slide, data);
  if (layout === "chart-or-table-with-description") result = buildChartOrTable(slide, data);
  if (layout === "chart-with-metrics") result = buildChartWithMetrics(slide, data);
  if (layout === "image-and-description") result = buildImageAndDescription(slide, data);
  if (layout === "image-list-with-description") result = buildImageList(slide, data);
  if (layout === "images-with-description") result = buildTeam(slide, data);
  if (layout === "metrics-with-description-image") result = buildMetricsWithImage(slide, data);
  if (layout === "table-of-contents") result = buildToc(slide, data);

  return result ? withModernMeta(result, layout) : null;
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

export function repairModernAipptSlideDocument(
  slide: ModernSlideLike,
  storedDocument: AipptSlideDocument | null,
): AipptSlideDocument | null {
  const rebuiltDocument = buildModernAipptSlideDocument(slide);
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
