"use client";

import React from "react";
import Link from "next/link";
import { Layout, Plus } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/70 bg-white/78 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 aippt-focus">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-black text-white shadow-[0_14px_30px_rgba(79,70,229,0.24)]">
              A
            </span>
            <span className="text-base font-bold text-slate-950">AIPPT</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/custom-layout" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 aippt-focus">
              <Plus className="w-5 h-5" />
              <span>创建模板</span>
            </Link>
            <Link href="/template-preview" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 aippt-focus">
              <Layout className="w-5 h-5" />
              <span>模板预览</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
