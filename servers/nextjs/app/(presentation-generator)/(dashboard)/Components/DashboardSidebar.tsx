"use client";

import React from "react";
import { LayoutDashboard, Star, Brain, Settings, Palette, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import LogoutButton from "@/components/Auth/LogoutButton";



export const defaultNavItems = [
    { key: "dashboard" as const, label: "\u5de5\u4f5c\u53f0", icon: LayoutDashboard },
    { key: "templates" as const, label: "\u6a21\u677f", icon: Star },
    { key: "designs" as const, label: "\u667a\u80fd", icon: Brain },



];
export const BelongingNavItems = [
    { key: "settings" as const, label: "\u8bbe\u7f6e", icon: Settings },
]

const DashboardSidebar = () => {


    const pathname = usePathname();
    const isAdmin = useSelector((state: RootState) => state.userConfig.auth_user.role === "admin");
    const activeTab = pathname.split("?")[0].split("/").pop();





    return (
        <aside
            className="sticky top-0 h-screen w-[115px] flex flex-col justify-between bg-[#F6F6F9] backdrop-blur border-r border-[#E1E1E5] px-4  py-8"
            aria-label="Dashboard sidebar"
        >
            <div>

                <Link href={`/dashboard`} className="flex items-center  pb-6 border-b border-[#E1E1E5]   gap-2    ">
                    <div className="bg-[#7C51F8] rounded-full cursor-pointer p-1 flex justify-center items-center mx-auto">
                        <img src="/logo-with-bg.png" alt="AI PPT logo" className="h-[40px] object-contain w-full" />
                    </div>
                </Link>
                <nav className="pt-6 font-syne" aria-label="Dashboard sections">
                    <div className="  space-y-6">

                        {/* Dashboard */}
                        <Link
                            prefetch={false}
                            href={`/dashboard`}
                            className={[
                                "flex flex-col tex-center items-center gap-2  transition-colors",
                                pathname === "/dashboard" ? "" : "ring-transparent",
                            ].join(" ")}
                            aria-label={"\u5de5\u4f5c\u53f0"}
                            title={"\u5de5\u4f5c\u53f0"}
                        >
                            <LayoutDashboard className={["h-4 w-4", pathname === "/dashboard" ? "text-[#5146E5]" : "text-slate-600"].join(" ")} />
                            <span className="text-[11px] text-slate-800">{"\u5de5\u4f5c\u53f0"}</span>
                        </Link>
                        <Link
                            prefetch={false}
                            href={`/templates`}
                            className={[
                                "flex flex-col tex-center items-center gap-2  transition-colors",
                                pathname === "/templates" ? "" : "ring-transparent",
                            ].join(" ")}
                            aria-label={"\u6a21\u677f"}
                            title={"\u6a21\u677f"}
                        >
                            <div className="flex flex-col cursor-pointer tex-center items-center gap-2  transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={`${pathname === "/templates" ? "#5146E5" : "#475569"}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 14h6" /><path d="M4 2h10" /><rect x="4" y="18" width="16" height="4" rx="1" /><rect x="4" y="6" width="16" height="4" rx="1" /></svg>
                                <span className="text-[11px] text-slate-800">{"\u6a21\u677f"}</span>
                            </div>
                        </Link>
                        <Link
                            prefetch={false}
                            href={`/theme`}
                            className={[
                                "flex flex-col tex-center items-center gap-2  transition-colors",
                                pathname === "/theme" ? "" : "ring-transparent",
                            ].join(" ")}
                            aria-label={"\u4e3b\u9898"}
                            title={"\u4e3b\u9898"}
                        >
                            <div className="flex flex-col cursor-pointer tex-center items-center gap-2  transition-colors">
                                <Palette className={`h-4 w-4 ${pathname === "/theme" ? "text-[#5146E5]" : "text-slate-600"}`} />
                                <span className="text-[11px] text-slate-800">{"\u4e3b\u9898"}</span>
                            </div>
                        </Link>
                    </div>
                </nav>
            </div>

            <div className="pt-5 border-t border-[#E1E1E5] font-syne space-y-6">
                {isAdmin ? BelongingNavItems.map(({ key, label: itemLabel, icon: Icon }) => {
                    const isActive = activeTab === key;
                    return (
                        <Link
                            prefetch={false}
                            key={key}
                            href={`/${key}`}
                            className={[
                                "flex flex-col tex-center items-center gap-2  transition-colors ",
                                isActive ? "" : "ring-transparent",
                            ].join(" ")}
                            aria-label={itemLabel}
                            title={itemLabel}
                        >
                            {/* <div className="flex items-center  ">
                                <img src={imageProviderIcon} alt="image provider" className="w-5 h-5 rounded-full object-cover border border-[#EDEEEF]" />
                                <img src={textProviderIcon} alt="text provider" className="w-5 h-5 rounded-full object-cover border border-[#EDEEEF]" />
                            </div> */}
                            <Settings className={`h-4 w-4 ${isActive ? "text-[#5146E5]" : "text-slate-600"}`} />
                            <span className="text-[11px] text-slate-800">{itemLabel}</span>
                        </Link>
                    );
                }) : (
                    <Link
                        prefetch={false}
                        href="/profile"
                        className="flex flex-col tex-center items-center gap-2 transition-colors"
                        aria-label="个人信息"
                        title="个人信息"
                    >
                        <UserCircle className={`h-4 w-4 ${activeTab === "profile" ? "text-[#5146E5]" : "text-slate-600"}`} />
                        <span className="text-[11px] text-slate-800">个人信息</span>
                    </Link>
                )}

                <LogoutButton
                    label="退出登录"
                    iconOnly={false}
                    className="flex flex-col tex-center items-center gap-2 transition-colors text-slate-800 text-[11px]"
                />

            </div>

        </aside>
    );
};

export default DashboardSidebar;


