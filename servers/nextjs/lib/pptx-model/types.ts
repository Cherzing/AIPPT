export type AipptAlign = "left" | "center" | "right" | "justify";
export type AipptValign = "top" | "middle" | "bottom";

export type AipptNativeFidelity = "A" | "B" | "C" | "D";

export type AipptNativeSourceRenderer =
  | "native"
  | "coal-power-builder"
  | "general-template-builder"
  | "modern-template-builder"
  | "standard-template-builder"
  | "swift-template-builder"
  | "built-in-template-builder"
  | "legacy-template-converter"
  | "ppt-importer"
  | "manual-template-authoring";

export type AipptNativeConversionStatus =
  | "complete"
  | "partial"
  | "background-fallback"
  | "legacy-only";

export type AipptNativeMeta = {
  version: 1;
  fidelity: AipptNativeFidelity;
  sourceRenderer: AipptNativeSourceRenderer;
  conversionStatus: AipptNativeConversionStatus;
  sourceTemplate?: string;
  sourceLayout?: string;
  warnings?: string[];
};

export type AipptBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type AipptTextStyle = {
  fontFace: string;
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: AipptAlign;
  valign?: AipptValign;
  margin?: [number, number, number, number];
  lineSpacingMultiple?: number;
};

export type AipptFill = {
  color: string;
  transparency?: number;
};

export type AipptLine = {
  color: string;
  width: number;
  transparency?: number;
  dash?: "solid" | "dash" | "dot";
  beginArrowType?: "none" | "triangle" | "oval";
  endArrowType?: "none" | "triangle" | "oval";
};

export type AipptBaseElement = AipptBox & {
  id: string;
  rotate?: number;
  opacity?: number;
  locked?: boolean;
  name?: string;
};

export type AipptTextElement = AipptBaseElement & {
  type: "text";
  text: string;
  style: AipptTextStyle;
};

export type AipptImageElement = AipptBaseElement & {
  type: "image";
  src: string;
  fit?: "stretch" | "cover" | "contain";
  prompt?: string;
};

export type AipptShapeElement = AipptBaseElement & {
  type: "shape";
  shape:
    | "rect"
    | "roundRect"
    | "ellipse"
    | "triangle"
    | "diamond"
    | "parallelogram"
    | "trapezoid"
    | "pentagon"
    | "hexagon"
    | "plus"
    | "rightArrow"
    | "leftArrow"
    | "upArrow"
    | "downArrow"
    | "cloud"
    | "heart"
    | "star5";
  fill?: AipptFill;
  line?: AipptLine;
  radius?: number;
};

export type AipptLineElement = AipptBaseElement & {
  type: "line";
  lineType?: "straight" | "polyline" | "elbow" | "curve" | "cubic";
  x2: number;
  y2: number;
  points?: Array<{ x: number; y: number }>;
  controlPoints?: Array<{ x: number; y: number }>;
  line: AipptLine;
};

export type AipptTableCell = {
  text: string;
  fill?: string;
  color?: string;
  bold?: boolean;
  align?: AipptAlign;
  valign?: AipptValign;
};

export type AipptTableElement = AipptBaseElement & {
  type: "table";
  columns: number[];
  rows: AipptTableCell[][];
  style: {
    fontFace: string;
    fontSize: number;
    color: string;
    borderColor?: string;
    headerFill?: string;
    margin?: [number, number, number, number];
  };
};

export type AipptChartElement = AipptBaseElement & {
  type: "chart";
  chartType: "bar" | "line" | "pie";
  title?: string;
  categories: string[];
  series: Array<{
    name: string;
    values: number[];
    color?: string;
  }>;
  style: {
    fontFace: string;
    fontSize: number;
    color: string;
    axisColor?: string;
    gridColor?: string;
    backgroundColor?: string;
  };
};

export type AipptFormulaElement = AipptBaseElement & {
  type: "formula";
  latex: string;
  displayText: string;
  style: AipptTextStyle & {
    backgroundColor?: string;
    borderColor?: string;
  };
};

export type AipptMediaElement = AipptBaseElement & {
  type: "media";
  mediaType: "video" | "audio";
  src?: string;
  poster?: string;
  title: string;
  style: {
    color: string;
    backgroundColor: string;
    borderColor: string;
    fontFace: string;
    fontSize: number;
  };
};

export type AipptGroupElement = AipptBaseElement & {
  type: "group";
  elements: AipptSlideElement[];
};

export type AipptSlideElement =
  | AipptTextElement
  | AipptImageElement
  | AipptShapeElement
  | AipptLineElement
  | AipptTableElement
  | AipptChartElement
  | AipptFormulaElement
  | AipptMediaElement
  | AipptGroupElement;

export type AipptSlideBackground =
  | { type: "solid"; color: string }
  | { type: "image"; src: string };

export type AipptSlideDocument = {
  id: string;
  width: number;
  height: number;
  meta?: AipptNativeMeta;
  background?: AipptSlideBackground;
  elements: AipptSlideElement[];
  deletedElementIds?: string[];
};

export type AipptPresentationDocument = {
  title?: string;
  slides: AipptSlideDocument[];
};
