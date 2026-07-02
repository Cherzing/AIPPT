export interface ModelOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  size: string;
}

export interface ImageProviderOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  requiresApiKey?: boolean;
  apiKeyField?: string;
  apiKeyFieldLabel?: string;
  getApiKeyUrl?: string;
}

export interface LLMProviderOption {
  value: string;
  label: string;
  description?: string;
  model_value?: string;
  model_label?: string;
  url?: string;
  icon?: string;
  getApiKeyUrl?: string;
}

export interface WebSearchProviderOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
  apiKeyField?: string;
  apiKeyLabel?: string;
  urlField?: string;
  urlLabel?: string;
}

export const WEB_SEARCH_PROVIDERS: Record<string, WebSearchProviderOption> = {
  auto: {
    value: "auto",
    label: "默认（模型）",
    description:
      "优先使用模型原生联网能力；如果当前模型不支持，则在你选择外部搜索提供商前保持关闭。",
    icon: "/providers/model-search.svg",
  },
  searxng: {
    value: "searxng",
    label: "SearXNG",
    description: "使用自托管的 SearXNG 实例。",
    icon: "/providers/searxng.svg",
    urlField: "SEARXNG_BASE_URL",
    urlLabel: "SearXNG 基础 URL",
  },
  tavily: {
    value: "tavily",
    label: "Tavily",
    description: "面向 AI 应用优化的搜索 API。",
    icon: "/providers/tavily.png",
    apiKeyField: "TAVILY_API_KEY",
    apiKeyLabel: "Tavily API Key",
  },
  exa: {
    value: "exa",
    label: "Exa",
    description: "面向 AI 的原生联网搜索，并提供结果高亮摘要。",
    icon: "/providers/exa.png",
    apiKeyField: "EXA_API_KEY",
    apiKeyLabel: "Exa API Key",
  },
  brave: {
    value: "brave",
    label: "Brave",
    description: "使用 Brave Search API 获取网页搜索结果。",
    icon: "/providers/brave.svg",
    apiKeyField: "BRAVE_SEARCH_API_KEY",
    apiKeyLabel: "Brave Search API Key",
  },
  // serper: {
  //   value: "serper",
  //   label: "Serper",
  //   description: "Google search results via Serper.",
  //   apiKeyField: "SERPER_API_KEY",
  //   apiKeyLabel: "Serper API key",
  // },
};

export const IMAGE_PROVIDERS: Record<string, ImageProviderOption> = {
  pexels: {
    value: "pexels",
    label: "Pexels",
    description: "免费图库照片和视频平台",
    icon: "/providers/pexel.png",
    requiresApiKey: true,
    apiKeyField: "PEXELS_API_KEY",
    apiKeyFieldLabel: "Pexels API Key",
    getApiKeyUrl: "#",
  },
  pixabay: {
    value: "pixabay",
    label: "Pixabay",
    description: "免费图片和视频资源",
    icon: "/providers/pixabay.png",
    requiresApiKey: true,
    apiKeyField: "PIXABAY_API_KEY",
    apiKeyFieldLabel: "Pixabay API Key",
    getApiKeyUrl: "#",
  },
  "dall-e-3": {
    value: "dall-e-3",
    label: "DALL-E 3",
    description: "OpenAI 图片生成模型",
    icon: "/providers/openai.png",
    requiresApiKey: true,
    apiKeyField: "OPENAI_API_KEY",
    apiKeyFieldLabel: "OpenAI API Key",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+openai+api+key&ie=UTF-8",
  },
  "gpt-image-1.5": {
    value: "gpt-image-1.5",
    label: "GPT Image 1.5",
    description: "OpenAI 图片生成模型",
    icon: "/providers/openai.png",
    requiresApiKey: true,
    apiKeyField: "OPENAI_API_KEY",
    apiKeyFieldLabel: "OpenAI API Key",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+openai+api+key&ie=UTF-8",
  },
  gemini_flash: {
    value: "gemini_flash",
    label: "Gemini Flash",
    description: "Google 快速图片生成模型",
    icon: "/providers/gemini-color.svg",
    requiresApiKey: true,
    apiKeyField: "GOOGLE_API_KEY",
    apiKeyFieldLabel: "Google API Key",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+google+AI+studio+api+key&sxsrf=ANbL-n5_hUGaEiG9v6k9VxZWyv0mqO0Jew%3A1776339625724",
  },
  nanobanana_pro: {
    value: "nanobanana_pro",
    label: "NanoBanana Pro",
    description: "Google 高级图片生成模型",
    icon: "/providers/gemini-color.svg",
    requiresApiKey: true,
    apiKeyField: "GOOGLE_API_KEY",
    apiKeyFieldLabel: "Google API Key",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+google+AI+studio+api+key&sxsrf=ANbL-n5_hUGaEiG9v6k9VxZWyv0mqO0Jew%3A1776339625724",
  },
  comfyui: {
    value: "comfyui",
    label: "ComfyUI",
    description: "使用本地 ComfyUI 服务和自定义工作流",
    icon: "/providers/comfyui-color.svg",
    requiresApiKey: false,
    apiKeyField: "COMFYUI_URL",
    apiKeyFieldLabel: "ComfyUI 服务 URL",
  },
  open_webui: {
    value: "open_webui",
    label: "Open WebUI",
    description: "使用 Open WebUI 服务生成图片",
    icon: "/providers/open-webui.png",
    requiresApiKey: false,
    apiKeyField: "OPEN_WEBUI_IMAGE_URL",
    apiKeyFieldLabel: "Open WebUI URL",
  },
  openai_compatible: {
    value: "openai_compatible",
    label: "自定义",
    description:
      "OpenAI 兼容的 /v1/images 接口（LiteLLM、Azure、vLLM 等）",
    icon: "/providers/custom.svg",
    requiresApiKey: false,
    apiKeyField: "OPENAI_COMPAT_IMAGE_BASE_URL",
    apiKeyFieldLabel: "OpenAI 兼容基础 URL",
  },
};

export const LLM_PROVIDERS: Record<string, LLMProviderOption> = {
  codex: {
    value: "codex",
    label: "ChatGPT",
    description: "通过 OAuth 使用 ChatGPT Plus/Pro",
    icon: "/providers/openai.png",
  },
  openai: {
    value: "openai",
    label: "OpenAI",
    description: "OpenAI 文本生成模型",
    url: "https://api.openai.com/v1",
    icon: "/providers/openai.png",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+openai+api+key&ie=UTF-8",
  },
  deepseek: {
    value: "deepseek",
    label: "DeepSeek",
    description: "通过 DeepSeek API 使用 DeepSeek 模型",
    url: "https://api.deepseek.com/v1",
    icon: "/providers/openai.png",
    getApiKeyUrl: "https://platform.deepseek.com/api_keys",
  },
  google: {
    value: "google",
    label: "Google",
    description: "Google 文本生成模型",
    url: "https://api.google.com/v1",
    icon: "/providers/gemini-color.svg",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+google+AI+studio+api+key&sxsrf=ANbL-n5_hUGaEiG9v6k9VxZWyv0mqO0Jew%3A1776339625724",
  },
  vertex: {
    value: "vertex",
    label: "Vertex AI",
    description: "Google Vertex AI 模型",
    icon: "/providers/gemini-color.svg",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+vertex+ai+api+key",
  },
  azure: {
    value: "azure",
    label: "Azure OpenAI",
    description: "Azure 托管的 OpenAI 部署",
    icon: "/providers/openai.png",
    getApiKeyUrl: "https://www.google.com/search?q=azure+openai+api+key",
  },
  bedrock: {
    value: "bedrock",
    label: "Amazon Bedrock",
    description: "AWS Bedrock 基础模型",
    icon: "/providers/custom.svg",
  },
  openrouter: {
    value: "openrouter",
    label: "OpenRouter",
    description: "通过 OpenRouter 的 OpenAI 兼容 API 使用多种模型",
    url: "https://openrouter.ai/api/v1",
    icon: "/providers/openai.png",
    getApiKeyUrl: "https://openrouter.ai/keys",
  },
  cerebras: {
    value: "cerebras",
    label: "Cerebras",
    description: "通过 OpenAI 兼容 API 使用 Cerebras Cloud",
    url: "https://api.cerebras.ai/v1",
    icon: "/providers/openai.png",
    getApiKeyUrl: "https://inference-docs.cerebras.ai",
  },
  litellm: {
    value: "litellm",
    label: "LiteLLM",
    description: "OpenAI 兼容的 LiteLLM 代理或网关",
    icon: "/providers/openai.png",
  },
  fireworks: {
    value: "fireworks",
    label: "Fireworks",
    description: "通过 OpenAI 兼容 API 使用 Fireworks AI",
    url: "https://api.fireworks.ai/inference/v1",
    icon: "/providers/openai.png",
    getApiKeyUrl: "https://fireworks.ai/account/api-keys",
  },
  together: {
    value: "together",
    label: "Together AI",
    description: "通过 OpenAI 兼容 API 使用 Together AI",
    url: "https://api.together.ai/v1",
    icon: "/providers/openai.png",
    getApiKeyUrl: "https://api.together.xyz/settings/api-keys",
  },
  lmstudio: {
    value: "lmstudio",
    label: "LM Studio",
    description: "本地 LM Studio OpenAI 兼容服务",
    url: "http://localhost:1234/v1",
    icon: "/providers/lm-studio.svg",
  },
  anthropic: {
    value: "anthropic",
    label: "Anthropic",
    description: "Anthropic Claude 模型",
    url: "https://api.anthropic.com/v1",
    icon: "/providers/claude-color.svg",
    getApiKeyUrl: "https://www.google.com/search?q=how+to+get+anthropic+api+key&sxsrf=ANbL-n7lsueZQ88L56HhqC1ch2PGD0rbNQ%3A1776339632265",
  },
  ollama: {
    value: "ollama",
    label: "Ollama",
    description: "Ollama 的主要文本生成模型",
    icon: "/providers/ollama.svg",
  },
  custom: {
    value: "custom",
    label: "自定义",
    description: "OpenAI 兼容的大语言模型",
    icon: "/providers/custom.svg",
  },

};

export const DALLE_3_QUALITY_OPTIONS = [
  {
    label: "标准",
    value: "standard",
    description: "生成更快，成本更低",
  },
  {
    label: "高清",
    value: "hd",
    description: "图片质量更高，成本也更高",
  },
];

export const GPT_IMAGE_1_5_QUALITY_OPTIONS = [
  {
    label: "低",
    value: "low",
    description: "速度最快，成本最低",
  },
  {
    label: "中",
    value: "medium",
    description: "质量与速度均衡",
  },
  {
    label: "高",
    value: "high",
    description: "质量最佳，生成时间更长",
  },
];
