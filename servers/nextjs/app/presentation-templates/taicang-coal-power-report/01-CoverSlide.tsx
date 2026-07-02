import * as z from "zod";
import { Shell, chapterBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

export const slideLayoutId = "coal-power-cover-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().min(4).max(24).default("???????????").meta({ description: "Cover title." }),
  organization: z.string().min(4).max(24).default("??????????").meta({ description: "Organization line." }),
  presenter: z.string().min(2).max(24).default("???/??????").meta({ description: "Presenter line." }),
});

type SchemaType = z.infer<typeof Schema>;

const CoverSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.cover, ...data };
  return (
    <Shell background={chapterBg}>
      <div className="absolute left-[140px] top-[240px] w-[1000px] text-center text-[31px] font-semibold text-[#0B3B78]">{merged.title}</div>
      <div className="absolute left-[337px] top-[340px] w-[600px] text-center text-[20px] text-[#0B3B78]">{merged.organization}</div>
      <div className="absolute left-[336px] top-[400px] w-[600px] text-center text-[18px] text-[#0B3B78]">{merged.presenter}</div>
    </Shell>
  );
};

export default CoverSlide;

