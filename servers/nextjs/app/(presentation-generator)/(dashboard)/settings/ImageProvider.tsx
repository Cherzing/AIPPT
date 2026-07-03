import ToolTip from "@/components/ToolTip";
import OpenAICompatibleImageFields from "@/components/OpenAICompatibleImageFields";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LLMConfig } from "@/types/llm_config";
import {
  DALLE_3_QUALITY_OPTIONS,
  GPT_IMAGE_1_5_QUALITY_OPTIONS,
  IMAGE_PROVIDERS,
} from "@/utils/providerConstants";
import { MixpanelEvent, trackEvent } from "@/utils/mixpanel";
import { Check, ChevronUp, Eye, EyeOff, ImageIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

const fieldClassName =
  "aippt-input h-12 w-full rounded-2xl border-slate-200 bg-white/90 text-sm shadow-[0_10px_24px_rgba(15,23,42,0.04)]";

const labelClassName = "mb-2 block text-sm font-semibold text-slate-700";

const ImageProvider = ({
  llmConfig,
  setLlmConfig,
}: {
  llmConfig: LLMConfig;
  setLlmConfig: (config: any) => void;
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [openImageProviderSelect, setOpenImageProviderSelect] = useState(false);
  const [openaiCompatListMeta, setOpenaiCompatListMeta] = useState<{
    modelsChecked: boolean;
    modelCount: number;
  }>({ modelsChecked: false, modelCount: 0 });

  useEffect(() => {
    if (llmConfig.IMAGE_PROVIDER !== "openai_compatible") {
      setOpenaiCompatListMeta({ modelsChecked: false, modelCount: 0 });
    }
  }, [llmConfig.IMAGE_PROVIDER]);

  const isImageGenerationDisabled = llmConfig.DISABLE_IMAGE_GENERATION ?? false;
  const selectedProvider = llmConfig.IMAGE_PROVIDER
    ? IMAGE_PROVIDERS[llmConfig.IMAGE_PROVIDER]
    : undefined;

  const handleChangeImageGenerationDisabled = (value: boolean) => {
    trackEvent(MixpanelEvent.Settings_Provider_Selected, {
      section: "image_provider",
      enabled: !value,
      provider: value ? "disabled" : llmConfig.IMAGE_PROVIDER || "",
    });
    setLlmConfig((prev: any) => ({
      ...prev,
      DISABLE_IMAGE_GENERATION: value,
    }));
  };

  const inputFieldChanged = (value: string, field: string) => {
    setLlmConfig((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getFieldValue = (field?: string) => {
    if (!field) return "";
    return (llmConfig as Record<string, string | undefined>)[field] || "";
  };

  const updateFieldValue = (field: string | undefined, value: string) => {
    if (!field) return;
    setLlmConfig((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderQualitySelector = () => {
    if (llmConfig.IMAGE_PROVIDER === "dall-e-3") {
      return (
        <div>
          <label className={labelClassName}>DALL-E 3 图片质量</label>
          <Select
            value={llmConfig.DALL_E_3_QUALITY || "standard"}
            onValueChange={(value) =>
              inputFieldChanged(value, "DALL_E_3_QUALITY")
            }
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue placeholder="选择质量" />
            </SelectTrigger>
            <SelectContent>
              {DALLE_3_QUALITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (llmConfig.IMAGE_PROVIDER === "gpt-image-1.5") {
      return (
        <div>
          <label className={labelClassName}>GPT Image 1.5 图片质量</label>
          <Select
            value={llmConfig.GPT_IMAGE_1_5_QUALITY || "low"}
            onValueChange={(value) =>
              inputFieldChanged(value, "GPT_IMAGE_1_5_QUALITY")
            }
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue placeholder="选择质量" />
            </SelectTrigger>
            <SelectContent>
              {GPT_IMAGE_1_5_QUALITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return null;
  };

  const renderProviderFields = () => {
    if (!selectedProvider) return null;

    if (selectedProvider.value === "openai_compatible") {
      return (
        <OpenAICompatibleImageFields
          layout="textProviderSettings"
          baseUrl={llmConfig.OPENAI_COMPAT_IMAGE_BASE_URL || ""}
          apiKey={llmConfig.OPENAI_COMPAT_IMAGE_API_KEY || ""}
          model={llmConfig.OPENAI_COMPAT_IMAGE_MODEL || ""}
          onBaseUrlChange={(value) => {
            setLlmConfig((prev: any) => ({
              ...prev,
              OPENAI_COMPAT_IMAGE_BASE_URL: value,
            }));
          }}
          onApiKeyChange={(value) => {
            setLlmConfig((prev: any) => ({
              ...prev,
              OPENAI_COMPAT_IMAGE_API_KEY: value,
            }));
          }}
          onModelChange={(value) => {
            setLlmConfig((prev: any) => ({
              ...prev,
              OPENAI_COMPAT_IMAGE_MODEL: value,
            }));
          }}
          onModelListMetaChange={setOpenaiCompatListMeta}
        />
      );
    }

    if (selectedProvider.value === "comfyui") {
      return (
        <>
          <div>
            <label className={labelClassName}>ComfyUI 服务 URL</label>
            <input
              type="text"
              placeholder="http://192.168.1.7:8188"
              className={fieldClassName}
              value={llmConfig.COMFYUI_URL || ""}
              onChange={(event) =>
                inputFieldChanged(event.target.value, "COMFYUI_URL")
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClassName}>工作流 JSON</label>
            <textarea
              placeholder="在此粘贴 ComfyUI 工作流 JSON（在 ComfyUI 中通过 Export (API) 导出）"
              className="aippt-input min-h-[120px] w-full resize-y rounded-2xl border-slate-200 bg-white/90 font-mono text-xs shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
              rows={4}
              value={llmConfig.COMFYUI_WORKFLOW || ""}
              onChange={(event) =>
                inputFieldChanged(event.target.value, "COMFYUI_WORKFLOW")
              }
            />
          </div>
        </>
      );
    }

    if (selectedProvider.value === "open_webui") {
      return (
        <>
          <div>
            <label className={labelClassName}>Open WebUI URL</label>
            <input
              type="text"
              placeholder="http://localhost:3000/api/v1"
              className={fieldClassName}
              value={llmConfig.OPEN_WEBUI_IMAGE_URL || ""}
              onChange={(event) =>
                inputFieldChanged(event.target.value, "OPEN_WEBUI_IMAGE_URL")
              }
            />
          </div>
          <div>
            <label className={labelClassName}>API Key（可选）</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                placeholder="API Key"
                className={`${fieldClassName} pr-12`}
                value={llmConfig.OPEN_WEBUI_IMAGE_API_KEY || ""}
                onChange={(event) =>
                  inputFieldChanged(
                    event.target.value,
                    "OPEN_WEBUI_IMAGE_API_KEY"
                  )
                }
              />
              <button
                type="button"
                aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
                onClick={() => setShowApiKey((prev) => !prev)}
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
        </>
      );
    }

    return (
      <div>
        <label className={labelClassName}>
          {selectedProvider.apiKeyFieldLabel}
        </label>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            placeholder={`请输入 ${selectedProvider.apiKeyFieldLabel}`}
            className={`${fieldClassName} pr-12`}
            value={getFieldValue(selectedProvider.apiKeyField)}
            onChange={(event) =>
              updateFieldValue(selectedProvider.apiKeyField, event.target.value)
            }
          />
          <button
            type="button"
            aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
            onClick={() => setShowApiKey((prev) => !prev)}
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
  };

  return (
    <div className="aippt-soft-card space-y-6 p-6 sm:p-7">
      <div className="flex flex-col gap-5 border-b border-slate-200/70 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
            <ImageIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <span className="aippt-section-eyebrow">图片资源</span>
            <h3 className="mt-3 text-xl font-semibold text-slate-950">
              图片生成设置
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              选择图片生成模型或素材来源。生成 PPT 时，系统会按照当前提供商配置自动匹配图片资源。
            </p>
          </div>
        </div>

        <ToolTip content="开启或关闭图片生成">
          <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] lg:w-auto lg:min-w-[190px]">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isImageGenerationDisabled ? "已关闭" : "已启用"}
              </p>
              <p className="text-xs text-slate-500">图片生成能力</p>
            </div>
            <Switch
              checked={!isImageGenerationDisabled}
              className="data-[state=checked]:bg-[#4F46E5] data-[state=unchecked]:bg-slate-300"
              onCheckedChange={(checked) =>
                handleChangeImageGenerationDisabled(!checked)
              }
            />
          </div>
        </ToolTip>
      </div>

      {isImageGenerationDisabled ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
          <p className="text-sm font-semibold text-slate-800">
            图片生成已关闭
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            开启后可配置图库、图片模型或 OpenAI 兼容接口；关闭时生成 PPT 将跳过自动配图。
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClassName}>选择图片提供商</label>
              <Popover
                open={openImageProviderSelect}
                onOpenChange={setOpenImageProviderSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openImageProviderSelect}
                    className={`${fieldClassName} justify-between px-4 font-normal hover:border-indigo-300`}
                  >
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {selectedProvider?.label || "选择图片提供商"}
                    </span>
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  align="start"
                  style={{ width: "min(420px, var(--radix-popover-trigger-width))" }}
                >
                  <Command>
                    <CommandInput placeholder="搜索提供商..." />
                    <CommandList>
                      <CommandEmpty>未找到提供商。</CommandEmpty>
                      <CommandGroup>
                        {Object.values(IMAGE_PROVIDERS).map((provider) => (
                          <CommandItem
                            key={provider.value}
                            value={provider.value}
                            onSelect={(value) => {
                              trackEvent(MixpanelEvent.Settings_Provider_Selected, {
                                section: "image_provider",
                                provider: value,
                              });
                              inputFieldChanged(value, "IMAGE_PROVIDER");
                              setOpenImageProviderSelect(false);
                            }}
                          >
                            <Check
                              className={
                                llmConfig.IMAGE_PROVIDER === provider.value
                                  ? "mr-2 h-4 w-4 opacity-100"
                                  : "mr-2 h-4 w-4 opacity-0"
                              }
                            />
                            <div className="flex min-w-0 flex-1 flex-col space-y-1">
                              <span className="text-sm font-semibold text-slate-900">
                                {provider.label}
                              </span>
                              <span className="text-xs leading-relaxed text-slate-500">
                                {provider.description}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedProvider?.description && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
                  当前来源
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {selectedProvider.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {selectedProvider.description}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderProviderFields()}
            {renderQualitySelector()}
          </div>
        </div>
      )}

      {!isImageGenerationDisabled &&
        llmConfig.IMAGE_PROVIDER === "openai_compatible" &&
        openaiCompatListMeta.modelsChecked &&
        openaiCompatListMeta.modelCount === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              未找到模型。请确认提供商凭据有效，并且当前提供商可以访问。
            </p>
            <div className="mt-4 max-w-md">
              <label className={labelClassName}>图片模型 ID</label>
              <input
                type="text"
                placeholder="例如：dall-e-3、gpt-image-1"
                className={fieldClassName}
                value={llmConfig.OPENAI_COMPAT_IMAGE_MODEL || ""}
                onChange={(event) => {
                  setLlmConfig((prev: any) => ({
                    ...prev,
                    OPENAI_COMPAT_IMAGE_MODEL: event.target.value,
                  }));
                }}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default ImageProvider;
