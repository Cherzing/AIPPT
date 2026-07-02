import * as z from "zod";
import { Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

const ItemSchema = z.object({
  number: z.string(),
  title: z.string(),
  lines: z.array(z.string()),
});

export const slideLayoutId = "coal-power-settlement-dashboard-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().default("????"),
  cards: z.array(ItemSchema).default([]),
});

type SchemaType = z.infer<typeof Schema>;

const positions = [
  { left: 64, top: 130 },
  { left: 656, top: 130 },
  { left: 64, top: 382 },
  { left: 656, top: 382 },
];

const accentColors = ["#1385D3", "#1385D3", "#FF6B00", "#FF6B00"];

const SettlementDashboardSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.optimization, ...data };

  return (
    <Shell background={contentBg}>
      <div className="absolute left-[58px] top-[76px] h-[38px] w-[4px] bg-[#1385D3]" />
      <div className="absolute left-[76px] top-[72px] w-[1080px] text-[28px] font-normal text-[#1385D3]">
        {merged.title}
      </div>

      {(merged.cards ?? []).slice(0, 4).map((card: any, index: number) => {
        const pos = positions[index];
        const accent = accentColors[index];
        return (
          <div key={index} className="absolute h-[230px] w-[536px] bg-[#F1F6FB]" style={{ left: pos.left, top: pos.top }}>
            <div className="absolute left-0 top-0 h-[230px] w-[3px]" style={{ backgroundColor: accent }} />
            <div className="absolute left-[16px] top-[16px] text-[20px] font-semibold">
              <span style={{ color: accent }}>{card.number}</span>
              <span className="ml-[10px] text-[#1385D3]">{card.title}</span>
            </div>
            <div className="absolute left-[16px] top-[82px] w-[486px]">
              {(card.lines ?? []).map((line: string, lineIndex: number) => (
                <div key={lineIndex} className="mb-[13px] flex gap-[12px] text-[16px] leading-[1.55] text-[#111827]">
                  <span className="text-[18px] leading-[1.35]">{"\u2022"}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Shell>
  );
};

export default SettlementDashboardSlide;
