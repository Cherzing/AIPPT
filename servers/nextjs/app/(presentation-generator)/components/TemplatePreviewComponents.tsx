"use client";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { TemplateWithData } from "@/app/presentation-templates/utils";
import { CompiledLayout } from "@/app/hooks/compileLayout";

export function TemplatePreviewStage({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative aspect-video overflow-hidden bg-white">
            <img
                src="/card_bg.svg"
                alt=""
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
            {children}
        </div>
    );
}

export const LayoutsBadge = memo(function LayoutsBadge({ count }: { count: number }) {
    return (
        <span className="text-xs font-syne absolute top-3.5 left-4 z-40 inline-flex items-center rounded-full bg-[#333333] px-3 py-1 font-semibold text-white">
            {"\u7248\u5f0f"}-{count}
        </span>
    );
});

export const ScaledSlidePreview = memo(function ScaledSlidePreview({
    children,
    id,
    index,
    isOutline = false,
}: {
    children: React.ReactNode;
    id: string;
    index: number;
    isOutline?: boolean;
}) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [box, setBox] = useState({ width: 0, height: 0 });
    const PREVIEW_SCALE = useMemo(() => {
        if (isOutline) return 0.2;
        if (!box.width || !box.height) return 0.24;
        return Math.max(box.width / 1280, box.height / 720);
    }, [box.height, box.width, isOutline]);
    const slideFrameHeight = isOutline ? `${720 * PREVIEW_SCALE}px` : "100%";
    const SLIDE_WIDTH = 1280;
    const SLIDE_NATIVE_HEIGHT = 720;
    const scaledSlideWidth = SLIDE_WIDTH * PREVIEW_SCALE;
    const scaledSlideHeight = SLIDE_NATIVE_HEIGHT * PREVIEW_SCALE;
    const slideLeft = isOutline ? 0 : (box.width - scaledSlideWidth) / 2;
    const slideTop = isOutline ? 0 : (box.height - scaledSlideHeight) / 2;

    useEffect(() => {
        if (isOutline || !wrapperRef.current) return;
        const element = wrapperRef.current;
        const observer = new ResizeObserver(() => {
            setBox({ width: element.clientWidth, height: element.clientHeight });
        });
        observer.observe(element);
        setBox({ width: element.clientWidth, height: element.clientHeight });
        return () => observer.disconnect();
    }, [isOutline]);

    return (
        <div
            ref={wrapperRef}
            key={`${id}-preview-${index}`}
            className={isOutline ? "relative" : "relative h-full w-full overflow-hidden"}
            style={{ height: slideFrameHeight, overflow: "hidden" }}
        >
            <div
                className="absolute pointer-events-none"
                style={{
                    left: slideLeft,
                    top: slideTop,
                    width: SLIDE_WIDTH,
                    height: SLIDE_NATIVE_HEIGHT,
                    transformOrigin: "top left",
                    transform: `scale(${PREVIEW_SCALE})`,
                }}
            >
                {children}
            </div>
        </div>
    );
});

export const InbuiltTemplatePreview = memo(function InbuiltTemplatePreview({
    layouts,
    templateId,
    isOutline = false,
}: {
    layouts: TemplateWithData[];
    templateId: string;
    isOutline?: boolean;
}) {
    const previewLayouts = useMemo(
        () => layouts.slice(0, isOutline ? 2 : 1),
        [isOutline, layouts]
    );
    return (
        <div className="relative z-10 h-full overflow-hidden">
            {previewLayouts.map((layout, index) => {
                const LayoutComponent = layout.component;
                return (
                    <ScaledSlidePreview key={`${templateId}-preview-${index}`} id={templateId} index={index} isOutline={isOutline}>
                        <LayoutComponent data={layout.sampleData} />
                    </ScaledSlidePreview>
                );
            })}
        </div>
    );
});

export const CustomTemplatePreview = memo(function CustomTemplatePreview({
    previewLayouts,
    loading,
    templateId,
    isOutline = false,
}: {
    previewLayouts: CompiledLayout[];
    loading: boolean;
    templateId: string;
    isOutline?: boolean;
}) {
    return (
        <div className="relative z-10 h-full overflow-hidden">
            {loading ? (
                [...Array(2)].map((_, index) => (
                    <div
                        key={`${templateId}-loading-${index}`}
                        className="relative w-full aspect-video flex items-center justify-center"
                    >
                        <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                    </div>
                ))
            ) : (
                previewLayouts.slice(0, isOutline ? 2 : 1).map((layout, index) => {
                    const LayoutComponent = layout.component;
                    return (
                        <ScaledSlidePreview key={`${templateId}-preview-${index}`} id={templateId} index={index} isOutline={isOutline}>
                            <LayoutComponent data={layout.sampleData} />
                        </ScaledSlidePreview>
                    );
                })
            )}
        </div>
    );
});
