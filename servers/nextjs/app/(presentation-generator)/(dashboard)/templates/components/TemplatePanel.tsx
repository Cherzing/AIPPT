"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight, Loader2, Sparkles } from "lucide-react";

import { templates } from "@/app/presentation-templates";
import { TemplateLayoutsWithSettings } from "@/app/presentation-templates/utils";
import {
  CustomTemplates,
  useCustomTemplatePreview,
  useCustomTemplateSummaries,
} from "@/app/hooks/useCustomTemplates";
import { Card } from "@/components/ui/card";
import { MixpanelEvent, trackEvent } from "@/utils/mixpanel";

import {
  CustomTemplatePreview,
  InbuiltTemplatePreview,
  LayoutsBadge,
  TemplatePreviewStage,
} from "../../../components/TemplatePreviewComponents";
import CreateCustomTemplate from "./CreateCustomTemplate";

const TEMPLATE_CATEGORIES = [
  "全部",
  "通用模板",
  "报告模板",
  "电厂专区",
  "自定义模板",
] as const;

type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

type InbuiltTemplateItem = {
  kind: "inbuilt";
  id: string;
  name: string;
  description: string;
  category: Exclude<TemplateCategory, "全部">;
  template: TemplateLayoutsWithSettings;
};

type CustomTemplateItem = {
  kind: "custom";
  id: string;
  name: string;
  description: string;
  category: Exclude<TemplateCategory, "全部">;
  template: CustomTemplates;
};

type TemplateItem = InbuiltTemplateItem | CustomTemplateItem;

function getInbuiltTemplateCategory(
  template: TemplateLayoutsWithSettings
): Exclude<TemplateCategory, "全部"> {
  const configuredCategory = template.settings?.category?.trim();
  if (
    configuredCategory === "通用模板" ||
    configuredCategory === "报告模板" ||
    configuredCategory === "电厂专区" ||
    configuredCategory === "自定义模板"
  ) {
    return configuredCategory;
  }
  if (template.id === "taicang-coal-power-report") return "电厂专区";
  if (template.id.includes("report") || template.id.startsWith("neo")) {
    return "报告模板";
  }
  return "通用模板";
}

function getCustomTemplateCategory(
  template: CustomTemplates
): Exclude<TemplateCategory, "全部"> {
  const configuredCategory = template.category?.trim();
  if (
    configuredCategory === "通用模板" ||
    configuredCategory === "报告模板" ||
    configuredCategory === "电厂专区" ||
    configuredCategory === "自定义模板"
  ) {
    return configuredCategory;
  }
  return "自定义模板";
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
      {category}
    </span>
  );
}

export const CustomTemplateCard = React.memo(function CustomTemplateCard({
  template,
}: {
  template: CustomTemplates;
}) {
  const router = useRouter();
  const { previewLayouts, loading } = useCustomTemplatePreview(`${template.id}`);
  const category = getCustomTemplateCategory(template);

  const handleOpen = useCallback(() => {
    trackEvent(MixpanelEvent.Templates_Custom_Opened, {
      template_id: template.id,
      template_name: template.name,
      category,
    });
    if (template.id.startsWith("custom-")) {
      router.push(`/template-preview?slug=${template.id}`);
    } else {
      router.push(`/template-preview?slug=custom-${template.id}`);
    }
  }, [category, router, template.id, template.name]);

  return (
    <Card
      className="aippt-soft-card group relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
      onClick={handleOpen}
    >
      <TemplatePreviewStage>
        <LayoutsBadge count={template.layoutCount} />
        <CustomTemplatePreview
          previewLayouts={previewLayouts}
          loading={loading}
          templateId={template.id}
        />
      </TemplatePreviewStage>
      <div className="relative z-40 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <CategoryBadge category={category} />
          </div>
          <h3 className="truncate text-base font-bold text-slate-950">
            {template.name}
          </h3>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600" />
      </div>
    </Card>
  );
}, (prev, next) => (
  prev.template.id === next.template.id &&
  prev.template.name === next.template.name &&
  prev.template.layoutCount === next.template.layoutCount &&
  prev.template.category === next.template.category
));

const InbuiltTemplateCard = React.memo(function InbuiltTemplateCard({
  template,
  category,
  onOpen,
}: {
  template: TemplateLayoutsWithSettings;
  category: string;
  onOpen: (id: string) => void;
}) {
  const handleOpen = useCallback(() => onOpen(template.id), [onOpen, template.id]);

  return (
    <Card
      className="aippt-soft-card group relative cursor-pointer overflow-hidden rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
      onClick={handleOpen}
    >
      <TemplatePreviewStage>
        <LayoutsBadge count={template.layouts.length} />
        <InbuiltTemplatePreview layouts={template.layouts} templateId={template.id} />
      </TemplatePreviewStage>
      <div className="relative z-40 flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-5">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <CategoryBadge category={category} />
          </div>
          <h3 className="text-base font-bold text-slate-950">{template.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
            {template.description}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600" />
      </div>
    </Card>
  );
});

const LayoutPreview = () => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("全部");
  const router = useRouter();
  const {
    templates: customTemplates,
    loading: customLoading,
  } = useCustomTemplateSummaries();

  useEffect(() => {
    trackEvent(MixpanelEvent.Templates_Page_Viewed);
    const existingScript = document.querySelector('script[src*="tailwindcss.com"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleOpenPreview = useCallback((id: string) => {
    trackEvent(MixpanelEvent.Templates_Inbuilt_Opened, { template_id: id });
    router.push(`/template-preview?slug=${id}`);
  }, [router]);

  const inbuiltItems = useMemo<InbuiltTemplateItem[]>(
    () =>
      templates.map((template) => ({
        kind: "inbuilt",
        id: template.id,
        name: template.name,
        description: template.description,
        category: getInbuiltTemplateCategory(template),
        template,
      })),
    []
  );

  const customItems = useMemo<CustomTemplateItem[]>(
    () =>
      customTemplates.map((template) => ({
        kind: "custom",
        id: template.id,
        name: template.name,
        description: "用户自定义模板",
        category: getCustomTemplateCategory(template),
        template,
      })),
    [customTemplates]
  );

  const allItems = useMemo<TemplateItem[]>(
    () => [...inbuiltItems, ...customItems],
    [customItems, inbuiltItems]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<TemplateCategory, number>();
    TEMPLATE_CATEGORIES.forEach((category) => counts.set(category, 0));
    counts.set("全部", allItems.length);
    allItems.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    });
    return counts;
  }, [allItems]);

  const visibleItems = useMemo(
    () =>
      activeCategory === "全部"
        ? allItems
        : allItems.filter((item) => item.category === activeCategory),
    [activeCategory, allItems]
  );

  const showCreateTemplateCard =
    activeCategory === "全部" || activeCategory === "自定义模板";

  return (
    <div className="aippt-page-shell font-syne">
      <div className="aippt-page-content">
        <div className="aippt-topbar">
          <div className="aippt-soft-card flex flex-col gap-5 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="aippt-section-eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                模板库
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[28px]">
                按类别选择 PPT 模板
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                使用内置母版或上传自定义模板。新增模板保存时可选择类别，模板库会自动归入对应专区。
              </p>
            </div>
            <Link
              href="/custom-template"
              onClick={() => trackEvent(MixpanelEvent.Templates_New_Template_Clicked)}
              className="aippt-gradient-button aippt-focus w-full sm:w-auto"
              aria-label="新建模板"
            >
              <span className="hidden md:inline">新建模板</span>
              <span className="md:hidden">新建</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="aippt-segmented flex-wrap">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category}
                className="aippt-segment aippt-focus"
                data-active={activeCategory === category}
                onClick={() => {
                  trackEvent(MixpanelEvent.Templates_Tab_Switched, {
                    category,
                  });
                  setActiveCategory(category);
                }}
              >
                {category}
                <span className="ml-2 rounded-full bg-white/70 px-2 py-0.5 text-xs text-slate-500">
                  {categoryCounts.get(category) ?? 0}
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            当前显示：{activeCategory}，共 {visibleItems.length} 个模板
          </p>
        </div>

        {customLoading && customItems.length === 0 ? (
          <div className="aippt-soft-card flex items-center justify-center py-14">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-slate-600">正在加载自定义模板……</span>
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {showCreateTemplateCard && <CreateCustomTemplate />}
              {visibleItems.map((item) =>
                item.kind === "inbuilt" ? (
                  <InbuiltTemplateCard
                    key={item.id}
                    template={item.template}
                    category={item.category}
                    onOpen={handleOpenPreview}
                  />
                ) : (
                  <CustomTemplateCard key={item.id} template={item.template} />
                )
              )}
            </div>
            {visibleItems.length === 0 && !showCreateTemplateCard ? (
              <div className="aippt-soft-card mt-6 flex flex-col items-center justify-center py-14 text-center">
                <p className="text-base font-semibold text-slate-900">
                  当前类别暂无模板
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  新增自定义模板时选择“{activeCategory}”，保存后会展示在这里。
                </p>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
};

export default LayoutPreview;
