"use client";

import React from "react";

import type {
  AipptChartElement,
  AipptFormulaElement,
  AipptMediaElement,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableElement,
  AipptTextElement,
} from "@/lib/pptx-model/types";

function normalizeColor(color?: string) {
  if (!color) return undefined;
  return color.startsWith("#") ? color : `#${color}`;
}

function boxStyle(element: AipptSlideElement): React.CSSProperties {
  return {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
    transform: element.rotate ? `rotate(${element.rotate}deg)` : undefined,
    transformOrigin: "center center",
    opacity: element.opacity,
    boxSizing: "border-box",
    cursor: element.locked ? "not-allowed" : "grab",
    pointerEvents: resolveSlideElementPointerEvents(true),
  };
}

function textStyle(element: AipptTextElement): React.CSSProperties {
  const style = element.style;
  const margin = style.margin ?? [0, 0, 0, 0];
  return {
    ...boxStyle(element),
    color: normalizeColor(style.color),
    fontFamily: style.fontFace,
    fontSize: style.fontSize,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? "italic" : undefined,
    textDecoration: style.underline ? "underline" : undefined,
    textAlign: style.align,
    lineHeight: style.lineSpacingMultiple ?? 1.18,
    padding: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
    display: "flex",
    alignItems:
      style.valign === "middle"
        ? "center"
        : style.valign === "bottom"
          ? "flex-end"
          : "flex-start",
    justifyContent:
      style.align === "center"
        ? "center"
        : style.align === "right"
          ? "flex-end"
          : "flex-start",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  };
}

function renderTable(element: AipptTableElement) {
  const borderColor = normalizeColor(element.style.borderColor ?? "D6DDE3");
  const colCount = Math.max(
    1,
    element.columns.length,
    ...element.rows.map((row) => row.length),
  );
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${Math.max(1, element.rows.length)}, minmax(0, 1fr))`,
        color: normalizeColor(element.style.color),
        fontFamily: element.style.fontFace,
        fontSize: element.style.fontSize,
        boxSizing: "border-box",
      }}
    >
      {element.rows.flatMap((row, rowIndex) =>
        row.map((cell, cellIndex) => (
          <div
            key={`${rowIndex}-${cellIndex}`}
            style={{
              border: `1px solid ${borderColor}`,
              background: normalizeColor(cell.fill) ?? "#FFFFFF",
              color: normalizeColor(cell.color ?? element.style.color),
              fontWeight: cell.bold ? 700 : 400,
              textAlign: cell.align ?? "center",
              display: "flex",
              alignItems:
                cell.valign === "top"
                  ? "flex-start"
                  : cell.valign === "bottom"
                    ? "flex-end"
                    : "center",
              justifyContent:
                cell.align === "left"
                  ? "flex-start"
                  : cell.align === "right"
                    ? "flex-end"
                    : "center",
              padding: "4px 6px",
              overflow: "hidden",
              boxSizing: "border-box",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {cell.text}
          </div>
        )),
      )}
    </div>
  );
}

function renderChart(element: AipptChartElement) {
  const maxValue = Math.max(
    1,
    ...element.series.flatMap((series) => series.values),
  );
  const plotLeft = 54;
  const plotTop = 48;
  const plotWidth = Math.max(80, element.w - 82);
  const plotHeight = Math.max(80, element.h - 92);
  const groupWidth = plotWidth / Math.max(1, element.categories.length);
  const barWidth = groupWidth / Math.max(2, element.series.length + 1);
  const valueToY = (value: number) => plotTop + plotHeight - (value / maxValue) * plotHeight;
  const categoryX = (categoryIndex: number) =>
    plotLeft + categoryIndex * groupWidth + groupWidth / 2;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "1px solid #D8E2EF",
        borderRadius: 12,
        background: normalizeColor(element.style.backgroundColor ?? "FFFFFF"),
        padding: 12,
        boxSizing: "border-box",
        color: normalizeColor(element.style.color),
        fontFamily: element.style.fontFace,
        fontSize: element.style.fontSize,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: element.style.fontSize + 2 }}>
        {element.title ?? "图表"}
      </div>
      <svg width="100%" height="calc(100% - 20px)" viewBox={`0 0 ${element.w} ${element.h - 20}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <line
            key={tick}
            x1={plotLeft}
            y1={plotTop + plotHeight * tick}
            x2={plotLeft + plotWidth}
            y2={plotTop + plotHeight * tick}
            stroke={normalizeColor(element.style.gridColor ?? "E2E8F0")}
            strokeWidth="1"
          />
        ))}
        <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotTop + plotHeight} stroke={normalizeColor(element.style.axisColor ?? "94A3B8")} />
        <line x1={plotLeft} y1={plotTop + plotHeight} x2={plotLeft + plotWidth} y2={plotTop + plotHeight} stroke={normalizeColor(element.style.axisColor ?? "94A3B8")} />
        {element.chartType === "line"
          ? element.series.map((series) => {
              const points = element.categories.map((_, categoryIndex) => ({
                x: categoryX(categoryIndex),
                y: valueToY(series.values[categoryIndex] ?? 0),
              }));
              return (
                <g key={series.name}>
                  <polyline
                    points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                    fill="none"
                    stroke={normalizeColor(series.color ?? "60A5FA")}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {points.map((point, index) => (
                    <circle
                      key={`${series.name}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill="#FFFFFF"
                      stroke={normalizeColor(series.color ?? "60A5FA")}
                      strokeWidth="3"
                    />
                  ))}
                </g>
              );
            })
          : element.categories.map((category, categoryIndex) => (
              <g key={category}>
                {element.series.map((series, seriesIndex) => {
                  const value = series.values[categoryIndex] ?? 0;
                  const h = (value / maxValue) * plotHeight;
                  const x = plotLeft + categoryIndex * groupWidth + 10 + seriesIndex * barWidth;
                  const y = plotTop + plotHeight - h;
                  return (
                    <rect
                      key={series.name}
                      x={x}
                      y={y}
                      width={Math.max(8, barWidth - 4)}
                      height={h}
                      rx="4"
                      fill={normalizeColor(series.color ?? "60A5FA")}
                    />
                  );
                })}
              </g>
            ))}
        {element.categories.map((category, categoryIndex) => (
          <text
            key={`label-${category}`}
            x={categoryX(categoryIndex)}
            y={plotTop + plotHeight + 24}
            textAnchor="middle"
            fill={normalizeColor(element.style.color)}
            fontSize={element.style.fontSize}
          >
            {category}
          </text>
        ))}
      </svg>
    </div>
  );
}

function renderFormula(element: AipptFormulaElement) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${normalizeColor(element.style.borderColor ?? "CBD5E1")}`,
        borderRadius: 10,
        background: normalizeColor(element.style.backgroundColor ?? "FFFFFF"),
        color: normalizeColor(element.style.color),
        fontFamily: element.style.fontFace,
        fontSize: element.style.fontSize,
        boxSizing: "border-box",
      }}
      title={element.latex}
    >
      {element.displayText}
    </div>
  );
}

function renderMedia(element: AipptMediaElement) {
  const isVideo = element.mediaType === "video";
  if (element.src && isVideo) {
    return (
      <video
        src={element.src}
        controls
        preload="metadata"
        title={element.title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          border: `1px solid ${normalizeColor(element.style.borderColor)}`,
          borderRadius: 10,
          background: "#000000",
          boxSizing: "border-box",
        }}
      />
    );
  }

  if (element.src && !isVideo) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          border: `1px solid ${normalizeColor(element.style.borderColor)}`,
          borderRadius: 12,
          background: normalizeColor(element.style.backgroundColor),
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "999px",
            background: "#E0F2FE",
            color: "#057DC1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            flex: "0 0 auto",
          }}
        >
          ♫
        </div>
        <audio
          src={element.src}
          controls
          preload="metadata"
          title={element.title}
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: `1px dashed ${normalizeColor(element.style.borderColor)}`,
        borderRadius: 14,
        background: normalizeColor(element.style.backgroundColor),
        color: normalizeColor(element.style.color),
        fontFamily: element.style.fontFace,
        fontSize: element.style.fontSize,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: isVideo ? 54 : 44,
          height: isVideo ? 54 : 44,
          borderRadius: "999px",
          background: "#E0F2FE",
          color: "#057DC1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isVideo ? 24 : 20,
          fontWeight: 800,
        }}
      >
        {isVideo ? "▶" : "♫"}
      </div>
      <div style={{ fontWeight: 700 }}>{element.title}</div>
      <div style={{ fontSize: 12, color: "#64748B" }}>
        {element.src ? "已设置媒体地址" : "点击后可替换媒体地址"}
      </div>
    </div>
  );
}

function shapePoints(shape: Extract<AipptSlideElement, { type: "shape" }>["shape"]) {
  const points: Record<string, string> = {
    triangle: "50,0 100,100 0,100",
    diamond: "50,0 100,50 50,100 0,50",
    parallelogram: "25,0 100,0 75,100 0,100",
    trapezoid: "20,0 80,0 100,100 0,100",
    pentagon: "50,0 100,38 82,100 18,100 0,38",
    hexagon: "25,0 75,0 100,50 75,100 25,100 0,50",
    rightArrow: "0,25 62,25 62,0 100,50 62,100 62,75 0,75",
    leftArrow: "100,25 38,25 38,0 0,50 38,100 38,75 100,75",
    upArrow: "25,100 25,38 0,38 50,0 100,38 75,38 75,100",
    downArrow: "25,0 75,0 75,62 100,62 50,100 0,62 25,62",
    plus: "38,0 62,0 62,38 100,38 100,62 62,62 62,100 38,100 38,62 0,62 0,38 38,38",
    star5: "50,0 61,35 98,35 68,57 79,92 50,70 21,92 32,57 2,35 39,35",
  };
  return points[shape];
}

function shapePath(shape: Extract<AipptSlideElement, { type: "shape" }>["shape"]) {
  if (shape === "heart") {
    return "M50 88 C20 62 5 45 5 25 C5 10 17 0 31 0 C39 0 46 4 50 11 C54 4 61 0 69 0 C83 0 95 10 95 25 C95 45 80 62 50 88 Z";
  }
  if (shape === "cloud") {
    return "M25 75 C12 75 2 65 2 52 C2 40 11 31 23 30 C28 16 41 8 56 11 C67 13 76 21 80 32 C91 34 98 43 98 54 C98 66 88 75 76 75 Z";
  }
  return undefined;
}

export function renderAipptElement(
  element: AipptSlideElement,
  hiddenElementIds = new Set<string>(),
) {
  const isHidden = hiddenElementIds.has(element.id);

  if (element.type === "text") {
    return (
      <div
        key={element.id}
        data-aippt-element-id={element.id}
        style={{
          ...textStyle(element),
          visibility: isHidden ? "hidden" : undefined,
        }}
      >
        {element.text}
      </div>
    );
  }

  if (element.type === "image") {
    return (
      <img
        key={element.id}
        data-aippt-element-id={element.id}
        src={element.src}
        alt={element.name ?? ""}
        draggable={false}
        style={{
          ...boxStyle(element),
          visibility: isHidden ? "hidden" : undefined,
          objectFit:
            element.fit === "contain"
              ? "contain"
              : element.fit === "cover"
                ? "cover"
                : "fill",
        }}
      />
    );
  }

  if (element.type === "shape") {
    const svgPoints = shapePoints(element.shape);
    const svgPath = shapePath(element.shape);
    if (svgPoints || svgPath) {
      const strokeWidth = element.line?.width ?? 0;
      return (
        <svg
          key={element.id}
          data-aippt-element-id={element.id}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            ...boxStyle(element),
            visibility: isHidden ? "hidden" : undefined,
            overflow: "visible",
          }}
        >
          {svgPoints ? (
            <polygon
              points={svgPoints}
              fill={normalizeColor(element.fill?.color) ?? "transparent"}
              stroke={normalizeColor(element.line?.color) ?? "transparent"}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            <path
              d={svgPath}
              fill={normalizeColor(element.fill?.color) ?? "transparent"}
              stroke={normalizeColor(element.line?.color) ?? "transparent"}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      );
    }
    return (
      <div
        key={element.id}
        data-aippt-element-id={element.id}
        style={{
          ...boxStyle(element),
          visibility: isHidden ? "hidden" : undefined,
          background: normalizeColor(element.fill?.color),
          border: element.line
            ? `${element.line.width}px ${element.line.dash === "dash" ? "dashed" : "solid"} ${normalizeColor(element.line.color)}`
            : undefined,
          borderRadius:
            element.shape === "ellipse"
              ? "50%"
              : element.shape === "roundRect"
                ? element.radius ?? 12
                : 0,
        }}
      />
    );
  }

  if (element.type === "line") {
    const minX = Math.min(element.x, element.x2, ...(element.points ?? []).map((point) => point.x), ...(element.controlPoints ?? []).map((point) => point.x));
    const minY = Math.min(element.y, element.y2, ...(element.points ?? []).map((point) => point.y), ...(element.controlPoints ?? []).map((point) => point.y));
    const maxX = Math.max(element.x, element.x2, ...(element.points ?? []).map((point) => point.x), ...(element.controlPoints ?? []).map((point) => point.x));
    const maxY = Math.max(element.y, element.y2, ...(element.points ?? []).map((point) => point.y), ...(element.controlPoints ?? []).map((point) => point.y));
    const viewWidth = Math.max(1, maxX - minX);
    const viewHeight = Math.max(1, maxY - minY);
    const sx = element.x - minX;
    const sy = element.y - minY;
    const ex = element.x2 - minX;
    const ey = element.y2 - minY;
    const controlPoints = element.controlPoints ?? [];
    const points = element.points ?? [];
    let path = `M ${sx} ${sy} L ${ex} ${ey}`;
    if (element.lineType === "polyline" || element.lineType === "elbow") {
      path = `M ${sx} ${sy} ${points
        .map((point) => `L ${point.x - minX} ${point.y - minY}`)
        .join(" ")} L ${ex} ${ey}`;
    }
    if (element.lineType === "curve") {
      const control = controlPoints[0] ?? {
        x: (element.x + element.x2) / 2,
        y: Math.min(element.y, element.y2) - 80,
      };
      path = `M ${sx} ${sy} Q ${control.x - minX} ${control.y - minY} ${ex} ${ey}`;
    }
    if (element.lineType === "cubic") {
      const c1 = controlPoints[0] ?? { x: element.x + 80, y: element.y - 80 };
      const c2 = controlPoints[1] ?? { x: element.x2 - 80, y: element.y2 + 80 };
      path = `M ${sx} ${sy} C ${c1.x - minX} ${c1.y - minY} ${c2.x - minX} ${c2.y - minY} ${ex} ${ey}`;
    }
    return (
      <svg
        key={element.id}
        data-aippt-element-id={element.id}
        viewBox={`${-8} ${-8} ${viewWidth + 16} ${viewHeight + 16}`}
        style={{
          position: "absolute",
          left: minX,
          top: minY,
          width: viewWidth,
          height: viewHeight,
          visibility: isHidden ? "hidden" : undefined,
          overflow: "visible",
        }}
      >
        <defs>
          <marker
            id={`arrow-${element.id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={normalizeColor(element.line.color)} />
          </marker>
          <marker
            id={`dot-${element.id}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <circle cx="5" cy="5" r="4" fill={normalizeColor(element.line.color)} />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={normalizeColor(element.line.color)}
          strokeWidth={element.line.width}
          strokeDasharray={element.line.dash === "dash" ? "10 8" : element.line.dash === "dot" ? "2 6" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerStart={
            element.line.beginArrowType === "triangle"
              ? `url(#arrow-${element.id})`
              : element.line.beginArrowType === "oval"
                ? `url(#dot-${element.id})`
                : undefined
          }
          markerEnd={
            element.line.endArrowType === "triangle"
              ? `url(#arrow-${element.id})`
              : element.line.endArrowType === "oval"
                ? `url(#dot-${element.id})`
                : undefined
          }
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (element.type === "table") {
    return (
      <div
        key={element.id}
        data-aippt-element-id={element.id}
        style={{
          ...boxStyle(element),
          visibility: isHidden ? "hidden" : undefined,
        }}
      >
        {renderTable(element)}
      </div>
    );
  }

  if (element.type === "chart") {
    return (
      <div key={element.id} data-aippt-element-id={element.id} style={boxStyle(element)}>
        {renderChart(element)}
      </div>
    );
  }

  if (element.type === "formula") {
    return (
      <div key={element.id} data-aippt-element-id={element.id} style={boxStyle(element)}>
        {renderFormula(element)}
      </div>
    );
  }

  if (element.type === "media") {
    return (
      <div key={element.id} data-aippt-element-id={element.id} style={boxStyle(element)}>
        {renderMedia(element)}
      </div>
    );
  }

  if (element.type === "group") {
    return (
      <div
        key={element.id}
        data-aippt-element-id={element.id}
        style={{
          ...boxStyle(element),
          visibility: isHidden ? "hidden" : undefined,
        }}
      >
        {element.elements.map((child) =>
          renderAipptElement(child, hiddenElementIds),
        )}
      </div>
    );
  }

  return null;
}

export function resolveSlideCanvasBackground(
  document: Pick<AipptSlideDocument, "background">,
  transparentBackground = false,
) {
  if (document.background?.type === "solid") {
    return normalizeColor(document.background.color);
  }
  return transparentBackground ? "transparent" : "#FFFFFF";
}

export function resolveSlideCanvasPointerEvents(
  transparentBackground = false,
  passthroughBackgroundInteractions = false,
) {
  return transparentBackground && passthroughBackgroundInteractions ? "none" : undefined;
}

export function resolveSlideElementPointerEvents(interactive = true) {
  return interactive ? "auto" : undefined;
}

export default function AipptSlideCanvas({
  document,
  hiddenElementIds = [],
  transparentBackground = false,
  passthroughBackgroundInteractions = false,
}: {
  document: AipptSlideDocument;
  hiddenElementIds?: string[];
  transparentBackground?: boolean;
  passthroughBackgroundInteractions?: boolean;
}) {
  const hiddenElementIdSet = new Set(hiddenElementIds);

  return (
    <div
      className="relative h-[720px] w-[1280px] overflow-hidden"
      style={{
        background: resolveSlideCanvasBackground(document, transparentBackground),
        pointerEvents: resolveSlideCanvasPointerEvents(
          transparentBackground,
          passthroughBackgroundInteractions,
        ),
      }}
    >
      {document.background?.type === "image" && (
        <img
          src={document.background.src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full"
        />
      )}
      {document.elements.map((element) =>
        renderAipptElement(element, hiddenElementIdSet),
      )}
    </div>
  );
}
