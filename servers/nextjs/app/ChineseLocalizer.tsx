"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const exactTranslations: Record<string, string> = {
  "Unauthorized": "未授权",
  "Sign in to view this page.": "请先登录后查看此页面。",
  "Could not load login": "无法加载登录信息",
  "We could not connect to the login service. Please refresh and try again.": "无法连接登录服务，请刷新页面后重试。",
  "Username too short": "用户名太短",
  "Your username must be at least 3 characters.": "用户名至少需要 3 个字符。",
  "Password too short": "密码太短",
  "Your password must be at least 6 characters.": "密码至少需要 6 个字符。",
  "Passwords do not match": "两次密码不一致",
  "Make sure both password fields match before continuing.": "继续前请确认两次输入的密码一致。",
  "Sign-in failed": "登录失败",
  "The username or password is incorrect. Please try again.": "用户名或密码不正确，请重试。",
  "Could not create account": "无法创建账户",
  "Something went wrong. Please try again.": "出现错误，请重试。",
  "Account created": "账户已创建",
  "Sign in with your new username and password to continue.": "请使用新用户名和密码登录后继续。",
  "Signed in": "已登录",
  "Welcome back. Loading your workspace.": "欢迎回来，正在加载工作区。",
  "Login unavailable": "登录暂不可用",
  "The login service is unavailable right now. Please try again in a moment.": "登录服务当前不可用，请稍后重试。",
  "Secure instance": "安全实例",
  "Create your admin login": "创建管理员登录信息",
  "Sign in to continue": "登录后继续",
  "One-time setup for this deployment. You will use the same username and password on future visits.": "此部署仅需一次初始化设置。后续访问将使用同一组用户名和密码。",
  "This deployment is protected. Enter your credentials to open the app.": "此部署已受保护。请输入凭据以打开应用。",
  "Username": "用户名",
  "Password": "密码",
  "Confirm password": "确认密码",
  "Setup is complete for this instance. Use the username and password you configured.": "此实例已完成设置。请使用已配置的用户名和密码。",
  "Create account": "创建账户",
  "Sign in": "登录",
  "Sign out": "退出登录",
  "Logout": "退出登录",
  "Signed out": "已退出登录",
  "Sign-out failed": "退出登录失败",
  "Signing out...": "正在退出登录...",
  "Preparing your workspace": "正在准备工作区",
  "Initializing Application": "正在初始化应用",
  "Loading configuration and checking model availability...": "正在加载配置并检查模型可用性...",
  "Could not connect to Ollama": "无法连接 Ollama",
  "Check the Ollama URL and try again.": "请检查 Ollama URL 后重试。",

  "Dashboard": "仪表盘",
  "Standard": "标准模板",
  "Smart": "智能模板",
  "Settings": "设置",
  "Settings page": "设置页面",
  "Templates": "模板",
  "Template": "模板",
  "Theme": "主题",
  "Themes": "主题",
  "Built-in": "内置",
  "Custom": "自定义",
  "Upload": "上传",
  "Download": "下载",
  "Export": "导出",
  "Import": "导入",
  "Save": "保存",
  "Saved": "已保存",
  "Cancel": "取消",
  "Continue": "继续",
  "Back": "返回",
  "Next": "下一步",
  "Delete": "删除",
  "Edit": "编辑",
  "Retry": "重试",
  "Close": "关闭",
  "Search": "搜索",
  "Preview": "预览",
  "Loading": "加载中",
  "Loading...": "加载中...",
  "Success": "成功",
  "Error": "错误",
  "Warning": "警告",
  "Failed": "失败",

  "Create presentation": "创建演示文稿",
  "Create Presentation": "创建演示文稿",
  "Create New Presentation": "新建演示文稿",
  "Create new presentation": "新建演示文稿",
  "New Presentation": "新建演示文稿",
  "Generate presentation": "生成演示文稿",
  "Generate Presentation": "生成演示文稿",
  "Generating presentation": "正在生成演示文稿",
  "Presentation generation completed": "演示文稿生成完成",
  "Presentation generation failed": "演示文稿生成失败",
  "Failed to load presentation": "加载演示文稿失败",
  "The presentation could not be loaded. Please try again.": "无法加载演示文稿，请重试。",
  "No presentation id found": "未找到演示文稿 ID",
  "Welcome on board!": "欢迎使用 AIPPT！",
  "Usage analytics": "使用情况分析",
  "Help improve AIPPT by sharing anonymous usage data.": "共享匿名使用数据，帮助改进 AIPPT。",
  "Celebrate again!": "再次庆祝",
  "Go to your dashboard": "前往仪表盘",

  "Text Generation Settings": "文本生成设置",
  "Image Generation Settings": "图片生成设置",
  "Web Search Settings": "联网搜索设置",
  "Choosing your text generation model": "选择文本生成模型",
  "Choosing where images come from": "选择图片来源",
  "Bring current information into generated presentations": "为生成的演示文稿引入最新信息",
  "Select Text Provider": "选择文本提供商",
  "Select Image Provider": "选择图片提供商",
  "Select Web Search Provider": "选择联网搜索提供商",
  "Enable/Disable Image Generation": "启用/禁用图片生成",
  "Enable/Disable Web Search": "启用/禁用联网搜索",
  "Continue to image provider": "继续配置图片提供商",
  "Continue to web search": "继续配置联网搜索",
  "Disable image generation & Continue": "禁用图片生成并继续",
  "Save & Finish": "保存并完成",
  "Disable web search & Finish": "禁用联网搜索并完成",

  "API Key": "API Key",
  "API key": "API Key",
  "Anthropic API key": "Anthropic API Key",
  "Anthropic API Key": "Anthropic API Key",
  "Your API key will be stored locally and never shared": "你的 API Key 将保存在本地，不会被共享",
  "Enter your API key": "输入 API Key",
  "Enter your Anthropic API key": "输入 Anthropic API Key",
  "Enter your URL": "输入 URL",
  "Enter your API Key": "输入 API Key",
  "Check for available models": "检查可用模型",
  "Checking for models...": "正在检查模型...",
  "Could not load models": "无法加载模型",
  "The server could not list models. Check your API key or endpoint and try again.": "服务器无法列出模型。请检查 API Key 或接口地址后重试。",
  "Select a model": "选择模型",
  "Select Model": "选择模型",
  "Select Anthropic Model": "选择 Anthropic 模型",
  "Search models...": "搜索模型...",
  "Search model...": "搜索模型...",
  "No model found.": "未找到模型。",
  "No models found. Please make sure your API key is valid and has access to models.": "未找到模型。请确认 API Key 有效且拥有模型访问权限。",
  "No models found. Please make sure your API key is valid and has access to Anthropic models.": "未找到模型。请确认 API Key 有效且拥有 Anthropic 模型访问权限。",
  "Important:": "重要：",

  "Quality": "质量",
  "Select a quality": "选择质量",
  "Low": "低",
  "Medium": "中",
  "High": "高",
  "HD": "高清",
  "Faster generation with lower cost": "生成更快，成本更低",
  "Higher quality images with increased cost": "图片质量更高，成本也更高",
  "Fastest and most cost-effective": "最快且最经济",
  "Balanced quality and speed": "质量与速度平衡",
  "Best quality with longer generation time": "质量最佳，但生成时间更长",

  "Slide": "幻灯片",
  "Slides": "幻灯片",
  "Outline": "大纲",
  "Outlines": "大纲",
  "Generate Outline": "生成大纲",
  "Edit Outline": "编辑大纲",
  "Upload file": "上传文件",
  "Upload Files": "上传文件",
  "Upload documents": "上传文档",
  "Attached files": "已附加文件",
  "Some files are not supported": "部分文件不受支持",
  "Supported: Word, PowerPoint, spreadsheets, PDF/TXT, and image files.": "支持：Word、PowerPoint、表格、PDF/TXT 和图片文件。",
  "Maximum file limit reached": "已达到文件数量上限",
  "Files selected": "已选择文件",

  "Title": "标题",
  "Description": "描述",
  "Name": "名称",
  "Content": "内容",
  "Image": "图片",
  "Images": "图片",
  "Icon": "图标",
  "Icons": "图标",
  "Chart": "图表",
  "Table": "表格",
  "Text": "文本",
  "Color": "颜色",
  "Font": "字体",
  "Layout": "版式",
  "Layouts": "版式",
  "Primary Color": "主色",
  "Background Color": "背景色",
  "Background Text": "背景文字",
  "Primary Text": "主文字",
  "Card Color": "卡片颜色",
  "Enter company name": "输入公司名称",
  "Create new theme": "新建主题",
  "Theme updated": "主题已更新",
  "Your theme changes were saved.": "主题更改已保存。",
  "Theme saved": "主题已保存",
  "Your new theme was created and is ready to use.": "新主题已创建，可立即使用。",
  "Theme deleted": "主题已删除",
  "The theme was removed from your library.": "该主题已从你的库中移除。",
  "Start with a blank canvas": "从空白画布开始",

  "Launching AIPPT...": "正在启动 AIPPT...",
  "Please wait a moment": "请稍候",
  "Launching AIPPT": "正在启动 AIPPT",
  "Opening your workspace": "正在打开工作区",
};

const attributeNames = ["placeholder", "title", "aria-label", "alt"];

function withOriginalSpacing(original: string, translated: string) {
  const prefix = original.match(/^\s*/)?.[0] ?? "";
  const suffix = original.match(/\s*$/)?.[0] ?? "";
  return `${prefix}${translated}${suffix}`;
}

function translate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const exact = exactTranslations[trimmed];
  if (exact) return withOriginalSpacing(value, exact);

  const removeMatch = trimmed.match(/^Remove (.+)$/);
  if (removeMatch) return withOriginalSpacing(value, `移除 ${removeMatch[1]}`);

  const uploadLimitMatch = trimmed.match(/^You can upload up to (\d+) documents only\.$/);
  if (uploadLimitMatch) return withOriginalSpacing(value, `最多只能上传 ${uploadLimitMatch[1]} 个文档。`);

  const filesAddedMatch = trimmed.match(/^(\d+) file\(s\) have been added\.$/);
  if (filesAddedMatch) return withOriginalSpacing(value, `已添加 ${filesAddedMatch[1]} 个文件。`);

  const slideMatch = trimmed.match(/^Slide (\d+)$/);
  if (slideMatch) return withOriginalSpacing(value, `幻灯片 ${slideMatch[1]}`);

  const customThemeMatch = trimmed.match(/^Custom version of (.+)$/);
  if (customThemeMatch) return withOriginalSpacing(value, `${customThemeMatch[1]} 的自定义版本`);

  return value;
}

function localizeElement(element: Element) {
  for (const attr of attributeNames) {
    const value = element.getAttribute(attr);
    if (!value) continue;
    const translated = translate(value);
    if (translated !== value) element.setAttribute(attr, translated);
  }
}

function localizeNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const current = node.textContent ?? "";
    const translated = translate(current);
    if (translated !== current) node.textContent = translated;
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  if (
    tagName === "script" ||
    tagName === "style" ||
    element.closest("[data-no-zh-localize]") ||
    element.closest("[data-slide-render]") ||
    element.closest("[data-presentation-render]")
  ) {
    return;
  }

  localizeElement(element);
  element.childNodes.forEach(localizeNode);
}

function hideChatGptOnboardingOption() {
  const texts = ["ChatGPT", "使用 ChatGPT 登录", "连接你的 ChatGPT 账户并选择一个受支持的模型。", "Use your ChatGPT account", "Connect your ChatGPT account and choose a supported model."];
  const selectors = ["button", "div", "p", "span"];
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((el) => {
      const text = (el.textContent || '').trim();
      if (!text) return;
      if (texts.includes(text)) {
        const card = (el.closest('[role=tab]') || el.closest('button') || el.closest('div')) as HTMLElement | null;
        if (card) card.style.display = 'none';
      }
    });
  }
}

export default function ChineseLocalizer() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/pdf-maker")) return;

    localizeNode(document.body);
    hideChatGptOnboardingOption();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          localizeNode(mutation.target);
          continue;
        }

        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          localizeElement(mutation.target);
          continue;
        }

        mutation.addedNodes.forEach(localizeNode);
        hideChatGptOnboardingOption();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributeNames,
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
