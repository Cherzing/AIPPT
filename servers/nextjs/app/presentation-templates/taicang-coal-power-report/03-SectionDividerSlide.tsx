import * as z from "zod";
import { Shell, chapterBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

export const slideLayoutId = "coal-power-section-divider-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  number: z.string().min(1).max(4).default("01").meta({ description: "Section number." }),
  title: z.string().min(2).max(18).default("????").meta({ description: "Section title." }),
  subtitle: z.string().min(2).max(24).default("????????").meta({ description: "Section subtitle." }),
});

type SchemaType = z.infer<typeof Schema>;

const SectionDividerSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.section, ...data };
  return (
    <Shell background={chapterBg}>
      <div className="absolute left-0 top-[200px] w-[1280px] text-center text-[42px] font-semibold text-[#0B3B78]">{merged.number}</div>
      <div className="absolute left-0 top-[290px] w-[1280px] text-center text-[30px] font-semibold text-[#0B3B78]">{merged.title}</div>
      <div className="absolute left-0 top-[360px] w-[1280px] text-center text-[20px] text-[#0B3B78]">{merged.subtitle}</div>
    </Shell>
  );
};

export default SectionDividerSlide;

