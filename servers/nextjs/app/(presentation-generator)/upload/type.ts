export interface UploadedFile {
  id: string;
  file: File;
  size: string;
}

export enum ThemeType {
  Light = "light",
  Dark = "dark",
  Custom = "custom",
  Faint_Yellow = "faint_yellow",
  Royal_Blue = "royal_blue",
  Light_Red = "light_red",
  Dark_Pink = "dark_pink",
}

export enum LanguageType {
  Auto = "自动识别（推荐）",
  ChineseSimplified = "中文（简体）",
  ChineseTraditional = "中文（繁体）",
  English = "英语",
  Japanese = "日语",
  Korean = "韩语",
  French = "法语",
  German = "德语",
  Spanish = "西班牙语",
  Portuguese = "葡萄牙语",
  Italian = "意大利语",
  Russian = "俄语",
  Arabic = "阿拉伯语",
  Hindi = "印地语",
  Thai = "泰语",
  Vietnamese = "越南语",
}

export interface PresentationConfig {
  slides: string | null;
  language: LanguageType | null;
  prompt: string;
  tone: ToneType;
  verbosity: VerbosityType;
  instructions: string;
  includeTableOfContents: boolean;
  includeTitleSlide: boolean;
  webSearch: boolean;
}

export enum ToneType {
  Default = "default",
  Casual = "casual",
  Professional = "professional",
  Funny = "funny",
  Educational = "educational",
  Sales_Pitch = "sales_pitch",
}

export enum VerbosityType {
  Concise = "concise",
  Standard = "standard",
  Text_Heavy = "text-heavy",
}
