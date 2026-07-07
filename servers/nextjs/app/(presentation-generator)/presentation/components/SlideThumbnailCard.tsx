import React, { forwardRef } from "react";
import type { Slide } from "../../types/slide";
import { V1ContentRender } from "../../components/V1ContentRender";

interface SlideThumbnailCardProps extends React.HTMLAttributes<HTMLDivElement> {
  slide: Slide;
  index: number;
  selected: boolean;
}

const SCALE = 0.1;

export const SlideThumbnailCard = forwardRef<
  HTMLDivElement,
  SlideThumbnailCardProps
>(({ slide, index, selected, className = "", style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "var(--card-color, #ffffff)",
        borderColor: selected ? "#5141e5" : "var(--stroke, #e5e7eb)",
        ...style,
      }}
      className={`relative cursor-pointer overflow-visible rounded-[4px] border bg-white p-1 transition-all duration-200 ${
        selected ? "border-[#FF4D2D] shadow-sm" : "border-transparent hover:border-[#FFD4C9]"
      } ${className}`}
      {...props}
    >
      <p className={`pointer-events-none absolute -left-6 top-1/2 z-50 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-sm px-1 text-xs font-medium ${
        selected ? "text-[#FF4D2D]" : "text-slate-500"
      }`}>
        {index + 1}
      </p>

      <div
        className="relative rounded-[3px] bg-white"
        style={{ height: `${720 * SCALE}px`, overflow: "hidden" }}
      >
        <div
          className="absolute top-0 left-0 rounded-[10px] overflow-hidden pointer-events-none"
          style={{
            width: 1280,
            height: 720,
            transformOrigin: "top left",
            transform: `scale(${SCALE})`,
          }}
        >
          <V1ContentRender slide={slide} isEditMode={false} />
        </div>
      </div>
    </div>
  );
});

SlideThumbnailCard.displayName = "SlideThumbnailCard";
