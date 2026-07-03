import React from "react";
import { LogOut, Search, Users } from "lucide-react";
import { IMAGE_PROVIDERS, LLM_PROVIDERS } from "@/utils/providerConstants";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export type SettingsSection =
  | "text-provider"
  | "image-provider"
  | "web-search-provider"
  | "user-management"
  | "session";

const SettingSideBar = ({
  selectedProvider,
  setSelectedProvider,
}: {
  selectedProvider: SettingsSection;
  setSelectedProvider: (provider: SettingsSection) => void;
}) => {
  const { llm_config } = useSelector((state: RootState) => state.userConfig);
  const textProviderIcon =
    LLM_PROVIDERS[llm_config.LLM as keyof typeof LLM_PROVIDERS]?.icon;
  const imageProviderIcon =
    IMAGE_PROVIDERS[llm_config.IMAGE_PROVIDER as keyof typeof IMAGE_PROVIDERS]
      ?.icon || "/providers/pexel.png";

  return (
    <div className="sticky top-0 flex h-screen w-full max-w-[248px] flex-col px-4 py-6">
      <div className="aippt-soft-card flex min-h-0 flex-1 flex-col p-4">
      <p className="border-b border-[var(--aippt-border)] pb-3.5 text-xs font-semibold text-slate-500">
        配置中心
      </p>
      <div className="mt-6 flex-1">
        <p className="pb-2.5 text-xs font-medium text-slate-500">
          选择提供商
        </p>
        <div className="space-y-2.5">
          <button
            className={`aippt-focus flex w-full items-center gap-2 rounded-[14px] border px-3 py-3.5 transition ${
              selectedProvider === "text-provider"
                ? "border-[#D9D6FE] bg-[#F4F3FF] text-[#5146E5]"
                : "border-[var(--aippt-border)] bg-white/75 text-slate-700 hover:bg-white"
            }`}
            onClick={() => setSelectedProvider("text-provider")}
          >
            <div className="relative w-[18px] h-[18px] rounded-full overflow-hidden border border-[#EDEEEF]">
              <img
                src={textProviderIcon}
                className="object-cover w-full h-full overflow-hidden"
                alt="文本提供商"
              />
            </div>
            <p className="text-xs font-medium">文本提供商</p>
          </button>
          <button
            className={`aippt-focus flex w-full items-center gap-2 rounded-[14px] border px-3 py-3.5 transition ${
              selectedProvider === "image-provider"
                ? "border-[#D9D6FE] bg-[#F4F3FF] text-[#5146E5]"
                : "border-[var(--aippt-border)] bg-white/75 text-slate-700 hover:bg-white"
            }`}
            onClick={() => setSelectedProvider("image-provider")}
          >
            <div className="relative w-[18px] h-[18px] rounded-full overflow-hidden border border-[#EDEEEF]">
              <img
                src={imageProviderIcon}
                className="object-cover w-full h-full overflow-hidden"
                alt="图片提供商"
              />
            </div>
            <p className="text-xs font-medium">图片提供商</p>
          </button>
          <button
            className={`aippt-focus flex w-full items-center gap-2 rounded-[14px] border px-3 py-3.5 transition ${
              selectedProvider === "web-search-provider"
                ? "border-[#D9D6FE] bg-[#F4F3FF] text-[#5146E5]"
                : "border-[var(--aippt-border)] bg-white/75 text-slate-700 hover:bg-white"
            }`}
            onClick={() => setSelectedProvider("web-search-provider")}
          >
            <div className="relative w-[18px] h-[18px] rounded-full overflow-hidden border border-[#EDEEEF] flex items-center justify-center bg-white">
              <Search className="w-3 h-3 text-[#5146E5]" />
            </div>
            <p className="text-xs font-medium">联网搜索提供商</p>
          </button>
        </div>
      </div>

      <div className="relative z-50 border-t border-[var(--aippt-border)] py-5">
        <p className="pb-2.5 text-xs font-medium text-slate-500">其他</p>
        <div className="space-y-2.5">
          <button
            className={`aippt-focus flex w-full items-center gap-2 rounded-[14px] border p-3 py-3.5 transition ${
              selectedProvider === "user-management"
                ? "border-[#D9D6FE] bg-[#F4F3FF] text-[#5146E5]"
                : "border-[var(--aippt-border)] bg-white/75 text-slate-700 hover:bg-white"
            }`}
            onClick={() => setSelectedProvider("user-management")}
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#EDEEEF] flex items-center justify-center bg-white">
              <Users className="w-3.5 h-3.5 text-[#5146E5]" />
            </div>
            <p className="text-xs font-medium">用户管理</p>
          </button>
          <button
            className={`aippt-focus flex w-full items-center gap-2 rounded-[14px] border p-3 py-3.5 transition ${
              selectedProvider === "session"
                ? "border-[#D9D6FE] bg-[#F4F3FF] text-[#5146E5]"
                : "border-[var(--aippt-border)] bg-white/75 text-slate-700 hover:bg-white"
            }`}
            onClick={() => setSelectedProvider("session")}
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#EDEEEF] flex items-center justify-center bg-white">
              <LogOut className="w-3.5 h-3.5 text-[#5146E5]" />
            </div>
            <p className="text-xs font-medium">退出登录</p>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingSideBar;
