import * as z from "zod";
import { MetricSchema, Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

const DetailBlockSchema = z.object({ heading: z.string(), body: z.string() });
const TimelineSchema = z.object({ date: z.string(), text: z.string() });

export const slideLayoutId = "coal-power-kpi-snapshot-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().default("????"),
  metrics: z.array(MetricSchema).default([]),
  leftBlock: DetailBlockSchema,
  rightBlock: DetailBlockSchema,
  timeline: z.array(TimelineSchema).default([]),
  coreMetrics: z.array(MetricSchema).default([]),
  conclusion: z.string().default("????"),
});

type SchemaType = z.infer<typeof Schema>;

function parseLines(text?: string) {
  return (text ?? "").split("\n").filter(Boolean);
}

const KpiSnapshotSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.kpi, ...data };
  const metrics = merged.metrics ?? [];
  const timeline = merged.timeline ?? [];
  const coreMetrics = merged.coreMetrics ?? [];
  const leftLines = parseLines(merged.leftBlock?.body);
  const rightLines = parseLines(merged.rightBlock?.body);

  return (
    <Shell background={contentBg}>
      <div className="absolute left-[58px] top-[76px] h-[38px] w-[4px] bg-[#1385D3]" />
      <div className="absolute left-[76px] top-[72px] w-[1080px] text-[26px] font-normal text-[#1385D3]">
        {merged.title}
      </div>

      {metrics.map((metric: any, index: number) => {
        const lefts = [116, 416, 710, 1010];
        return (
          <div key={`${metric.label}-${index}`} className="absolute text-center" style={{ left: lefts[index] - 80, top: 128, width: 260 }}>
            <div className="text-[28px] font-normal leading-none text-[#FF6B00]">{metric.value}</div>
            <div className="mt-[12px] text-[13px] leading-[1.25] text-[#24313D]">{metric.label}</div>
          </div>
        );
      })}

      <div className="absolute left-[58px] top-[192px] h-px w-[1162px] bg-[#D6DDE3]" />

      <div className="absolute left-[58px] top-[204px] h-[118px] w-[566px] bg-[#F1F6FB]" />
      <div className="absolute left-[654px] top-[204px] h-[118px] w-[566px] bg-[#F1F6FB]" />
      <div className="absolute left-[58px] top-[204px] h-[118px] w-[4px] bg-[#1385D3]" />
      <div className="absolute left-[654px] top-[204px] h-[118px] w-[4px] bg-[#FF6B00]" />

      <div className="absolute left-[78px] top-[218px] text-[16px] font-semibold text-[#1385D3]">
        {merged.leftBlock?.heading}
      </div>
      <div className="absolute left-[78px] top-[252px] w-[506px] text-[12px] leading-[1.75] text-[#111827]">
        {leftLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      <div className="absolute left-[674px] top-[218px] text-[16px] font-semibold text-[#1385D3]">
        {merged.rightBlock?.heading}
      </div>
      <div className="absolute left-[674px] top-[252px] w-[506px] text-[12px] leading-[1.75] text-[#111827]">
        {rightLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      <div className="absolute left-[58px] top-[342px] text-[18px] font-semibold text-[#1385D3]">
        {"\u5efa\u8bbe\u5173\u952e\u8282\u70b9"}
      </div>
      <div className="absolute left-[58px] top-[374px] h-[106px] w-[1162px] bg-[#F1F6FB]" />
      <div className="absolute left-[58px] top-[374px] h-[3px] w-[1162px] bg-[#1385D3]" />

      {timeline.map((item: any, index: number) => {
        const lefts = [160, 448, 736, 1024];
        const isOrange = index === 2;
        return (
          <div key={`${item.date}-${index}`} className="absolute text-center" style={{ left: lefts[index] - 115, top: 392, width: 230 }}>
            <div className={`mx-auto h-[10px] w-[10px] rounded-full ${isOrange ? "bg-[#FF6B00]" : "bg-[#1385D3]"}`} />
            <div className={`mt-[12px] text-[13px] font-semibold ${isOrange ? "text-[#FF6B00]" : "text-[#1385D3]"}`}>{item.date}</div>
            <div className="mt-[8px] whitespace-pre-line text-[12px] leading-[1.55] text-[#111827]">{item.text}</div>
          </div>
        );
      })}

      <div className="absolute left-[58px] top-[502px] text-[18px] font-semibold text-[#1385D3]">
        {"\u8fd0\u8425\u6838\u5fc3\u6570\u636e"}
      </div>
      <div className="absolute left-[58px] top-[534px] h-[72px] w-[1162px] bg-[#F1F6FB]" />
      {coreMetrics.map((item: any, index: number) => {
        const lefts = [176, 460, 744, 1032];
        return (
          <div key={index} className="absolute text-center" style={{ left: lefts[index] - 120, top: 552, width: 240 }}>
            <div className="text-[18px] font-semibold text-[#FF6B00]">{item.value}</div>
            <div className="mt-[8px] text-[12px] leading-[1.35] text-[#111827]">{item.label}</div>
          </div>
        );
      })}

      <div className="absolute left-[58px] top-[620px] h-[78px] w-[1162px] bg-[#057DC1]" />
      <div className="absolute left-[132px] top-[646px] w-[1014px] text-center text-[14px] leading-[1.75] text-white">
        {merged.conclusion}
      </div>
    </Shell>
  );
};

export default KpiSnapshotSlide;
