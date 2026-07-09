import type { AipptSlideDocument, AipptSlideElement } from "./types";

export type AipptLayerDirection = "front" | "back" | "forward" | "backward";

export function findAipptElement(
  elements: AipptSlideElement[],
  id: string,
): AipptSlideElement | null {
  for (const element of elements) {
    if (element.id === id) return element;
    if (element.type === "group") {
      const child = findAipptElement(element.elements, id);
      if (child) return child;
    }
  }
  return null;
}

export function updateAipptElement(
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

export function updateAipptImageElementSource(
  document: AipptSlideDocument,
  id: string,
  src: string,
  prompt?: string,
): AipptSlideDocument {
  return updateAipptElement(document, id, (element) => {
    if (element.type !== "image") return element;
    return {
      ...element,
      src,
      prompt: prompt ?? element.prompt,
    };
  });
}

export function deleteAipptElement(
  document: AipptSlideDocument,
  id: string,
): AipptSlideDocument {
  const removeFromList = (elements: AipptSlideElement[]): AipptSlideElement[] =>
    elements
      .filter((element) => element.id !== id)
      .map((element) =>
        element.type === "group"
          ? { ...element, elements: removeFromList(element.elements) }
          : element,
      );

  return { ...document, elements: removeFromList(document.elements) };
}

export function addAipptElement(
  document: AipptSlideDocument,
  element: AipptSlideElement,
): AipptSlideDocument {
  return { ...document, elements: [...document.elements, element] };
}

export function duplicateAipptElement(
  document: AipptSlideDocument,
  id: string,
): AipptSlideDocument {
  const element = findAipptElement(document.elements, id);
  if (!element) return document;

  const copy = structuredClone(element) as AipptSlideElement;
  copy.id = `${element.id}-copy-${Date.now().toString(36)}`;
  copy.x = element.x + 24;
  copy.y = element.y + 24;
  if (copy.type === "line" && element.type === "line") {
    copy.x2 = element.x2 + 24;
    copy.y2 = element.y2 + 24;
  }

  const insertAfter = (elements: AipptSlideElement[]): AipptSlideElement[] => {
    const result: AipptSlideElement[] = [];
    for (const current of elements) {
      result.push(current);
      if (current.id === id) result.push(copy);
      else if (current.type === "group") {
        result[result.length - 1] = {
          ...current,
          elements: insertAfter(current.elements),
        };
      }
    }
    return result;
  };

  return { ...document, elements: insertAfter(document.elements) };
}

export function moveAipptElementLayer(
  document: AipptSlideDocument,
  id: string,
  direction: AipptLayerDirection,
): AipptSlideDocument {
  const moveInList = (elements: AipptSlideElement[]): AipptSlideElement[] => {
    const index = elements.findIndex((element) => element.id === id);
    if (index >= 0) {
      const next = [...elements];
      const [element] = next.splice(index, 1);
      let targetIndex = index;
      if (direction === "front") targetIndex = next.length;
      if (direction === "back") targetIndex = 0;
      if (direction === "forward") targetIndex = Math.min(index + 1, next.length);
      if (direction === "backward") targetIndex = Math.max(index - 1, 0);
      next.splice(targetIndex, 0, element);
      return next;
    }

    return elements.map((element) =>
      element.type === "group"
        ? { ...element, elements: moveInList(element.elements) }
        : element,
    );
  };

  return { ...document, elements: moveInList(document.elements) };
}

export function createAipptTextElement(
  id: string,
  text = "双击编辑文本",
): AipptSlideElement {
  return {
    id,
    type: "text",
    x: 160,
    y: 160,
    w: 360,
    h: 64,
    text,
    style: {
      fontFace: "Microsoft YaHei",
      fontSize: 22,
      color: "111827",
      align: "left",
      valign: "middle",
      margin: [4, 8, 4, 8],
    },
  };
}

export function createAipptShapeElement(id: string): AipptSlideElement {
  return {
    id,
    type: "shape",
    shape: "roundRect",
    x: 180,
    y: 180,
    w: 240,
    h: 120,
    fill: { color: "F1F6FB" },
    line: { color: "057DC1", width: 1 },
    radius: 12,
  };
}

export function createAipptImageElement(id: string): AipptSlideElement {
  return {
    id,
    type: "image",
    x: 180,
    y: 160,
    w: 320,
    h: 180,
    src:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIzNjAiIHJ4PSIyNCIgZmlsbD0iI0YxRjVGOSIvPjxwYXRoIGQ9Ik0xNjAgMjQwaDMyMGwtOTAtMTAwLTcwIDc4LTUwLTU4LTExMCA4MHoiIGZpbGw9IiNCRkRCRkUiLz48Y2lyY2xlIGN4PSI0NzAiIGN5PSIxMDAiIHI9IjQwIiBmaWxsPSIjNjBBNUZBIi8+PHRleHQgeD0iMzIwIiB5PSIzMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjYiIGZpbGw9IiM0NzU1NjkiIGZvbnQtZmFtaWx5PSJNaWNyb3NvZnQgWWFIZWkiPuWbvueJh+WNoOW9jeS9jeS4jeaNouaNoueahDwvdGV4dD48L3N2Zz4=",
    fit: "cover",
    name: "图片占位",
  };
}

export function createAipptLineElement(id: string): AipptSlideElement {
  return {
    id,
    type: "line",
    x: 180,
    y: 220,
    w: 320,
    h: 0,
    x2: 500,
    y2: 220,
    line: { color: "057DC1", width: 3, dash: "solid" },
    name: "线条",
  };
}

export function createAipptChartElement(id: string): AipptSlideElement {
  return {
    id,
    type: "chart",
    chartType: "bar",
    x: 160,
    y: 150,
    w: 420,
    h: 260,
    title: "图表标题",
    categories: ["一月", "二月", "三月", "四月"],
    series: [
      { name: "计划", values: [42, 58, 64, 72], color: "60A5FA" },
      { name: "完成", values: [36, 52, 70, 86], color: "10B981" },
    ],
    style: {
      fontFace: "Microsoft YaHei",
      fontSize: 12,
      color: "334155",
      axisColor: "94A3B8",
      gridColor: "E2E8F0",
      backgroundColor: "FFFFFF",
    },
    name: "图表",
  };
}

export function createAipptTableElement(id: string): AipptSlideElement {
  return {
    id,
    type: "table",
    x: 150,
    y: 160,
    w: 520,
    h: 150,
    columns: [170, 175, 175],
    rows: [
      [
        { text: "指标", fill: "057DC1", color: "FFFFFF", bold: true },
        { text: "计划", fill: "057DC1", color: "FFFFFF", bold: true },
        { text: "完成", fill: "057DC1", color: "FFFFFF", bold: true },
      ],
      [{ text: "进度" }, { text: "按期" }, { text: "完成" }],
      [{ text: "质量" }, { text: "达标" }, { text: "稳定" }],
    ],
    style: {
      fontFace: "Microsoft YaHei",
      fontSize: 13,
      color: "111827",
      borderColor: "D6DDE3",
      margin: [4, 6, 4, 6],
    },
    name: "表格",
  };
}

export function createAipptFormulaElement(id: string): AipptSlideElement {
  return {
    id,
    type: "formula",
    x: 170,
    y: 170,
    w: 320,
    h: 86,
    latex: "E=mc^2",
    displayText: "E = mc²",
    style: {
      fontFace: "Cambria Math",
      fontSize: 30,
      color: "111827",
      align: "center",
      valign: "middle",
      margin: [8, 8, 8, 8],
      backgroundColor: "FFFFFF",
      borderColor: "CBD5E1",
    },
    name: "公式",
  };
}

export function createAipptMediaElement(
  id: string,
  mediaType: "video" | "audio" = "video",
): AipptSlideElement {
  return {
    id,
    type: "media",
    mediaType,
    x: 170,
    y: 170,
    w: mediaType === "video" ? 360 : 320,
    h: mediaType === "video" ? 210 : 78,
    title: mediaType === "video" ? "视频占位" : "音频占位",
    style: {
      color: "334155",
      backgroundColor: "F8FAFC",
      borderColor: "CBD5E1",
      fontFace: "Microsoft YaHei",
      fontSize: 15,
    },
    name: mediaType === "video" ? "视频" : "音频",
  };
}
