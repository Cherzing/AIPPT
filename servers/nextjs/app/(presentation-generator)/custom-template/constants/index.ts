/**
 * Constants for Custom Template Creation Flow
 */

import { TemplateCreationStep } from "../types";

export const TEMPLATE_STEPS: Record<TemplateCreationStep, { title: string; description: string }> = {
    'file-upload': {
        title: '上传模板',
        description: '上传 PPTX 文件以开始创建模板',
    },
    'font-check': {
        title: '检查字体',
        description: '正在检查演示文稿中的字体',
    },
    'font-upload': {
        title: '上传字体',
        description: '上传缺失字体以确保渲染准确',
    },
    'slides-preview': {
        title: '预览页面',
        description: '处理前先检查每一页内容',
    },
    'template-creation': {
        title: '创建模板',
        description: '正在将页面转换为可复用模板',
    },
    'completed': {
        title: '已完成',
        description: '模板已准备好，可立即保存',
    },
};

export const UI_CONFIG = {
    schemaEditorWidth: '520px',
    slideGridGap: '20px',
    maxContentWidth: '1400px',
}

export const HIGHLIGHTS_ITEMS = [
    {
        number: "1",
        title: "耗时",
        description: "手动排版和逐页复制会反复消耗大量时间",
    },
    {
        number: "2",
        title: "成本高",
        description: "设计资源不该浪费在重复性模板整理工作上",
    },
    {
        number: "3",
        title: "不稳定",
        description: "AI 生成版式如果缺少模板约束，往往需要反复修正",
    },
]

export const TAILWIND_CDN_URL = "https://cdn.tailwindcss.com";

export const FAQS = [
    {
        question: "什么是自定义模板创建？",
        answer: "你可以通过上传现有 PPTX 文件，提取其中的页面结构并生成可复用模板。",
    },
    {
        question: "如何创建自定义模板？",
        answer: "上传一个 PPTX 文件，完成字体检查后，系统会继续处理并生成模板。",
    },
    {
        question: "为什么需要检查字体？",
        answer: "如果 PPTX 中使用了系统缺失字体，先补齐字体能确保页面还原更准确。",
    },
    {
        question: "模板生成后可以做什么？",
        answer: "生成后的模板可用于后续 AIPPT 创建，帮助保持页面风格一致。",
    },
]
