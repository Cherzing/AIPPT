import * as z from "zod";
import { Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

export const slideLayoutId = "coal-power-closing-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({ title: z.string().default("????"), body: z.string().default("????"), placeholder: z.string().default("????") });

type SchemaType = z.infer<typeof Schema>;

const ClosingSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.wisdom, ...data };
  return (
    <Shell background={contentBg}>
      <div className="absolute left-[66px] top-[72px] w-[1100px] text-[26px] font-semibold text-[#0B3B78]">{merged.title}</div>
      <div className="absolute left-[66px] top-[138px] w-[1140px] whitespace-pre-line text-[15px] leading-[1.6] text-[#24313D]">{merged.body}</div>
      <div className="absolute left-[318px] top-[500px] h-[138px] w-[640px] rounded-[8px] border-2 border-dashed border-[#B9D7EE] bg-white/70" />
      <div className="absolute left-[360px] top-[556px] w-[560px] text-center text-[18px] text-[#7A8A98]">{merged.placeholder}</div>
    </Shell>
  );
};

export default ClosingSlide;
