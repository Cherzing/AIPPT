import React, { useEffect, useMemo, useRef, useState } from "react";

import { V1ContentRender } from "../../(presentation-generator)/components/V1ContentRender";

const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;
const EDITOR_TOP_SPACE = 56;
const EDITOR_INSPECTOR_SPACE = 312;

function hasAipptEditorChrome(slide: any, isEditMode: boolean, presentMode: boolean, fixedSize: boolean) {
  if (!isEditMode || presentMode || fixedSize) return false;
  const content = slide?.content;
  if (content?.__aippt?.width === 1280 && content?.__aippt?.height === 720) {
    return true;
  }
  const layoutGroup = typeof slide?.layout_group === "string" ? slide.layout_group : "";
  const layout = typeof slide?.layout === "string" ? slide.layout : "";
  return (
    layoutGroup === "taicang-coal-power-report" ||
    layout.includes("coal-power-")
  );
}

const SlideScale = ({
  slide,
  theme,
  isEditMode = true,

  /** Fill viewport; scale may exceed 1 so slides appear larger in present mode */
  presentMode = false,
  isClickable = true,
  fixedSize = false,
}: {
  slide: any;
  theme?: any;
  isEditMode?: boolean;

  presentMode?: boolean;
  isClickable?: boolean;
  fixedSize?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [aipptInspectorOpen, setAipptInspectorOpen] = useState(false);
  const showAipptEditorChrome = hasAipptEditorChrome(
    slide,
    isEditMode,
    presentMode,
    fixedSize,
  );

  const scale = useMemo(() => {
    if (fixedSize) return 1;
    if (presentMode) {
      const { w, h } = box;
      if (w < 1 || h < 1) return 1;
      const sx = w / BASE_WIDTH;
      const sy = h / BASE_HEIGHT;
      return Math.min(sx, sy);
    }
    const reservedTop = showAipptEditorChrome ? EDITOR_TOP_SPACE : 0;
    const reservedRight =
      showAipptEditorChrome && aipptInspectorOpen ? EDITOR_INSPECTOR_SPACE : 0;
    const chromeWidth = BASE_WIDTH + reservedRight;
    const chromeHeight = BASE_HEIGHT + reservedTop;
    if (!box.w || !box.h) return 1;
    const sx = box.w / chromeWidth;
    const sy = box.h / chromeHeight;
    return Math.min(sx, sy, 1.25) * 0.995;
  }, [
    fixedSize,
    presentMode,
    box.w,
    box.h,
    showAipptEditorChrome,
    aipptInspectorOpen,
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      setBox((previous) =>
        Math.abs(previous.w - next.w) < 1 && Math.abs(previous.h - next.h) < 1
          ? previous
          : next,
      );
    });

    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });

    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={containerRef}
      className={
        fixedSize
          ? "relative h-[720px] w-[1280px] overflow-hidden shadow-none"
          : `relative w-full ${
              presentMode
                ? "flex h-full min-h-0 items-center justify-center shadow-none"
                : "h-full bg-[#f4f5f7] shadow-none"
            }`
      }
    >
      <div
        className={
          presentMode || fixedSize
            ? "relative mx-auto shrink-0"
          : "relative mx-auto shrink-0"
        }
        style={{
          width: `${(BASE_WIDTH + (showAipptEditorChrome && aipptInspectorOpen ? EDITOR_INSPECTOR_SPACE : 0)) * scale}px`,
          height: `${(BASE_HEIGHT + (showAipptEditorChrome ? EDITOR_TOP_SPACE : 0)) * scale}px`,
          overflow: showAipptEditorChrome ? "visible" : "hidden",
        }}
      >
        <div
          className="absolute left-0"
          style={{
            top: showAipptEditorChrome ? EDITOR_TOP_SPACE : 0,
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          <div
            className="slide-edit-stage relative w-full h-full select-none"
            data-testid="slide-content"
            style={
              {
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              } as React.CSSProperties
            }
          >
            {!isClickable && (
              <div
                className="absolute inset-0 bg-transparent z-30 w-full h-full  select-none"
                aria-hidden="true"
              />
            )}
            <V1ContentRender
              slide={slide}
              isEditMode={isEditMode}
              theme={theme}
              onAipptInspectorChange={setAipptInspectorOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideScale;
