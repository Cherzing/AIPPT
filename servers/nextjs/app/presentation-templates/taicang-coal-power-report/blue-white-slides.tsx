import * as z from "zod";

const LOGO = "/template-assets/taicang-coal-power-report/native/image1.png";
const TEXTURE = "/template-assets/taicang-coal-power-report/native/image2.jpg";
const BLUE = "#007DC7";
const ORANGE = "#E46C1A";
const TEXT = "#333333";
const PALE = "#F3F8FC";
const GRID = "#D9E3EA";
const FONT = "'Microsoft YaHei','Noto Sans SC','Source Han Sans SC',sans-serif";

const baseText = (value: string) => z.string().default(value);
const editableImageSchema = z.object({
  __image_url__: z.string().min(1).default(TEXTURE).meta({
    description: "Image URL or project asset path.",
  }),
  __image_prompt__: z.string().min(5).max(120).default("深色工业纹理背景图片").meta({
    description: "Prompt used to generate or replace this image.",
  }),
});
const agendaItemSchema = z.object({ number: z.string(), title: z.string() });
const pointSchema = z.object({ number: z.string(), title: z.string(), body: z.string() });
const metricSchema = z.object({ value: z.string(), label: z.string() });
const tableRowSchema = z.array(z.string());
const timelineItemSchema = z.object({ month: z.string(), label: z.string(), accent: z.enum(["blue", "orange"]).optional() });
const cardSchema = z.object({ number: z.string(), title: z.string(), body: z.string() });

const defaultTextureImage = (prompt = "深色工业纹理背景图片") => ({
  __image_url__: TEXTURE,
  __image_prompt__: prompt,
});

const imageSlotSchema = z.object({
  label: z.string(),
  caption: z.string(),
  image: editableImageSchema.default(defaultTextureImage()),
});
const processStepSchema = z.object({ number: z.string(), title: z.string() });

type EditableImage = z.infer<typeof editableImageSchema>;

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[720px] w-[1280px] overflow-hidden bg-white" style={{ fontFamily: FONT, letterSpacing: 0 }}>
      {children}
    </div>
  );
}

function Logo({ position = "left" }: { position?: "left" | "right" }) {
  return (
    <img
      src={LOGO}
      alt="中煤集团"
      className="absolute object-contain"
      style={position === "right" ? { left: 1088, top: 58, width: 70, height: 70 } : { left: 13, top: 18, width: 50, height: 50 }}
    />
  );
}

function TopRule() {
  return <div className="absolute left-[80px] top-[51px] h-[2px] w-[1170px] bg-[#007DC7]" />;
}

function BottomBand() {
  return <div className="absolute bottom-0 left-0 h-[27px] w-full bg-[#007DC7]" />;
}

function WaveFooter() {
  return (
    <svg className="absolute bottom-0 left-0 h-[205px] w-[1280px]" viewBox="0 0 1280 205" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 50 C220 30 295 58 430 82 C610 114 735 133 862 144 C990 156 1112 142 1280 70 L1280 205 L0 205 Z" fill="#24AEE0" />
      <path d="M0 75 C220 58 345 70 505 100 C670 130 832 153 985 153 C1104 153 1190 128 1280 96 L1280 205 L0 205 Z" fill="#039ED8" />
      <path d="M0 103 C230 82 397 98 580 132 C760 166 930 183 1055 173 C1154 165 1222 132 1280 116 L1280 205 L0 205 Z" fill="#0089CF" />
      <path d="M0 134 C250 112 430 116 622 151 C810 184 965 199 1056 188 C1152 176 1216 140 1280 124 L1280 205 L0 205 Z" fill="#007DC7" />
      <rect x="0" y="180" width="1280" height="25" fill="#007DC7" />
    </svg>
  );
}

function Header({ title }: { title: string }) {
  return (
    <>
      <Logo />
      <TopRule />
      <div className="absolute left-[52px] top-[72px] h-[38px] w-[4px] bg-[#007DC7]" />
      <div className="absolute left-[66px] top-[72px] w-[1100px] text-[28px] font-semibold leading-none text-[#007DC7]">{title}</div>
    </>
  );
}

function FitText({
  children,
  x,
  y,
  w,
  className,
  style,
}: {
  children: React.ReactNode;
  x: number;
  y: number;
  w: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={{ position: "absolute", left: x, top: y, width: w, ...style }}>
      {children}
    </div>
  );
}

function EditableImage({
  image,
  dataPath,
  x,
  y,
  w,
  h,
}: {
  image?: EditableImage;
  dataPath: string;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  if (!image?.__image_url__) return null;

  return (
    <img
      src={image.__image_url__}
      alt={image.__image_prompt__ || "图片"}
      data-edit-path={dataPath}
      data-edit-type="image"
      data-edit-prompt={image.__image_prompt__ || ""}
      className="absolute object-fill"
      style={{ left: x, top: y, width: w, height: h }}
    />
  );
}

function imageOrDefault(image: EditableImage | undefined, prompt: string): EditableImage {
  return image?.__image_url__ ? image : defaultTextureImage(prompt);
}

export const coverSlideLayoutId = "coal-blue-white-cover-slide";
export const coverSlideLayoutName = "封面页";
export const coverSlideLayoutDescription = "中煤蓝白汇报模板原版风格封面页，文字可替换。";
export const CoverSchema = z.object({
  title: baseText("新煤电项目汇报材料"),
  organization: baseText("中煤太仓能源开发有限公司"),
  presenter: baseText("汇报人 / 部门 / 日期"),
});
export function CoverSlide({ data }: { data: z.infer<typeof CoverSchema> }) {
  return (
    <Slide>
      <Logo position="right" />
      <FitText x={140} y={241} w={1000} className="text-center text-[40px] font-normal leading-[1.12] text-[#007DC7]">{data.title}</FitText>
      <FitText x={337} y={344} w={600} className="text-center text-[21px] leading-none text-[#007DC7]">{data.organization}</FitText>
      <FitText x={336} y={404} w={600} className="text-center text-[19px] leading-none text-[#333333]">{data.presenter}</FitText>
      <WaveFooter />
    </Slide>
  );
}

export const agendaSlideLayoutId = "coal-blue-white-agenda-slide";
export const agendaSlideLayoutName = "汇报提纲";
export const agendaSlideLayoutDescription = "中煤蓝白汇报模板原版目录页，目录文字可替换。";
export const AgendaSchema = z.object({
  title: baseText("汇报提纲"),
  items: z.array(agendaItemSchema).default([
    { number: "01", title: "项目概况" },
    { number: "02", title: "尾工及缺陷整改情况" },
    { number: "03", title: "运行值达设计值情况" },
    { number: "04", title: "智慧电厂建设情况" },
    { number: "05", title: "专项验收办理情况" },
    { number: "06", title: "工程结算及决算计划" },
    { number: "07", title: "财务决算计划" },
    { number: "08", title: "竣工验收计划" },
  ]),
});
export function AgendaSlide({ data }: { data: z.infer<typeof AgendaSchema> }) {
  const items = data.items.slice(0, 8);
  return (
    <Slide>
      <Logo />
      <TopRule />
      <div className="absolute left-[45px] top-[80px] h-[39px] w-[3px] bg-[#007DC7]" />
      <FitText x={60} y={78} w={420} className="text-[28px] font-semibold leading-none text-[#007DC7]">{data.title}</FitText>
      {items.map((item, index) => (
        <div key={`${item.number}-${index}`} className="absolute" style={{ left: 89, top: 148 + index * 55 }}>
          <div className="absolute left-0 top-0 w-[34px] text-[27px] font-semibold leading-none text-[#007DC7]">{item.number}</div>
          <div className="absolute left-[48px] top-[13px] h-[2px] w-[38px] bg-[#129BE7]" />
          <div className="absolute left-[101px] top-[1px] w-[800px] text-[24px] leading-none text-[#333333]">{item.title}</div>
        </div>
      ))}
      <BottomBand />
    </Slide>
  );
}

export const sectionSlideLayoutId = "coal-blue-white-section-slide";
export const sectionSlideLayoutName = "章节页";
export const sectionSlideLayoutDescription = "中煤蓝白汇报模板原版章节页，章节文字可替换。";
export const SectionSchema = z.object({
  number: baseText("01"),
  title: baseText("章节标题"),
  subtitle: baseText("章节说明文字 / 关键主题"),
});
export function SectionSlide({ data }: { data: z.infer<typeof SectionSchema> }) {
  return (
    <Slide>
      <Logo position="right" />
      <FitText x={0} y={200} w={1280} className="text-center text-[56px] font-normal leading-none text-[#007DC7]">{data.number}</FitText>
      <FitText x={0} y={290} w={1280} className="text-center text-[40px] font-normal leading-none text-[#007DC7]">{data.title}</FitText>
      <FitText x={0} y={360} w={1280} className="text-center text-[22px] leading-none text-[#007DC7]">{data.subtitle}</FitText>
      <WaveFooter />
    </Slide>
  );
}

export const standardSlideLayoutId = "coal-blue-white-standard-content-slide";
export const standardSlideLayoutName = "标准内容页";
export const standardSlideLayoutDescription = "中煤蓝白汇报模板原版要点内容页，标题和正文可替换。";
export const StandardContentSchema = z.object({
  title: baseText("标准标题内容页"),
  points: z.array(pointSchema).default([
    { number: "1", title: "要点标题", body: "这里放置一段汇报正文，保持短句、分层和可扫描性。" },
    { number: "2", title: "要点标题", body: "这里放置一段汇报正文，保持短句、分层和可扫描性。" },
    { number: "3", title: "要点标题", body: "这里放置一段汇报正文，保持短句、分层和可扫描性。" },
  ]),
});
export function StandardContentSlide({ data }: { data: z.infer<typeof StandardContentSchema> }) {
  return (
    <Slide>
      <Header title={data.title} />
      {data.points.slice(0, 3).map((point, index) => (
        <div key={index} className="absolute" style={{ left: 80, top: 154 + index * 120 }}>
          <div className="absolute left-0 top-[5px] h-[18px] w-[18px] bg-[#007DC7]" />
          <FitText x={34} y={0} w={340} className="text-[20px] font-semibold leading-none text-[#007DC7]">{point.title} {point.number}</FitText>
          <FitText x={34} y={38} w={980} className="text-[18px] leading-[1.45] text-[#333333]">{point.body}</FitText>
        </div>
      ))}
      <BottomBand />
    </Slide>
  );
}

export const twoColumnSlideLayoutId = "coal-blue-white-two-column-slide";
export const twoColumnSlideLayoutName = "双栏内容页";
export const twoColumnSlideLayoutDescription = "中煤蓝白汇报模板原版双栏内容页，左右内容和图片可替换。";
export const TwoColumnSchema = z.object({
  title: baseText("双栏内容页"),
  leftTitle: baseText("左侧主题"),
  leftBody: baseText("用于放置背景、问题、建设内容或文字说明。"),
  leftImage: editableImageSchema.default(defaultTextureImage("左侧工业纹理配图")),
  rightTitle: baseText("右侧主题"),
  rightBody: baseText("用于放置成果、措施、风险或对比结论。"),
  rightImage: editableImageSchema.default(defaultTextureImage("右侧工业纹理配图")),
});
export function TwoColumnSlide({ data }: { data: z.infer<typeof TwoColumnSchema> }) {
  return (
    <Slide>
      <Header title={data.title} />
      <div className="absolute left-[80px] top-[150px] h-[360px] w-[520px] bg-[#F3F8FC]" />
      <div className="absolute left-[680px] top-[150px] h-[360px] w-[520px] bg-[#F3F8FC]" />
      <FitText x={110} y={180} w={300} className="text-[20px] font-semibold text-[#007DC7]">{data.leftTitle}</FitText>
      <FitText x={110} y={232} w={430} className="whitespace-pre-line text-[17px] leading-[1.6] text-[#333333]">{data.leftBody}</FitText>
      <EditableImage image={imageOrDefault(data.leftImage, "左侧工业纹理配图")} dataPath="leftImage" x={110} y={274.4} w={397.9} h={209.2} />
      <FitText x={710} y={180} w={300} className="text-[20px] font-semibold text-[#E46C1A]">{data.rightTitle}</FitText>
      <FitText x={710} y={232} w={430} className="whitespace-pre-line text-[17px] leading-[1.6] text-[#333333]">{data.rightBody}</FitText>
      <EditableImage image={imageOrDefault(data.rightImage, "右侧工业纹理配图")} dataPath="rightImage" x={710} y={274.4} w={479} h={209.2} />
      <BottomBand />
    </Slide>
  );
}

export const metricsSlideLayoutId = "coal-blue-white-metrics-slide";
export const metricsSlideLayoutName = "数据指标页";
export const metricsSlideLayoutDescription = "中煤蓝白汇报模板原版指标页，指标和结论可替换。";
export const MetricsSchema = z.object({
  title: baseText("数据指标页"),
  metrics: z.array(metricSchema).default([
    { value: "2×100", label: "万千瓦" },
    { value: "21.54", label: "亿千瓦时" },
    { value: "46.13", label: "亿千瓦时" },
    { value: "2025.12.2", label: "关键节点" },
  ]),
  conclusion: baseText("关键结论区：用一句话承接数据，突出经营成果和管理价值。"),
});
export function MetricsSlide({ data }: { data: z.infer<typeof MetricsSchema> }) {
  return (
    <Slide>
      <Header title={data.title} />
      {data.metrics.slice(0, 4).map((metric, index) => (
        <div key={index} className="absolute text-center" style={{ left: 80 + index * 300, top: 150, width: 250 }}>
          <div className="text-[32px] leading-none text-[#E46C1A]">{metric.value}</div>
          <div className="mt-[68px] text-[14px] text-[#333333]">{metric.label}</div>
        </div>
      ))}
      <div className="absolute left-[80px] top-[350px] h-[150px] w-[1120px] bg-[#F3F8FC]" />
      <FitText x={120} y={402} w={1040} className="text-center text-[18px] leading-[1.6] text-[#007DC7]">{data.conclusion}</FitText>
      <BottomBand />
    </Slide>
  );
}

export const tableSlideLayoutId = "coal-blue-white-table-slide";
export const tableSlideLayoutName = "表格数据页";
export const tableSlideLayoutDescription = "中煤蓝白汇报模板原版表格页，表头和数据可替换。";
export const TableSchema = z.object({
  title: baseText("表格数据页"),
  columns: z.array(z.string()).default(["序号", "名称", "单位", "设计值", "#5机组", "#6机组", "结论"]),
  rows: z.array(tableRowSchema).default(Array.from({ length: 6 }, () => ["数据", "数据", "数据", "数据", "数据", "数据", "数据"])),
});
export function TableSlide({ data }: { data: z.infer<typeof TableSchema> }) {
  const columns = data.columns.slice(0, 7);
  const rows = data.rows.slice(0, 6);
  return (
    <Slide>
      <Header title={data.title} />
      <div className="absolute left-[80px] top-[150px] w-[1120px]">
        <div className="grid grid-cols-7">
          {columns.map((column, index) => (
            <div key={index} className="flex h-[44px] items-center justify-center border border-[#D9E3EA] bg-[#007DC7] px-1 text-center text-[12px] text-white">{column}</div>
          ))}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-7">
            {columns.map((_, colIndex) => (
              <div key={colIndex} className="flex h-[44px] items-center justify-center border border-[#D9E3EA] px-1 text-center text-[12px] text-[#333333]" style={{ background: rowIndex % 2 === 0 ? "#FFFFFF" : "#F7FBFD" }}>
                {row[colIndex] ?? ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      <BottomBand />
    </Slide>
  );
}

export const timelineSlideLayoutId = "coal-blue-white-timeline-slide";
export const timelineSlideLayoutName = "时间轴页";
export const timelineSlideLayoutDescription = "中煤蓝白汇报模板原版时间轴页，月份和节点文字可替换。";
export const TimelineSchema = z.object({
  title: baseText("时间轴页"),
  items: z.array(timelineItemSchema).default([
    { month: "6", label: "节点说明", accent: "blue" },
    { month: "7", label: "节点说明", accent: "blue" },
    { month: "8", label: "节点说明", accent: "orange" },
    { month: "10", label: "节点说明", accent: "blue" },
    { month: "12", label: "节点说明", accent: "blue" },
  ]),
});
export function TimelineSlide({ data }: { data: z.infer<typeof TimelineSchema> }) {
  return (
    <Slide>
      <Header title={data.title} />
      <div className="absolute left-[155px] top-[340px] h-[2px] w-[970px] bg-[#007DC7]" />
      {data.items.slice(0, 5).map((item, index) => {
        const color = item.accent === "orange" ? ORANGE : BLUE;
        const x = 155 + index * 250;
        return (
          <div key={index} className="absolute text-center" style={{ left: x - 80, top: 270, width: 160 }}>
            <div className="text-[24px] text-[#007DC7]" style={{ color }}>{item.month}月</div>
            <div className="mx-auto mt-[46px] h-[28px] w-[28px] rounded-full" style={{ background: color }} />
            <div className="mt-[26px] text-[14px] text-[#333333]">{item.label}</div>
          </div>
        );
      })}
      <BottomBand />
    </Slide>
  );
}

export const cardGridSlideLayoutId = "coal-blue-white-card-grid-slide";
export const cardGridSlideLayoutName = "卡片网格页";
export const cardGridSlideLayoutDescription = "中煤蓝白汇报模板原版卡片网格页，卡片内容可替换。";
export const CardGridSchema = z.object({
  title: baseText("卡片网格页"),
  cards: z.array(cardSchema).default(["01", "02", "03", "04", "05", "06"].map((number) => ({
    number,
    title: "卡片标题",
    body: "用于展示任务、措施、风险、验收项或系统模块。",
  }))),
});
export function CardGridSlide({ data }: { data: z.infer<typeof CardGridSchema> }) {
  return (
    <Slide>
      <Header title={data.title} />
      {data.cards.slice(0, 6).map((card, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const left = 85 + col * 380;
        const top = 155 + row * 190;
        return (
          <div key={index} className="absolute h-[145px] w-[330px] border border-[#E2EDF3] bg-[#F3F8FC]" style={{ left, top }}>
            <FitText x={27} y={24} w={50} className="text-[20px] text-[#007DC7]">{card.number}</FitText>
            <FitText x={86} y={25} w={190} className="text-[20px] text-[#007DC7]">{card.title}</FitText>
            <FitText x={30} y={78} w={270} className="text-[13px] leading-[1.5] text-[#333333]">{card.body}</FitText>
          </div>
        );
      })}
      <BottomBand />
    </Slide>
  );
}

export const imageSlideLayoutId = "coal-blue-white-image-showcase-slide";
export const imageSlideLayoutName = "图片展示页";
export const imageSlideLayoutDescription = "中煤蓝白汇报模板原版图片展示页，图片和说明文字可替换。";
export const ImageShowcaseSchema = z.object({
  title: baseText("图片展示页"),
  images: z.array(imageSlotSchema).default([
    { label: "图片 / 系统截图", caption: "图片说明文字", image: defaultTextureImage("左上图片槽位配图") },
    { label: "图片 / 系统截图", caption: "图片说明文字", image: defaultTextureImage("右上图片槽位配图") },
    { label: "图片 / 系统截图", caption: "图片说明文字", image: defaultTextureImage("左下图片槽位配图") },
    { label: "图片 / 系统截图", caption: "图片说明文字", image: defaultTextureImage("右下图片槽位配图") },
  ]),
});
export function ImageShowcaseSlide({ data }: { data: z.infer<typeof ImageShowcaseSchema> }) {
  return (
    <Slide>
      <Header title={data.title} />
      {data.images.slice(0, 4).map((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const left = 90 + col * 560;
        const top = 150 + row * 220;
        const image = imageOrDefault(item.image, `${item.label || "图片"}配图`);
        return (
          <div key={index} className="absolute" style={{ left, top }}>
            <div className="relative h-[160px] w-[500px] overflow-hidden border border-[#C7D7E2] bg-[#E6EEF4]">
              <div className="absolute inset-0 flex items-center justify-center text-[16px] text-[#007DC7]">{item.label}</div>
              <img
                src={image.__image_url__}
                alt={image.__image_prompt__ || item.label}
                data-edit-path={`images[${index}].image`}
                data-edit-type="image"
                data-edit-prompt={image.__image_prompt__ || ""}
                className="absolute inset-0 h-full w-full object-fill"
              />
            </div>
            <div className="flex h-[28px] w-[500px] items-center bg-[#007DC7] px-[8px] text-[12px] text-white">{item.caption}</div>
          </div>
        );
      })}
      <BottomBand />
    </Slide>
  );
}

export const processSlideLayoutId = "coal-blue-white-process-slide";
export const processSlideLayoutName = "流程步骤页";
export const processSlideLayoutDescription = "中煤蓝白汇报模板原版流程步骤页，流程文字可替换。";
export const ProcessSchema = z.object({
  title: baseText("流程步骤页"),
  steps: z.array(processStepSchema).default([
    { number: "01", title: "自检" },
    { number: "02", title: "整改" },
    { number: "03", title: "验收" },
    { number: "04", title: "闭环" },
  ]),
  note: baseText("流程说明区：补充每个阶段的责任、时间、交付物。"),
});
export function ProcessSlide({ data }: { data: z.infer<typeof ProcessSchema> }) {
  return (
    <Slide>
      <Header title={data.title} />
      {data.steps.slice(0, 4).map((step, index) => {
        const left = 115 + index * 285;
        return (
          <div key={index} className="absolute h-[110px] w-[180px] border border-[#D9E3EA] bg-[#F3F8FC] text-center" style={{ left, top: 230 }}>
            <div className="mt-[20px] text-[22px] text-[#007DC7]">{step.number}</div>
            <div className="mt-[18px] text-[16px] text-[#333333]">{step.title}</div>
          </div>
        );
      })}
      <FitText x={230} y={430} w={820} className="text-center text-[18px] text-[#007DC7]">{data.note}</FitText>
      <BottomBand />
    </Slide>
  );
}

export const closingSlideLayoutId = "coal-blue-white-closing-slide";
export const closingSlideLayoutName = "结束页";
export const closingSlideLayoutDescription = "中煤蓝白汇报模板原版结束页，结束语可替换。";
export const ClosingSchema = z.object({
  title: baseText("感谢聆听"),
  summary: baseText("总结观点 / 下一步计划 / 联系方式"),
});
export function ClosingSlide({ data }: { data: z.infer<typeof ClosingSchema> }) {
  return (
    <Slide>
      <Logo position="right" />
      <FitText x={0} y={255} w={1280} className="text-center text-[40px] text-[#007DC7]">{data.title}</FitText>
      <FitText x={0} y={340} w={1280} className="text-center text-[22px] text-[#333333]">{data.summary}</FitText>
      <WaveFooter />
    </Slide>
  );
}

export const blueWhiteSampleData = {
  cover: CoverSchema.parse({}),
  agenda: AgendaSchema.parse({}),
  section: SectionSchema.parse({}),
  standard: StandardContentSchema.parse({}),
  twoColumn: TwoColumnSchema.parse({}),
  metrics: MetricsSchema.parse({}),
  table: TableSchema.parse({}),
  timeline: TimelineSchema.parse({}),
  cards: CardGridSchema.parse({}),
  images: ImageShowcaseSchema.parse({}),
  process: ProcessSchema.parse({}),
  closing: ClosingSchema.parse({}),
};
