import * as z from "zod";
import { Shell, contentBg } from "./shared";
import taicangCoalPowerReportSampleData from "./sampleData";

export const slideLayoutId = "coal-power-card-grid-slide";
export const slideLayoutName = "";
export const slideLayoutDescription = "";

export const Schema = z.object({
  title: z.string().default("????"),
  columns: z.array(z.string()).default([]),
  rows: z.array(z.array(z.string())).default([]),
  conclusion: z.string().default("????"),
});

type SchemaType = z.infer<typeof Schema>;

const widths = [70, 350, 150, 130, 190, 190];
const tableWidth = widths.reduce((sum, width) => sum + width, 0);

function Conclusion({ text }: { text?: string }) {
  const fallback = text ?? "";
  const prefix = "\u7ed3\u8bba\uff1a";
  const hasPrefix = fallback.startsWith(prefix);
  const normalized = hasPrefix ? fallback.slice(prefix.length) : fallback;

  return (
    <>
      <span className="font-semibold text-[#18A34A]">{prefix}</span>
      <span>{normalized}</span>
    </>
  );
}

const CardGridSlide = ({ data }: { data: Partial<SchemaType> }) => {
  const merged = { ...taicangCoalPowerReportSampleData.performance, ...data };

  return (
    <Shell background={contentBg}>
      <div className="absolute left-[58px] top-[76px] h-[38px] w-[4px] bg-[#1385D3]" />
      <div className="absolute left-[76px] top-[72px] w-[1080px] text-[28px] font-normal text-[#1385D3]">
        {merged.title}
      </div>

      <div className="absolute left-[66px] top-[162px]" style={{ width: tableWidth }}>
        <div className="flex h-[42px] bg-[#057DC1] text-[15px] font-semibold text-white">
          {(merged.columns ?? []).map((column: string, index: number) => (
            <div key={index} className="flex items-center px-[8px]" style={{ width: widths[index] }}>
              {column}
            </div>
          ))}
        </div>

        {(merged.rows ?? []).map((row: any[], rowIndex: number) => (
          <div key={rowIndex} className={`flex h-[44px] border-b border-[#D7DDE3] text-[14px] text-[#111827] ${rowIndex % 2 === 1 ? "bg-[#F1F4F7]" : "bg-white"}`}>
            {row.map((cell: string, cellIndex: number) => (
              <div key={cellIndex} className="flex items-center px-[8px]" style={{ width: widths[cellIndex] }}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="absolute left-[66px] top-[572px] h-[70px] w-[1080px] bg-[#F1F6FB]" />
      <div className="absolute left-[66px] top-[572px] h-[70px] w-[3px] bg-[#18A34A]" />
      <div className="absolute left-[84px] top-[592px] w-[1038px] text-[16px] leading-[1.75] text-[#111827]">
        <Conclusion text={merged.conclusion} />
      </div>
    </Shell>
  );
};

export default CardGridSlide;
