"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, EllipsisVertical, Loader2, Trash, UserRound } from "lucide-react";

import { DashboardApi } from "@/app/(presentation-generator)/services/api/dashboard";
import SlideScale from "@/app/(presentation-generator)/components/PresentationRender";
import { useFontLoader } from "@/app/(presentation-generator)/hooks/useFontLoad";
import MarkdownRenderer from "@/components/MarkDownRender";
import { notify } from "@/components/ui/sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";

export const PresentationCard = ({
  id,
  title,
  presentation,
  onDeleted,
}: {
  id: string;
  title: string;
  presentation: any;
  onDeleted?: (presentationId: string) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handlePreview = (event: React.MouseEvent) => {
    event.preventDefault();
    trackEvent(MixpanelEvent.Dashboard_Presentation_Opened, {
      pathname,
      presentation_id: id,
      title_length: (title || "").length,
      slide_count: presentation?.slides?.length || 0,
    });
    router.push(`/presentation?id=${id}&type=standard`);
  };

  useEffect(() => {
    applyTheme(presentation.theme);
  }, []);

  const applyTheme = async (theme: any) => {
    const element = document.getElementById(`dashboard-presentation-card-${id}`);
    if (!element || !theme?.data?.colors?.graph_0) {
      return;
    }

    const cssVariables = {
      "--primary-color": theme.data.colors.primary,
      "--background-color": theme.data.colors.background,
      "--card-color": theme.data.colors.card,
      "--stroke": theme.data.colors.stroke,
      "--primary-text": theme.data.colors.primary_text,
      "--background-text": theme.data.colors.background_text,
      "--graph-0": theme.data.colors.graph_0,
      "--graph-1": theme.data.colors.graph_1,
      "--graph-2": theme.data.colors.graph_2,
      "--graph-3": theme.data.colors.graph_3,
      "--graph-4": theme.data.colors.graph_4,
      "--graph-5": theme.data.colors.graph_5,
      "--graph-6": theme.data.colors.graph_6,
      "--graph-7": theme.data.colors.graph_7,
      "--graph-8": theme.data.colors.graph_8,
      "--graph-9": theme.data.colors.graph_9,
    };

    Object.entries(cssVariables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });

    if (theme.data.fonts.textFont.url && theme.data.fonts.textFont.name) {
      useFontLoader({ [theme.data.fonts.textFont.name]: theme.data.fonts.textFont.url });
      element.style.setProperty("font-family", `"${theme.data.fonts.textFont.name}"`);
      element.style.setProperty("--heading-font-family", `"${theme.data.fonts.textFont.name}"`);
      element.style.setProperty("--body-font-family", `"${theme.data.fonts.textFont.name}"`);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    const response = await DashboardApi.deletePresentation(id);

    if (response?.success) {
      trackEvent(MixpanelEvent.Dashboard_Presentation_Deleted, {
        pathname,
        presentation_id: id,
        slide_count: presentation?.slides?.length || 0,
      });
      notify.success("文稿已删除", "该演示文稿已从工作台移除。");
      setShowDeleteDialog(false);
      onDeleted?.(id);
    } else {
      notify.error("删除失败", response?.message || "删除演示文稿时出现问题。");
    }
    setIsDeleting(false);
  };

  const firstSlide = presentation?.slides?.[0];
  const createdDate = presentation?.created_at
    ? new Date(presentation.created_at).toLocaleDateString()
    : "未记录";

  return (
    <article
      onClick={handlePreview}
      className="group aippt-soft-card relative flex min-h-[320px] cursor-pointer flex-col overflow-hidden rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)] aippt-focus"
      tabIndex={0}
      aria-label={`打开演示文稿：${title}`}
    >
      <div
        id={`dashboard-presentation-card-${id}`}
        suppressHydrationWarning
        className="relative flex flex-1 flex-col"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-white p-4">
          <div className="absolute right-4 top-4 z-20 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
            PPT
          </div>
          <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl border border-white bg-white shadow-[0_16px_38px_rgba(15,23,42,0.12)]">
            <div className="absolute inset-0">
              <SlideScale
                slide={firstSlide}
                isClickable={false}
                presentMode
              />
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-base font-bold text-slate-950">
                <MarkdownRenderer
                  content={title || "未命名演示文稿"}
                  className="mb-0 line-clamp-1 text-base font-bold text-slate-950"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {createdDate}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                  <UserRound className="h-3.5 w-3.5" />
                  所属用户：{presentation?.owner_user || "未记录"}
                </span>
              </div>
            </div>

            <Popover>
              <PopoverTrigger
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 aippt-focus"
                onClick={(event) => event.stopPropagation()}
                aria-label="文稿操作"
              >
                <EllipsisVertical className="h-5 w-5" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[180px] rounded-2xl border-slate-200 bg-white p-2 shadow-xl">
                <button
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <span>删除文稿</span>
                  <Trash className="h-4 w-4" />
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_150ms_ease-out]"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!isDeleting) setShowDeleteDialog(false);
          }}
        >
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" />
          <div
            className="relative w-[380px] max-w-[calc(100vw-2rem)] rounded-[24px] bg-white shadow-2xl animate-[scaleIn_200ms_ease-out]"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <div className="flex flex-col items-center p-7 pb-5 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-950">
                删除这个演示文稿？
              </h3>
              <p className="text-sm leading-6 text-slate-500">
                即将删除 <span className="font-semibold text-slate-700">“{title}”</span>。
                此操作不可撤销。
              </p>
            </div>
            <div className="flex border-t border-slate-100">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="flex flex-1 items-center justify-center gap-2 border-l border-slate-100 px-4 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    删除中...
                  </>
                ) : (
                  "确认删除"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
