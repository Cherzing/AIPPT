"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { defaultNavItems } from "./DashboardSidebar";
import { usePathname } from "next/navigation";

const DashboardNav = () => {
  const pathname = usePathname();
  const activeTab = pathname.split("?")[0].split("/").pop();
  const activeItem = defaultNavItems.find((item) => item.key === activeTab);
  const title =
    activeItem?.label ??
    (activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : "AIPPT");
  const isThemePage = activeTab === "theme";

  return (
    <div className="aippt-topbar">
      <div className="aippt-soft-card flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="aippt-section-eyebrow">AIPPT</p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[28px]">
            {title}
          </h1>
        </div>
        {activeTab !== "playground" ? (
          <Link
            href={isThemePage ? "/theme?tab=new-theme" : "/generate"}
            className="aippt-gradient-button aippt-focus w-full sm:w-auto"
            aria-label={isThemePage ? "新建主题" : "新建演示文稿"}
          >
            <span className="hidden md:inline">
              {isThemePage ? "新建主题" : "新建演示文稿"}
            </span>
            <span className="md:hidden">新建</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardNav;
