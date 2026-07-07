import fs from "node:fs/promises";
import path from "node:path";

import pptxgen from "pptxgenjs";

import type { NativeExportParams, NativePresentation, NativeSlide } from "./types";

const GROUP = "taicang-coal-power-report";
const SLIDE_W = 13.333333;
const SLIDE_H = 7.5;
const PX = SLIDE_W / 1280;
const FONT = "Microsoft YaHei";
const SERIF_FONT = "SimSun";
const BLUE = "057DC1";
const DARK_BLUE = "0B3B78";
const SKY = "1385D3";
const ORANGE = "FF6B00";
const TEXT = "111827";
const MUTED = "4C5966";
const LIGHT_BG = "F1F6FB";
const LINE = "D6DDE3";
const WHITE = "FFFFFF";

type Pptx = pptxgen;
type PptxSlide = ReturnType<pptxgen["addSlide"]>;

function i(px: number) {
  return Number((px * PX).toFixed(4));
}

function layoutKey(slide: NativeSlide) {
  const layout = slide.layout ?? "";
  return layout.includes(":") ? layout.split(":").pop() ?? layout : layout;
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string" && value.trim()) {
    return value
      .replace(/\*\*/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+\n/g, "\n")
      .trim();
  }
  if (typeof value === "number") return String(value);
  return fallback;
}

function array<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function resolveAsset(repoRoot: string, name: string) {
  return path.join(
    repoRoot,
    "public",
    "template-assets",
    GROUP,
    name,
  );
}

function addBackground(slide: PptxSlide, repoRoot: string, kind: "chapter" | "content") {
  slide.background = { color: WHITE };
  slide.addImage({
    path: resolveAsset(repoRoot, kind === "chapter" ? "chapter-bg.png" : "content-bg.png"),
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
  });
}

function addText(
  slide: PptxSlide,
  value: string,
  box: { x: number; y: number; w: number; h: number },
  opts: {
    size: number;
    color?: string;
    bold?: boolean;
    fontFace?: string;
    align?: "left" | "center" | "right";
    valign?: "top" | "middle" | "bottom";
    margin?: number | [number, number, number, number];
    breakLine?: boolean;
    fit?: "shrink" | "resize";
  },
) {
  slide.addText(value, {
    x: i(box.x),
    y: i(box.y),
    w: i(box.w),
    h: i(box.h),
    fontFace: opts.fontFace ?? FONT,
    fontSize: opts.size,
    color: opts.color ?? TEXT,
    bold: opts.bold ?? false,
    align: opts.align ?? "left",
    valign: opts.valign ?? "top",
    margin: opts.margin ?? 0.03,
    breakLine: opts.breakLine ?? false,
    fit: opts.fit ?? "shrink",
    paraSpaceAfter: 0,
  });
}

function addRect(
  pres: Pptx,
  slide: PptxSlide,
  box: { x: number; y: number; w: number; h: number },
  fill: string,
  options?: { line?: string; transparency?: number; radius?: boolean },
) {
  slide.addShape(options?.radius ? pres.ShapeType.roundRect : pres.ShapeType.rect, {
    x: i(box.x),
    y: i(box.y),
    w: i(box.w),
    h: i(box.h),
    fill: { color: fill, transparency: options?.transparency ?? 0 },
    line: { color: options?.line ?? fill, transparency: options?.line ? 0 : 100, width: 0.5 },
  });
}

function addLine(
  pres: Pptx,
  slide: PptxSlide,
  from: { x: number; y: number },
  to: { x: number; y: number },
  color = LINE,
  width = 1,
) {
  slide.addShape(pres.ShapeType.line, {
    x: i(from.x),
    y: i(from.y),
    w: i(to.x - from.x),
    h: i(to.y - from.y),
    line: { color, width },
  });
}

function addContentTitle(pres: Pptx, slide: PptxSlide, title: string) {
  addRect(pres, slide, { x: 58, y: 76, w: 4, h: 38 }, SKY);
  addText(slide, title, { x: 76, y: 68, w: 1080, h: 46 }, {
    size: 20,
    color: SKY,
    fontFace: SERIF_FONT,
    margin: 0,
  });
}

function addPageNumber(slide: PptxSlide, slideNo: number, dark = false) {
  addText(slide, String(slideNo).padStart(2, "0"), { x: 1185, y: 676, w: 52, h: 22 }, {
    size: 8,
    color: dark ? "D8E8F8" : "8A98A6",
    align: "right",
    margin: 0,
  });
}

function addBulletList(
  pres: Pptx,
  slide: PptxSlide,
  items: string[],
  box: { x: number; y: number; w: number; h: number },
  opts?: { size?: number; color?: string; bulletColor?: string; gap?: number },
) {
  const size = opts?.size ?? 11;
  const gap = opts?.gap ?? 34;
  items.slice(0, Math.floor(box.h / gap)).forEach((item, idx) => {
    const y = box.y + idx * gap;
    addRect(pres, slide, { x: box.x, y: y + 7, w: 7, h: 7 }, opts?.bulletColor ?? ORANGE, {
      radius: true,
    });
    addText(slide, item, { x: box.x + 18, y, w: box.w - 18, h: gap + 4 }, {
      size,
      color: opts?.color ?? TEXT,
      margin: 0,
    });
  });
}

function addMetric(slide: PptxSlide, value: string, label: string, x: number, y: number, w = 260) {
  addText(slide, value, { x, y, w, h: 32 }, {
    size: 21,
    color: ORANGE,
    align: "center",
    margin: 0,
    fontFace: SERIF_FONT,
  });
  addText(slide, label, { x, y: y + 42, w, h: 34 }, {
    size: 9.5,
    color: "24313D",
    align: "center",
    margin: 0,
  });
}

function renderCover(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "chapter");
  const data = source.content ?? {};
  addText(slide, text(data.title, "新投产煤电项目汇报材料"), { x: 360, y: 272, w: 560, h: 46 }, {
    size: 22,
    color: SKY,
    bold: true,
    fontFace: SERIF_FONT,
    align: "center",
    margin: 0,
  });
  addText(slide, text(data.organization, "中央企业能源开发有限公司"), { x: 430, y: 334, w: 420, h: 22 }, {
    size: 8.5,
    color: DARK_BLUE,
    bold: true,
    align: "center",
    margin: 0,
  });
  addText(slide, text(data.presenter, "汇报单位：职务：汇报时间"), { x: 430, y: 360, w: 420, h: 20 }, {
    size: 7.5,
    color: TEXT,
    align: "center",
    margin: 0,
  });
  addText(slide, text(data.date, ""), { x: 430, y: 386, w: 420, h: 18 }, {
    size: 7,
    color: MUTED,
    align: "center",
    margin: 0,
  });
}

function renderAgenda(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addText(slide, text(data.title, "汇报提纲"), { x: 92, y: 146, w: 210, h: 24 }, {
    size: 13,
    color: SKY,
    bold: true,
    margin: 0,
    fontFace: SERIF_FONT,
  });
  const items = array<{ number?: string; title?: string }>(data.items);
  const defaults = ["项目概况", "建设进展", "专项工程", "问题整改", "运行指标", "优化提升", "智慧电厂", "重点安排"];
  const agenda = items.length ? items : defaults.map((title, idx) => ({ number: String(idx + 1).padStart(2, "0"), title }));
  agenda.slice(0, 8).forEach((item, idx) => {
    const y = 198 + idx * 36;
    addRect(pres, slide, { x: 94, y: y + 5, w: 3, h: 18 }, SKY);
    addText(slide, text(item.number, String(idx + 1).padStart(2, "0")), { x: 112, y, w: 36, h: 22 }, {
      size: 10,
      color: SKY,
      bold: true,
      margin: 0,
    });
    addText(slide, text(item.title, defaults[idx] ?? "章节标题"), { x: 158, y: y + 1, w: 390, h: 22 }, {
      size: 9.5,
      color: TEXT,
      bold: true,
      margin: 0,
    });
  });
  addPageNumber(slide, 2);
}

function renderSection(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "chapter");
  const data = source.content ?? {};
  addText(slide, text(data.number, "01"), { x: 0, y: 200, w: 1280, h: 58 }, {
    size: 31.5,
    color: DARK_BLUE,
    bold: true,
    align: "center",
    margin: 0,
  });
  addText(slide, text(data.title, "????"), { x: 0, y: 290, w: 1280, h: 44 }, {
    size: 22.5,
    color: DARK_BLUE,
    bold: true,
    fontFace: SERIF_FONT,
    align: "center",
    margin: 0,
  });
  addText(slide, text(data.subtitle, "??????"), { x: 0, y: 360, w: 1280, h: 30 }, {
    size: 15,
    color: DARK_BLUE,
    bold: true,
    align: "center",
    margin: 0,
  });
}

function renderKpi(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addContentTitle(pres, slide, text(data.title, "项目建设概况与关键节点总览"));
  const defaultMetrics = [
    { value: "×××万千瓦", label: "建设规模/装机容量" },
    { value: "××个月", label: "建设周期/实施周期" },
    { value: "××亿元", label: "总投资/控制目标" },
    { value: "YYYY.MM", label: "投产移交/关键节点" },
  ];
  const metrics = Object.prototype.hasOwnProperty.call(data, "metrics")
    ? array<any>(data.metrics)
    : defaultMetrics;
  metrics.slice(0, 4).forEach((metric, idx) => {
    addMetric(slide, text(metric.value, "—"), text(metric.label, "指标说明"), [36, 336, 630, 930][idx], 128);
  });
  addLine(pres, slide, { x: 58, y: 192 }, { x: 1220, y: 192 }, LINE, 0.8);
  [
    { x: 58, accent: SKY, block: data.leftBlock, title: "项目概况" },
    { x: 654, accent: ORANGE, block: data.rightBlock, title: "建设成果" },
  ].forEach((item) => {
    addRect(pres, slide, { x: item.x, y: 204, w: 566, h: 118 }, LIGHT_BG);
    addRect(pres, slide, { x: item.x, y: 204, w: 4, h: 118 }, item.accent);
    addText(slide, text(item.block?.heading, item.title), { x: item.x + 20, y: 218, w: 500, h: 24 }, {
      size: 12,
      color: SKY,
      bold: true,
      margin: 0,
    });
    addText(slide, text(item.block?.body, "可填写项目概况、建设成果、管理成效等内容。"), { x: item.x + 20, y: 252, w: 506, h: 62 }, {
      size: 8.5,
      color: TEXT,
      margin: 0.01,
    });
  });
  addText(slide, "建设关键节点", { x: 58, y: 342, w: 260, h: 24 }, { size: 13, color: SKY, bold: true, margin: 0 });
  addRect(pres, slide, { x: 58, y: 374, w: 1162, h: 106 }, LIGHT_BG);
  addRect(pres, slide, { x: 58, y: 374, w: 1162, h: 3 }, SKY);
  const timeline = Object.prototype.hasOwnProperty.call(data, "timeline")
    ? array<any>(data.timeline)
    : [
    { date: "YYYY.MM", text: "主体工程完成" },
    { date: "YYYY.MM", text: "机组试运行" },
    { date: "YYYY.MM", text: "投产移交" },
    { date: "报告期末", text: "滚动更新" },
  ];
  timeline.slice(0, 4).forEach((item, idx) => {
    const x = [45, 333, 621, 909][idx];
    addRect(pres, slide, { x: x + 110, y: 392, w: 10, h: 10 }, idx === 2 ? ORANGE : SKY, { radius: true });
    addText(slide, text(item.date, "YYYY.MM"), { x, y: 414, w: 230, h: 20 }, {
      size: 9.5,
      color: idx === 2 ? ORANGE : SKY,
      bold: true,
      align: "center",
      margin: 0,
    });
    addText(slide, text(item.text, "节点说明"), { x, y: 440, w: 230, h: 34 }, {
      size: 8.5,
      color: TEXT,
      align: "center",
      margin: 0,
    });
  });
  addText(slide, "运营核心数据", { x: 58, y: 502, w: 260, h: 24 }, { size: 13, color: SKY, bold: true, margin: 0 });
  addRect(pres, slide, { x: 58, y: 534, w: 1162, h: 72 }, LIGHT_BG);
  const core = Object.prototype.hasOwnProperty.call(data, "coreMetrics")
    ? array<any>(data.coreMetrics)
    : defaultMetrics;
  core.slice(0, 4).forEach((metric, idx) => {
    const x = [56, 340, 624, 912][idx];
    addText(slide, text(metric.value, "—"), { x, y: 552, w: 240, h: 22 }, {
      size: 13,
      color: ORANGE,
      bold: true,
      align: "center",
      margin: 0,
    });
    addText(slide, text(metric.label, "指标说明"), { x, y: 582, w: 240, h: 20 }, {
      size: 8.5,
      color: TEXT,
      align: "center",
      margin: 0,
    });
  });
  addRect(pres, slide, { x: 58, y: 620, w: 1162, h: 78 }, BLUE);
  addText(slide, text(data.conclusion, "项目建设、投产和运营工作总体受控，相关指标可根据实际情况替换。"), { x: 132, y: 642, w: 1014, h: 38 }, {
    size: 10,
    color: WHITE,
    align: "center",
    margin: 0.02,
  });
  addPageNumber(slide, 4);
}

function renderTwoColumn(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addContentTitle(pres, slide, text(data.title, "建设收尾与整改工作按计划推进"));
  addText(slide, text(data.subtitle, "当前重点工作按计划推进，实行清单化、节点化、闭环化管理。"), { x: 74, y: 126, w: 1090, h: 42 }, {
    size: 12,
    color: MUTED,
    margin: 0,
  });
  [
    { x: 70, title: text(data.leftTitle, "已完成或基本完成事项"), items: array<string>(data.leftItems), color: SKY },
    { x: 670, title: text(data.rightTitle, "正在推进事项"), items: array<string>(data.rightItems), color: ORANGE },
  ].forEach((col) => {
    addRect(pres, slide, { x: col.x, y: 196, w: 540, h: 360 }, LIGHT_BG, { line: "D6E4EF", radius: true });
    addRect(pres, slide, { x: col.x, y: 196, w: 540, h: 42 }, col.color);
    addText(slide, col.title, { x: col.x + 20, y: 208, w: 460, h: 22 }, { size: 13, color: WHITE, bold: true, margin: 0 });
    addBulletList(pres, slide, col.items.length ? col.items : ["事项一：可替换为具体工作内容", "事项二：可替换为推进情况", "事项三：可替换为风险和措施"], { x: col.x + 28, y: 260, w: 480, h: 250 }, { size: 10, bulletColor: col.color, gap: 58 });
  });
  addRect(pres, slide, { x: 70, y: 590, w: 1140, h: 72 }, BLUE);
  addText(slide, text(data.footer, "后续将围绕剩余事项建立任务清单，明确责任、节点和验收标准。"), { x: 104, y: 611, w: 1072, h: 34 }, {
    size: 10,
    color: WHITE,
    align: "center",
    margin: 0.02,
  });
  addPageNumber(slide, 5);
}

function renderTimeline(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addContentTitle(pres, slide, text(data.title, "专项工程节点明确，重点任务稳步推进"));
  const cards = array<any>(data.cards).slice(0, 4);
  const fallback = ["码头输煤", "雨污分流", "尾工项目", "智慧化改造"].map((title) => ({
    title,
    status: "推进中",
    plan: "方案编制 → 审批 → 招标 → 实施",
    desc: "用于展示专项工程关键节点和实施路径。",
  }));
  (cards.length ? cards : fallback).slice(0, 4).forEach((card, idx) => {
    const x = idx % 2 === 0 ? 88 : 674;
    const y = idx < 2 ? 158 : 382;
    const color = idx % 2 === 0 ? ORANGE : BLUE;
    addRect(pres, slide, { x, y, w: 520, h: 164 }, idx < 2 ? "F5F8FA" : "F1F6FB", { line: "D6E4EF" });
    addRect(pres, slide, { x: x + 380, y: y + 20, w: 94, h: 24 }, color);
    addText(slide, text(card.status, "推进中"), { x: x + 380, y: y + 26, w: 94, h: 14 }, {
      size: 7.5,
      color: WHITE,
      align: "center",
      bold: true,
      margin: 0,
    });
    addText(slide, text(card.title, `专项工程${idx + 1}`), { x: x + 22, y: y + 28, w: 330, h: 24 }, {
      size: 13,
      color: DARK_BLUE,
      bold: true,
      margin: 0,
    });
    addText(slide, text(card.plan, "方案编制 → 审批 → 招标 → 实施"), { x: x + 24, y: y + 72, w: 442, h: 22 }, {
      size: 10,
      color,
      bold: true,
      margin: 0,
    });
    addText(slide, text(card.desc, "可替换为工程背景、当前进度、责任单位和下一步安排。"), { x: x + 24, y: y + 106, w: 442, h: 44 }, {
      size: 8.5,
      color: MUTED,
      margin: 0.02,
    });
  });
  addPageNumber(slide, 6);
}

function renderPerformance(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addContentTitle(pres, slide, text(data.title, "运行性能指标对标设计值开展验证分析"));
  const columns = array<string>(data.columns);
  const rows = array<string[]>(data.rows);
  const tableRows = [
    (columns.length ? columns : ["序号", "指标名称", "设计值", "单位", "机组A", "机组B"]).map((cell) => ({
      text: cell,
      options: { bold: true, color: WHITE, fill: BLUE, align: "center" as const },
    })),
    ...(rows.length ? rows : [
      ["1", "汽轮机热耗", "设计值", "kJ/kWh", "实测值", "实测值"],
      ["2", "锅炉效率", "设计值", "%", "实测值", "实测值"],
      ["3", "机组出力", "设计值", "MW", "实测值", "实测值"],
      ["4", "厂用电率", "设计值", "%", "实测值", "实测值"],
    ]).slice(0, 8).map((row) => row.map((cell) => ({ text: text(cell, "—"), options: { color: TEXT, align: "center" as const } }))),
  ];
  slide.addTable(tableRows as any, {
    x: i(70),
    y: i(146),
    w: i(1140),
    h: i(402),
    colW: [i(80), i(260), i(190), i(120), i(240), i(240)],
    margin: 0.03,
    fontFace: FONT,
    fontSize: 9.2,
    border: { color: "D6E4EF", pt: 0.5 },
    valign: "middle",
  });
  addRect(pres, slide, { x: 70, y: 584, w: 1140, h: 72 }, LIGHT_BG, { line: "D6E4EF", radius: true });
  addText(slide, text(data.conclusion, "结论：主要性能指标整体满足设计和运行目标要求。"), { x: 104, y: 606, w: 1072, h: 30 }, {
    size: 11,
    color: DARK_BLUE,
    align: "center",
    margin: 0.02,
  });
  addPageNumber(slide, 7);
}

function renderCardGrid(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addContentTitle(pres, slide, text(data.title, "煤炭厂的作用与发展方向"));

  const columns = array<string>(data.columns);
  const rows = array<string[]>(data.rows);
  const colWidths = [70, 350, 150, 130, 190, 190];
  const tableX = 66;
  const tableY = 162;
  const tableW = 1080;
  const headerH = 42;
  const rowH = 44;

  addRect(pres, slide, { x: tableX, y: tableY, w: tableW, h: headerH }, BLUE);
  let cursorX = tableX;
  columns.slice(0, colWidths.length).forEach((column, idx) => {
    const w = colWidths[idx] ?? Math.floor(tableW / Math.max(columns.length, 1));
    addText(slide, text(column), { x: cursorX + 8, y: tableY + 10, w: w - 16, h: 18 }, {
      size: 11.25,
      color: WHITE,
      bold: true,
      margin: 0,
      fit: "shrink",
    });
    cursorX += w;
  });

  rows.slice(0, 8).forEach((row, rowIndex) => {
    const y = tableY + headerH + rowIndex * rowH;
    addRect(pres, slide, { x: tableX, y, w: tableW, h: rowH }, rowIndex % 2 === 1 ? "F1F4F7" : WHITE);
    addLine(pres, slide, { x: tableX, y: y + rowH }, { x: tableX + tableW, y: y + rowH }, LINE, 0.5);
    let cellX = tableX;
    row.slice(0, colWidths.length).forEach((cell, cellIndex) => {
      const w = colWidths[cellIndex] ?? Math.floor(tableW / Math.max(row.length, 1));
      addText(slide, text(cell), { x: cellX + 8, y: y + 9, w: w - 16, h: rowH - 12 }, {
        size: 10.5,
        color: TEXT,
        bold: true,
        margin: 0,
        fit: "shrink",
        valign: "middle",
      });
      cellX += w;
    });
  });

  addLine(
    pres,
    slide,
    { x: tableX, y: tableY + headerH + rows.slice(0, 8).length * rowH },
    { x: tableX + tableW, y: tableY + headerH + rows.slice(0, 8).length * rowH },
    "D7DDE3",
    0.5,
  );

  addRect(pres, slide, { x: 66, y: 572, w: 1080, h: 70 }, LIGHT_BG);
  addRect(pres, slide, { x: 66, y: 572, w: 3, h: 70 }, "18A34A");
  const conclusion = text(data.conclusion, "");
  const conclusionPrefix = "结论：";
  const conclusionBody = conclusion.startsWith(conclusionPrefix)
    ? conclusion.slice(conclusionPrefix.length)
    : conclusion;
  slide.addText([
    { text: conclusionPrefix, options: { bold: true, color: "18A34A" } },
    { text: conclusionBody, options: { bold: true, color: TEXT } },
  ], {
    x: i(84),
    y: i(592),
    w: i(1038),
    h: i(42),
    fontFace: SERIF_FONT,
    fontSize: 12,
    margin: 0,
    breakLine: false,
    fit: "shrink",
    paraSpaceAfter: 0,
  });
  addPageNumber(slide, 8);
}

function renderDashboard(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addContentTitle(pres, slide, text(data.title, "智慧电厂建设稳步推进，关键系统持续完善"));
  addText(slide, text(data.body, "可围绕生产管理、设备状态监测、智能巡检、燃料管理、环保监测、经营分析等场景展开。"), { x: 78, y: 140, w: 1120, h: 108 }, {
    size: 12,
    color: MUTED,
    margin: 0.03,
  });
  addRect(pres, slide, { x: 78, y: 286, w: 1120, h: 260 }, "EDF5FA", { line: "D6E4EF", radius: true });
  addText(slide, text(data.placeholder, "系统界面 / 现场照片 / 架构图占位"), { x: 290, y: 398, w: 700, h: 40 }, {
    size: 18,
    color: "7C8B99",
    align: "center",
    margin: 0,
  });
  ["生产管理", "设备监测", "智能巡检", "经营分析"].forEach((label, idx) => {
    const x = 140 + idx * 268;
    addRect(pres, slide, { x, y: 590, w: 210, h: 44 }, idx % 2 === 0 ? SKY : ORANGE, { radius: true });
    addText(slide, label, { x, y: 604, w: 210, h: 20 }, { size: 11, color: WHITE, bold: true, align: "center", margin: 0 });
  });
  addPageNumber(slide, 9);
}

function renderClosing(slide: PptxSlide, source: NativeSlide, repoRoot: string) {
  addBackground(slide, repoRoot, "chapter");
  const data = source.content ?? {};
  addText(slide, text(data.title, "感谢聆听"), { x: 430, y: 274, w: 420, h: 42 }, {
    size: 18,
    color: SKY,
    bold: true,
    fontFace: SERIF_FONT,
    align: "center",
    margin: 0,
  });
  addText(slide, text(data.message, "请各位领导批评指正。"), { x: 282, y: 350, w: 716, h: 42 }, {
    size: 9,
    color: TEXT,
    align: "center",
    margin: 0,
  });
  addText(slide, text(data.organization, "中央企业能源开发有限公司"), { x: 430, y: 610, w: 420, h: 22 }, {
    size: 8,
    color: SKY,
    align: "center",
    margin: 0,
  });
}

function renderGenericContent(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string, page: number) {
  addBackground(slide, repoRoot, "content");
  const data = source.content ?? {};
  addContentTitle(pres, slide, text(data.title, "内容页"));
  const body = Object.entries(data)
    .filter(([key, value]) => key !== "title" && typeof value === "string")
    .map(([, value]) => value)
    .join("\n");
  addText(slide, body || "请在此填写页面内容。", { x: 78, y: 150, w: 1120, h: 430 }, {
    size: 13,
    color: TEXT,
    margin: 0.05,
  });
  addPageNumber(slide, page);
}

function renderSlide(pres: Pptx, slide: PptxSlide, source: NativeSlide, repoRoot: string, slideNo: number) {
  switch (layoutKey(source)) {
    case "coal-power-cover-slide":
      renderCover(pres, slide, source, repoRoot);
      break;
    case "coal-power-agenda-slide":
      renderAgenda(pres, slide, source, repoRoot);
      break;
    case "coal-power-section-divider-slide":
      renderSection(pres, slide, source, repoRoot);
      break;
    case "coal-power-kpi-snapshot-slide":
      renderKpi(pres, slide, source, repoRoot);
      break;
    case "coal-power-two-column-progress-slide":
      renderTwoColumn(pres, slide, source, repoRoot);
      break;
    case "coal-power-timeline-slide":
      renderTimeline(pres, slide, source, repoRoot);
      break;
    case "coal-power-performance-comparison-slide":
      renderPerformance(pres, slide, source, repoRoot);
      break;
    case "coal-power-card-grid-slide":
      renderCardGrid(pres, slide, source, repoRoot);
      break;
    case "coal-power-settlement-dashboard-slide":
      renderDashboard(pres, slide, source, repoRoot);
      break;
    case "coal-power-closing-slide":
      renderClosing(slide, source, repoRoot);
      break;
    default:
      renderGenericContent(pres, slide, source, repoRoot, slideNo);
  }
}

export function canExportCoalPowerNative(presentation: NativePresentation): boolean {
  const slides = presentation.slides ?? [];
  return slides.length > 0 && slides.every((slide) => {
    const layout = typeof slide.layout === "string" ? slide.layout : "";
    return slide.layout_group === GROUP && layout.startsWith(`${GROUP}:coal-power-`);
  });
}

export async function exportCoalPowerNativePptx({
  presentation,
  outPath,
  repoRoot = process.cwd(),
}: NativeExportParams): Promise<{ path: string }> {
  if (!canExportCoalPowerNative(presentation)) {
    throw new Error("Presentation is not a taicang coal-power template deck.");
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const pres = new pptxgen();
  pres.defineLayout({ name: "AIPPT_WIDE", width: SLIDE_W, height: SLIDE_H });
  pres.layout = "AIPPT_WIDE";
  pres.author = "AIPPT";
  pres.company = "AIPPT";
  pres.subject = "AIPPT native PPTX export";
  pres.title = text(presentation.title, "煤电项目汇报");
  pres.theme = {
    headFontFace: FONT,
    bodyFontFace: FONT,
  };

  presentation.slides?.forEach((source, idx) => {
    const slide = pres.addSlide();
    slide.addNotes(source.speaker_note ? source.speaker_note : "");
    renderSlide(pres, slide, source, repoRoot, idx + 1);
  });

  await pres.writeFile({ fileName: outPath });
  return { path: outPath };
}
