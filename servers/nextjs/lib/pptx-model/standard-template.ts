import type {
  AipptChartElement,
  AipptNativeMeta,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTextStyle,
} from "./types";

const GROUP = "standard";
const WHITE = "FFFFFF";
const BG = "FFFFFF";
const TEXT = "111827";
const MUTED = "6B7280";
const STROKE = "E5E7EB";
const CARD = "F8FAFC";
const CARD_ALT = "F3F4F6";
const GREEN = "1B8C2D";
const GREEN_DARK = "166534";
const FONT = "Playfair Display";
const DEFAULT_ICON = "/static/icons/bold/checks-bold.svg";
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZyI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTIwIDI1MGg0MDBsLTExMi0xMjAtODggOTgtNjQtNzQtMTM2IDk2eiIgZmlsbD0iI0QxRDVERUIiLz48Y2lyY2xlIGN4PSI0OTAiIGN5PSI5NCIgcj0iNDQiIGZpbGw9IiMxQjhDMkQiIG9wYWNpdHk9Ii4yNSIvPjx0ZXh0IHg9IjMyMCIgeT0iMzE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiPkVkaXRhYmxlIGltYWdlPC90ZXh0Pjwvc3ZnPg==";

const STANDARD_LAYOUT_ALIASES: Record<string, string> = {
  "header-counter-two-column-image-text-slide": "intro",
  IntroSlideLayout: "intro",
  "chart-left-text-right-layout": "chart-left",
  ChartLeftTextRightLayout: "chart-left",
  "header-left-media-contact-info-slide": "contact",
  ContactLayout: "contact",
  "split-left-strip-header-title-subtitle-cards-slide": "heading-bullet-image",
  HeadingBulletImageDescriptionLayout: "heading-bullet-image",
  "header-bullets-title-description-image-slide": "icon-bullet",
  IconBulletDescriptionLayout: "icon-bullet",
  "header-title-card-slide": "icon-image",
  IconImageDescriptionLayout: "icon-image",
  "header-smallbar-title-team-cards-slide": "image-list",
  ImageListWithDescriptionLayout: "image-list",
  "header-tagline-cards-grid-slide": "metrics-description",
  MetricsDescriptionLayout: "metrics-description",
  "header-bullets-image-split-slide": "numbered-image",
  NumberedBulletSingleImageLayout: "numbered-image",
  "table-of-contents-layout": "toc",
  TableOfContentsLayout: "toc",
  "visual-metrics": "visual-metrics",
  VisualMetricsSlideLayout: "visual-metrics",
};

type StandardSlideLike = {
  id?: string | null;
  index?: number;
  layout?: string | null;
  layout_group?: string | null;
  content?: Record<string, any> | null;
};

function rawLayout(slide: StandardSlideLike) {
  const layout = slide.layout ?? "";
  return layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
}

function key(slide: StandardSlideLike) {
  const raw = rawLayout(slide);
  return STANDARD_LAYOUT_ALIASES[raw] ?? raw;
}

function standardMeta(layout: string): AipptNativeMeta {
  return {
    version: 1,
    fidelity: "A",
    sourceRenderer: "standard-template-builder",
    conversionStatus: "complete",
    sourceTemplate: GROUP,
    sourceLayout: layout,
  };
}

function withStandardMeta(
  document: AipptSlideDocument,
  layout: string,
): AipptSlideDocument {
  return {
    ...document,
    meta: standardMeta(layout),
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
  return cleanColor(data.__primaryColor__ ?? data.primaryColor, GREEN);
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
): AipptSlideElement {
  return {
    ...rect(id, x, y, w, h, fill, line),
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

function slideId(slide: StandardSlideLike, name: string) {
  return slide.id ?? `standard-${name}-${slide.index ?? 0}`;
}

function brand(data: Record<string, any>): AipptSlideElement[] {
  const logo = str(data._logo_url__, "");
  const company = str(data.__companyName__, "");
  const elements: AipptSlideElement[] = [];
  if (logo) {
    elements.push(image("brand-logo", logo, 40, 24, 24, 24, { fit: "contain", locked: true }));
  }
  if (company) {
    elements.push(text("brand-company", company, logo ? 72 : 40, 23, 250, 24, style(18, TEXT, { bold: true })));
  }
  if (logo || company) {
    elements.push(line("brand-rule", company ? 340 : 88, 38, company ? 560 : 310, 38, TEXT, 2));
  }
  return elements.map(locked);
}

function pageMarker(id: string, value: unknown, x = 1162, y = 26) {
  return text(id, str(value, ""), x, y, 42, 24, style(18, GREEN, { bold: true, align: "right" }));
}

function splitTitle(value: string, breakAfter?: unknown) {
  if (value.includes("\n")) return value;
  const index = Math.max(1, Math.min(value.length - 1, num(breakAfter, 0)));
  return index > 0 ? `${value.slice(0, index)}\n${value.slice(index).trim()}` : value;
}

function cards(data: Record<string, any>) {
  return (
    arr<Record<string, any>>(data.cards).length
      ? arr<Record<string, any>>(data.cards)
      : arr<Record<string, any>>(data.bulletPoints).length
        ? arr<Record<string, any>>(data.bulletPoints)
        : arr<Record<string, any>>(data.items).length
          ? arr<Record<string, any>>(data.items)
          : arr<Record<string, any>>(data.metrics)
  );
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
    series: [{ name: "Value", values, color: GREEN }],
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
  source: unknown,
  x: number,
  y: number,
  color = GREEN,
): AipptSlideElement[] {
  const icon = iconValue(source);
  return [
    ellipse(`${prefix}-icon-bg`, x, y, 64, 64, color, color),
    image(`${prefix}-icon`, icon.src, x + 16, y + 16, 32, 32, {
      fit: "contain",
      prompt: icon.prompt,
      name: "Icon",
    }),
  ];
}

function buildIntro(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const mainImage = imageValue(data.media?.image ?? data.image, "business cover image");
  const introCard = data.introCard && typeof data.introCard === "object" ? data.introCard : {};
  const showIntro = introCard.enabled !== false;

  return document(slideId(slide, "intro"), [
    ...brand(data),
    image("media-image", mainImage.src, 0, 64, 640, 656, {
      prompt: mainImage.prompt,
      name: "Media image",
    }),
    rect("right-panel", 640, 64, 640, 656, WHITE, WHITE, { locked: true }),
    text("title", splitTitle(str(data.title, "Introduction Our Pitchdeck"), data.titleBreakAfter), 708, 132, 470, 150, style(58, TEXT, { bold: true, lineSpacingMultiple: 1.04 })),
    text("paragraph", str(data.paragraph ?? data.description, "Concise supporting paragraph for the introduction."), 708, 326, 450, 112, style(17, MUTED, { lineSpacingMultiple: 1.52 })),
    ...(showIntro
      ? [
          rect("intro-card", 708, 486, 410, 92, WHITE, STROKE, { radius: 8 }),
          ellipse("intro-avatar", 732, 506, 54, 54, primary(data), primary(data)),
          text("intro-initials", str(introCard.initials, "JD"), 732, 522, 54, 18, style(16, WHITE, { bold: true, align: "center", valign: "middle" })),
          text("intro-name", str(introCard.name, "Pitch Deck Team"), 806, 506, 260, 26, style(21, TEXT, { bold: true })),
          text("intro-date", str(introCard.date, "December 22, 2025"), 806, 536, 260, 20, style(15, primary(data))),
        ]
      : []),
  ]);
}

function buildChartLeft(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  return document(slideId(slide, "chart-left"), [
    ...brand(data),
    rect("chart-card", 80, 150, 500, 420, WHITE, STROKE, { radius: 8 }),
    chartElement("chart", data.chart, 112, 198, 436, 318),
    text("title", str(data.title, "Insights At A Glance"), 700, 178, 480, 150, style(58, TEXT, { bold: true, lineSpacingMultiple: 1.06 })),
    text("paragraph", str(data.paragraph ?? data.description, "Supporting description for the chart."), 700, 372, 430, 138, style(17, MUTED, { lineSpacingMultiple: 1.55 })),
  ]);
}

function buildContact(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const sections = arr<Record<string, any>>(data.sections);
  const resolved = sections.length
    ? sections
    : [
        { label: "Email", value: data.contact?.email ?? "hello@example.com" },
        { label: "Website", value: data.contact?.website ?? "example.com" },
        { label: "Phone", value: data.contact?.phone ?? "+1 555 0100" },
      ];
  const panelImage = imageValue(data.image ?? data.media?.image, "contact page image");

  return document(slideId(slide, "contact"), [
    ...brand(data),
    pageMarker("page-number", data.topBar?.pageNumber ?? data.pageNumber, 1162),
    image("contact-image", panelImage.src, 64, 150, 420, 420, {
      prompt: panelImage.prompt,
      name: "Contact image",
    }),
    text("title", str(data.title, "Let's Get in\nTouch with Us"), 600, 138, 480, 118, style(52, TEXT, { bold: true, lineSpacingMultiple: 1.06 })),
    ...resolved.slice(0, 4).flatMap((section, index) => {
      const top = 304 + index * 76;
      return [
        line(`section-rule-${index}`, 600, top - 12, 1080, top - 12, STROKE, 1),
        text(`section-label-${index}`, str(section.label, `Item ${index + 1}`), 600, top, 160, 24, style(17, GREEN_DARK, { bold: true })),
        text(`section-value-${index}`, str(section.value, "Value"), 790, top, 330, 34, style(18, TEXT)),
      ];
    }),
    rect("bottom-bar", 0, 664, 1280, 56, primary(data), primary(data), { locked: true }),
  ]);
}

function buildHeadingBulletImage(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const mainImage = imageValue(data.image, "strategy image");
  const resolvedCards = cards(data);
  return document(slideId(slide, "heading-bullet-image"), [
    ...brand(data),
    rect("left-strip", 0, 0, 32, 720, primary(data), primary(data), { locked: true }),
    pageMarker("page-number", data.pageNumber),
    text("heading", str(data.heading ?? data.title, "A Blueprint for\nSuccess"), 80, 116, 500, 116, style(54, TEXT, { bold: true, lineSpacingMultiple: 1.04 })),
    text("description", str(data.description ?? data.paragraph, "Supporting paragraph under the heading."), 80, 260, 430, 90, style(16, MUTED, { lineSpacingMultiple: 1.48 })),
    image("supporting-image", mainImage.src, 870, 128, 300, 220, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    ...resolvedCards.slice(0, 4).flatMap((card, index) => {
      const left = 80 + (index % 2) * 560;
      const top = 418 + Math.floor(index / 2) * 118;
      return [
        rect(`card-${index}`, left, top, 500, 86, WHITE, STROKE, { radius: 8 }),
        rect(`card-ribbon-${index}`, left, top, 118, 28, primary(data), primary(data), { radius: 4 }),
        text(`card-title-${index}`, str(card.title, `Strategy ${index + 1}`), left + 14, top + 7, 92, 12, style(11, WHITE, { bold: true, align: "center", valign: "middle" })),
        text(`card-body-${index}`, str(card.body ?? card.description, "Editable card body."), left + 144, top + 18, 320, 40, style(14, MUTED, { lineSpacingMultiple: 1.32 })),
      ];
    }),
  ]);
}

function buildIconBullet(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const resolvedCards = cards(data);
  return document(slideId(slide, "icon-bullet"), [
    ...brand(data),
    text("right-title", str(data.rightTitle ?? data.title, "Disrupting the\nIndustry"), 710, 126, 450, 128, style(58, TEXT, { bold: true, lineSpacingMultiple: 1.04 })),
    rect("description-card", 710, 286, 420, 118, CARD_ALT, CARD_ALT, { radius: 8 }),
    text("right-description", str(data.rightDescription ?? data.description, "Supporting paragraph under the large heading."), 736, 314, 360, 58, style(16, MUTED, { lineSpacingMultiple: 1.45 })),
    rect("cards-panel", 80, 106, 560, 510, WHITE, STROKE, { radius: 10 }),
    ...resolvedCards.slice(0, 4).flatMap((card, index) => {
      const top = 138 + index * 112;
      return [
        ...iconBubble(`card-${index}`, card.symbolIcon ?? card.icon, 118, top, primary(data)),
        text(`card-title-${index}`, str(card.title, "Visionary Leadership"), 206, top + 4, 350, 28, style(22, TEXT, { bold: true })),
        text(`card-description-${index}`, str(card.description, "Editable card description."), 206, top + 40, 350, 44, style(14, MUTED, { lineSpacingMultiple: 1.35 })),
      ];
    }),
  ]);
}

function buildIconImage(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const card = data.card && typeof data.card === "object" ? data.card : {};
  const background = imageValue(data.backgroundImage ?? data.image, "wide background image");
  const cardImage = imageValue(card.image ?? data.image, "supporting image");
  return document(slideId(slide, "icon-image"), [
    ...brand(data),
    pageMarker("page-number", data.topBar?.pageNumber),
    text("title", str(data.title, "Transforming Ideas into\nReality"), 80, 92, 780, 114, style(54, TEXT, { bold: true, lineSpacingMultiple: 1.05 })),
    image("background-image", background.src, 0, 260, 1280, 270, {
      prompt: background.prompt,
      name: "Background image",
      opacity: 0.55,
    }),
    rect("content-card", 220, 236, 840, 340, WHITE, STROKE, { radius: 12 }),
    image("card-image", cardImage.src, 246, 266, 320, 250, {
      prompt: cardImage.prompt,
      name: "Supporting image",
    }),
    text("card-heading", str(card.heading ?? data.heading ?? data.title, "Idea Generation and Validation"), 610, 292, 370, 64, style(28, TEXT, { bold: true })),
    text("card-body", str(card.body ?? data.description ?? data.paragraph, "Editable supporting body paragraph."), 610, 382, 360, 100, style(16, MUTED, { lineSpacingMultiple: 1.45 })),
  ]);
}

function buildImageList(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const resolvedCards = cards(data);
  const count = Math.max(1, Math.min(4, resolvedCards.length || 1));
  const cardW = 250;
  const gap = 40;
  const startX = (1280 - count * cardW - (count - 1) * gap) / 2;
  return document(slideId(slide, "image-list"), [
    ...brand(data),
    text("title", str(data.title, "Our Professional Team"), 0, 96, 1280, 58, style(46, TEXT, { bold: true, align: "center" })),
    ...resolvedCards.slice(0, 4).flatMap((card, index) => {
      const left = startX + index * (cardW + gap);
      const top = 218;
      const memberImage = imageValue(card.image, str(card.name ?? card.title, "member image"));
      return [
        rect(`member-card-${index}`, left, top, cardW, 348, WHITE, STROKE, { radius: 10 }),
        image(`member-image-${index}`, memberImage.src, left + 20, top + 20, cardW - 40, 170, {
          prompt: memberImage.prompt,
          name: str(card.name ?? card.title, "Member image"),
        }),
        text(`member-name-${index}`, str(card.name ?? card.title, "Team Member"), left + 18, top + 214, cardW - 36, 28, style(22, TEXT, { bold: true, align: "center" })),
        text(`member-description-${index}`, str(card.role ?? card.description, "Member description."), left + 18, top + 254, cardW - 36, 56, style(14, MUTED, { align: "center", lineSpacingMultiple: 1.35 })),
      ];
    }),
  ]);
}

function buildMetricsDescription(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const resolvedCards = cards(data);
  return document(slideId(slide, "metrics-description"), [
    ...brand(data),
    text("title", str(data.title, "Scaling New Heights Together"), 80, 86, 780, 76, style(50, TEXT, { bold: true })),
    text("tagline", str(data.tagline ?? data.description, "A concise summary of the key metrics."), 80, 170, 760, 44, style(17, MUTED)),
    ...resolvedCards.slice(0, 6).flatMap((card, index) => {
      const left = 92 + (index % 3) * 376;
      const top = 274 + Math.floor(index / 3) * 152;
      return [
        rect(`metric-card-${index}`, left, top, 326, 112, WHITE, STROKE, { radius: 10 }),
        text(`metric-number-${index}`, str(card.number ?? card.value, String(index + 1)), left + 22, top + 18, 82, 42, style(36, primary(data), { bold: true })),
        text(`metric-subtitle-${index}`, str(card.subtitle ?? card.label ?? card.title, "Metric"), left + 118, top + 20, 170, 24, style(20, TEXT, { bold: true })),
        text(`metric-body-${index}`, str(card.body ?? card.description, "Metric description."), left + 118, top + 54, 170, 34, style(13, MUTED, { lineSpacingMultiple: 1.3 })),
      ];
    }),
  ]);
}

function buildNumberedImage(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const bullets = arr<Record<string, any>>(data.bullets).length ? arr<Record<string, any>>(data.bullets) : cards(data);
  const mainImage = imageValue(data.image, "journey image");
  const right = data.right && typeof data.right === "object" ? data.right : {};
  return document(slideId(slide, "numbered-image"), [
    ...brand(data),
    ...bullets.slice(0, 4).flatMap((bullet, index) => {
      const top = 138 + index * 112;
      return [
        text(`bullet-number-${index}`, str(bullet.number, String(index + 1).padStart(2, "0")), 74, top, 58, 34, style(28, primary(data), { bold: true })),
        text(`bullet-title-${index}`, str(bullet.title, "Strategic Execution"), 154, top + 2, 320, 26, style(21, TEXT, { bold: true })),
        text(`bullet-body-${index}`, str(bullet.body ?? bullet.description, "Editable bullet body."), 154, top + 38, 340, 44, style(14, MUTED, { lineSpacingMultiple: 1.32 })),
      ];
    }),
    image("main-image", mainImage.src, 530, 168, 280, 350, {
      prompt: mainImage.prompt,
      name: "Supporting image",
    }),
    text("right-heading", str(right.heading ?? data.heading ?? data.title, "Our Journey"), 880, 188, 300, 46, style(34, TEXT, { bold: true })),
    text("right-paragraph", str(right.paragraph ?? data.paragraph ?? data.description, "Editable paragraph describing the journey."), 880, 260, 300, 170, style(16, MUTED, { lineSpacingMultiple: 1.5 })),
  ]);
}

function buildToc(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const resolvedItems = arr<Record<string, any>>(data.items);
  const items = resolvedItems.length
    ? resolvedItems
    : [{ title: "Introduction" }, { title: "Problem Statement" }, { title: "Solution" }];
  return document(slideId(slide, "toc"), [
    ...brand(data),
    text("title", str(data.title, "Table Of Contents"), 80, 82, 560, 62, style(50, TEXT, { bold: true })),
    text("description", str(data.description, "A quick overview of the presentation sections."), 80, 156, 840, 48, style(16, MUTED, { lineSpacingMultiple: 1.42 })),
    ...items.slice(0, 10).flatMap((item, index) => {
      const left = index < 5 ? 100 : 690;
      const top = 256 + (index % 5) * 72;
      return [
        ellipse(`item-marker-${index}`, left, top, 42, 42, primary(data), primary(data)),
        text(`item-number-${index}`, String(index + 1), left, top + 12, 42, 16, style(15, WHITE, { bold: true, align: "center", valign: "middle" })),
        text(`item-title-${index}`, str(item.title, `Section ${index + 1}`), left + 64, top + 9, 360, 24, style(20, TEXT, { bold: true })),
      ];
    }),
  ]);
}

function buildVisualMetrics(slide: StandardSlideLike, data: Record<string, any>): AipptSlideDocument {
  const resolvedCards = cards(data);
  return document(slideId(slide, "visual-metrics"), [
    ...brand(data),
    text("title", str(data.title, "Our Vision And Strategy For Excellence"), 64, 92, 1080, 70, style(48, TEXT, { bold: true })),
    text("description", str(data.description, "Lead paragraph for the metrics slide."), 64, 178, 980, 64, style(16, MUTED, { lineSpacingMultiple: 1.42 })),
    ...resolvedCards.slice(0, 4).flatMap((card, index) => {
      const left = 64 + index * 304;
      const top = 318;
      const value = str(card.value, "67");
      const unit = str(card.unit, "%");
      return [
        rect(`metric-card-${index}`, left, top, 260, 270, WHITE, STROKE, { radius: 12 }),
        text(`metric-title-${index}`, str(card.title ?? card.label, "Research"), left + 28, top + 30, 204, 28, style(22, TEXT, { bold: true, align: "center" })),
        ellipse(`metric-ring-bg-${index}`, left + 62, top + 78, 136, 136, "F1F5F9", STROKE),
        ellipse(`metric-ring-${index}`, left + 78, top + 94, 104, 104, WHITE, primary(data)),
        text(`metric-value-${index}`, `${value}${unit}`, left + 68, top + 132, 124, 26, style(26, TEXT, { bold: true, align: "center", valign: "middle" })),
        text(`metric-description-${index}`, str(card.description, "Metric description."), left + 28, top + 224, 204, 28, style(13, MUTED, { align: "center" })),
      ];
    }),
  ]);
}

export function isStandardLayout(slide: StandardSlideLike) {
  return slide.layout_group === GROUP && Boolean(STANDARD_LAYOUT_ALIASES[rawLayout(slide)]);
}

export function getStandardStoredDocumentCandidate(
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

export function buildStandardAipptSlideDocument(
  slide: StandardSlideLike,
): AipptSlideDocument | null {
  if (!isStandardLayout(slide)) return null;
  const data = slide.content ?? {};
  const layout = key(slide);
  let result: AipptSlideDocument | null = null;

  if (layout === "intro") result = buildIntro(slide, data);
  if (layout === "chart-left") result = buildChartLeft(slide, data);
  if (layout === "contact") result = buildContact(slide, data);
  if (layout === "heading-bullet-image") result = buildHeadingBulletImage(slide, data);
  if (layout === "icon-bullet") result = buildIconBullet(slide, data);
  if (layout === "icon-image") result = buildIconImage(slide, data);
  if (layout === "image-list") result = buildImageList(slide, data);
  if (layout === "metrics-description") result = buildMetricsDescription(slide, data);
  if (layout === "numbered-image") result = buildNumberedImage(slide, data);
  if (layout === "toc") result = buildToc(slide, data);
  if (layout === "visual-metrics") result = buildVisualMetrics(slide, data);

  return result ? withStandardMeta(result, rawLayout(slide)) : null;
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

export function repairStandardAipptSlideDocument(
  slide: StandardSlideLike,
  storedDocument: AipptSlideDocument | null,
): AipptSlideDocument | null {
  const rebuiltDocument = buildStandardAipptSlideDocument(slide);
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
