import type { AipptBox } from "./types";

export const AIPPT_CANVAS_WIDTH = 1280;
export const AIPPT_CANVAS_HEIGHT = 720;
export const PPTX_WIDTH_IN = 13.333333;
export const PPTX_HEIGHT_IN = 7.5;

const PX_TO_IN = PPTX_WIDTH_IN / AIPPT_CANVAS_WIDTH;
const PT_TO_PX = 96 / 72;

function round(value: number) {
  return Number(value.toFixed(4));
}

export function pxToIn(value: number) {
  return round(value * PX_TO_IN);
}

export function ptToPx(value: number) {
  return round(value * PT_TO_PX);
}

export function boxToPptx(box: AipptBox) {
  return {
    x: pxToIn(box.x),
    y: pxToIn(box.y),
    w: pxToIn(box.w),
    h: pxToIn(box.h),
  };
}

