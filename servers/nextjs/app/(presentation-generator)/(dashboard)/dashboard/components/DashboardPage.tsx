"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpDown, FileText, Plus, Sparkles } from "lucide-react";

import { DashboardApi } from "@/app/(presentation-generator)/services/api/dashboard";
import { PresentationGrid } from "@/app/(presentation-generator)/(dashboard)/dashboard/components/PresentationGrid";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";

const DashboardPage: React.FC = () => {
  const pathname = usePathname();
  const [presentations, setPresentations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deckSortDirection, setDeckSortDirection] = useState<"desc" | "asc">(
    "desc"
  );

  const sortedPresentations = useMemo(() => {
    return [...presentations].sort((a: any, b: any) => {
      const first = new Date(a.updated_at ?? a.created_at).getTime();
      const second = new Date(b.updated_at ?? b.created_at).getTime();
      return deckSortDirection === "desc" ? second - first : first - second;
    });
  }, [presentations, deckSortDirection]);

  useEffect(() => {
    void fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    let fetchedCount = 0;
    let hasError = false;
    try {
      setIsLoading(true);
      setError(null);
      const data = await DashboardApi.getPresentations();
      fetchedCount = data.length;
      setPresentations(data);
    } catch {
      hasError = true;
      setError("无法加载演示文稿，请稍后重试。");
      setPresentations([]);
    } finally {
      trackEvent(MixpanelEvent.Dashboard_Page_Viewed, {
        pathname,
        presentation_count: fetchedCount,
        load_failed: hasError,
      });
      setIsLoading(false);
    }
  };

  const removePresentation = (presentationId: string) => {
    setPresentations((prev) => prev.filter((p) => p.id !== presentationId));
  };

  return (
    <main className="aippt-page-shell">
      <section className="aippt-page-content mb-7 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="aippt-soft-card overflow-hidden rounded-[var(--aippt-radius)] p-7">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                AIPPT 工作台
              </p>
              <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                管理、生成和迭代你的演示文稿
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                从主题、文档或模板开始，快速生成可编辑的 PPT，并在这里统一管理历史作品。
              </p>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_18px_42px_rgba(79,70,229,0.25)] sm:flex">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs font-medium text-slate-500">演示文稿</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {presentations.length}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs font-medium text-slate-500">排序方式</p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {deckSortDirection === "desc" ? "最近更新优先" : "最早创建优先"}
              </p>
            </div>
            <Link
              href="/templates"
              className="rounded-3xl border border-indigo-100 bg-indigo-50/80 p-5 transition hover:-translate-y-0.5 hover:bg-indigo-100 aippt-focus"
            >
              <p className="text-xs font-medium text-indigo-600">模板库</p>
              <p className="mt-2 text-base font-semibold text-indigo-950">
                选择母版开始创作
              </p>
            </Link>
          </div>
        </div>

        <Link
          href="/upload"
          onClick={() =>
            trackEvent(MixpanelEvent.Dashboard_New_Presentation_Clicked, {
              pathname,
              source: "dashboard_hero_card",
            })
          }
          className="group aippt-soft-card relative flex min-h-[260px] overflow-hidden rounded-[var(--aippt-radius)] p-7 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(79,70,229,0.18)] aippt-focus"
          aria-label="创建演示文稿"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-200/50 blur-2xl transition group-hover:scale-125" />
          <div className="absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_18px_42px_rgba(79,70,229,0.25)] transition group-hover:scale-105">
            <Plus className="h-7 w-7" />
          </div>
          <div className="relative z-10 flex max-w-[18rem] flex-col justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                AI 生成
              </p>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">
                创建演示文稿
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                输入主题或上传文档，生成结构化、可编辑、可导出的 PPT。
              </p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
              立即开始 <Plus className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </section>

      <section className="aippt-page-content">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">我的文稿</h2>
              <p className="text-xs text-slate-500">普通用户只显示自己的文稿，管理员显示全部文稿。</p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 aippt-focus"
            title="切换排序"
            aria-label="切换排序"
            onClick={() =>
              setDeckSortDirection((current) =>
                current === "desc" ? "asc" : "desc"
              )
            }
          >
            <ArrowUpDown
              className={`h-4 w-4 transition-transform duration-300 ${
                deckSortDirection === "asc" ? "rotate-180" : ""
              }`}
            />
            排序
          </button>
        </div>
        <PresentationGrid
          presentations={sortedPresentations}
          isLoading={isLoading}
          error={error}
          onPresentationDeleted={removePresentation}
        />
      </section>
    </main>
  );
};

export default DashboardPage;
