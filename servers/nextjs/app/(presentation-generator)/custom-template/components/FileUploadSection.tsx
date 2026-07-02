import React from "react";
import { UploadIcon, ChevronRight, Plus, FileText, X, Coins, Edit3, Info } from "lucide-react";
import { ProcessedSlide } from "../types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FileUploadSectionProps {
  selectedFile: File | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  CheckFonts: () => void;
  isProcessingPptx: boolean;
  slides: ProcessedSlide[];
  completedSlides: number;
}

const COST_PER_SLIDE = 3;
const COST_EDIT = 1;

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedFile,
  handleFileSelect,
  removeFile,
  CheckFonts,
  isProcessingPptx,
  slides,
  completedSlides,
}) => {
  const isProcessing = isProcessingPptx || slides.some((s) => s.processing);

  const handleCheckFonts = () => {
    CheckFonts();
  };

  return (
    <div className="md:h-[calc(100vh-310px)] h-[calc(100vh-450px)] relative overflow-hidden">
      <div className="max-w-[650px] w-full mx-auto px-2 md:px-0">
        <div
          className="w-max ml-9 rounded-tl-[28px] rounded-tr-[28px] flex items-center bg-[#FAFAFF] px-2.5 pt-2.5 pb-1"
          style={{
            boxShadow: '0 0 16px 0 rgba(80, 71, 230, 0.12)',
          }}
        >
          <div
            className="flex justify-center gap-1 py-2.5 pl-2 pr-3 cursor-pointer bg-white rounded-[80px]"
            style={{
              boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.06)',
            }}
          >
            <UploadIcon className="w-4 h-4 text-black" />
            <p className="text-xs font-medium text-black">上传 PPTX 文件</p>
          </div>
        </div>

        <div
          className="w-full bg-[#FAFAFF] rounded-[28px] p-2.5"
          style={{
            boxShadow: '0 0 16px 0 rgba(80, 71, 230, 0.12)',
            clipPath: 'inset(0px -28px -28px -28px)',
          }}
        >
          <div className="bg-[#FEFEFF] rounded-[18px] p-2 border border-[#EDEEEF]">
            <div className="h-[120px] w-full bg-[#F6F6F9] rounded-[12px] p-1.5">
              <div className="border border-[#B8B8C1] border-dashed rounded-[12px] p-1.5 h-full relative">
                {!selectedFile ? (
                  <>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pptx"
                      onChange={handleFileSelect}
                      className="opacity-0 w-full h-full cursor-pointer absolute top-0 left-0 z-10"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-[42px] h-[42px] flex justify-center items-center rounded-full bg-[#EBE9FE]">
                        <div className="w-[22px] h-[22px] rounded-full bg-[#7A5AF8] flex items-center justify-center text-white">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                      <p className="pt-3 text-xs font-normal text-[#808080] tracking-[-0.12px] text-center">
                        <span className="text-[#808080] underline underline-offset-4">点击上传</span> 或将文件拖拽到此处
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-between gap-3 px-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EBE9FE] flex items-center justify-center text-[#6E59F5]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#101323] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-[#8A8A96]">已选择，可继续检查字体</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F8FAFC]"
                      aria-label="移除文件"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 min-h-[44px]">
              {isProcessing ? (
                <div className="rounded-[18px] border border-[#E7E3FF] bg-[#F8F7FF] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#4C3FC7]">
                        {isProcessingPptx ? '正在检查字体...' : '正在处理页面...'}
                      </p>
                      {slides.length > 0 ? (
                        <p className="text-xs font-medium text-[#9A9AA6] tracking-[-0.1px]">
                          已完成 {completedSlides}/{slides.length} 页
                        </p>
                      ) : null}
                    </div>
                    <div className="w-[120px] h-2 rounded-full overflow-hidden bg-[#E4DEFF]">
                      <div className="h-full w-full processing-stripes" />
                    </div>
                  </div>
                  <style jsx>{`
                    @keyframes stripes {
                      from {
                        background-position: 0 0;
                      }
                      to {
                        background-position: 24px 0;
                      }
                    }
                    .processing-stripes {
                      background: repeating-linear-gradient(
                        135deg,
                        rgba(122, 90, 248, 0.9) 0px,
                        rgba(122, 90, 248, 0.9) 9px,
                        rgba(122, 90, 248, 0.18) 9px,
                        rgba(122, 90, 248, 0.18) 18px
                      );
                      filter: saturate(1.05);
                      background-size: 24px 24px;
                      will-change: background-position;
                      animation: stripes 0.7s linear infinite;
                    }
                  `}</style>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    className="px-4 py-2.5 text-xs font-semibold text-[#101323] font-syne tracking-[-0.12px] flex gap-1"
                    style={{
                      borderRadius: '48px',
                      background: 'linear-gradient(270deg, #D5CAFC 2.4%, #E3D2EB 27.88%, #F4DCD3 69.23%, #FDE4C2 100%)',
                      cursor: 'pointer',
                    }}
                    onClick={handleCheckFonts}
                    disabled={isProcessing}
                  >
                    {!selectedFile ? '选择 PPTX 文件' : '检查字体'}
                    <ChevronRight className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <ul className="flex items-center max-w-[85%] md:max-w-[70%] mx-auto mt-5 justify-between gap-2.5">
          <li className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8.5" cy="8.17041" r="4.5" fill="#EBE9FE" />
            </svg>
            <p className="md:text-sm text-[10px] font-normal text-[#3A3A3A]">仅支持 PPTX</p>
          </li>
          <li className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8.5" cy="8.17041" r="4.5" fill="#EBE9FE" />
            </svg>
            <p className="md:text-sm text-[10px] font-normal text-[#3A3A3A]">最大 100MB</p>
          </li>
          <li className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8.5" cy="8.17041" r="4.5" fill="#EBE9FE" />
            </svg>
            <p className="md:text-sm text-[10px] font-normal text-[#3A3A3A]">约 5 分钟完成</p>
          </li>
        </ul>

        <div className="mt-4 px-4 py-3 rounded-lg border border-[#EBE9FE] flex items-start gap-2 shadow-md">
          <svg className="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="#EBE9FE" />
            <path d="M10 6V10M10 14H10.0088" stroke="#5B49A1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm md:text-base font-medium text-[#20165C] tracking-[-0.13px]">
            <span className="font-bold text-[#5B49A1]">提示：</span>
            每一页会以 <span className="font-semibold">截图 + HTML 参考</span> 的方式发送给你当前配置的文本模型。
            只有支持视觉输入的模型，才能更准确地还原版式；纯文本模型可能报错或生成较弱的布局效果。
            如需更稳定结果，请在设置中选择支持图片输入的模型。
          </p>
        </div>
      </div>
    </div>
  );
};
