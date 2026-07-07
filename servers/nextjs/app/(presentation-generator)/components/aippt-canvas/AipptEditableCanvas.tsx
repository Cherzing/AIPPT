"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BringToFront,
  Copy,
  Film,
  FunctionSquare,
  Image as ImageIcon,
  LineChart,
  Music,
  SendToBack,
  Shapes,
  Table2,
  Trash2,
  Type,
} from "lucide-react";

import type {
  AipptFormulaElement,
  AipptImageElement,
  AipptLineElement,
  AipptMediaElement,
  AipptShapeElement,
  AipptSlideDocument,
  AipptSlideElement,
  AipptTableElement,
} from "@/lib/pptx-model/types";
import {
  addAipptElement,
  createAipptFormulaElement,
  createAipptImageElement,
  createAipptLineElement,
  createAipptMediaElement,
  createAipptShapeElement,
  createAipptTableElement,
  createAipptTextElement,
  duplicateAipptElement,
  moveAipptElementLayer,
} from "@/lib/pptx-model/editing";

import AipptSlideCanvas from "./AipptSlideCanvas";

type DragState =
  | {
      type: "move";
      id: string;
      startX: number;
      startY: number;
      original: AipptSlideElement;
      scale: number;
    }
  | {
      type: "resize";
      id: string;
      startX: number;
      startY: number;
      original: AipptSlideElement;
      scale: number;
    }
  | {
      type: "line-endpoint";
      id: string;
      endpoint: "start" | "end";
      startX: number;
      startY: number;
      original: AipptLineElement;
      scale: number;
    };

type InsertTool =
  | "text"
  | "shape"
  | "image"
  | "line"
  | "table"
  | "formula"
  | "video"
  | "audio";

type ShapePreset = {
  shape: AipptShapeElement["shape"];
  label: string;
  points?: string;
  path?: string;
};

type LinePreset = {
  lineType: NonNullable<AipptLineElement["lineType"]>;
  label: string;
  path: string;
  dash?: "solid" | "dash" | "dot";
  beginArrowType?: "none" | "triangle" | "oval";
  endArrowType?: "none" | "triangle" | "oval";
};

const SHAPE_PRESETS: ShapePreset[] = [
  { shape: "rect", label: "矩形", points: "0,0 100,0 100,100 0,100" },
  { shape: "roundRect", label: "圆角矩形", path: "M18 0 L82 0 Q100 0 100 18 L100 82 Q100 100 82 100 L18 100 Q0 100 0 82 L0 18 Q0 0 18 0 Z" },
  { shape: "ellipse", label: "椭圆", path: "M50 0 A50 50 0 1 1 49.9 0 Z" },
  { shape: "triangle", label: "三角形", points: "50,0 100,100 0,100" },
  { shape: "diamond", label: "菱形", points: "50,0 100,50 50,100 0,50" },
  { shape: "parallelogram", label: "平行四边形", points: "25,0 100,0 75,100 0,100" },
  { shape: "trapezoid", label: "梯形", points: "20,0 80,0 100,100 0,100" },
  { shape: "pentagon", label: "五边形", points: "50,0 100,38 82,100 18,100 0,38" },
  { shape: "hexagon", label: "六边形", points: "25,0 75,0 100,50 75,100 25,100 0,50" },
  { shape: "plus", label: "十字形", points: "38,0 62,0 62,38 100,38 100,62 62,62 62,100 38,100 38,62 0,62 0,38 38,38" },
  { shape: "rightArrow", label: "右箭头", points: "0,25 62,25 62,0 100,50 62,100 62,75 0,75" },
  { shape: "leftArrow", label: "左箭头", points: "100,25 38,25 38,0 0,50 38,100 38,75 100,75" },
  { shape: "upArrow", label: "上箭头", points: "25,100 25,38 0,38 50,0 100,38 75,38 75,100" },
  { shape: "downArrow", label: "下箭头", points: "25,0 75,0 75,62 100,62 50,100 0,62 25,62" },
  { shape: "cloud", label: "云形", path: "M25 75 C12 75 2 65 2 52 C2 40 11 31 23 30 C28 16 41 8 56 11 C67 13 76 21 80 32 C91 34 98 43 98 54 C98 66 88 75 76 75 Z" },
  { shape: "heart", label: "心形", path: "M50 88 C20 62 5 45 5 25 C5 10 17 0 31 0 C39 0 46 4 50 11 C54 4 61 0 69 0 C83 0 95 10 95 25 C95 45 80 62 50 88 Z" },
  { shape: "star5", label: "五角星", points: "50,0 61,35 98,35 68,57 79,92 50,70 21,92 32,57 2,35 39,35" },
];

const LINE_PRESETS: LinePreset[] = [
  { lineType: "straight", label: "直线", path: "M 5 50 L 95 50" },
  { lineType: "straight", label: "虚线", path: "M 5 50 L 95 50", dash: "dash" },
  { lineType: "straight", label: "单箭头", path: "M 5 50 L 95 50", endArrowType: "triangle" },
  { lineType: "straight", label: "虚线箭头", path: "M 5 50 L 95 50", dash: "dash", endArrowType: "triangle" },
  { lineType: "straight", label: "端点线", path: "M 5 50 L 95 50", endArrowType: "oval" },
  { lineType: "polyline", label: "折线", path: "M 10 20 L 10 80 L 90 80", endArrowType: "triangle" },
  { lineType: "elbow", label: "肘形折线", path: "M 10 20 L 50 20 L 50 80 L 90 80", endArrowType: "triangle" },
  { lineType: "curve", label: "曲线", path: "M 10 80 Q 30 20 90 70", endArrowType: "triangle" },
  { lineType: "cubic", label: "自由曲线", path: "M 10 75 C 35 5 60 95 90 25", endArrowType: "triangle" },
];

const STRAIGHT_LINE_PRESETS = LINE_PRESETS.slice(0, 5);
const BENT_LINE_PRESETS = LINE_PRESETS.slice(5);

function lineMarkerId(prefix: string, preset: LinePreset, index: number) {
  return `${prefix}-${preset.lineType}-${index}`;
}

function lineBounds(element: AipptLineElement) {
  const points = [
    { x: element.x, y: element.y },
    { x: element.x2, y: element.y2 },
    ...(element.points ?? []),
    ...(element.controlPoints ?? []),
  ];
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  return {
    x: minX,
    y: minY,
    w: Math.max(16, maxX - minX),
    h: Math.max(16, maxY - minY),
  };
}

function updateElement(
  document: AipptSlideDocument,
  id: string,
  updater: (element: AipptSlideElement) => AipptSlideElement,
): AipptSlideDocument {
  const updateList = (elements: AipptSlideElement[]): AipptSlideElement[] =>
    elements.map((element) => {
      if (element.id === id) return updater(element);
      if (element.type === "group") {
        return { ...element, elements: updateList(element.elements) };
      }
      return element;
    });

  return { ...document, elements: updateList(document.elements) };
}

function deleteElement(document: AipptSlideDocument, id: string): AipptSlideDocument {
  const removeFromList = (elements: AipptSlideElement[]): AipptSlideElement[] =>
    elements
      .filter((element) => element.id !== id)
      .map((element) =>
        element.type === "group"
          ? { ...element, elements: removeFromList(element.elements) }
          : element,
      );

  const deletedElementIds = Array.from(
    new Set([...(document.deletedElementIds ?? []), id]),
  );

  return {
    ...document,
    deletedElementIds,
    elements: removeFromList(document.elements),
  };
}

function findElement(
  elements: AipptSlideElement[],
  id: string,
): AipptSlideElement | null {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.type === "group") {
      const child = findElement(element.elements, id);
      if (child) return child;
    }
  }
  return null;
}

function selectedBoxStyle(element: AipptSlideElement): React.CSSProperties {
  return {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
    border: "2px solid #2563EB",
    boxShadow: "0 0 0 1px rgba(37, 99, 235, 0.2)",
    pointerEvents: "none",
    zIndex: 1000,
  };
}

function normalizeColor(color?: string) {
  if (!color) return undefined;
  return color.startsWith("#") ? color : `#${color}`;
}

function stripHash(color: string) {
  return color.replace(/^#/, "").toUpperCase();
}

function editorButtonStyle(active = false, disabled = false): React.CSSProperties {
  return {
    height: 32,
    minWidth: 42,
    borderRadius: 4,
    border: active ? "1px solid #FF6A4A" : "1px solid transparent",
    background: disabled ? "#F8FAFC" : active ? "#FFF1EC" : "transparent",
    color: disabled ? "#94A3B8" : active ? "#E84522" : "#334155",
    padding: "0 8px",
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.75 : 1,
  };
}

function toolbarButtonLabelStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

function fieldStyle(): React.CSSProperties {
  return {
    height: 28,
    width: "100%",
    border: "1px solid #D8E2EF",
    borderRadius: 7,
    padding: "0 8px",
    fontSize: 12,
    color: "#0F172A",
    background: "#FFFFFF",
  };
}

function editableTextStyle(
  element: Extract<AipptSlideElement, { type: "text" }>,
  isSelected: boolean,
  isDragging: boolean,
  isEditing: boolean,
): React.CSSProperties {
  const style = element.style;
  const margin = style.margin ?? [0, 0, 0, 0];

  return {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
    opacity: isSelected ? 1 : 0,
    zIndex: isSelected ? 1100 : -1,
    border: "none",
    background: "transparent",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
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
    cursor: isEditing ? "text" : isDragging ? "grabbing" : "grab",
  };
}

function editableTableStyle(element: AipptTableElement): React.CSSProperties {
  return {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
    zIndex: 1100,
    display: "grid",
    gridTemplateColumns: `repeat(${Math.max(1, element.columns.length)}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${Math.max(1, element.rows.length)}, minmax(0, 1fr))`,
    background: "#FFFFFF",
    fontFamily: element.style.fontFace,
    fontSize: element.style.fontSize,
    color: normalizeColor(element.style.color),
    boxSizing: "border-box",
    cursor: "grab",
  };
}

export default function AipptEditableCanvas({
  document,
  onChange,
  onInspectorChange,
}: {
  document: AipptSlideDocument;
  onChange: (document: AipptSlideDocument) => void;
  onInspectorChange?: (open: boolean) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const textEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingMediaToolRef = useRef<"image" | "video" | "audio" | null>(null);
  const pendingMediaPointRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<InsertTool | null>(null);
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showLinePanel, setShowLinePanel] = useState(false);
  const [showTablePanel, setShowTablePanel] = useState(false);
  const [tableHoverCell, setTableHoverCell] = useState<{ rows: number; cols: number } | null>(null);
  const [isCustomTable, setIsCustomTable] = useState(false);
  const [customTableRows, setCustomTableRows] = useState(3);
  const [customTableCols, setCustomTableCols] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTableCell, setEditingTableCell] = useState<{
    id: string;
    rowIndex: number;
    cellIndex: number;
  } | null>(null);
  const [selectedShape, setSelectedShape] = useState<AipptShapeElement["shape"]>("roundRect");
  const [selectedLinePreset, setSelectedLinePreset] = useState<LinePreset>(LINE_PRESETS[0]);
  const selectedElement = useMemo(
    () => (selectedId ? findElement(document.elements, selectedId) : null),
    [document.elements, selectedId],
  );
  const hiddenElementIds =
    (selectedElement?.type === "text" || selectedElement?.type === "table") && selectedId
      ? [selectedId]
      : [];
  const selectedIndex = selectedId
    ? document.elements.findIndex((element) => element.id === selectedId)
    : -1;

  useEffect(() => {
    onInspectorChange?.(Boolean(selectedElement));
    return () => onInspectorChange?.(false);
  }, [onInspectorChange, selectedElement]);

  const getScale = useCallback(() => {
    if (!canvasRef.current) return 1;
    const rect = canvasRef.current.getBoundingClientRect();
    return rect.width / 1280 || 1;
  }, []);

  const getCanvasPoint = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = rect.width / 1280 || 1;
    return {
      x: Math.max(0, Math.min(1280, (event.clientX - rect.left) / scale)),
      y: Math.max(0, Math.min(720, (event.clientY - rect.top) / scale)),
    };
  }, []);

  const commit = useCallback(
    (nextDocument: AipptSlideDocument) => {
      onChange(nextDocument);
    },
    [onChange],
  );

  useEffect(() => {
    if (selectedElement?.type !== "text" || editingTextId !== selectedElement.id) return;
    const frame = window.requestAnimationFrame(() => {
      textEditorRef.current?.focus();
      textEditorRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editingTextId, selectedElement?.id, selectedElement?.type]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (event.clientX - drag.startX) / drag.scale;
      const dy = (event.clientY - drag.startY) / drag.scale;

      commit(
        updateElement(document, drag.id, (element) => {
          if (drag.type === "line-endpoint" && element.type === "line") {
            const nextElement =
              drag.endpoint === "start"
                ? { ...element, x: drag.original.x + dx, y: drag.original.y + dy }
                : { ...element, x2: drag.original.x2 + dx, y2: drag.original.y2 + dy };
            const bounds = lineBounds(nextElement);
            return {
              ...nextElement,
              w: bounds.w,
              h: bounds.h,
            };
          }
          if (drag.type === "resize") {
            return {
              ...element,
              w: Math.max(16, drag.original.w + dx),
              h: Math.max(16, drag.original.h + dy),
            };
          }
          if (element.type === "line" && drag.original.type === "line") {
            const nextPoints = drag.original.points?.map((point) => ({ x: point.x + dx, y: point.y + dy }));
            const nextControlPoints = drag.original.controlPoints?.map((point) => ({ x: point.x + dx, y: point.y + dy }));
            return {
              ...element,
              x: drag.original.x + dx,
              y: drag.original.y + dy,
              x2: drag.original.x2 + dx,
              y2: drag.original.y2 + dy,
              points: nextPoints,
              controlPoints: nextControlPoints,
            };
          }
          return {
            ...element,
            x: drag.original.x + dx,
            y: drag.original.y + dy,
          };
        }),
      );
    };

    const onMouseUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [commit, document]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selectedId) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        commit(deleteElement(document, selectedId));
        setSelectedId(null);
        setEditingTextId(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        const next = duplicateAipptElement(document, selectedId);
        commit(next);
        const originalIndex = document.elements.findIndex((element) => element.id === selectedId);
        const copied = originalIndex >= 0 ? next.elements[originalIndex + 1] : null;
        if (copied) setSelectedId(copied.id);
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        commit(
          updateElement(document, selectedId, (element) => {
            if (element.type === "line") {
              const nextPoints = element.points?.map((point) => ({ x: point.x + dx, y: point.y + dy }));
              const nextControlPoints = element.controlPoints?.map((point) => ({ x: point.x + dx, y: point.y + dy }));
              return {
                ...element,
                x: element.x + dx,
                y: element.y + dy,
                x2: element.x2 + dx,
                y2: element.y2 + dy,
                points: nextPoints,
                controlPoints: nextControlPoints,
              };
          }
            return { ...element, x: element.x + dx, y: element.y + dy };
          }),
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commit, document, selectedId]);

  const startElementDrag = (
    event: React.MouseEvent<HTMLElement>,
    element: AipptSlideElement,
  ) => {
    if (element.locked) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(element.id);
    if (element.type !== "text") setEditingTextId(null);
    setEditingTableCell(null);
    dragRef.current = {
      type: "move",
      id: element.id,
      startX: event.clientX,
      startY: event.clientY,
      original: element,
      scale: getScale(),
    };
    setIsDragging(true);
  };

  const onCanvasMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (activeTool) {
      event.preventDefault();
      const point = getCanvasPoint(event);
      insertToolAt(activeTool, point.x, point.y);
      setActiveTool(null);
      setEditingTextId(null);
      return;
    }
    const elementNode = target.closest("[data-aippt-element-id]") as HTMLElement | null;
    const id = elementNode?.dataset.aipptElementId;
    if (!id) {
      setSelectedId(null);
      setEditingTextId(null);
      return;
    }
    const element = findElement(document.elements, id);
    if (!element || element.locked) return;
    startElementDrag(event, element);
  };

  const onTableEditorMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
    element: AipptTableElement,
  ) => {
    if (editingTableCell?.id === element.id) return;
    startElementDrag(event, element);
  };

  const onResizeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedElement || !selectedId) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      type: "resize",
      id: selectedId,
      startX: event.clientX,
      startY: event.clientY,
      original: selectedElement,
      scale: getScale(),
    };
  };

  const onLineEndpointMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
    endpoint: "start" | "end",
  ) => {
    if (!selectedElement || selectedElement.type !== "line" || !selectedId) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      type: "line-endpoint",
      id: selectedId,
      endpoint,
      startX: event.clientX,
      startY: event.clientY,
      original: selectedElement,
      scale: getScale(),
    };
  };

  const onTextBlur = (id: string, value: string) => {
    commit(
      updateElement(document, id, (element) =>
        element.type === "text" ? { ...element, text: value } : element,
      ),
    );
  };

  const onTextInput = (id: string, value: string) => {
    commit(
      updateElement(document, id, (element) =>
        element.type === "text" ? { ...element, text: value } : element,
      ),
    );
  };

  const updateTableCellText = (
    id: string,
    rowIndex: number,
    cellIndex: number,
    value: string,
  ) => {
    commit(
      updateElement(document, id, (element) =>
        element.type === "table"
          ? {
              ...element,
              rows: element.rows.map((row, currentRowIndex) =>
                currentRowIndex === rowIndex
                  ? row.map((cell, currentCellIndex) =>
                      currentCellIndex === cellIndex ? { ...cell, text: value } : cell,
                    )
                  : row,
              ),
            }
          : element,
      ),
    );
  };

  const insertElement = (element: AipptSlideElement) => {
    commit(addAipptElement(document, element));
    setSelectedId(element.id);
  };

  const openMediaPicker = (tool: "image" | "video" | "audio", x: number, y: number) => {
    pendingMediaToolRef.current = tool;
    pendingMediaPointRef.current = { x, y };
    const input = fileInputRef.current;
    if (!input) return;
    input.accept =
      tool === "image" ? "image/*" : tool === "video" ? "video/*" : "audio/*";
    input.value = "";
    input.click();
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error("读取文件失败"));
      reader.readAsDataURL(file);
    });

  const getImageSize = (src: string) =>
    new Promise<{ width: number; height: number }>((resolve) => {
      const image = new Image();
      image.onload = () =>
        resolve({ width: image.naturalWidth || 320, height: image.naturalHeight || 180 });
      image.onerror = () => resolve({ width: 320, height: 180 });
      image.src = src;
    });

  const uploadImageFile = async (file: File, fallbackSrc: string) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/v1/ppt/images/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) return fallbackSrc;
      const payload = await response.json();
      return payload?.url ?? payload?.path ?? payload?.src ?? fallbackSrc;
    } catch {
      return fallbackSrc;
    }
  };

  const insertPickedMedia = async (file: File) => {
    const tool = pendingMediaToolRef.current;
    const point = pendingMediaPointRef.current;
    pendingMediaToolRef.current = null;
    pendingMediaPointRef.current = null;
    if (!tool || !point) return;

    const idSuffix = Date.now().toString(36);
    const place = <T extends AipptSlideElement>(element: T, width = element.w, height = element.h): T => ({
      ...element,
      x: Math.max(0, Math.min(1280 - width, point.x - width / 2)),
      y: Math.max(0, Math.min(720 - height, point.y - height / 2)),
      w: width,
      h: height,
    });

    if (tool === "image") {
      const dataUrl = await fileToDataUrl(file);
      const src = await uploadImageFile(file, dataUrl);
      const imageSize = await getImageSize(dataUrl);
      const maxWidth = 520;
      const maxHeight = 320;
      const ratio = Math.min(maxWidth / imageSize.width, maxHeight / imageSize.height, 1);
      const width = Math.max(120, Math.round(imageSize.width * ratio));
      const height = Math.max(80, Math.round(imageSize.height * ratio));
      insertElement({
        ...(place(
          createAipptImageElement(`image-${idSuffix}`) as AipptImageElement,
          width,
          height,
        ) as AipptImageElement),
        src,
        fit: "contain",
        name: file.name || "图片",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const mediaType = tool === "video" ? "video" : "audio";
    const width = mediaType === "video" ? 420 : 360;
    const height = mediaType === "video" ? 236 : 72;
    insertElement({
      ...(place(
        createAipptMediaElement(`media-${idSuffix}`, mediaType) as AipptMediaElement,
        width,
        height,
      ) as AipptMediaElement),
      src: objectUrl,
      title: file.name || (mediaType === "video" ? "本地视频" : "本地音频"),
      name: file.name || (mediaType === "video" ? "视频" : "音频"),
    });
  };

  const onMediaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    void insertPickedMedia(file);
  };

  const createTableBySize = (rows: number, cols: number) => {
    const safeRows = Math.max(1, Math.min(20, Math.round(rows)));
    const safeCols = Math.max(1, Math.min(20, Math.round(cols)));
    const idSuffix = Date.now().toString(36);
    const width = Math.min(900, Math.max(220, safeCols * 92));
    const height = Math.min(520, Math.max(90, safeRows * 36));
    const columnWidth = Math.round(width / safeCols);
    const table = createAipptTableElement(`table-${idSuffix}`) as AipptTableElement;
    insertElement({
      ...table,
      x: Math.round((1280 - width) / 2),
      y: Math.round((720 - height) / 2),
      w: width,
      h: height,
      columns: Array.from({ length: safeCols }, () => columnWidth),
      rows: Array.from({ length: safeRows }, (_, rowIndex) =>
        Array.from({ length: safeCols }, (_, colIndex) => ({
          text: rowIndex === 0 ? `标题${colIndex + 1}` : "",
          fill: rowIndex === 0 ? "057DC1" : undefined,
          color: rowIndex === 0 ? "FFFFFF" : "111827",
          bold: rowIndex === 0,
        })),
      ),
      style: {
        ...table.style,
        fontSize: 13,
        borderColor: "D6DDE3",
        margin: [4, 6, 4, 6],
      },
      name: `${safeRows}×${safeCols} 表格`,
    });
    setShowTablePanel(false);
    setTableHoverCell(null);
    setIsCustomTable(false);
  };

  const insertToolAt = (tool: InsertTool, x: number, y: number) => {
    const idSuffix = Date.now().toString(36);
    const place = <T extends AipptSlideElement>(element: T, width = element.w, height = element.h): T => ({
      ...element,
      x: Math.max(0, Math.min(1280 - width, x - width / 2)),
      y: Math.max(0, Math.min(720 - height, y - height / 2)),
      w: width,
      h: height,
    });

    if (tool === "text") {
      insertElement(place(createAipptTextElement(`text-${idSuffix}`, "双击编辑文本"), 280, 52));
      return;
    }
    if (tool === "shape") {
      insertElement({
        ...(place(createAipptShapeElement(`shape-${idSuffix}`), 220, 120) as AipptShapeElement),
        shape: selectedShape,
        radius: selectedShape === "roundRect" ? 12 : undefined,
      });
      return;
    }
    if (tool === "image") {
      openMediaPicker("image", x, y);
      return;
    }
    if (tool === "line") {
      const element = createAipptLineElement(`line-${idSuffix}`) as AipptLineElement;
      const x1 = Math.max(0, Math.min(1180, x - 120));
      const y1 = y;
      const x2 = Math.max(80, Math.min(1280, x + 120));
      const y2 = y + (selectedLinePreset.lineType === "straight" ? 0 : 80);
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      insertElement({
        ...element,
        lineType: selectedLinePreset.lineType,
        x: x1,
        y: y1,
        x2,
        y2,
        w: 240,
        h: Math.abs(y2 - y1),
        points:
          selectedLinePreset.lineType === "polyline"
            ? [{ x: x1, y: y2 }]
            : selectedLinePreset.lineType === "elbow"
              ? [
                  { x: midX, y: y1 },
                  { x: midX, y: y2 },
                ]
              : undefined,
        controlPoints:
          selectedLinePreset.lineType === "curve"
            ? [{ x: midX, y: Math.min(y1, y2) - 70 }]
            : selectedLinePreset.lineType === "cubic"
              ? [
                  { x: x1 + 80, y: y1 - 90 },
                  { x: x2 - 80, y: y2 + 90 },
                ]
              : undefined,
        line: {
          ...element.line,
          dash: selectedLinePreset.dash ?? "solid",
          beginArrowType: selectedLinePreset.beginArrowType ?? "none",
          endArrowType: selectedLinePreset.endArrowType ?? "none",
        },
      });
      return;
    }
    if (tool === "table") {
      createTableBySize(3, 3);
      return;
    }
    if (tool === "formula") {
      const element = place(
        createAipptFormulaElement(`formula-${idSuffix}`) as AipptFormulaElement,
        320,
        86,
      );
      const latex = window.prompt("请输入公式（LaTeX 或普通公式文本）", element.latex);
      insertElement(
        latex?.trim()
          ? { ...element, latex: latex.trim(), displayText: latex.trim().replaceAll("^2", "²") }
          : element,
      );
      return;
    }
    if (tool === "video" || tool === "audio") {
      openMediaPicker(tool, x, y);
    }
  };

  const chooseTool = (tool: InsertTool) => {
    setActiveTool((current) => (current === tool ? null : tool));
    setShowTablePanel(false);
    setShowShapePanel(false);
    setShowLinePanel(false);
    setSelectedId(null);
    setEditingTextId(null);
  };

  const addText = () => {
    chooseTool("text");
  };

  const addShape = () => {
    setShowShapePanel((current) => !current);
    setShowLinePanel(false);
    setShowTablePanel(false);
  };

  const addImage = () => {
    chooseTool("image");
  };

  const addLine = () => {
    setShowLinePanel((current) => !current);
    setShowShapePanel(false);
    setShowTablePanel(false);
    setActiveTool("line");
    setSelectedId(null);
    setEditingTextId(null);
  };

  const addTable = () => {
    setShowTablePanel((current) => !current);
    setShowShapePanel(false);
    setShowLinePanel(false);
    setActiveTool(null);
    setSelectedId(null);
    setEditingTextId(null);
  };

  const addFormula = () => {
    chooseTool("formula");
  };

  const addMedia = (mediaType: "video" | "audio") => {
    chooseTool(mediaType);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const next = duplicateAipptElement(document, selectedId);
    commit(next);
    const originalIndex = document.elements.findIndex((element) => element.id === selectedId);
    const copied = originalIndex >= 0 ? next.elements[originalIndex + 1] : null;
    if (copied) setSelectedId(copied.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    commit(deleteElement(document, selectedId));
    setSelectedId(null);
    setEditingTextId(null);
  };

  const moveLayer = (direction: "front" | "back" | "forward" | "backward") => {
    if (!selectedId) return;
    commit(moveAipptElementLayer(document, selectedId, direction));
  };

  const updateSelected = (updater: (element: AipptSlideElement) => AipptSlideElement) => {
    if (!selectedId) return;
    commit(updateElement(document, selectedId, updater));
  };

  const updateTextStyle = (
    patch: Partial<Extract<AipptSlideElement, { type: "text" }>["style"]>,
  ) => {
    updateSelected((element) =>
      element.type === "text"
        ? { ...element, style: { ...element.style, ...patch } }
        : element,
    );
  };

  const updateShapeFill = (color: string) => {
    updateSelected((element) =>
      element.type === "shape"
        ? { ...element, fill: { ...(element.fill ?? {}), color: stripHash(color) } }
        : element,
    );
  };

  const updateShapeLine = (color: string) => {
    updateSelected((element) =>
      element.type === "shape"
        ? {
            ...element,
            line: {
              color: stripHash(color),
              width: element.line?.width ?? 1,
              dash: element.line?.dash,
            },
          }
        : element,
    );
  };

  const alignSelected = (align: "left" | "center" | "right") => {
    updateTextStyle({ align });
  };

  const updateSelectedNumber = (
    key: "x" | "y" | "w" | "h" | "opacity",
    value: number,
  ) => {
    updateSelected((element) => ({
      ...element,
      [key]: key === "opacity" ? Math.max(0.05, Math.min(1, value)) : value,
    }));
  };

  return (
    <div
      ref={canvasRef}
      className="relative h-[720px] w-[1280px] overflow-visible"
      style={{ cursor: activeTool ? "crosshair" : isDragging ? "grabbing" : "default" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onMediaFileChange}
      />
      <div
        className="absolute left-0 top-[-56px] z-[1400] flex h-[44px] w-[1280px] items-center gap-2 border-b border-slate-200 bg-white px-4 shadow-none"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" title="选择后点击画布插入文本" style={editorButtonStyle(activeTool === "text")} onClick={addText}>
          <span style={toolbarButtonLabelStyle()}><Type size={15} />文本</span>
        </button>
        <button type="button" title="选择后点击画布插入形状" style={editorButtonStyle(activeTool === "shape")} onClick={addShape}>
          <span style={toolbarButtonLabelStyle()}><Shapes size={15} />形状</span>
        </button>
        <button type="button" title="选择后点击画布插入图片" style={editorButtonStyle(activeTool === "image")} onClick={addImage}>
          <span style={toolbarButtonLabelStyle()}><ImageIcon size={15} />图片</span>
        </button>
        <button type="button" title="选择后点击画布插入线条" style={editorButtonStyle(activeTool === "line")} onClick={addLine}>
          <span style={toolbarButtonLabelStyle()}><LineChart size={15} />线条</span>
        </button>
        <button type="button" title="打开表格生成器" style={editorButtonStyle(showTablePanel)} onClick={addTable}>
          <span style={toolbarButtonLabelStyle()}><Table2 size={15} />表格</span>
        </button>
        <button type="button" title="选择后点击画布插入公式" style={editorButtonStyle(activeTool === "formula")} onClick={addFormula}>
          <span style={toolbarButtonLabelStyle()}><FunctionSquare size={15} />公式</span>
        </button>
        <button type="button" title="选择后点击画布插入视频" style={editorButtonStyle(activeTool === "video")} onClick={() => addMedia("video")}>
          <span style={toolbarButtonLabelStyle()}><Film size={15} />视频</span>
        </button>
        <button type="button" title="选择后点击画布插入音频" style={editorButtonStyle(activeTool === "audio")} onClick={() => addMedia("audio")}>
          <span style={toolbarButtonLabelStyle()}><Music size={15} />音频</span>
        </button>
        <span className="mx-2 h-5 w-px bg-slate-200" />
        <button type="button" title="复制所选元素" style={editorButtonStyle(false, !selectedId)} disabled={!selectedId} onClick={duplicateSelected}>
          <span style={toolbarButtonLabelStyle()}><Copy size={15} />复制</span>
        </button>
        <button type="button" title="删除所选元素" style={editorButtonStyle(false, !selectedId)} disabled={!selectedId} onClick={deleteSelected}>
          <span style={toolbarButtonLabelStyle()}><Trash2 size={15} />删除</span>
        </button>
        <span className="mx-2 h-5 w-px bg-slate-200" />
        <button type="button" title="移到顶层" style={editorButtonStyle(false, !selectedId)} disabled={!selectedId} onClick={() => moveLayer("front")}>
          <span style={toolbarButtonLabelStyle()}><BringToFront size={15} />置顶</span>
        </button>
        <button type="button" title="上移一层" style={editorButtonStyle(false, !selectedId)} disabled={!selectedId} onClick={() => moveLayer("forward")}>上移</button>
        <button type="button" title="下移一层" style={editorButtonStyle(false, !selectedId)} disabled={!selectedId} onClick={() => moveLayer("backward")}>下移</button>
        <button type="button" title="移到底层" style={editorButtonStyle(false, !selectedId)} disabled={!selectedId} onClick={() => moveLayer("back")}>
          <span style={toolbarButtonLabelStyle()}><SendToBack size={15} />置底</span>
        </button>
      </div>
      {showTablePanel && (
        <div
          className="absolute left-[286px] top-[-20px] z-[1450] w-[312px] rounded-sm border border-slate-200 bg-white p-3 shadow-xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-3 flex h-7 items-center justify-between bg-[#F7F7F7] px-2 text-sm text-slate-700">
            <span>表格 {tableHoverCell ? `${tableHoverCell.rows} × ${tableHoverCell.cols}` : ""}</span>
            <button
              type="button"
              className="text-sm text-slate-700 hover:text-[#FF6A4A]"
              onClick={() => setIsCustomTable((current) => !current)}
            >
              {isCustomTable ? "返回" : "自定义"}
            </button>
          </div>
          {!isCustomTable ? (
            <div
              className="grid grid-cols-10 gap-[4px] px-1 pb-1"
              onMouseLeave={() => setTableHoverCell(null)}
            >
              {Array.from({ length: 100 }, (_, index) => {
                const row = Math.floor(index / 10) + 1;
                const col = (index % 10) + 1;
                const active = Boolean(
                  tableHoverCell && row <= tableHoverCell.rows && col <= tableHoverCell.cols,
                );
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={`插入 ${row} 行 ${col} 列表格`}
                    className="h-[23px] w-[23px] border"
                    style={{
                      borderColor: active ? "#FF6A4A" : "#DCDCDC",
                      background: active ? "rgba(255, 106, 74, 0.12)" : "#F7F7F7",
                    }}
                    onMouseEnter={() => setTableHoverCell({ rows: row, cols: col })}
                    onClick={() => createTableBySize(row, col)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 px-1 pb-1">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <span className="w-14">行数：</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={customTableRows}
                  onChange={(event) => setCustomTableRows(Number(event.currentTarget.value))}
                  style={fieldStyle()}
                />
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <span className="w-14">列数：</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={customTableCols}
                  onChange={(event) => setCustomTableCols(Number(event.currentTarget.value))}
                  style={fieldStyle()}
                />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    setShowTablePanel(false);
                    setIsCustomTable(false);
                  }}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="rounded bg-[#FF6A4A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#E84522]"
                  onClick={() => createTableBySize(customTableRows, customTableCols)}
                >
                  确认
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {showShapePanel && (
        <div
          className="absolute left-[54px] top-[-20px] z-[1450] w-[328px] rounded-md border border-slate-200 bg-white p-3 shadow-xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700">选择预设图形</div>
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
              onClick={() => setShowShapePanel(false)}
            >
              关闭
            </button>
          </div>
          <div className="mb-2 border-l-4 border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
            基础图形
          </div>
          <div className="grid grid-cols-6 gap-2">
            {SHAPE_PRESETS.map((preset) => (
              <button
                key={preset.shape}
                type="button"
                title={preset.label}
                className="flex h-10 items-center justify-center rounded border bg-white hover:border-blue-300 hover:bg-blue-50"
                style={{
                  borderColor: selectedShape === preset.shape ? "#2563EB" : "#E2E8F0",
                  background: selectedShape === preset.shape ? "#EFF6FF" : "#FFFFFF",
                }}
                onClick={() => {
                  setSelectedShape(preset.shape);
                  setActiveTool("shape");
                  setShowShapePanel(false);
                  setSelectedId(null);
                }}
              >
                <svg viewBox="0 0 100 100" className="h-6 w-6 overflow-visible">
                  {preset.points ? (
                    <polygon
                      points={preset.points}
                      fill={selectedShape === preset.shape ? "#DBEAFE" : "transparent"}
                      stroke={selectedShape === preset.shape ? "#2563EB" : "#64748B"}
                      strokeWidth="7"
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : (
                    <path
                      d={preset.path}
                      fill={selectedShape === preset.shape ? "#DBEAFE" : "transparent"}
                      stroke={selectedShape === preset.shape ? "#2563EB" : "#64748B"}
                      strokeWidth="7"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </svg>
              </button>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            当前：{SHAPE_PRESETS.find((preset) => preset.shape === selectedShape)?.label}，点击幻灯片插入。
          </div>
        </div>
      )}
      {showLinePanel && (
        <div
          className="absolute left-[178px] top-[-20px] z-[1450] w-[286px] rounded-sm border border-slate-200 bg-white p-3 shadow-xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mb-2 border-l-4 border-slate-300 bg-[#F1F1F1] px-2 py-1 text-sm text-slate-600">
            直线
          </div>
          <div className="mb-4 grid grid-cols-5 gap-x-3 gap-y-2 px-1">
            {STRAIGHT_LINE_PRESETS.map((preset, index) => {
              const arrowId = lineMarkerId("line-panel-arrow", preset, index);
              const dotId = lineMarkerId("line-panel-dot", preset, index);
              return (
                <button
                  key={`straight-${preset.label}`}
                  type="button"
                  title={preset.label}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded hover:bg-slate-100"
                  onClick={() => {
                    setSelectedLinePreset(preset);
                    setActiveTool("line");
                    setShowLinePanel(false);
                    setSelectedId(null);
                  }}
                >
                  <svg viewBox="0 0 100 100" className="h-9 w-9 overflow-hidden">
                    <defs>
                      <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
                      </marker>
                      <marker id={dotId} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                        <circle cx="5" cy="5" r="4" fill="#999" />
                      </marker>
                    </defs>
                    <path
                      d={preset.path}
                      fill="none"
                      stroke="#999"
                      strokeWidth="6"
                      strokeDasharray={preset.dash === "dash" ? "12 8" : undefined}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd={
                        preset.endArrowType === "triangle"
                          ? `url(#${arrowId})`
                          : preset.endArrowType === "oval"
                            ? `url(#${dotId})`
                            : undefined
                      }
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
          <div className="mb-2 border-l-4 border-slate-300 bg-[#F1F1F1] px-2 py-1 text-sm text-slate-600">
            折线、曲线
          </div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-2 px-1">
            {BENT_LINE_PRESETS.map((preset, index) => {
              const arrowId = lineMarkerId("line-panel-bent-arrow", preset, index);
              return (
                <button
                  key={`bent-${preset.label}`}
                  type="button"
                  title={preset.label}
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded hover:bg-slate-100"
                  onClick={() => {
                    setSelectedLinePreset(preset);
                    setActiveTool("line");
                    setShowLinePanel(false);
                    setSelectedId(null);
                  }}
                >
                  <svg viewBox="0 0 100 100" className="h-10 w-10 overflow-hidden">
                    <defs>
                      <marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
                      </marker>
                    </defs>
                    <path
                      d={preset.path}
                      fill="none"
                      stroke="#999"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd={preset.endArrowType === "triangle" ? `url(#${arrowId})` : undefined}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div onMouseDown={onCanvasMouseDown}>
        <AipptSlideCanvas document={document} hiddenElementIds={hiddenElementIds} />
      </div>
      {activeTool && (
        <div className="pointer-events-none absolute left-4 top-4 z-[1200] rounded bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-white">
          已选择“{
            activeTool === "text"
              ? "文本"
              : activeTool === "shape"
                ? `形状：${SHAPE_PRESETS.find((preset) => preset.shape === selectedShape)?.label ?? "形状"}`
                : activeTool === "image"
                  ? "图片"
                  : activeTool === "line"
                    ? `线条：${selectedLinePreset.label}`
                    : activeTool === "table"
                        ? "表格"
                        : activeTool === "formula"
                          ? "公式"
                          : activeTool === "video"
                            ? "视频"
                            : "音频"
          }”，点击幻灯片插入
        </div>
      )}
      {document.elements.map((element) => {
        if (element.type === "text") {
          return (
            <textarea
              key={`edit-${element.id}`}
              ref={selectedId === element.id ? textEditorRef : undefined}
              value={element.text}
              readOnly={editingTextId !== element.id}
              onChange={(event) => onTextInput(element.id, event.currentTarget.value)}
              onBlur={(event) => {
                onTextBlur(element.id, event.currentTarget.value);
                setEditingTextId(null);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                setSelectedId(element.id);
                setEditingTextId(element.id);
                window.requestAnimationFrame(() => {
                  event.currentTarget.focus();
                  event.currentTarget.select();
                });
              }}
              onMouseDown={(event) => {
                if (event.detail >= 2 || editingTextId === element.id) {
                  event.stopPropagation();
                  return;
                }
                startElementDrag(event, element);
              }}
              style={editableTextStyle(
                element,
                selectedId === element.id,
                isDragging,
                editingTextId === element.id,
              )}
            />
          );
        }
        if (element.type === "table" && selectedId === element.id) {
          const borderColor = normalizeColor(element.style.borderColor ?? "D6DDE3") ?? "#D6DDE3";
          return (
            <div
              key={`edit-table-${element.id}`}
              data-aippt-element-id={element.id}
              data-aippt-table-editor="true"
              style={editableTableStyle(element)}
              onMouseDown={(event) => onTableEditorMouseDown(event, element)}
            >
              {element.rows.flatMap((row, rowIndex) =>
                row.map((cell, cellIndex) => {
                  const isEditing =
                    editingTableCell?.id === element.id &&
                    editingTableCell.rowIndex === rowIndex &&
                    editingTableCell.cellIndex === cellIndex;
                  return (
                    <textarea
                      key={`cell-${element.id}-${rowIndex}-${cellIndex}`}
                      value={cell.text}
                      readOnly={!isEditing}
                      title={isEditing ? "正在编辑单元格" : "双击编辑"}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        setEditingTableCell({ id: element.id, rowIndex, cellIndex });
                        const target = event.currentTarget;
                        window.requestAnimationFrame(() => {
                          target.focus();
                          target.select();
                        });
                      }}
                      onFocus={() => {
                        if (isEditing) return;
                      }}
                      onChange={(event) =>
                        updateTableCellText(element.id, rowIndex, cellIndex, event.currentTarget.value)
                      }
                      onBlur={() => setEditingTableCell(null)}
                      onMouseDown={(event) => {
                        if (isEditing) event.stopPropagation();
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        resize: "none",
                        border: `1px solid ${borderColor}`,
                        outline: isEditing ? "1px solid #FF6A4A" : "none",
                        background: normalizeColor(cell.fill) ?? "#FFFFFF",
                        color: normalizeColor(cell.color ?? element.style.color),
                        fontFamily: element.style.fontFace,
                        fontSize: element.style.fontSize,
                        fontWeight: cell.bold ? 700 : 400,
                        textAlign: cell.align ?? "center",
                        padding: "4px 6px",
                        lineHeight: 1.25,
                        overflow: "hidden",
                        boxSizing: "border-box",
                        cursor: isEditing ? "text" : "move",
                        pointerEvents: "auto",
                      }}
                    />
                  );
                }),
              )}
            </div>
          );
        }
        return null;
      })}
      {selectedElement &&
        (() => {
          const selectionBounds = selectedElement.type === "line" ? lineBounds(selectedElement) : selectedElement;
          const label =
            selectedElement.type === "text"
              ? "文本"
              : selectedElement.type === "shape"
                ? "形状"
                : selectedElement.type === "line"
                  ? "线条"
                  : selectedElement.type;
          return (
            <>
              <div style={selectedBoxStyle({ ...selectedElement, ...selectionBounds })} />
              <div
                className="absolute rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white shadow"
                style={{
                  left: selectionBounds.x,
                  top: Math.max(4, selectionBounds.y - 28),
                  zIndex: 1200,
                }}
              >
                {label}
                <span className="ml-2 opacity-80">
                  {Math.round(selectionBounds.w)}×{Math.round(selectionBounds.h)}
                </span>
              </div>
              {selectedElement.type === "line" ? (
                <>
                  <div
                    onMouseDown={(event) => onLineEndpointMouseDown(event, "start")}
                    className="absolute h-3.5 w-3.5 cursor-crosshair rounded-full border-2 border-white bg-blue-600 shadow"
                    title="拖动调整线条起点"
                    style={{
                      left: selectedElement.x - 7,
                      top: selectedElement.y - 7,
                      zIndex: 1210,
                    }}
                  />
                  <div
                    onMouseDown={(event) => onLineEndpointMouseDown(event, "end")}
                    className="absolute h-3.5 w-3.5 cursor-crosshair rounded-full border-2 border-white bg-blue-600 shadow"
                    title="拖动调整线条终点"
                    style={{
                      left: selectedElement.x2 - 7,
                      top: selectedElement.y2 - 7,
                      zIndex: 1210,
                    }}
                  />
                </>
              ) : (
                <div
                  onMouseDown={onResizeMouseDown}
                  className="absolute h-3 w-3 cursor-se-resize rounded-full bg-blue-600"
                  style={{
                    left: selectedElement.x + selectedElement.w - 6,
                    top: selectedElement.y + selectedElement.h - 6,
                    zIndex: 1200,
                  }}
                />
              )}
            </>
          );
        })()}
      {selectedElement && (
        <>
          <style>
            {`@keyframes aipptDesignPanelIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}`}
          </style>
          <div
            className="absolute z-[1340] w-[286px] overflow-hidden rounded-r-2xl border border-l border-slate-200 bg-white/98 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur"
            style={{
              left: "calc(100% + 12px)",
              top: -56,
              height: 776,
              animation: "aipptDesignPanelIn 180ms ease-out both",
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex h-[50px] items-center border-b border-slate-200 bg-white px-4 text-sm">
              <span className="font-semibold text-slate-900">设计</span>
              <span className="ml-auto text-[11px] text-slate-400">
                {selectedIndex >= 0 ? `第 ${selectedIndex + 1} 层` : ""}
              </span>
            </div>
        <div className="h-[calc(100%-50px)] overflow-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">元素样式</div>
          <div className="text-[11px] text-slate-400">
            {selectedIndex >= 0 ? `第 ${selectedIndex + 1} 层` : "未选择"}
          </div>
        </div>
        {selectedElement && (
          <div className="mb-4 space-y-3 rounded-xl bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2">
              {(["x", "y", "w", "h"] as const).map((key) => (
                <label key={key} className="block text-xs font-semibold text-slate-600">
                  {key.toUpperCase()}
                  <input
                    type="number"
                    value={Math.round(selectedElement[key])}
                    onChange={(event) =>
                      updateSelectedNumber(key, Number(event.target.value) || 0)
                    }
                    style={fieldStyle()}
                  />
                </label>
              ))}
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              透明度
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={selectedElement.opacity ?? 1}
                onChange={(event) =>
                  updateSelectedNumber("opacity", Number(event.target.value))
                }
                className="mt-1 w-full"
              />
            </label>
            <button
              type="button"
              style={editorButtonStyle(Boolean(selectedElement.locked))}
              onClick={() =>
                updateSelected((element) => ({
                  ...element,
                  locked: !element.locked,
                }))
              }
            >
              {selectedElement.locked ? "已锁定元素" : "锁定元素"}
            </button>
          </div>
        )}
        {selectedElement?.type === "text" && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              字体大小
              <input
                type="number"
                min={8}
                max={96}
                value={selectedElement.style.fontSize}
                onChange={(event) => updateTextStyle({ fontSize: Number(event.target.value) || 12 })}
                style={fieldStyle()}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              文字颜色
              <input
                type="color"
                value={normalizeColor(selectedElement.style.color) ?? "#111827"}
                onChange={(event) => updateTextStyle({ color: stripHash(event.target.value) })}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white"
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" style={editorButtonStyle(selectedElement.style.bold)} onClick={() => updateTextStyle({ bold: !selectedElement.style.bold })}>加粗</button>
              <button type="button" style={editorButtonStyle(selectedElement.style.italic)} onClick={() => updateTextStyle({ italic: !selectedElement.style.italic })}>斜体</button>
              <button type="button" style={editorButtonStyle(selectedElement.style.underline)} onClick={() => updateTextStyle({ underline: !selectedElement.style.underline })}>下划线</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" style={editorButtonStyle(selectedElement.style.align === "left")} onClick={() => alignSelected("left")}>左</button>
              <button type="button" style={editorButtonStyle(selectedElement.style.align === "center")} onClick={() => alignSelected("center")}>中</button>
              <button type="button" style={editorButtonStyle(selectedElement.style.align === "right")} onClick={() => alignSelected("right")}>右</button>
            </div>
          </div>
        )}
        {selectedElement?.type === "shape" && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              填充颜色
              <input
                type="color"
                value={normalizeColor(selectedElement.fill?.color) ?? "#F1F6FB"}
                onChange={(event) => updateShapeFill(event.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              边框颜色
              <input
                type="color"
                value={normalizeColor(selectedElement.line?.color) ?? "#057DC1"}
                onChange={(event) => updateShapeLine(event.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              边框宽度
              <input
                type="number"
                min={0}
                max={12}
                value={selectedElement.line?.width ?? 0}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "shape"
                      ? {
                          ...element,
                          line: {
                            color: element.line?.color ?? "057DC1",
                            width: Number(event.target.value) || 0,
                            dash: element.line?.dash,
                          },
                        }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
          </div>
        )}
        {selectedElement?.type === "image" && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              图片地址
              <input
                type="text"
                value={selectedElement.src}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "image"
                      ? { ...element, src: event.target.value }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["cover", "contain", "stretch"] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  style={editorButtonStyle(selectedElement.fit === fit)}
                  onClick={() =>
                    updateSelected((element) =>
                      element.type === "image" ? { ...element, fit } : element,
                    )
                  }
                >
                  {fit === "cover" ? "裁切" : fit === "contain" ? "完整" : "拉伸"}
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedElement?.type === "line" && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              线条颜色
              <input
                type="color"
                value={normalizeColor(selectedElement.line.color) ?? "#057DC1"}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "line"
                      ? { ...element, line: { ...element.line, color: stripHash(event.target.value) } }
                      : element,
                  )
                }
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              线宽
              <input
                type="number"
                min={1}
                max={16}
                value={selectedElement.line.width}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "line"
                      ? { ...element, line: { ...element.line, width: Number(event.target.value) || 1 } }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
          </div>
        )}
        {selectedElement?.type === "chart" && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              图表标题
              <input
                type="text"
                value={selectedElement.title ?? ""}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "chart"
                      ? { ...element, title: event.target.value }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["bar", "line"] as const).map((chartType) => (
                <button
                  key={chartType}
                  type="button"
                  style={editorButtonStyle(selectedElement.chartType === chartType)}
                  onClick={() =>
                    updateSelected((element) =>
                      element.type === "chart" ? { ...element, chartType } : element,
                    )
                  }
                >
                  {chartType === "bar" ? "柱状图" : "折线图"}
                </button>
              ))}
            </div>
            <label className="block text-xs font-semibold text-slate-600">
              分类（逗号分隔）
              <input
                type="text"
                value={selectedElement.categories.join(",")}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "chart"
                      ? {
                          ...element,
                          categories: event.target.value
                            .split(/[,，]/)
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              数据系列（每行：名称: 1,2,3）
              <textarea
                value={selectedElement.series
                  .map((series) => `${series.name}: ${series.values.join(",")}`)
                  .join("\n")}
                onChange={(event) =>
                  updateSelected((element) => {
                    if (element.type !== "chart") return element;
                    const colors = ["60A5FA", "10B981", "F59E0B", "EF4444"];
                    const series = event.target.value
                      .split(/\n+/)
                      .map((line, index) => {
                        const [namePart, valuesPart = ""] = line.split(/[:：]/);
                        return {
                          name: namePart.trim() || `系列${index + 1}`,
                          values: valuesPart
                            .split(/[,，]/)
                            .map((value) => Number(value.trim()))
                            .filter((value) => Number.isFinite(value)),
                          color: element.series[index]?.color ?? colors[index % colors.length],
                        };
                      })
                      .filter((series) => series.values.length > 0);
                    return { ...element, series: series.length > 0 ? series : element.series };
                  })
                }
                className="mt-1 h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-blue-300"
              />
            </label>
          </div>
        )}
        {selectedElement?.type === "formula" && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              公式内容
              <input
                type="text"
                value={selectedElement.latex}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "formula"
                      ? {
                          ...element,
                          latex: event.target.value,
                          displayText: event.target.value.replaceAll("^2", "²"),
                        }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              公式颜色
              <input
                type="color"
                value={normalizeColor(selectedElement.style.color) ?? "#111827"}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "formula"
                      ? { ...element, style: { ...element.style, color: stripHash(event.target.value) } }
                      : element,
                  )
                }
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white"
              />
            </label>
          </div>
        )}
        {selectedElement?.type === "media" && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">
              媒体标题
              <input
                type="text"
                value={selectedElement.title}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "media"
                      ? { ...element, title: event.target.value }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              媒体地址
              <input
                type="text"
                value={selectedElement.src ?? ""}
                onChange={(event) =>
                  updateSelected((element) =>
                    element.type === "media"
                      ? { ...element, src: event.target.value }
                      : element,
                  )
                }
                style={fieldStyle()}
              />
            </label>
          </div>
        )}
        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="mb-2 text-xs font-bold text-slate-700">图层</div>
          <div className="max-h-[170px] space-y-1 overflow-auto pr-1">
            {document.elements.map((element, index) => (
              <button
                key={element.id}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[11px]"
                style={{
                  background: selectedId === element.id ? "#EFF6FF" : "#FFFFFF",
                  color: selectedId === element.id ? "#1D4ED8" : "#334155",
                  border: selectedId === element.id ? "1px solid #BFDBFE" : "1px solid transparent",
                }}
                onClick={() => setSelectedId(element.id)}
              >
                <span className="truncate">{element.name ?? element.id}</span>
                <span className="ml-2 text-slate-400">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
