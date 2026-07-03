"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronUp, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getApiErrorMessage, getApiUrl } from "@/utils/api";
import { notify } from "@/components/ui/sonner";

export interface OpenAICompatibleImageFieldsProps {
  baseUrl: string;
  apiKey: string;
  model: string;
  onBaseUrlChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onModelListMetaChange?: (meta: {
    modelsChecked: boolean;
    modelCount: number;
  }) => void;
  layout?: "stacked" | "textProviderSettings";
}

const inputClassName =
  "aippt-input h-12 w-full rounded-2xl border-slate-200 bg-white/90 text-sm shadow-[0_10px_24px_rgba(15,23,42,0.04)]";

const labelClassName = "mb-2 block text-sm font-semibold text-slate-700";

export default function OpenAICompatibleImageFields({
  baseUrl,
  apiKey,
  model,
  onBaseUrlChange,
  onApiKeyChange,
  onModelChange,
  onModelListMetaChange,
  layout = "stacked",
}: OpenAICompatibleImageFieldsProps) {
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsChecked, setModelsChecked] = useState(false);
  const [openModelSelect, setOpenModelSelect] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const skipUrlKeyResetOnce = useRef(true);

  const urlKey = `${baseUrl}|${apiKey}`;

  useEffect(() => {
    if (skipUrlKeyResetOnce.current) {
      skipUrlKeyResetOnce.current = false;
      return;
    }

    setModels([]);
    setModelsChecked(false);
    onModelChange("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  const fetchModels = async () => {
    if (!baseUrl.trim()) return;

    setModelsLoading(true);
    try {
      const response = await fetch(
        getApiUrl("/api/v1/ppt/openai/models/available"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: baseUrl.trim(),
            api_key: apiKey,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setModels(Array.isArray(data) ? data : []);
        setModelsChecked(true);
      } else {
        const message = await getApiErrorMessage(
          response,
          "服务器无法列出模型。请检查 API Key 或端点后重试。"
        );
        console.error("Failed to fetch models");
        setModels([]);
        setModelsChecked(true);
        notify.error("无法加载模型", message);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      notify.error(
        "无法加载模型",
        "连接提供商时出现问题。请检查网络后重试。"
      );
      setModels([]);
      setModelsChecked(true);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (layout !== "textProviderSettings" || !onModelListMetaChange) return;
    onModelListMetaChange({ modelsChecked, modelCount: models.length });
  }, [layout, modelsChecked, models.length, onModelListMetaChange]);

  const renderApiKeyField = () => (
    <div>
      <label className={labelClassName}>图片 API Key</label>
      <div className="relative">
        <input
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
          className={`${inputClassName} pr-12`}
          placeholder="图片端点的 API Key"
        />
        <button
          type="button"
          aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
          onClick={() => setShowApiKey((previous) => !previous)}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 transition hover:text-indigo-600"
        >
          {showApiKey ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  const renderBaseUrlField = () => (
    <div>
      <label className={labelClassName}>OpenAI 兼容基础 URL</label>
      <input
        type="text"
        value={baseUrl}
        onChange={(event) => onBaseUrlChange(event.target.value)}
        className={inputClassName}
        placeholder="例如：https://api.example.com/v1"
      />
      <p className="mt-2 text-xs leading-5 text-slate-500">
        需要兼容 OpenAI 风格的图片生成接口，URL 通常需要包含 /v1。
      </p>
    </div>
  );

  const renderCheckModelsButton = (fullWidth = false) => {
    if (modelsChecked && models.length > 0) return null;

    return (
      <button
        type="button"
        onClick={() => void fetchModels()}
        disabled={modelsLoading || !baseUrl.trim()}
        className={`aippt-ghost-button ${
          fullWidth ? "w-full" : "w-fit"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {modelsLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在检查模型...
          </span>
        ) : (
          "检查模型"
        )}
      </button>
    );
  };

  const renderModelSelect = () => {
    if (!modelsChecked || models.length === 0) return null;

    return (
      <div>
        <label className={labelClassName}>选择图片模型</label>
        <Popover open={openModelSelect} onOpenChange={setOpenModelSelect}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openModelSelect}
              className={`${inputClassName} justify-between px-4 font-normal hover:border-indigo-300`}
            >
              <span className="truncate text-sm font-semibold text-slate-900">
                {model || "选择模型"}
              </span>
              <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command>
              <CommandInput placeholder="搜索模型..." />
              <CommandList>
                <CommandEmpty>未找到模型。</CommandEmpty>
                <CommandGroup>
                  {models.map((modelName) => (
                    <CommandItem
                      key={modelName}
                      value={modelName}
                      onSelect={() => {
                        onModelChange(modelName);
                        setOpenModelSelect(false);
                      }}
                    >
                      <Check
                        className={
                          model === modelName
                            ? "mr-2 h-4 w-4 opacity-100"
                            : "mr-2 h-4 w-4 opacity-0"
                        }
                      />
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {modelName}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderManualModelField = () => {
    if (!modelsChecked || models.length > 0) return null;

    return (
      <div>
        <label className={labelClassName}>图片模型 ID</label>
        <input
          type="text"
          value={model}
          onChange={(event) => onModelChange(event.target.value)}
          className={inputClassName}
          placeholder="例如：dall-e-3、gpt-image-1"
        />
      </div>
    );
  };

  if (layout === "textProviderSettings") {
    return (
      <div className="md:col-span-2">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2">
          {renderApiKeyField()}
          {renderBaseUrlField()}
          {renderModelSelect()}
          {renderManualModelField()}
          <div className="flex items-end">
            {renderCheckModelsButton()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm leading-6 text-slate-600">
        使用支持 OpenAI 风格 <code className="rounded bg-white px-1 py-0.5 text-xs">/v1/images/generations</code>{" "}
        的端点，基础 URL 通常需要包含{" "}
        <code className="rounded bg-white px-1 py-0.5 text-xs">/v1</code>。
      </div>

      {renderBaseUrlField()}
      {renderApiKeyField()}
      {renderCheckModelsButton(true)}

      {modelsChecked && models.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            未找到模型。请确认 API Key 有效且具备模型访问权限。
          </p>
        </div>
      )}

      {renderManualModelField()}

      {modelsChecked && models.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            请选择服务端已开放用于图片生成的模型。
          </p>
        </div>
      )}

      {renderModelSelect()}
    </div>
  );
}
