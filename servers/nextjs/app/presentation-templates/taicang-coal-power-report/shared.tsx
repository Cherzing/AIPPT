import * as z from "zod";
import type { ReactNode } from "react";

export const chapterBg = "/template-assets/taicang-coal-power-report/chapter-bg.png";
export const contentBg = "/template-assets/taicang-coal-power-report/content-bg.png";
export const fonts = "'Source Han Serif SC','Noto Serif SC','SimSun','Microsoft YaHei',serif";

export const MetricSchema = z.object({
  value: z.string().min(1).max(20).meta({ description: "Metric value." }),
  label: z.string().min(2).max(40).meta({ description: "Metric label." }),
  note: z.string().min(0).max(80).optional().meta({ description: "Optional note." }),
});

export const BulletSchema = z.object({
  title: z.string().min(2).max(32).meta({ description: "Short item heading." }),
  description: z.string().min(8).max(180).meta({ description: "Supporting description." }),
});

export const StageSchema = z.object({
  label: z.string().min(2).max(16).meta({ description: "Stage label." }),
  title: z.string().min(2).max(40).meta({ description: "Stage title." }),
  description: z.string().min(8).max(160).meta({ description: "Stage description." }),
});

export function Shell({ children, background, dark = false, page }: { children: ReactNode; background?: string; dark?: boolean; page?: string }) {
  return (
    <div className="relative h-[720px] w-[1280px] overflow-hidden bg-white" style={{ fontFamily: fonts, letterSpacing: 0 }}>
      {background ? <img src={background} alt="template background" className="absolute inset-0 h-full w-full object-cover" /> : null}
      {children}
      {page ? <div className={`absolute bottom-[18px] right-[24px] text-[12px] ${dark ? "text-white/65" : "text-[#8A98A6]"}`}>{page}</div> : null}
    </div>
  );
}

export function Header({ title, section, subtitle }: { title?: string; section?: string; subtitle?: string }) {
  return (
    <>
      {section ? <div className="absolute left-[66px] top-[42px] text-[14px] text-[#8A98A6]">{section}</div> : null}
      {title ? <div className="absolute left-[66px] top-[72px] max-w-[1100px] text-[26px] font-semibold text-[#0B3B78]">{title}</div> : null}
      {subtitle ? <div className="absolute left-[60px] top-[128px] max-w-[1160px] text-[17px] text-[#4C5966]">{subtitle}</div> : null}
    </>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
}
