import React, { useEffect, useState } from "react";
import {
  Loader2,
  PlusIcon,
  Trash2,
  Trash,
  Sparkles,
} from "lucide-react";
import { notify } from "@/components/ui/sonner";
import ToolTip from "@/components/ToolTip";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePresentationSlide,
  updateSlide,
} from "@/store/slices/presentationGeneration";
import { usePathname } from "next/navigation";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { addToHistory } from "@/store/slices/undoRedoSlice";
import NewSlide from "./NewSlide";
import SlideScale from "../../components/PresentationRender";

interface SlideContentProps {
  slide: any;
  index: number;
  presentationId: string;
  isChatEditing?: boolean;
  isChatTargeted?: boolean;
  showInlineAddSlide?: boolean;
}

const SlideContent = ({
  slide,
  index,
  presentationId,
  isChatEditing = false,
  showInlineAddSlide = true,
}: SlideContentProps) => {
  const dispatch = useDispatch();
  const slideLayout = typeof slide?.layout === "string" ? slide.layout : "";
  const [showNewSlideSelection, setShowNewSlideSelection] = useState(false);
  const [speakerNoteDraft, setSpeakerNoteDraft] = useState(slide?.speaker_note ?? "");
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  // Use the centralized group layouts hook

  const pathname = usePathname();

  useEffect(() => {
    setSpeakerNoteDraft(slide?.speaker_note ?? "");
  }, [slide?.id, slide?.speaker_note]);

  const handleSpeakerNoteChange = (value: string) => {
    setSpeakerNoteDraft(value);
    dispatch(
      updateSlide({
        index: slide.index,
        slide: {
          ...slide,
          speaker_note: value,
        },
      })
    );
  };



  const onDeleteSlide = async () => {
    try {
      if ((presentationData?.slides?.length ?? 0) <= 1) {
        notify.warning(
          "无法删除幻灯片",
          "演示文稿至少需要保留一张幻灯片。"
        );
        return;
      }

      trackEvent(MixpanelEvent.Presentation_Slide_Deleted, {
        pathname,
        presentation_id: presentationId,
        slide_id: slide.id,
        slide_index: slide.index,
        layout: slideLayout,
      });
      // Add current state to past
      dispatch(
        addToHistory({
          slides: presentationData?.slides,
          actionType: "DELETE_SLIDE",
        })
      );
      dispatch(deletePresentationSlide(slide.index));
    } catch (error: any) {
      console.error("Error deleting slide:", error);
      notify.error(
        "无法删除幻灯片",
        error.message || "删除幻灯片时发生错误。"
      );
    }
  };
  useEffect(() => {
    if (slideLayout.includes("custom")) {
      const existingScript = document.querySelector(
        'script[src*="tailwindcss.com"]'
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://cdn.tailwindcss.com";
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [slideLayout, isStreaming]);

  return (
    <>
      <div
        id={`slide-${slide.index}`}
        className="main-slide relative flex h-full min-h-0 w-full items-start justify-center max-md:mb-4"
      >
        {isStreaming && (
          <Loader2 className="w-8 h-8 absolute right-2 top-2 z-30 text-blue-800 animate-spin" />
        )}
        <div
          data-layout={slide.layout}
          data-group={slide.layout_group}
          className="group h-full min-h-0 w-full font-syne"
        >
          {/* <V1ContentRender slide={slide} isEditMode={true} theme={null} /> */}
          {isChatEditing && (
            <div
              className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 overflow-hidden rounded-[50px]  p-[1.5px] font-syne"
              aria-live="polite"
            >
              <span className="relative z-20 flex items-center overflow-hidden rounded-[50px] bg-white px-3 py-2 text-sm font-medium text-[#666666]">
                <span
                  aria-hidden="true"
                  className="generating-slides-background absolute"
                />
                <span className="relative z-10 flex items-center  gap-2">
                  <Sparkles className="h-4 w-4 text-[#9034EA]" />
                  正在更新幻灯片……
                </span>
              </span>
            </div>
          )}
          <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-hidden">
              <SlideScale slide={slide} theme={presentationData?.theme || null} />
            </div>
            <div className="relative z-[1600] h-14 shrink-0 border-t border-slate-200 bg-white px-3 py-1.5">
              <div className="flex h-full items-start text-xs text-slate-500">
                <textarea
                  aria-label="演讲者备注"
                  value={speakerNoteDraft}
                  placeholder="演讲者备注"
                  onChange={(event) => handleSpeakerNoteChange(event.currentTarget.value)}
                  className="h-full min-h-0 flex-1 resize-none overflow-y-auto rounded border border-transparent bg-transparent px-1 py-1 text-xs leading-5 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
                  rows={2}
                />
              </div>
            </div>
          </div>
          {showInlineAddSlide && !showNewSlideSelection && (
            <div className="group-hover:opacity-100 hidden md:block opacity-0 transition-opacity my-4 duration-300">
              <ToolTip content="在下方新增幻灯片">
                {!isStreaming && (
                  <div
                    role="button"
                    aria-label="在下方新增幻灯片"
                    onClick={() => {
                      setShowNewSlideSelection(true);
                    }}
                    className="  bg-white shadow-md w-[80px] py-2 border hover:border-[#5141e5] duration-300  flex items-center justify-center rounded-lg cursor-pointer mx-auto"
                  >
                    <PlusIcon className="text-gray-500 text-base cursor-pointer" />
                  </div>
                )}
              </ToolTip>
            </div>
          )}
          {showNewSlideSelection && (
            <div
              className="fixed inset-0 z-[1000] overflow-y-auto bg-black/50 px-4 py-16"
              onClick={() => setShowNewSlideSelection(false)}
            >
              <div className="relative z-[1001] flex min-h-full items-start justify-center pt-10">
                <div
                  className="w-full max-w-[675px]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <NewSlide
                    index={index}
                    templateID={`${slideLayout.split(":")[0]}`}
                    setShowNewSlideSelection={setShowNewSlideSelection}
                    presentationId={presentationId}
                  />
                </div>
              </div>
            </div>
          )}

          {!isStreaming && (
            <div
              className={`absolute right-3 top-3 z-30 hidden md:flex flex-row items-center gap-2 rounded-[28px] border border-gray-200/80 bg-white/95 px-2.5 py-2 ${"opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"}`}
              style={{
                boxShadow: "0 2px 13.2px 0 rgba(0, 0, 0, 0.10)",
              }}
            >
              <button
                type="button"
                aria-label="删除幻灯片"
                onClick={onDeleteSlide}
                className="flex px-4 py-2.5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 font-syne"
              >
                <ToolTip content="删除幻灯片">
                  <Trash className="h-4 w-4" />
                </ToolTip>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SlideContent;
