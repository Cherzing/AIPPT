"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Wrapper from "@/components/Wrapper";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";

const PATHS_WITH_HEADER_BACK = [
  "/upload",
  "/outline",
  "/documents-preview",
  "/template-preview",
] as const;

function pathMatches(pathname: string | null, base: string) {
  return pathname === base || pathname?.startsWith(`${base}/`) === true;
}

const Header = () => {
  const pathname = usePathname();
  const showHeaderBack = PATHS_WITH_HEADER_BACK.some((path) =>
    pathMatches(pathname, path)
  );

  const backToUpload =
    pathMatches(pathname, "/outline") || pathMatches(pathname, "/documents-preview");
  const backToTemplates = pathMatches(pathname, "/template-preview");
  const backHref = backToUpload ? "/upload" : backToTemplates ? "/templates" : "/dashboard";
  const backLabel = backToUpload ? "返回上一步" : backToTemplates ? "返回模板库" : "返回工作台";

  return (
    <div className="sticky top-0 z-50 w-full border-b border-white/70 bg-white/76 py-4 backdrop-blur-xl">
      <Wrapper className="px-5 sm:px-10 lg:px-20">
        <div className="flex items-center justify-between py-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 aippt-focus"
            onClick={() =>
              trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/dashboard" })
            }
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
              <Image
                src="/logo-removebg-preview.png"
                alt="AIPPT 标识"
                width={40}
                height={40}
                className="h-full w-full object-contain p-1"
                priority
              />
            </span>
            <span className="hidden text-base font-bold text-slate-950 sm:inline">AIPPT</span>
          </Link>

          {showHeaderBack ? (
            <Link
              href={backHref}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 aippt-focus"
              onClick={() =>
                trackEvent(MixpanelEvent.Navigation, { from: pathname, to: backHref })
              }
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span>{backLabel}</span>
            </Link>
          ) : null}
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;
