"use client";

import React from "react";
import {
  LayoutDashboard,
  LogOut,
  Palette,
  Settings,
  Sparkles,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import LogoutButton from "@/components/Auth/LogoutButton";
import { RootState } from "@/store/store";

export const defaultNavItems = [
  { key: "dashboard", href: "/dashboard", label: "工作台", icon: LayoutDashboard },
  { key: "templates", href: "/templates", label: "模板库", icon: Sparkles },
  { key: "theme", href: "/theme", label: "主题", icon: Palette },
];

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      prefetch={false}
      href={href}
      aria-label={label}
      className={[
        "group flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all aippt-focus",
        isActive
          ? "bg-white text-[#4338ca] shadow-[0_10px_26px_rgba(79,70,229,0.12)]"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          isActive
            ? "bg-indigo-50 text-[#4f46e5]"
            : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-[#4f46e5]",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </Link>
  );
}

const DashboardSidebar = () => {
  const isAdmin = useSelector(
    (state: RootState) => state.userConfig.auth_user.role === "admin"
  );

  return (
    <aside
      className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-white/70 bg-white/72 px-4 py-5 shadow-[16px_0_50px_rgba(15,23,42,0.04)] backdrop-blur-xl lg:flex lg:flex-col"
      aria-label="AIPPT 主导航"
    >
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-3 rounded-[22px] bg-gradient-to-br from-indigo-600 to-violet-600 p-3 text-white shadow-[0_18px_42px_rgba(79,70,229,0.28)] aippt-focus"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/16 text-xl font-black">
          A
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight">AIPPT</p>
          <p className="text-xs text-white/78">AI 演示文稿工作台</p>
        </div>
      </Link>

      <nav className="space-y-2" aria-label="主要页面">
        {defaultNavItems.map(({ key, ...item }) => (
          <NavLink key={key} {...item} />
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-200/70 pt-4">
        <NavLink
          href={isAdmin ? "/settings" : "/profile"}
          label={isAdmin ? "系统设置" : "个人信息"}
          icon={isAdmin ? Settings : UserCircle}
        />
        <LogoutButton
          label="退出登录"
          className="group flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 aippt-focus"
          iconWrapperClassName="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-red-100 group-hover:text-red-600"
        />
      </div>
    </aside>
  );
};

export default DashboardSidebar;
