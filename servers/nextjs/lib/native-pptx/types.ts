export type NativeSlide = {
  index?: number;
  layout?: string;
  layout_group?: string;
  content?: Record<string, any> | null;
  speaker_note?: string | null;
};

export type NativePresentation = {
  id?: string;
  title?: string | null;
  slides?: NativeSlide[];
};

export type NativeExportParams = {
  presentation: NativePresentation;
  outPath: string;
  repoRoot?: string;
};
