import type {
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableCell,
  AipptTextStyle,
} from "./types";

const GROUP = "taicang-coal-power-report";
const BLUE = "057DC1";
const SKY = "1385D3";
const DARK_BLUE = "0B3B78";
const DARK = "111827";
const MUTED = "4C5966";
const LIGHT = "F1F6FB";
const ORANGE = "FF6B00";
const LINE = "D6DDE3";
const WHITE = "FFFFFF";
const FONT = "Microsoft YaHei";
const SERIF = "SimSun";

type CoalSlideLike = {
  id?: string | null;
  index?: number;
  layout?: string;
  layout_group?: string;
  content?: Record<string, any> | null;
};

function asset(name: string) {
  return `/template-assets/${GROUP}/${name}`;
}

function key(slide: CoalSlideLike) {
  const layout = slide.layout ?? "";
  return layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
}

function str(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function arr<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function textStyle(
  fontSize: number,
  color = DARK,
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
  style: AipptTextStyle,
): AipptSlideElement {
  return { id, type: "text", text: value, x, y, w, h, style };
}

function rect(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  line = fill,
): AipptSlideElement {
  return {
    id,
    type: "shape",
    shape: "rect",
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: line, width: line === fill ? 0 : 1 },
  };
}

function bulletElements(items: string[], x: number, y: number, w: number, gap: number) {
  return items.slice(0, 8).flatMap((item, index) => [
    text(`bullet-dot-${x}-${index}`, "•", x, y + index * gap, 20, 24, textStyle(16, SKY)),
    text(
      `bullet-text-${x}-${index}`,
      item,
      x + 24,
      y + index * gap,
      w - 24,
      gap,
      textStyle(14.5, DARK, { lineSpacingMultiple: 1.28 }),
    ),
  ]);
}

function contentShell(id: string, title: string, elements: AipptSlideElement[]) {
  return {
    id,
    width: 1280,
    height: 720,
    background: { type: "image" as const, src: asset("content-bg.png") },
    elements: [
      rect("title-mark", 58, 76, 4, 38, SKY),
      text("title", title, 76, 70, 1080, 44, textStyle(28, SKY)),
      ...elements,
    ],
  };
}

function buildCover(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  return {
    id: slide.id ?? `coal-cover-${slide.index ?? 0}`,
    width: 1280,
    height: 720,
    background: { type: "image", src: asset("chapter-bg.png") },
    elements: [
      text(
        "cover-title",
        str(data.title, "新投产煤电项目汇报模板"),
        140,
        240,
        1000,
        48,
        textStyle(31, DARK_BLUE, { bold: true, align: "center", valign: "middle" }),
      ),
      text(
        "cover-org",
        str(data.organization, "××能源开发有限公司"),
        337,
        340,
        600,
        32,
        textStyle(20, DARK_BLUE, { align: "center", valign: "middle" }),
      ),
      text(
        "cover-presenter",
        str(data.presenter, "汇报人/职务：×××"),
        336,
        400,
        600,
        30,
        textStyle(18, DARK_BLUE, { align: "center", valign: "middle" }),
      ),
    ],
  };
}

function buildAgenda(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  const items = arr<{ number?: string; title?: string }>(data.items);
  return contentShell(slide.id ?? `coal-agenda-${slide.index ?? 0}`, str(data.title, "汇报提纲"), [
    ...items.slice(0, 8).map((item, index) => {
      const left = index % 2 === 0 ? 120 : 690;
      const top = 150 + Math.floor(index / 2) * 108;
      return [
        rect(`agenda-card-${index}`, left, top, 470, 72, WHITE, LINE),
        text(`agenda-no-${index}`, str(item.number, String(index + 1).padStart(2, "0")), left + 20, top + 14, 72, 36, textStyle(28, ORANGE, { bold: true })),
        text(`agenda-title-${index}`, str(item.title, "章节标题"), left + 104, top + 20, 320, 30, textStyle(18, DARK)),
      ];
    }).flat(),
  ]);
}

function buildSection(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  return {
    id: slide.id ?? `coal-section-${slide.index ?? 0}`,
    width: 1280,
    height: 720,
    background: { type: "image", src: asset("chapter-bg.png") },
    elements: [
      text("section-number", str(data.number, "01"), 0, 200, 1280, 58, textStyle(42, DARK_BLUE, { bold: true, align: "center", valign: "middle" })),
      text("section-title", str(data.title, "章节标题"), 0, 290, 1280, 44, textStyle(30, DARK_BLUE, { bold: true, align: "center", valign: "middle" })),
      text("section-subtitle", str(data.subtitle, "章节说明"), 0, 360, 1280, 32, textStyle(20, DARK_BLUE, { align: "center", valign: "middle" })),
    ],
  };
}

function buildKpi(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  const metrics = arr<{ value?: string; label?: string }>(data.metrics);
  const timeline = arr<{ date?: string; text?: string }>(data.timeline);
  return contentShell(slide.id ?? `coal-kpi-${slide.index ?? 0}`, str(data.title, "项目建设概况与关键节点总览"), [
    ...metrics.slice(0, 4).map((metric, index) => {
      const x = 58 + index * 292;
      return [
        rect(`metric-card-${index}`, x, 136, 260, 82, WHITE, LINE),
        text(`metric-value-${index}`, str(metric.value, "××"), x + 18, 150, 220, 30, textStyle(24, ORANGE, { bold: true, align: "center" })),
        text(`metric-label-${index}`, str(metric.label, "关键指标"), x + 18, 184, 220, 24, textStyle(13, MUTED, { align: "center" })),
      ];
    }).flat(),
    rect("left-panel", 58, 246, 548, 180, WHITE, LINE),
    rect("right-panel", 670, 246, 548, 180, WHITE, LINE),
    text("left-heading", str(data.leftBlock?.heading, "项目概况"), 82, 266, 220, 28, textStyle(20, SKY, { bold: true })),
    text("left-body", str(data.leftBlock?.body, ""), 82, 304, 486, 104, textStyle(14, DARK, { lineSpacingMultiple: 1.45 })),
    text("right-heading", str(data.rightBlock?.heading, "建设成果"), 694, 266, 220, 28, textStyle(20, SKY, { bold: true })),
    text("right-body", str(data.rightBlock?.body, ""), 694, 304, 486, 104, textStyle(14, DARK, { lineSpacingMultiple: 1.45 })),
    ...timeline.slice(0, 4).map((item, index) => [
      rect(`time-line-${index}`, 120 + index * 280, 488, 210, 2, SKY),
      rect(`time-dot-${index}`, 112 + index * 280, 479, 18, 18, ORANGE),
      text(`time-date-${index}`, str(item.date, "YYYY.MM"), 72 + index * 280, 508, 120, 22, textStyle(15, ORANGE, { bold: true, align: "center" })),
      text(`time-text-${index}`, str(item.text, "关键节点"), 48 + index * 280, 536, 180, 52, textStyle(12.5, MUTED, { align: "center" })),
    ]).flat(),
    text("conclusion", str(data.conclusion, ""), 70, 632, 1110, 44, textStyle(14, MUTED, { lineSpacingMultiple: 1.35 })),
  ]);
}

function buildProgress(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  return contentShell(slide.id ?? `coal-progress-${slide.index ?? 0}`, str(data.title, "建设收尾与整改工作按计划推进"), [
    rect("summary", 58, 136, 1160, 62, LIGHT),
    text("subtitle", str(data.subtitle, ""), 82, 154, 1100, 26, textStyle(16, DARK)),
    rect("left-box", 58, 230, 548, 286, WHITE, LINE),
    rect("right-box", 670, 230, 548, 286, WHITE, LINE),
    rect("left-head-bg", 58, 230, 548, 42, BLUE),
    rect("right-head-bg", 670, 230, 548, 42, BLUE),
    text("left-title", str(data.leftTitle, "已完成事项"), 80, 239, 500, 26, textStyle(17, WHITE, { bold: true })),
    text("right-title", str(data.rightTitle, "正在推进事项"), 692, 239, 500, 26, textStyle(17, WHITE, { bold: true })),
    ...bulletElements(arr<string>(data.leftItems), 86, 300, 470, 46),
    ...bulletElements(arr<string>(data.rightItems), 698, 300, 470, 52),
    text("footer", str(data.footer, ""), 70, 568, 1120, 54, textStyle(15, MUTED, { lineSpacingMultiple: 1.45 })),
  ]);
}

function buildTimeline(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  const cards = arr<Record<string, any>>(data.cards);
  return contentShell(slide.id ?? `coal-timeline-${slide.index ?? 0}`, str(data.title, "专项工程节点明确，招标施工稳步推进"), [
    ...cards.slice(0, 4).map((card, index) => {
      const x = 72 + index * 300;
      return [
        rect(`card-${index}`, x, 158, 250, 360, WHITE, LINE),
        rect(`card-top-${index}`, x, 158, 250, 8, card.statusColor?.replace("#", "") || ORANGE),
        text(`card-title-${index}`, str(card.title, `专项工程${index + 1}`), x + 18, 190, 210, 30, textStyle(20, BLUE, { bold: true })),
        text(`card-status-${index}`, str(card.status, "推进中"), x + 18, 232, 210, 24, textStyle(14, ORANGE, { bold: true })),
        text(`card-plan-${index}`, str(card.plan, ""), x + 18, 276, 210, 64, textStyle(14, DARK, { lineSpacingMultiple: 1.45 })),
        text(`card-desc-${index}`, str(card.desc, ""), x + 18, 366, 210, 96, textStyle(12.5, MUTED, { lineSpacingMultiple: 1.4 })),
      ];
    }).flat(),
  ]);
}

function buildDefect(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  return contentShell(slide.id ?? `coal-defect-${slide.index ?? 0}`, str(data.title, "问题整改进入闭环阶段，重点缺陷按计划清零"), [
    rect("metric-bg", 58, 138, 1160, 90, LIGHT),
    rect("metric-line", 58, 138, 4, 90, ORANGE),
    text("metric-value", str(data.metricValue, "若干"), 82, 162, 120, 48, textStyle(44, ORANGE)),
    text("metric-text", str(data.metricText, "项重点问题待整改闭环"), 214, 176, 420, 28, textStyle(20, DARK)),
    text("metric-note", `${str(data.metricNote1, "")}\n${str(data.metricNote2, "")}`, 804, 158, 360, 56, textStyle(15, MUTED, { align: "right", lineSpacingMultiple: 1.6 })),
    rect("measure-box", 58, 250, 1160, 200, WHITE, LINE),
    text("section-title", str(data.sectionTitle, "整改推进措施"), 78, 266, 240, 28, textStyle(20, SKY, { bold: true })),
    ...bulletElements(arr<string>(data.bullets), 84, 310, 1040, 36),
    rect("target", 58, 476, 1160, 44, BLUE),
    text("target-text", str(data.target, "目标：按计划完成重点问题整改"), 78, 484, 1120, 28, textStyle(22, WHITE, { bold: true, align: "center" })),
    text("footer", str(data.footer, ""), 58, 580, 1120, 54, textStyle(16, MUTED, { lineSpacingMultiple: 1.6 })),
  ]);
}

function buildPerformance(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  const columns = arr<string>(data.columns);
  const rows = arr<string[]>(data.rows);
  const tableRows: AipptTableCell[][] = [
    (columns.length ? columns : ["序号", "指标名称", "设计值", "单位", "机组A/系统A", "机组B/系统B"]).map((item) => ({
      text: item,
      fill: BLUE,
      color: WHITE,
      bold: true,
    })),
    ...rows.slice(0, 8).map((row) => row.map((item) => ({ text: str(item, "-") }))),
  ];
  return contentShell(slide.id ?? `coal-performance-${slide.index ?? 0}`, str(data.title, "运行性能指标对标设计值开展验证分析"), [
    {
      id: "performance-table",
      type: "table",
      x: 68,
      y: 150,
      w: 1144,
      h: 360,
      columns: [90, 260, 180, 140, 236, 238],
      rows: tableRows,
      style: { fontFace: FONT, fontSize: 12.5, color: DARK, borderColor: LINE, margin: [4, 6, 4, 6] },
    },
    rect("conclusion-bg", 68, 548, 1144, 62, LIGHT, LINE),
    text("conclusion", str(data.conclusion, "结论：主要性能指标整体满足设计和运行目标要求。"), 92, 566, 1090, 28, textStyle(16, MUTED, { align: "center" })),
  ]);
}

function buildCardGrid(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  const cards = arr<Record<string, any>>(data.cards);
  return contentShell(slide.id ?? `coal-card-grid-${slide.index ?? 0}`, str(data.title, "多维优化措施协同发力，持续提升运行经济性"), [
    ...cards.slice(0, 6).map((card, index) => {
      const x = 70 + (index % 3) * 390;
      const y = 150 + Math.floor(index / 3) * 210;
      return [
        rect(`opt-card-${index}`, x, y, 340, 170, WHITE, LINE),
        text(`opt-number-${index}`, str(card.number, String(index + 1).padStart(2, "0")), x + 18, y + 18, 54, 30, textStyle(22, ORANGE, { bold: true })),
        text(`opt-title-${index}`, str(card.title, "优化措施"), x + 82, y + 20, 220, 26, textStyle(18, BLUE, { bold: true })),
        ...bulletElements(arr<string>(card.lines), x + 24, y + 62, 290, 30),
      ];
    }).flat(),
  ]);
}

function buildSettlement(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  const items = arr<Record<string, any>>(data.items ?? data.cards);
  return contentShell(slide.id ?? `coal-settlement-${slide.index ?? 0}`, str(data.title, "投资结算与经营指标持续跟踪"), [
    rect("summary-bg", 58, 138, 1160, 78, LIGHT),
    text("summary", str(data.summary ?? data.description, "围绕投资控制、结算推进、经营贡献和风险防控开展闭环管理。"), 82, 158, 1080, 34, textStyle(17, DARK, { align: "center" })),
    ...items.slice(0, 4).map((item, index) => {
      const x = 80 + index * 292;
      return [
        rect(`settle-card-${index}`, x, 260, 240, 190, WHITE, LINE),
        text(`settle-value-${index}`, str(item.value ?? item.number, "××"), x + 18, 292, 204, 38, textStyle(26, ORANGE, { bold: true, align: "center" })),
        text(`settle-title-${index}`, str(item.title ?? item.label, "指标名称"), x + 18, 342, 204, 28, textStyle(17, BLUE, { bold: true, align: "center" })),
        text(`settle-desc-${index}`, str(item.desc ?? item.description, ""), x + 20, 386, 200, 48, textStyle(12.5, MUTED, { align: "center" })),
      ];
    }).flat(),
    text("footer", str(data.footer, ""), 78, 548, 1120, 50, textStyle(15, MUTED, { align: "center" })),
  ]);
}

function buildClosing(slide: CoalSlideLike, data: Record<string, any>): AipptSlideDocument {
  return {
    id: slide.id ?? `coal-closing-${slide.index ?? 0}`,
    width: 1280,
    height: 720,
    background: { type: "image", src: asset("content-bg.png") },
    elements: [
      text("closing-title", str(data.title, "后续重点工作安排"), 66, 72, 1100, 38, textStyle(26, DARK_BLUE, { bold: true })),
      text("closing-body", str(data.body, ""), 66, 138, 1140, 210, textStyle(15, "24313D", { lineSpacingMultiple: 1.6 })),
      {
        id: "closing-placeholder-box",
        type: "shape",
        shape: "roundRect",
        x: 318,
        y: 500,
        w: 640,
        h: 138,
        fill: { color: WHITE, transparency: 30 },
        line: { color: "B9D7EE", width: 2, dash: "dash" },
        radius: 8,
      },
      text("closing-placeholder", str(data.placeholder, "可替换为总结语、二维码或联系信息"), 360, 556, 560, 26, textStyle(18, "7A8A98", { align: "center", valign: "middle" })),
    ],
  };
}

export function isCoalPowerLayout(slide: CoalSlideLike) {
  return slide.layout_group === GROUP || key(slide).startsWith("coal-power-");
}

export function buildCoalPowerAipptSlideDocument(
  slide: CoalSlideLike,
): AipptSlideDocument | null {
  if (!isCoalPowerLayout(slide)) return null;
  const data = slide.content ?? {};
  const layout = key(slide);
  if (layout === "coal-power-cover-slide") return buildCover(slide, data);
  if (layout === "coal-power-agenda-slide") return buildAgenda(slide, data);
  if (layout === "coal-power-section-divider-slide") return buildSection(slide, data);
  if (layout === "coal-power-kpi-snapshot-slide") return buildKpi(slide, data);
  if (layout === "coal-power-two-column-progress-slide") return buildProgress(slide, data);
  if (layout === "coal-power-timeline-slide") return buildTimeline(slide, data);
  if (layout === "coal-power-performance-comparison-slide") return buildPerformance(slide, data);
  if (layout === "coal-power-card-grid-slide") return buildCardGrid(slide, data);
  if (layout === "coal-power-settlement-dashboard-slide") return buildSettlement(slide, data);
  if (layout === "coal-power-closing-slide") return buildClosing(slide, data);
  return null;
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
    if (element.type === "group") {
      const storedElement = storedElements.get(element.id);
      return {
        ...element,
        ...(storedElement?.type === "group" ? storedElement : {}),
        elements: applyStoredElementOverrides(element.elements, storedElements),
      };
    }
    return storedElements.get(element.id) ?? element;
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
    if (element.type === "group") {
      collectUserAddedElements(element.elements, rebuiltElementIds, result);
    }
  }
  return result;
}

export function repairCoalPowerAipptSlideDocument(
  slide: CoalSlideLike,
  storedDocument: AipptSlideDocument | null,
): AipptSlideDocument | null {
  const rebuiltDocument = buildCoalPowerAipptSlideDocument(slide);
  if (!rebuiltDocument) return storedDocument;
  if (!storedDocument) return rebuiltDocument;

  const layout = key(slide);
  const shouldRepair =
    layout === "coal-power-cover-slide" ||
    layout === "coal-power-section-divider-slide" ||
    layout === "coal-power-closing-slide";

  if (!shouldRepair) return storedDocument;

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
