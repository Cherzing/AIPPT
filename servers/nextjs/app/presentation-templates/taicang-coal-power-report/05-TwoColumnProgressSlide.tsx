import * as z from "zod";
import { Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

export const slideLayoutId = "coal-power-two-column-progress-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().default("????"),
  subtitle: z.string().default("????"),
  subtitlePrefix: z.string().optional(),
  subtitleHighlight: z.string().optional(),
  subtitleSuffix: z.string().optional(),
  leftTitle: z.string().default("????"),
  rightTitle: z.string().default("????"),
  leftItems: z.array(z.string()).default([]),
  rightItems: z.array(z.string()).default([]),
  footer: z.string().default("????"),
});

type SchemaType = z.infer<typeof Schema>;

function Subtitle({ data }: { data: any }) {
  if (!data.subtitlePrefix) {
    return <>{data.subtitle}</>;
  }

  return (
    <>
      {data.subtitlePrefix}
      <span className="text-[#FF6B00]">{data.subtitleHighlight}</span>
      {data.subtitleSuffix}
    </>
  );
}

const TwoColumnProgressSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.progress, ...data };

  return (
    <Shell background={contentBg}>
      <div className="absolute left-[58px] top-[76px] h-[38px] w-[4px] bg-[#1385D3]" />
      <div className="absolute left-[76px] top-[72px] w-[1080px] text-[28px] font-normal text-[#1385D3]">
        {merged.title}
      </div>

      <div className="absolute left-[58px] top-[132px] w-[1100px] text-[15px] leading-[1.45] text-[#111827]">
        <Subtitle data={merged} />
      </div>

      <div className="absolute left-[58px] top-[166px] h-[232px] w-[540px] bg-[#F1F6FB]" />
      <div className="absolute left-[658px] top-[166px] h-[232px] w-[560px] bg-[#F1F6FB]" />
      <div className="absolute left-[58px] top-[166px] h-[232px] w-[3px] bg-[#22B45B]" />
      <div className="absolute left-[658px] top-[166px] h-[232px] w-[3px] bg-[#FF8A00]" />

      <div className="absolute left-[76px] top-[178px] text-[20px] font-semibold text-[#1385D3]">
        {merged.leftTitle}
      </div>
      {(merged.leftItems ?? []).map((item: string, index: number) => (
        <div key={index} className="absolute left-[78px] flex w-[485px] gap-[12px] text-[16px] leading-[1.65] text-[#111827]" style={{ top: 224 + index * 36 }}>
          <span className="text-[18px] leading-[1.45]">{"\u2022"}</span>
          <span>{item}</span>
        </div>
      ))}

      <div className="absolute left-[676px] top-[178px] text-[20px] font-semibold text-[#1385D3]">
        {merged.rightTitle}
      </div>
      {(merged.rightItems ?? []).map((item: string, index: number) => (
        <div key={index} className="absolute left-[678px] flex w-[495px] gap-[12px] text-[16px] leading-[1.7] text-[#111827]" style={{ top: 230 + index * 78 }}>
          <span className="text-[18px] leading-[1.45]">{"\u2022"}</span>
          <span>{item}</span>
        </div>
      ))}

      <div className="absolute left-[58px] top-[422px] h-[36px] w-[1160px] bg-[#057DC1]" />

      <div className="absolute left-[58px] top-[548px] w-[1120px] text-[16px] leading-[1.85] text-[#111827]">
        {merged.footer}
      </div>
    </Shell>
  );
};

export default TwoColumnProgressSlide;
