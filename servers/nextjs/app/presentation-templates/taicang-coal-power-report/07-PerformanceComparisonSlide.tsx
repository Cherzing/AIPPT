import * as z from "zod";
import { Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

export const slideLayoutId = "coal-power-performance-comparison-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().default("????"),
  metric: z.string().default("????"),
  metricValue: z.string().optional(),
  metricText: z.string().optional(),
  metricNote1: z.string().default("????"),
  metricNote2: z.string().default("????"),
  sectionTitle: z.string().default("????"),
  bullets: z.array(z.string()).default([]),
  target: z.string().default("????"),
  footer: z.string().default("????"),
});

type SchemaType = z.infer<typeof Schema>;

const PerformanceComparisonSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.defect, ...data };
  const metricValue = merged.metricValue ?? "15";
  const metricText = merged.metricText ?? "\u9879\u8f93\u7164\u7cfb\u7edf\u5c01\u5835\u7c7b\u95ee\u9898\u5f85\u6574\u6539";

  return (
    <Shell background={contentBg}>
      <div className="absolute left-[58px] top-[76px] h-[38px] w-[4px] bg-[#1385D3]" />
      <div className="absolute left-[76px] top-[72px] w-[1080px] text-[28px] font-normal text-[#1385D3]">
        {merged.title}
      </div>

      <div className="absolute left-[58px] top-[138px] h-[90px] w-[1160px] bg-[#F1F6FB]" />
      <div className="absolute left-[58px] top-[138px] h-[90px] w-[4px] bg-[#FF6B00]" />
      <div className="absolute left-[82px] top-[164px] flex items-baseline gap-[18px]">
        <span className="text-[44px] font-normal leading-none text-[#FF6B00]">{metricValue}</span>
        <span className="text-[20px] text-[#111827]">{metricText}</span>
      </div>
      <div className="absolute right-[78px] top-[160px] w-[330px] text-right text-[15px] leading-[1.8] text-[#555]">
        <div>{merged.metricNote1}</div>
        <div>{merged.metricNote2}</div>
      </div>

      <div className="absolute left-[58px] top-[250px] h-[200px] w-[1160px] border border-[#D9D9D9] bg-white/70" />
      <div className="absolute left-[78px] top-[266px] text-[20px] font-semibold text-[#1385D3]">{merged.sectionTitle}</div>
      {(merged.bullets ?? []).map((item: string, index: number) => (
        <div key={index} className="absolute left-[84px] flex w-[1040px] gap-[14px] text-[15px] leading-[1.6] text-[#111827]" style={{ top: 310 + index * 36 }}>
          <span className="text-[18px] leading-[1.35]">{"\u2022"}</span>
          <span>{item}</span>
        </div>
      ))}

      <div className="absolute left-[58px] top-[476px] flex h-[44px] w-[1160px] items-center justify-center bg-[#057DC1] text-[22px] font-semibold text-white">
        {merged.target}
      </div>

      <div className="absolute left-[58px] top-[580px] w-[1120px] text-[16px] leading-[1.8] text-[#555]">
        {merged.footer}
      </div>
    </Shell>
  );
};

export default PerformanceComparisonSlide;
