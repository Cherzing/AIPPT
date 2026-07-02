import * as z from "zod";
import { Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

const CardSchema = z.object({
  title: z.string(),
  status: z.string(),
  plan: z.string(),
  desc: z.string(),
  statusColor: z.string().optional(),
  emphasis: z.array(z.string()).optional(),
});

export const slideLayoutId = "coal-power-timeline-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().default("????"),
  cards: z.array(CardSchema).default([]),
});

type SchemaType = z.infer<typeof Schema>;

const positions = [
  { left: 64, top: 130 },
  { left: 656, top: 130 },
  { left: 64, top: 382 },
  { left: 656, top: 382 },
];

function HighlightedText({ text, emphasis = [] }: { text: string; emphasis?: string[] }) {
  if (!emphasis.length) {
    return <>{text}</>;
  }

  const matches = emphasis
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
    .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${matches.join("|")})`, "g");

  return (
    <>
      {text.split(pattern).map((part, index) =>
        emphasis.includes(part) ? (
          <span key={index} className="text-[#FF6B00]">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

const TimelineSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.followup, ...data };

  return (
    <Shell background={contentBg}>
      <div className="absolute left-[58px] top-[76px] h-[38px] w-[4px] bg-[#1385D3]" />
      <div className="absolute left-[76px] top-[72px] w-[1080px] text-[28px] font-normal text-[#1385D3]">
        {merged.title}
      </div>

      {(merged.cards ?? []).slice(0, 4).map((card: any, index: number) => {
        const pos = positions[index];
        const statusColor = card.statusColor ?? (index < 2 ? "#F07818" : "#00649B");
        return (
          <div key={index} className="absolute h-[230px] w-[536px] bg-[#F1F6FB]" style={{ left: pos.left, top: pos.top }}>
            <div className="absolute left-0 top-0 h-[230px] w-[3px] bg-[#1385D3]" />
            <div className="absolute right-[14px] top-[10px] h-[26px] w-[130px] text-center text-[13px] leading-[26px] text-white" style={{ backgroundColor: statusColor }}>
              {card.status}
            </div>
            <div className="absolute left-[16px] top-[16px] text-[20px] font-semibold text-[#1385D3]">{card.title}</div>
            <div className="absolute left-[16px] top-[70px] w-[480px] text-[17px] leading-[1.55] text-[#111827]">
              <HighlightedText text={card.plan} emphasis={card.emphasis} />
            </div>
            <div className="absolute left-[16px] top-[132px] w-[486px] text-[16px] leading-[1.75] text-[#111827]">
              <HighlightedText text={card.desc} emphasis={card.emphasis} />
            </div>
          </div>
        );
      })}
    </Shell>
  );
};

export default TimelineSlide;
