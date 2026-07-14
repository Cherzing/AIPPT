import type {
  AipptNativeMeta,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableCell,
  AipptTextStyle,
} from "./types";

const GROUP = "general";
const WHITE = "FFFFFF";
const BG = "FFFFFF";
const TEXT = "111827";
const MUTED = "4B5563";
const STROKE = "E5E7EB";
const CARD = "F8FAFC";
const CARD_ALT = "F3F4F6";
const PRIMARY = "9333EA";
const PRIMARY_DARK = "7E22CE";
const PRIMARY_LIGHT = "F3E8FF";
const FONT = "Poppins";
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIHJ4PSIyNCIgZmlsbD0iI0Y4RkFGQyIvPjxwYXRoIGQ9Ik0xMjAgMjUwaDQwMGwtMTEyLTEyMC04OCA5OC02NC03NC0xMzYgOTZ6IiBmaWxsPSIjRERFN0YzIi8+PGNpcmNsZSBjeD0iNDkwIiBjeT0iOTQiIHI9IjQ0IiBmaWxsPSIjQzRCNUZEIi8+PHRleHQgeD0iMzIwIiB5PSIzMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Qjc0ODAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+RWRpdGFibGUgaW1hZ2U8L3RleHQ+PC9zdmc+";
const DEFAULT_ICON = "/static/icons/bold/checks-bold.svg";

const GENERAL_LAYOUTS = new Set([
  "general-intro-slide",
  "basic-info-slide",
  "bullet-icons-only-slide",
  "bullet-with-icons-slide",
  "chart-with-bullets-slide",
  "metrics-slide",
  "metrics-with-image-slide",
  "numbered-bullets-slide",
  "quote-slide",
  "table-info-slide",
  "table-of-contents-slide",
  "team-slide",
]);

type GeneralSlideLike = {
  id?: string | null;
  index?: number;
  layout?: string | null;
  layout_group?: string | null;
  content?: Record<string, any> | null;
};

function key(slide: GeneralSlideLike) {
  const layout = slide.layout ?? "";
  return layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
}

function generalMeta(layout: string): AipptNativeMeta {
  return {
    version: 1,
    fidelity: "A",
    sourceRenderer: "general-template-builder",
    conversionStatus: "complete",
    sourceTemplate: GROUP,
    sourceLayout: layout,
  };
}

function withGeneralMeta(
  document: AipptSlideDocument,
  layout: string,
): AipptSlideDocument {
  return {
    ...document,
    meta: generalMeta(layout),
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

function cleanColor(value: unknown, fallback: string) {
  return str(value, fallback).replace(/^#/, "").toUpperCase();
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
  opacity = 0.12,
): AipptSlideElement {
  return {
    ...rect(id, x, y, w, h, fill, fill, {
      locked: true,
      opacity,
      transparency: Math.round((1 - opacity) * 100),
    }),
    shape: "ellipse",
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

function slideId(slide: GeneralSlideLike, name: string) {
  return slide.id ?? `general-${name}-${slide.index ?? 0}`;
}

function brand(data: Record<string, any>): AipptSlideElement[] {
  const logo = str(data._logo_url__, "");
  const company = str(data.__companyName__, "");
  const elements: AipptSlideElement[] = [];
  if (logo) {
    elements.push(image("brand-logo", logo, 80, 24, 24, 24, { fit: "contain", locked: true }));
  }
  if (company) {
    elements.push(
      locked(text("brand-company", company, logo ? 112 : 80, 24, 280, 24, style(14, TEXT, { bold: true, valign: "middle" }))),
    );
  }
  return elements;
}

function themePrimary(data: Record<string, any>) {
  return cleanColor(data.__primaryColor__ ?? data.primaryColor, PRIMARY);
}

function accentLine(id: string, x: number, y: number, w = 80, color = PRIMARY) {
  return locked(rect(id, x, y, w, 4, color));
}

function subtleWaves(prefix: string, side: "left" | "right" | "bottom" = "left") {
  if (side === "right") {
    return [
      ellipse(`${prefix}-wave-1`, 1060, -70, 300, 240, PRIMARY, 0.08),
      ellipse(`${prefix}-wave-2`, 1100, 120, 260, 200, PRIMARY_DARK, 0.06),
    ];
  }
  if (side === "bottom") {
    return [
      ellipse(`${prefix}-wave-1`, -90, 606, 560, 150, PRIMARY, 0.08),
      ellipse(`${prefix}-wave-2`, 280, 620, 640, 150, PRIMARY_DARK, 0.07),
      ellipse(`${prefix}-wave-3`, 740, 610, 600, 150, PRIMARY, 0.08),
    ];
  }
  return [
    ellipse(`${prefix}-wave-1`, -120, 20, 360, 210, PRIMARY, 0.08),
    ellipse(`${prefix}-wave-2`, -130, 205, 350, 210, PRIMARY_DARK, 0.06),
  ];
}

function chartElement(
  id: string,
  data: unknown,
  x: number,
  y: number,
  w: number,
  h: number,
): AipptSlideElement {
  const chartData = data && typeof data === "object" ? data as Record<string, any> : {};
  const type = chartData.type === "pie" ? "pie" : chartData.type === "line" || chartData.type === "area" || chartData.type === "scatter" ? "line" : "bar";
  const points = arr<Record<string, any>>(chartData.data);
  const categories = points.length
    ? points.map((point, index) => str(point.name ?? point.x, `Item ${index + 1}`))
    : ["Q1", "Q2", "Q3"];
  const values = points.length
    ? points.map((point) => {
        const value = Number(point.value ?? point.y ?? 0);
        return Number.isFinite(value) ? value : 0;
      })
    : [5, 8, 12];

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
      color: MUTED,
      axisColor: "CBD5E1",
      gridColor: "E5E7EB",
      backgroundColor: WHITE,
    },
  };
}

function iconBubble(
  prefix: string,
  icon: unknown,
  x: number,
  y: number,
  color = PRIMARY,
  square = false,
): AipptSlideElement[] {
  const resolved = iconValue(icon);
  return [
    rect(`${prefix}-icon-bg`, x, y, 48, 48, color, color, { radius: square ? 8 : 24 }),
    image(`${prefix}-icon`, resolved.src, x + 12, y + 12, 24, 24, {
      fit: "contain",
      prompt: resolved.prompt,
      name: "Icon",
    }),
  ];
}

function buildIntro(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const mainImage = imageValue(data.image, "business team in meeting room");
  const initials = str(data.presenterName, "John Doe")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3);

  return document(slideId(slide, "intro"), [
    ...brand(data),
    image("main-image", mainImage.src, 80, 200, 500, 320, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    text("title", str(data.title, "Product Overview"), 670, 162, 500, 132, style(50, TEXT, { bold: true, lineSpacingMultiple: 1.06 })),
    accentLine("accent-line", 670, 314, 80, primary),
    text("description", str(data.description, "Our product offers customizable dashboards for real-time reporting and data-driven decisions."), 670, 346, 500, 96, style(18, MUTED, { lineSpacingMultiple: 1.38 })),
    rect("presenter-card", 670, 482, 460, 96, WHITE, STROKE, { radius: 8 }),
    rect("presenter-avatar", 694, 506, 48, 48, primary, primary, { radius: 24 }),
    text("presenter-initials", initials || "JD", 694, 516, 48, 20, style(15, WHITE, { bold: true, align: "center", valign: "middle" })),
    text("presenter-name", str(data.presenterName, "John Doe"), 762, 502, 300, 26, style(20, TEXT, { bold: true })),
    text("presentation-date", str(data.presentationDate, "December 2025"), 762, 534, 300, 22, style(15, MUTED)),
  ]);
}

function buildBasicInfo(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const mainImage = imageValue(data.image, "business team discussing product features");
  return document(slideId(slide, "basic-info"), [
    ...brand(data),
    image("main-image", mainImage.src, 80, 200, 500, 320, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    text("title", str(data.title, "Product Overview"), 670, 178, 500, 140, style(54, TEXT, { bold: true, lineSpacingMultiple: 1.04 })),
    accentLine("accent-line", 670, 334, 80, primary),
    text("description", str(data.description, "Our product offers customizable dashboards for real-time reporting and data-driven decisions."), 670, 372, 500, 118, style(18, MUTED, { lineSpacingMultiple: 1.42 })),
  ]);
}

function buildBulletIconsOnly(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const mainImage = imageValue(data.image, "business professionals collaborating");
  const bullets = arr<Record<string, any>>(data.bulletPoints);
  return document(slideId(slide, "bullet-icons-only"), [
    ...brand(data),
    ...subtleWaves("bullet-icons", "left"),
    text("title", str(data.title, "Solutions"), 80, 82, 600, 90, style(64, TEXT, { bold: true })),
    ...bullets.slice(0, 4).flatMap((bullet, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const left = 82 + col * 300;
      const top = 242 + row * 150;
      return [
        ...iconBubble(`bullet-${index}`, bullet.icon, left, top, primary),
        text(`bullet-title-${index}`, str(bullet.title, "Custom Software"), left + 66, top, 210, 28, style(20, TEXT, { bold: true })),
        text(`bullet-subtitle-${index}`, str(bullet.subtitle, "We create tailored software to optimize processes and boost efficiency."), left + 66, top + 36, 230, 70, style(13.5, MUTED, { lineSpacingMultiple: 1.28 })),
      ];
    }),
    image("main-image", mainImage.src, 810, 204, 380, 320, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    locked({ ...rect("sparkle", 1120, 128, 28, 28, primary), shape: "star5", opacity: 0.65 } as AipptSlideElement),
    line("decorative-wave", 814, 160, 894, 160, primary, 2),
  ]);
}

function buildBulletWithIcons(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const mainImage = imageValue(data.image, "business people analyzing documents");
  const bullets = arr<Record<string, any>>(data.bulletPoints);
  const gridLines = Array.from({ length: 12 }, (_, index) => [
    line(`grid-v-${index}`, 88 + index * 36, 184, 88 + index * 36, 530, primary, 0.5),
    line(`grid-h-${index}`, 80, 194 + index * 30, 520, 194 + index * 30, primary, 0.5),
  ]).flat().map((element) => ({ ...element, opacity: 0.22, line: { ...(element as any).line, transparency: 78 } }) as AipptSlideElement);

  return document(slideId(slide, "bullet-with-icons"), [
    ...brand(data),
    text("title", str(data.title, "Problem"), 80, 78, 700, 72, style(54, TEXT, { bold: true })),
    ...gridLines,
    image("main-image", mainImage.src, 116, 230, 410, 310, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    locked({ ...rect("sparkle", 532, 210, 24, 24, primary), shape: "star5", opacity: 0.8 } as AipptSlideElement),
    text("description", str(data.description, "Businesses face challenges with outdated technology and rising costs."), 690, 190, 475, 76, style(18, MUTED, { lineSpacingMultiple: 1.38 })),
    ...bullets.slice(0, 3).flatMap((bullet, index) => {
      const top = 310 + index * 112;
      return [
        ...iconBubble(`bullet-${index}`, bullet.icon, 690, top, primary, true),
        text(`bullet-title-${index}`, str(bullet.title, "Inefficiency"), 758, top - 2, 360, 28, style(22, TEXT, { bold: true })),
        accentLine(`bullet-accent-${index}`, 758, top + 38, 48, primary),
        text(`bullet-description-${index}`, str(bullet.description, "Businesses struggle to find digital tools that meet their needs."), 758, top + 52, 380, 48, style(15, MUTED, { lineSpacingMultiple: 1.28 })),
      ];
    }),
  ]);
}

function buildChartWithBullets(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const bullets = arr<Record<string, any>>(data.bulletPoints);
  return document(slideId(slide, "chart-with-bullets"), [
    ...brand(data),
    text("title", str(data.title, "Market Size"), 80, 70, 690, 70, style(54, TEXT, { bold: true })),
    text("description", str(data.description, "Businesses face challenges with outdated technology and rising costs."), 80, 154, 650, 62, style(16, MUTED, { lineSpacingMultiple: 1.35 })),
    rect("chart-card", 80, 248, 704, 386, WHITE, "F1F5F9", { radius: 8 }),
    chartElement("chart", data.chartData, 110, 278, 644, 326),
    ...bullets.slice(0, 3).flatMap((bullet, index) => {
      const top = 145 + index * 154;
      return [
        rect(`bullet-card-${index}`, 850, top, 350, 124, primary, primary, { radius: 16 }),
        ...iconBubble(`bullet-${index}`, bullet.icon, 876, top + 22, primary, true),
        text(`bullet-title-${index}`, str(bullet.title, "Total Addressable Market"), 936, top + 22, 230, 28, style(18, WHITE, { bold: true })),
        text(`bullet-description-${index}`, str(bullet.description, "Companies can use market data to plan future expansion."), 876, top + 68, 286, 42, style(13, WHITE, { lineSpacingMultiple: 1.25 })),
      ];
    }),
  ]);
}

function buildMetrics(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const metrics = arr<Record<string, any>>(data.metrics);
  const count = Math.max(1, Math.min(3, metrics.length || 3));
  const cardW = count === 1 ? 360 : count === 2 ? 360 : 300;
  const gap = count === 1 ? 0 : count === 2 ? 80 : 48;
  const totalW = count * cardW + (count - 1) * gap;
  const startX = (1280 - totalW) / 2;
  return document(slideId(slide, "metrics"), [
    ...brand(data),
    ...subtleWaves("metrics-left", "left"),
    ...subtleWaves("metrics-right", "right"),
    text("title", str(data.title, "Company Traction"), 120, 112, 1040, 70, style(54, TEXT, { bold: true, align: "center" })),
    ...Array.from({ length: count }, (_, index) => {
      const metric = metrics[index] ?? {};
      const left = startX + index * (cardW + gap);
      return [
        text(`metric-label-${index}`, str(metric.label, "Clients Onboarded"), left, 280, cardW, 24, style(14, MUTED, { bold: true, align: "center" })),
        text(`metric-value-${index}`, str(metric.value, ["150+", "200+", "95%"][index] ?? "100"), left, 318, cardW, 70, style(56, primary, { bold: true, align: "center" })),
        rect(`metric-description-bg-${index}`, left, 420, cardW, 104, primary, primary, { radius: 8 }),
        text(`metric-description-${index}`, str(metric.description, "Detailed description of the metric."), left + 24, 444, cardW - 48, 56, style(13, WHITE, { align: "center", valign: "middle", lineSpacingMultiple: 1.25 })),
      ];
    }).flat(),
  ]);
}

function buildMetricsWithImage(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const mainImage = imageValue(data.image, "person holding tablet with analytics dashboard");
  const metrics = arr<Record<string, any>>(data.metrics);
  return document(slideId(slide, "metrics-with-image"), [
    ...brand(data),
    ...subtleWaves("metrics-image-bottom", "bottom"),
    ...subtleWaves("metrics-image-right", "right"),
    image("main-image", mainImage.src, 80, 162, 500, 384, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    text("title", str(data.title, "Competitive Advantage"), 670, 150, 500, 130, style(52, TEXT, { bold: true, lineSpacingMultiple: 1.06 })),
    text("description", str(data.description, "Ginyard International Co. stands out by offering custom digital solutions tailored to client needs."), 670, 304, 500, 92, style(17, MUTED, { lineSpacingMultiple: 1.38 })),
    ...metrics.slice(0, 4).flatMap((metric, index) => {
      const left = 670 + (index % 2) * 230;
      const top = 450 + Math.floor(index / 2) * 88;
      return [
        text(`metric-label-${index}`, str(metric.label, "Satisfied Clients"), left, top, 190, 22, style(14, MUTED, { align: "center" })),
        text(`metric-value-${index}`, str(metric.value, "200+"), left, top + 28, 190, 50, style(42, primary, { bold: true, align: "center" })),
      ];
    }),
  ]);
}

function buildNumberedBullets(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const mainImage = imageValue(data.image, "business people analyzing charts");
  const bullets = arr<Record<string, any>>(data.bulletPoints);
  return document(slideId(slide, "numbered-bullets"), [
    ...brand(data),
    text("title", str(data.title, "Market Validation"), 80, 90, 700, 112, style(54, TEXT, { bold: true, lineSpacingMultiple: 1.08 })),
    accentLine("accent-line", 80, 222, 96, primary),
    image("main-image", mainImage.src, 850, 94, 350, 194, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    ...bullets.slice(0, 4).flatMap((bullet, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const left = 90 + col * 570;
      const top = 346 + row * 136;
      return [
        text(`bullet-number-${index}`, String(index + 1).padStart(2, "0"), left, top, 84, 58, style(44, TEXT, { bold: true })),
        text(`bullet-title-${index}`, str(bullet.title, "Customer Insights"), left + 104, top + 6, 330, 30, style(24, TEXT, { bold: true })),
        text(`bullet-description-${index}`, str(bullet.description, "Surveys reveal strong customer interest in digital solutions."), left + 104, top + 48, 390, 62, style(15, MUTED, { lineSpacingMultiple: 1.3 })),
      ];
    }),
    ...subtleWaves("numbered-bottom", "bottom"),
  ]);
}

function buildQuote(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const bgImage = imageValue(data.backgroundImage, "inspirational landscape background");
  return {
    ...document(slideId(slide, "quote"), [
      image("background-image", bgImage.src, 0, 0, 1280, 720, {
        prompt: bgImage.prompt,
        name: "Background image",
        opacity: 0.62,
      }),
      ellipse("quote-orb-left", -40, -30, 220, 220, primary, 0.2),
      ellipse("quote-orb-right", 1120, 570, 240, 240, PRIMARY_DARK, 0.18),
      text("heading", str(data.heading, "Words of Wisdom"), 160, 148, 960, 64, style(42, WHITE, { bold: true, align: "center" })),
      accentLine("accent-line", 600, 232, 80, primary),
      text("quote-mark", "\"", 0, 250, 1280, 68, style(74, primary, { align: "center", valign: "middle" })),
      text("quote", str(data.quote, "Success is not final, failure is not fatal: it is the courage to continue that counts."), 190, 334, 900, 110, style(30, WHITE, { italic: true, align: "center", lineSpacingMultiple: 1.28 })),
      line("author-line-left", 470, 514, 534, 514, primary, 1),
      text("author", str(data.author, "Winston Churchill"), 554, 498, 172, 28, style(18, WHITE, { bold: true, align: "center", valign: "middle" })),
      line("author-line-right", 746, 514, 810, 514, primary, 1),
      locked(rect("bottom-border", 0, 712, 1280, 8, TEXT)),
    ]),
    background: { type: "solid", color: "000000" },
  };
}

function buildTableInfo(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const tableData = data.tableData && typeof data.tableData === "object" ? data.tableData : {};
  const headers = arr<string>(tableData.headers).slice(0, 5);
  const rows = arr<string[]>(tableData.rows).slice(0, 6);
  const resolvedHeaders = headers.length ? headers : ["Company", "Revenue", "Growth", "Market Share"];
  const tableRows: AipptTableCell[][] = [
    resolvedHeaders.map((header) => ({ text: str(header, "-"), fill: primary, color: WHITE, bold: true })),
    ...(rows.length ? rows : [["Company A", "$2.5M", "15%", "25%"], ["Company B", "$1.8M", "12%", "18%"]]).map((row, rowIndex) =>
      resolvedHeaders.map((_, cellIndex) => ({
        text: str(row?.[cellIndex], ""),
        fill: cellIndex % 2 === 0 ? CARD : CARD_ALT,
        color: MUTED,
        align: "center" as const,
      })),
    ),
  ];
  const tableWidth = 900;
  return document(slideId(slide, "table-info"), [
    ...brand(data),
    ...subtleWaves("table-left", "left"),
    ...subtleWaves("table-right", "right"),
    text("title", str(data.title, "Market Comparison"), 160, 88, 960, 64, style(50, TEXT, { bold: true, align: "center" })),
    accentLine("accent-line", 600, 178, 80, primary),
    {
      id: "table",
      type: "table",
      x: 190,
      y: 242,
      w: tableWidth,
      h: 50 * tableRows.length,
      columns: resolvedHeaders.map(() => tableWidth / resolvedHeaders.length),
      rows: tableRows,
      style: {
        fontFace: FONT,
        fontSize: 13,
        color: MUTED,
        borderColor: STROKE,
        margin: [4, 8, 4, 8],
      },
    },
    text("description", str(data.description, "This comparison shows our competitive position in the market."), 190, 566, 900, 62, style(15, MUTED, { align: "center", lineSpacingMultiple: 1.34 })),
  ]);
}

function buildToc(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const sections = arr<Record<string, any>>(data.sections);
  const resolved = sections.length
    ? sections
    : [
        { number: 1, title: "Problem", pageNumber: "03" },
        { number: 2, title: "Solution", pageNumber: "04" },
        { number: 3, title: "Product Overview", pageNumber: "05" },
        { number: 4, title: "Market Size", pageNumber: "06" },
      ];
  const mid = Math.ceil(resolved.length / 2);
  return document(slideId(slide, "table-of-contents"), [
    ...brand(data),
    text("title", str(data.title, "Contents"), 0, 82, 1280, 62, style(50, TEXT, { bold: true, align: "center" })),
    line("decorative-wave", 600, 170, 680, 170, primary, 3),
    ...resolved.slice(0, 10).flatMap((section, index) => {
      const right = index >= mid;
      const slot = right ? index - mid : index;
      const left = right ? 708 : 110;
      const top = 230 + slot * 76;
      return [
        rect(`section-number-bg-${index}`, left, top, 56, 56, primary, primary, { radius: 12 }),
        text(`section-number-${index}`, str(section.number, String(index + 1)), left, top + 14, 56, 24, style(20, WHITE, { bold: true, align: "center", valign: "middle" })),
        text(`section-title-${index}`, str(section.title, "Section title"), left + 78, top + 13, 320, 28, style(20, TEXT, { bold: true })),
        text(`section-page-${index}`, str(section.pageNumber, String(index + 3).padStart(2, "0")), left + 420, top + 12, 58, 26, style(20, MUTED, { align: "right" })),
        text(`section-dots-${index}`, ".....", left + 414, top + 36, 64, 18, style(12, "D1D5DB", { align: "right" })),
      ];
    }),
  ]);
}

function buildTeam(slide: GeneralSlideLike, data: Record<string, any>): AipptSlideDocument {
  const primary = themePrimary(data);
  const members = arr<Record<string, any>>(data.teamMembers);
  return document(slideId(slide, "team"), [
    ...brand(data),
    ...subtleWaves("team-bottom", "bottom"),
    text("title", str(data.title, "Our Team Members"), 80, 150, 500, 122, style(52, TEXT, { bold: true, lineSpacingMultiple: 1.08 })),
    accentLine("accent-line", 80, 296, 80, primary),
    text("company-description", str(data.companyDescription, "Ginyard International Co. is a leading provider of innovative digital solutions tailored for businesses."), 80, 334, 500, 118, style(18, MUTED, { lineSpacingMultiple: 1.38 })),
    ...members.slice(0, 4).flatMap((member, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const left = 710 + col * 230;
      const top = 132 + row * 260;
      const memberImage = imageValue(member.image, "professional headshot");
      return [
        image(`member-image-${index}`, memberImage.src, left + 46, top, 132, 132, {
          prompt: memberImage.prompt,
          name: `${str(member.name, "Team member")} photo`,
        }),
        text(`member-name-${index}`, str(member.name, "Team Member"), left, top + 152, 224, 26, style(18, TEXT, { bold: true, align: "center" })),
        text(`member-position-${index}`, str(member.position, "Role"), left, top + 182, 224, 22, style(13, MUTED, { italic: true, align: "center" })),
        text(`member-description-${index}`, str(member.description, "Brief description of the team member."), left + 8, top + 212, 208, 48, style(11.5, MUTED, { align: "center", lineSpacingMultiple: 1.2 })),
      ];
    }),
  ]);
}

export function isGeneralLayout(slide: GeneralSlideLike) {
  return slide.layout_group === GROUP && GENERAL_LAYOUTS.has(key(slide));
}

export function getGeneralStoredDocumentCandidate(
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

export function buildGeneralAipptSlideDocument(
  slide: GeneralSlideLike,
): AipptSlideDocument | null {
  if (!isGeneralLayout(slide)) return null;
  const data = slide.content ?? {};
  const layout = key(slide);
  let result: AipptSlideDocument | null = null;

  if (layout === "general-intro-slide") result = buildIntro(slide, data);
  if (layout === "basic-info-slide") result = buildBasicInfo(slide, data);
  if (layout === "bullet-icons-only-slide") result = buildBulletIconsOnly(slide, data);
  if (layout === "bullet-with-icons-slide") result = buildBulletWithIcons(slide, data);
  if (layout === "chart-with-bullets-slide") result = buildChartWithBullets(slide, data);
  if (layout === "metrics-slide") result = buildMetrics(slide, data);
  if (layout === "metrics-with-image-slide") result = buildMetricsWithImage(slide, data);
  if (layout === "numbered-bullets-slide") result = buildNumberedBullets(slide, data);
  if (layout === "quote-slide") result = buildQuote(slide, data);
  if (layout === "table-info-slide") result = buildTableInfo(slide, data);
  if (layout === "table-of-contents-slide") result = buildToc(slide, data);
  if (layout === "team-slide") result = buildTeam(slide, data);

  return result ? withGeneralMeta(result, layout) : null;
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

export function repairGeneralAipptSlideDocument(
  slide: GeneralSlideLike,
  storedDocument: AipptSlideDocument | null,
): AipptSlideDocument | null {
  const rebuiltDocument = buildGeneralAipptSlideDocument(slide);
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
