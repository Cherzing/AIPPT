import * as z from "zod";
import { Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

const AgendaItemSchema = z.object({
  number: z.string().min(1).max(4).meta({ description: "Agenda number." }),
  title: z.string().min(2).max(32).meta({ description: "Agenda title." }),
});

export const slideLayoutId = "coal-power-agenda-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().min(2).max(12).default("????").meta({ description: "Agenda title." }),
  items: z.array(AgendaItemSchema).min(4).max(8).default([]).meta({ description: "Agenda rows." }),
});

type SchemaType = z.infer<typeof Schema>;

const AgendaSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.agenda, ...data };
  const items = merged.items ?? [];
  return (
    <Shell background={contentBg}>
      <div className="absolute left-[60px] top-[80px] w-[400px] text-[32px] font-semibold text-[#0B3B78]">{merged.title}</div>
      {items.map((item: any, index: number) => {
        const rowTop = 143 + index * 55;
        return (
          <div key={`${item.number}-${index}`}>
            <div className="absolute left-[60px] h-[28px] w-[4px] bg-[#1385D3]" style={{ top: rowTop + 4 }} />
            <div className="absolute left-[78px] text-[24px] font-normal text-[#1385D3]" style={{ top: rowTop }}>{item.number}</div>
            <div className="absolute left-[160px] text-[24px] font-normal text-[#24313D]" style={{ top: rowTop }}>{item.title}</div>
          </div>
        );
      })}
    </Shell>
  );
};

export default AgendaSlide;
