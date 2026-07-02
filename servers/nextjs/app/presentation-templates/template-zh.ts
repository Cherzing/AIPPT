import type {
  TemplateLayoutsWithSettings,
  TemplateWithData,
} from "./utils";

const templateText: Record<string, { name: string; description: string }> = {
  general: {
    name: "\u901a\u7528\u6a21\u677f",
    description: "\u9002\u7528\u4e8e\u5e38\u89c1\u6f14\u793a\u573a\u666f\u7684\u901a\u7528\u7248\u5f0f",
  },
  modern: {
    name: "\u73b0\u4ee3\u5546\u52a1",
    description: "\u767d\u8272\u4e0e\u84dd\u8272\u4e3a\u4e3b\u7684\u73b0\u4ee3\u5546\u52a1\u6f14\u793a\u6a21\u677f",
  },
  standard: {
    name: "\u6807\u51c6\u6a21\u677f",
    description: "\u7ed3\u6784\u6e05\u6670\u3001\u9002\u5408\u591a\u79cd\u6c47\u62a5\u573a\u666f\u7684\u6807\u51c6\u7248\u5f0f",
  },
  swift: {
    name: "\u7b80\u6d01\u5feb\u901f",
    description: "\u8f7b\u91cf\u3001\u7b80\u6d01\u7684\u5feb\u901f\u6f14\u793a\u6a21\u677f",
  },
  code: {
    name: "\u4ee3\u7801\u6f14\u793a",
    description: "\u9002\u5408\u5c55\u793a\u4ee3\u7801\u3001\u7ec8\u7aef\u3001\u6587\u4ef6\u7ed3\u6784\u548c\u6280\u672f\u65b9\u6848",
  },
  education: {
    name: "\u6559\u80b2\u8bfe\u4ef6",
    description: "\u9002\u5408\u6559\u5b66\u3001\u57f9\u8bad\u548c\u77e5\u8bc6\u8bb2\u89e3\u7684\u8bfe\u4ef6\u7248\u5f0f",
  },
  "product-overview": {
    name: "\u4ea7\u54c1\u4ecb\u7ecd",
    description: "\u9002\u5408\u4ea7\u54c1\u529f\u80fd\u3001\u4ef7\u503c\u548c\u65b9\u6848\u4ecb\u7ecd\u7684\u6a21\u677f",
  },
  report: {
    name: "\u62a5\u544a\u6c47\u62a5",
    description: "\u9002\u5408\u6570\u636e\u62a5\u544a\u3001\u9879\u76ee\u6c47\u62a5\u548c\u9636\u6bb5\u603b\u7ed3",
  },
  "pitch-deck": {
    name: "\u878d\u8d44\u8def\u6f14",
    description: "\u9002\u5408\u9879\u76ee\u8def\u6f14\u3001\u5546\u4e1a\u8ba1\u5212\u548c\u6295\u8d44\u4eba\u6c9f\u901a",
  },
  "taicang-coal-power-report": {
    name: "\u65b0\u6295\u4ea7\u7164\u7535\u9879\u76ee\u6c47\u62a5",
    description: "\u57fa\u4e8e\u539f\u59cb\u6c47\u62a5\u6750\u6599\u590d\u523b\u7684\u7164\u7535\u9879\u76ee\u6c47\u62a5\u6bcd\u7248",
  },
  "neo-general": {
    name: "\u65b0\u901a\u7528",
    description: "\u66f4\u73b0\u4ee3\u7684\u901a\u7528\u6f14\u793a\u7248\u5f0f\u96c6",
  },
  "neo-standard": {
    name: "\u65b0\u6807\u51c6",
    description: "\u9762\u5411\u62a5\u544a\u548c\u5206\u6790\u573a\u666f\u7684\u65b0\u6807\u51c6\u7248\u5f0f",
  },
  "neo-modern": {
    name: "\u65b0\u73b0\u4ee3",
    description: "\u73b0\u4ee3\u6570\u636e\u3001\u56fe\u8868\u548c\u5546\u52a1\u4fe1\u606f\u5c55\u793a\u7248\u5f0f",
  },
  "neo-swift": {
    name: "\u65b0\u7b80\u6d01",
    description: "\u8282\u594f\u660e\u5feb\u3001\u89c6\u89c9\u7b80\u6d01\u7684\u73b0\u4ee3\u7248\u5f0f\u96c6",
  },
};

const layoutNameMap: Record<string, string> = {
  "Intro Slide": "\u5c01\u9762\u9875",
  "Intro Pitch Deck Slide": "\u8def\u6f14\u5c01\u9762\u9875",
  "Cover Slide": "\u5c01\u9762\u9875",
  "Title Slide": "\u6807\u9898\u9875",
  "Section Slide": "\u7ae0\u8282\u9875",
  "Table of Contents": "\u76ee\u5f55\u9875",
  "Table Of Contents": "\u76ee\u5f55\u9875",
  "Table of Content": "\u76ee\u5f55\u9875",
  "Table Of Content Slide": "\u76ee\u5f55\u9875",
  "Table of Content Slide": "\u76ee\u5f55\u9875",
  "Basic Info": "\u57fa\u7840\u4fe1\u606f\u9875",
  "Agenda Slide": "\u8bae\u7a0b\u9875",
  "Timeline": "\u65f6\u95f4\u8f74",
  "Table": "\u8868\u683c\u9875",
  "Chart": "\u56fe\u8868\u9875",
  "ContactLayout": "\u8054\u7cfb\u65b9\u5f0f\u9875",
};

function translateLayoutName(name: string, index: number) {
  if (!name) return `\u7248\u5f0f ${String(index + 1).padStart(2, "0")}`;
  if (layoutNameMap[name]) return layoutNameMap[name];
  const normalized = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  const translated = normalized
    .replace(/\bIntro\b/gi, "\u5f15\u5165")
    .replace(/\bCover\b/gi, "\u5c01\u9762")
    .replace(/\bSection\b/gi, "\u7ae0\u8282")
    .replace(/\bAgenda\b/gi, "\u8bae\u7a0b")
    .replace(/\bTitle\b/gi, "\u6807\u9898")
    .replace(/\bSubtitle\b/gi, "\u526f\u6807\u9898")
    .replace(/\bDescription\b/gi, "\u63cf\u8ff0")
    .replace(/\bText\b/gi, "\u6587\u672c")
    .replace(/\bImage\b/gi, "\u56fe\u7247")
    .replace(/\bChart\b/gi, "\u56fe\u8868")
    .replace(/\bCharts\b/gi, "\u56fe\u8868")
    .replace(/\bTable\b/gi, "\u8868\u683c")
    .replace(/\bMetrics?\b/gi, "\u6307\u6807")
    .replace(/\bGrid\b/gi, "\u7f51\u683c")
    .replace(/\bCards?\b/gi, "\u5361\u7247")
    .replace(/\bComparison\b/gi, "\u5bf9\u6bd4")
    .replace(/\bTimeline\b/gi, "\u65f6\u95f4\u8f74")
    .replace(/\bBullet\b/gi, "\u8981\u70b9")
    .replace(/\bBullets\b/gi, "\u8981\u70b9")
    .replace(/\bList\b/gi, "\u5217\u8868")
    .replace(/\bNumbered\b/gi, "\u7f16\u53f7")
    .replace(/\bIcon\b/gi, "\u56fe\u6807")
    .replace(/\bIcons\b/gi, "\u56fe\u6807")
    .replace(/\bQuote\b/gi, "\u5f15\u8bed")
    .replace(/\bTeam\b/gi, "\u56e2\u961f")
    .replace(/\bContact\b/gi, "\u8054\u7cfb")
    .replace(/\bLeft\b/gi, "\u5de6\u4fa7")
    .replace(/\bRight\b/gi, "\u53f3\u4fa7")
    .replace(/\bCentered\b/gi, "\u5c45\u4e2d")
    .replace(/\bFull Width\b/gi, "\u5168\u5bbd")
    .replace(/\bTwo Column\b/gi, "\u53cc\u680f")
    .replace(/\bDual\b/gi, "\u53cc\u9879")
    .replace(/\bMulti\b/gi, "\u591a\u9879")
    .replace(/\bFour\b/gi, "\u56db\u9879")
    .replace(/\bSix\b/gi, "\u516d\u9879")
    .replace(/\bModern\b/gi, "\u73b0\u4ee3")
    .replace(/\bLayout\b/gi, "\u7248\u5f0f")
    .replace(/\bSlide\b/gi, "\u9875")
    .replace(/\bWith\b/gi, "\u642d\u914d")
    .replace(/\bAnd\b/gi, "\u4e0e");

  return /[A-Za-z]/.test(translated)
    ? `\u7248\u5f0f ${String(index + 1).padStart(2, "0")}`
    : translated;
}

function translateLayoutDescription(description: string) {
  if (!description) return "\u9002\u7528\u4e8e\u6f14\u793a\u6587\u7a3f\u7684\u7248\u5f0f\u3002";
  const translated = description
    .replace(/A two-column table of contents slide with section titles and numbers on a left panel and a title plus description paragraph on the right panel\./gi, "\u53cc\u680f\u76ee\u5f55\u9875\uff0c\u5de6\u4fa7\u5c55\u793a\u7ae0\u8282\u6807\u9898\u4e0e\u5e8f\u53f7\uff0c\u53f3\u4fa7\u5c55\u793a\u4e3b\u6807\u9898\u548c\u8bf4\u660e\u6587\u5b57\u3002")
    .replace(/A professional table of contents layout with numbered sections, and page references\. This should be right after introduction slide if ever used\./gi, "\u4e13\u4e1a\u76ee\u5f55\u7248\u5f0f\uff0c\u5305\u542b\u7ae0\u8282\u7f16\u53f7\u548c\u9875\u7801\u5f15\u7528\uff0c\u901a\u5e38\u653e\u5728\u5c01\u9762\u6216\u5f15\u5165\u9875\u4e4b\u540e\u3002")
    .replace(/A slide with a header row containing label, separator, and counter, followed by a two-column layout with a media area and stacked text blocks\. If used as the endig slide then it shoudn't have the intro card\./gi, "\u5e26\u9875\u7709\u3001\u5206\u9694\u7ebf\u548c\u5e8f\u53f7\u7684\u53cc\u680f\u5c01\u9762\u7248\u5f0f\uff0c\u5de6\u4fa7\u4e3a\u56fe\u7247\u533a\uff0c\u53f3\u4fa7\u4e3a\u6807\u9898\u3001\u6b63\u6587\u548c\u4fe1\u606f\u5361\u7247\u3002")
    .replace(/^A clean slide layout with/i, "\u6e05\u6670\u7684\u5e7b\u706f\u7247\u7248\u5f0f\uff0c\u5305\u542b")
    .replace(/^A slide featuring/i, "\u7528\u4e8e\u5c55\u793a")
    .replace(/^A visually appealing/i, "\u89c6\u89c9\u8868\u73b0\u6e05\u6670\u7684")
    .replace(/Ideal for/gi, "\u9002\u5408")
    .replace(/title/gi, "\u6807\u9898")
    .replace(/description/gi, "\u63cf\u8ff0")
    .replace(/image/gi, "\u56fe\u7247")
    .replace(/chart/gi, "\u56fe\u8868")
    .replace(/table/gi, "\u8868\u683c")
    .replace(/metrics?/gi, "\u6307\u6807")
    .replace(/cards?/gi, "\u5361\u7247")
    .replace(/bullets?/gi, "\u8981\u70b9")
    .replace(/content/gi, "\u5185\u5bb9")
    .replace(/overview/gi, "\u6982\u89c8")
    .replace(/team/gi, "\u56e2\u961f")
    .replace(/market/gi, "\u5e02\u573a")
    .replace(/business/gi, "\u5546\u4e1a")
    .replace(/product/gi, "\u4ea7\u54c1")
    .replace(/strategy/gi, "\u7b56\u7565")
    .replace(/performance/gi, "\u8868\u73b0")
    .replace(/timeline/gi, "\u65f6\u95f4\u8f74")
    .replace(/layout/gi, "\u7248\u5f0f")
    .replace(/slide/gi, "\u5e7b\u706f\u7247");

  return /[A-Za-z]/.test(translated)
    ? "\u9002\u7528\u4e8e\u6f14\u793a\u6587\u7a3f\u7684\u4e2d\u6587\u7248\u5f0f\u3002"
    : translated;
}

function translateSampleText(value: string) {
  const exact: Record<string, string> = {
    "Product Overview": "\u4ea7\u54c1\u6982\u89c8",
    "Pitch Deck": "\u8def\u6f14\u6587\u7a3f",
    "Introduction": "\u9879\u76ee\u4ecb\u7ecd",
    "Introduction Our Pitchdeck": "\u9879\u76ee\u4ecb\u7ecd",
    "Our Pitchdeck": "\u6211\u4eec\u7684\u8def\u6f14",
    "Pitchdeck": "\u8def\u6f14\u6587\u7a3f",
    "John Doe": "\u5f20\u4e09",
    "December 2025": "2025\u5e7412\u6708",
    "December 2024": "2024\u5e7412\u6708",
    "December 22, 2025": "2025\u5e7412\u670822\u65e5",
    "Q4 2025": "2025\u5e74\u7b2c\u56db\u5b63\u5ea6",
    "Company Name": "\u516c\u53f8\u540d\u79f0",
    "Your Company": "\u4f60\u7684\u516c\u53f8",
    "Pitch Deck Team": "\u8def\u6f14\u56e2\u961f",
    "Jan 1, 2025": "2025\u5e741\u67081\u65e5",
    "January 2025": "2025\u5e741\u6708",
    "Thank You": "\u8c22\u8c22",
    "Contact Us": "\u8054\u7cfb\u6211\u4eec",
    "Agenda": "\u76ee\u5f55",
    "Overview": "\u6982\u89c8",
    "Problem": "\u95ee\u9898",
    "Solution": "\u89e3\u51b3\u65b9\u6848",
    "Market": "\u5e02\u573a",
    "Market Size": "\u5e02\u573a\u89c4\u6a21",
    "Market Validation": "\u5e02\u573a\u9a8c\u8bc1",
    "Team": "\u56e2\u961f",
    "Team Member": "\u56e2\u961f\u6210\u5458",
    "Roadmap": "\u8def\u7ebf\u56fe",
    "Business Model": "\u5546\u4e1a\u6a21\u5f0f",
    "Competitive Advantage": "\u7ade\u4e89\u4f18\u52bf",
    "Company Traction": "\u516c\u53f8\u8fdb\u5c55",
    "Product Performance": "\u4ea7\u54c1\u8868\u73b0",
    "Table of Contents": "\u76ee\u5f55",
    "Table Of Contents": "\u76ee\u5f55",
    "Table of Content": "\u76ee\u5f55",
    "Table Of Content": "\u76ee\u5f55",
    "SECTION TITLE SECTION TITLE": "\u7ae0\u8282\u6807\u9898",
    "HEADING 1": "\u6807\u9898 1",
    "HEADING 2": "\u6807\u9898 2",
    "HEADING 3": "\u6807\u9898 3",
    "HEADING 4": "\u6807\u9898 4",
    "Market Expansion Strategy": "\u5e02\u573a\u6269\u5c55\u7b56\u7565",
    "Customer Insights": "\u5ba2\u6237\u6d1e\u5bdf",
    "Customer Signals": "\u5ba2\u6237\u4fe1\u53f7",
    "Customer Success": "\u5ba2\u6237\u6210\u529f",
    "Customer insight": "\u5ba2\u6237\u6d1e\u5bdf",
    "Customer Feedback": "\u5ba2\u6237\u53cd\u9988",
    "Customer Satisfaction": "\u5ba2\u6237\u6ee1\u610f\u5ea6",
    "Modern Stack": "\u73b0\u4ee3\u6280\u672f\u6808",
    "Founded in 2020": "2020\u5e74\u6210\u7acb",
    "First Product in 2021": "2021\u5e74\u53d1\u5e03\u9996\u6b3e\u4ea7\u54c1",
    "Key Milestone in 2022": "2022\u5e74\u8fbe\u6210\u5173\u952e\u91cc\u7a0b\u7891",
    "Global Expansion in 2024": "2024\u5e74\u5168\u7403\u6269\u5f20",
    "Operations": "\u8fd0\u8425",
    "Customers": "\u5ba2\u6237",
    "Quality": "\u8d28\u91cf",
    "Service": "\u670d\u52a1",
    "Price": "\u4ef7\u683c",
    "Satisfied": "\u6ee1\u610f",
    "Unsatisfied": "\u4e0d\u6ee1\u610f",
    "Artificial Intelligence": "\u4eba\u5de5\u667a\u80fd",
    "Internet Of Things": "\u7269\u8054\u7f51",
    "Internet of Things": "\u7269\u8054\u7f51",
    "Others": "\u5176\u4ed6",
    "Headers": "\u8bf7\u6c42\u5934",
    "File Tree": "\u6587\u4ef6\u6811",
    "Notes": "\u5907\u6ce8",
    "Outcomes": "\u5b66\u4e60\u6210\u679c",
    "Duration": "\u65f6\u957f",
    "Audience": "\u53d7\u4f17",
    "Format": "\u5f62\u5f0f",
    "Criteria": "\u8bc4\u4ef7\u6807\u51c6",
    "Beginner": "\u5165\u95e8",
    "Developing": "\u53d1\u5c55\u4e2d",
    "Proficient": "\u719f\u7ec3",
    "Advanced": "\u9ad8\u7ea7",
    "Thank you": "\u8c22\u8c22",
    "Contact": "\u8054\u7cfb\u65b9\u5f0f",
    "Email": "\u90ae\u7bb1",
    "Website": "\u7f51\u7ad9",
    "Sections": "\u7ae0\u8282",
    "Method": "\u65b9\u6cd5",
    "Sources": "\u6765\u6e90",
    "Evidence": "\u4f9d\u636e",
    "Impact": "\u5f71\u54cd",
    "Risk Level": "\u98ce\u9669\u7b49\u7ea7",
    "Response": "\u5e94\u5bf9\u63aa\u65bd",
    "Limitations": "\u5c40\u9650\u6027",
    "Follow-up": "\u540e\u7eed\u8ddf\u8fdb",
    "Metric": "\u6307\u6807",
    "Conversion": "\u8f6c\u5316",
    "High": "\u9ad8",
    "Low": "\u4f4e",
    "Simple but shallow": "\u7b80\u5355\u4f46\u6df1\u5ea6\u4e0d\u8db3",
    "Deep but harder to adopt": "\u6df1\u5165\u4f46\u91c7\u7528\u95e8\u69db\u66f4\u9ad8",
    "Target position": "\u76ee\u6807\u5b9a\u4f4d",
  };

  if (exact[value]) return exact[value];

  const translated = value
    .replace(/Add a short subtitle or description here\.?/gi, "\u5728\u6b64\u6dfb\u52a0\u7b80\u77ed\u7684\u526f\u6807\u9898\u6216\u63cf\u8ff0\u3002")
    .replace(/Lorem ipsum dolor sit amet, consectetur adipiscing elit\. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua\. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat\./gi, "\u8fd9\u91cc\u5c55\u793a\u6838\u5fc3\u80cc\u666f\u3001\u5173\u952e\u4fe1\u606f\u548c\u9636\u6bb5\u6027\u6210\u679c\uff0c\u7528\u4e8e\u652f\u6491\u6c47\u62a5\u4e2d\u7684\u91cd\u70b9\u7ed3\u8bba\u548c\u540e\u7eed\u884c\u52a8\u5b89\u6392\u3002")
    .replace(/Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua\. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris/gi, "\u8fd9\u91cc\u5c55\u793a\u9879\u76ee\u80cc\u666f\u3001\u6838\u5fc3\u4ef7\u503c\u548c\u5173\u952e\u8fdb\u5c55\uff0c\u5e2e\u52a9\u542c\u4f17\u5feb\u901f\u7406\u89e3\u672c\u6b21\u6c47\u62a5\u4e3b\u9898")
    .replace(/Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna/gi, "\u8fd9\u91cc\u5c55\u793a\u5173\u952e\u4fe1\u606f\u548c\u91cd\u70b9\u7ed3\u8bba")
    .replace(/Lorem ipsum dolor sit amet, consectetur adipiscing elit\. Sed do eiusmod tempor incididunt ut labore\./gi, "\u8fd9\u91cc\u5c55\u793a\u7b80\u8981\u8bf4\u660e\u548c\u652f\u6491\u4fe1\u606f\u3002")
    .replace(/Lorem ipsum dolor sit amet, consectetur adipiscing elit\. Sed do eiusmod tempor\./gi, "\u8fd9\u91cc\u5c55\u793a\u7b80\u8981\u8bf4\u660e\u3002")
    .replace(/Lorem ipsum dolor sit amet, consectetur adipiscing elit\./gi, "\u8fd9\u91cc\u5c55\u793a\u7b80\u8981\u8bf4\u660e\u3002")
    .replace(/Lorem ipsum dolor sit amet, consectetur/gi, "\u8fd9\u91cc\u5c55\u793a\u7b80\u8981\u8bf4\u660e")
    .replace(/Lorem ipsum dolor sit\.?/gi, "\u7b80\u8981\u8bf4\u660e\u3002")
    .replace(/Lorem ipsum dolor/gi, "\u7b80\u8981\u8bf4\u660e")
    .replace(/Our product offers customizable dashboards for real-time reporting and data-driven decisions\.?/gi, "\u6211\u4eec\u7684\u4ea7\u54c1\u63d0\u4f9b\u53ef\u5b9a\u5236\u7684\u4eea\u8868\u76d8\uff0c\u652f\u6301\u5b9e\u65f6\u62a5\u544a\u548c\u6570\u636e\u9a71\u52a8\u51b3\u7b56\u3002")
    .replace(/It integrates with third-party tools to enhance operations and scales with business growth for improved efficiency\.?/gi, "\u5b83\u53ef\u4e0e\u7b2c\u4e09\u65b9\u5de5\u5177\u96c6\u6210\uff0c\u5e2e\u52a9\u63d0\u5347\u8fd0\u8425\u6548\u7387\u5e76\u652f\u6301\u4e1a\u52a1\u589e\u957f\u3002")
    .replace(/Product Overview/gi, "\u4ea7\u54c1\u6982\u89c8")
    .replace(/Product Performance/gi, "\u4ea7\u54c1\u8868\u73b0")
    .replace(/Pitch Deck/gi, "\u8def\u6f14\u6587\u7a3f")
    .replace(/Pitch Deck Team/gi, "\u8def\u6f14\u56e2\u961f")
    .replace(/Introduction Our Pitchdeck/gi, "\u9879\u76ee\u4ecb\u7ecd")
    .replace(/Our Pitchdeck/gi, "\u6211\u4eec\u7684\u8def\u6f14")
    .replace(/Pitchdeck/gi, "\u8def\u6f14\u6587\u7a3f")
    .replace(/Introduction/gi, "\u9879\u76ee\u4ecb\u7ecd")
    .replace(/John Doe/gi, "\u5f20\u4e09")
    .replace(/Jan 1, 2025/gi, "2025\u5e741\u67081\u65e5")
    .replace(/December 22, 2025/gi, "2025\u5e7412\u670822\u65e5")
    .replace(/December 2025/gi, "2025\u5e7412\u6708")
    .replace(/Table Of Contents?/gi, "\u76ee\u5f55")
    .replace(/Table of Contents?/gi, "\u76ee\u5f55")
    .replace(/SECTION TITLE SECTION TITLE/gi, "\u7ae0\u8282\u6807\u9898")
    .replace(/HEADING\s+(\d+)/gi, "\u6807\u9898 $1")
    .replace(/Market Size/gi, "\u5e02\u573a\u89c4\u6a21")
    .replace(/Market Validation/gi, "\u5e02\u573a\u9a8c\u8bc1")
    .replace(/Market Expansion Strategy/gi, "\u5e02\u573a\u6269\u5c55\u7b56\u7565")
    .replace(/Company Traction/gi, "\u516c\u53f8\u8fdb\u5c55")
    .replace(/Business Model/gi, "\u5546\u4e1a\u6a21\u5f0f")
    .replace(/Competitive Advantage/gi, "\u7ade\u4e89\u4f18\u52bf")
    .replace(/Team Member/gi, "\u56e2\u961f\u6210\u5458")
    .replace(/Customer Insights?/gi, "\u5ba2\u6237\u6d1e\u5bdf")
    .replace(/Customer Signals?/gi, "\u5ba2\u6237\u4fe1\u53f7")
    .replace(/Customer Success/gi, "\u5ba2\u6237\u6210\u529f")
    .replace(/Customer support team in office/gi, "\u529e\u516c\u5ba4\u4e2d\u7684\u5ba2\u6237\u652f\u6301\u56e2\u961f")
    .replace(/Customer Feedback/gi, "\u5ba2\u6237\u53cd\u9988")
    .replace(/Customer Satisfaction/gi, "\u5ba2\u6237\u6ee1\u610f\u5ea6")
    .replace(/Modern Stack/gi, "\u73b0\u4ee3\u6280\u672f\u6808")
    .replace(/Customizable Workflows/gi, "\u53ef\u5b9a\u5236\u5de5\u4f5c\u6d41")
    .replace(/Customer-Centric Disruption/gi, "\u4ee5\u5ba2\u6237\u4e3a\u4e2d\u5fc3\u7684\u521b\u65b0")
    .replace(/Artificial Intelligence/gi, "\u4eba\u5de5\u667a\u80fd")
    .replace(/Internet Of Things/gi, "\u7269\u8054\u7f51")
    .replace(/Internet of Things/gi, "\u7269\u8054\u7f51")
    .replace(/Others/gi, "\u5176\u4ed6")
    .replace(/Headers/gi, "\u8bf7\u6c42\u5934")
    .replace(/File Tree/gi, "\u6587\u4ef6\u6811")
    .replace(/Notes/gi, "\u5907\u6ce8")
    .replace(/Outcomes/gi, "\u5b66\u4e60\u6210\u679c")
    .replace(/Duration/gi, "\u65f6\u957f")
    .replace(/Audience/gi, "\u53d7\u4f17")
    .replace(/Format/gi, "\u5f62\u5f0f")
    .replace(/Criteria/gi, "\u8bc4\u4ef7\u6807\u51c6")
    .replace(/Beginner/gi, "\u5165\u95e8")
    .replace(/Developing/gi, "\u53d1\u5c55\u4e2d")
    .replace(/Proficient/gi, "\u719f\u7ec3")
    .replace(/Advanced/gi, "\u9ad8\u7ea7")
    .replace(/Thank you/gi, "\u8c22\u8c22")
    .replace(/Contact/gi, "\u8054\u7cfb\u65b9\u5f0f")
    .replace(/Email/gi, "\u90ae\u7bb1")
    .replace(/Website/gi, "\u7f51\u7ad9")
    .replace(/Sections/gi, "\u7ae0\u8282")
    .replace(/Method/gi, "\u65b9\u6cd5")
    .replace(/Sources/gi, "\u6765\u6e90")
    .replace(/Evidence/gi, "\u4f9d\u636e")
    .replace(/Impact/gi, "\u5f71\u54cd")
    .replace(/Risk Level/gi, "\u98ce\u9669\u7b49\u7ea7")
    .replace(/Response/gi, "\u5e94\u5bf9\u63aa\u65bd")
    .replace(/Limitations/gi, "\u5c40\u9650\u6027")
    .replace(/Follow-up/gi, "\u540e\u7eed\u8ddf\u8fdb")
    .replace(/Metric/gi, "\u6307\u6807")
    .replace(/Conversion/gi, "\u8f6c\u5316")
    .replace(/Simple but shallow/gi, "\u7b80\u5355\u4f46\u6df1\u5ea6\u4e0d\u8db3")
    .replace(/Deep but harder to adopt/gi, "\u6df1\u5165\u4f46\u91c7\u7528\u95e8\u69db\u66f4\u9ad8")
    .replace(/Target position/gi, "\u76ee\u6807\u5b9a\u4f4d")
    .replace(/\bHigh\b/gi, "\u9ad8")
    .replace(/\bLow\b/gi, "\u4f4e")
    .replace(/Built-in tracking and performance monitoring\.?/gi, "\u5185\u7f6e\u8ddf\u8e2a\u4e0e\u6027\u80fd\u76d1\u63a7\u3002")
    .replace(/title/gi, "\u6807\u9898")
    .replace(/subtitle/gi, "\u526f\u6807\u9898")
    .replace(/description/gi, "\u63cf\u8ff0")
    .replace(/company/gi, "\u516c\u53f8")
    .replace(/revenue/gi, "\u6536\u5165")
    .replace(/growth/gi, "\u589e\u957f")
    .replace(/users/gi, "\u7528\u6237")
    .replace(/market/gi, "\u5e02\u573a")
    .replace(/team/gi, "\u56e2\u961f")
    .replace(/goal/gi, "\u76ee\u6807")
    .replace(/strategy/gi, "\u7b56\u7565")
    .replace(/overview/gi, "\u6982\u89c8");

  if (!/[A-Za-z]/.test(translated)) return translated;

  const compact = translated.trim();
  const quarter = compact.match(/^Q([1-4])$/i);
  if (quarter) return `\u7b2c${quarter[1]}\u5b63\u5ea6`;

  const section = compact.match(/^Section\s+(\d+)$/i);
  if (section) return `\u7ae0\u8282 ${section[1]}`;

  const column = compact.match(/^Column\s+(\d+)$/i);
  if (column) return `\u5217 ${column[1]}`;

  const row = compact.match(/^Row\s+([A-Z])$/i);
  if (row) return `\u884c ${row[1].toUpperCase().charCodeAt(0) - 64}`;

  const letter = compact.match(/^[A-D]$/i);
  if (letter) return `\u9879\u76ee ${letter[0].toUpperCase().charCodeAt(0) - 64}`;

  if (/^CEO$/i.test(compact)) return "\u9996\u5e2d\u6267\u884c\u5b98";
  if (/^CTO$/i.test(compact)) return "\u9996\u5e2d\u6280\u672f\u5b98";
  if (/^COO$/i.test(compact)) return "\u9996\u5e2d\u8fd0\u8425\u5b98";
  if (/^CMO$/i.test(compact)) return "\u9996\u5e2d\u5e02\u573a\u5b98";
  if (/^PDT$/i.test(compact)) return "\u56e2\u961f";
  if (/^SEM$/i.test(compact)) return "\u641c\u7d22\u8425\u9500";
  if (/^TAM$/i.test(compact)) return "\u603b\u6f5c\u5728\u5e02\u573a";
  if (/^SAM$/i.test(compact)) return "\u53ef\u670d\u52a1\u5e02\u573a";
  if (/^SOM$/i.test(compact)) return "\u53ef\u83b7\u53d6\u5e02\u573a";
  if (/^\d+K\+?$/i.test(compact)) return `${compact.replace(/K/gi, "\u5343")}`;
  if (/^\d+(\.\d+)?\s*Million$/i.test(compact)) return `${compact.replace(/Million/gi, "\u767e\u4e07")}`;
  if (/^\d+(\.\d+)?\s*Billion$/i.test(compact)) return `${compact.replace(/Billion/gi, "\u5341\u4ebf")}`;

  if (compact.length <= 12) return "\u6838\u5fc3\u5185\u5bb9";
  if (compact.length <= 28) return "\u5173\u952e\u8981\u70b9";
  if (compact.length <= 70) return "\u8fd9\u91cc\u5c55\u793a\u91cd\u70b9\u8bf4\u660e\u548c\u5173\u952e\u652f\u6491\u4fe1\u606f\u3002";
  return "\u8fd9\u91cc\u5c55\u793a\u5173\u952e\u80cc\u666f\u3001\u6838\u5fc3\u89c2\u70b9\u548c\u652f\u6491\u6570\u636e\uff0c\u7528\u4e8e\u8bf4\u660e\u5f53\u524d\u65b9\u6848\u7684\u4ef7\u503c\u4e0e\u8fdb\u5c55\u3002";
}

const preservedSampleKeys = new Set([
  "type",
  "mode",
  "trend",
  "icon",
  "iconName",
  "color",
  "colorPalette",
  "gradient",
  "variant",
  "__image_url__",
  "__icon_url__",
  "__icon_query__",
]);

function shouldPreserveSampleString(key: string | undefined, value: string) {
  if (key && preservedSampleKeys.has(key)) return true;
  const trimmed = value.trim();
  return (
    /^https?:\/\//i.test(trimmed) ||
    /^data:/i.test(trimmed) ||
    /^#[0-9a-f]{3,8}$/i.test(trimmed) ||
    /^var\(--/.test(trimmed) ||
    /^[a-z][a-z0-9-]*$/i.test(trimmed) && ["bar", "line", "donut", "pie", "area", "funnel", "horizontal", "vertical", "up", "down", "neutral"].includes(trimmed.toLowerCase())
  );
}

function localizeSampleValue(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    return shouldPreserveSampleString(key, value) ? value : translateSampleText(value);
  }
  if (typeof value === "string") return translateSampleText(value);
  if (Array.isArray(value)) return value.map((nestedValue) => localizeSampleValue(nestedValue, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([nestedKey, nestedValue]) => [nestedKey, localizeSampleValue(nestedValue, nestedKey)]),
    );
  }
  return value;
}

export function localizeTemplateGroup(group: TemplateLayoutsWithSettings): TemplateLayoutsWithSettings {
  const groupText = templateText[group.id];
  return {
    ...group,
    name: groupText?.name ?? group.name,
    description: groupText?.description ?? group.description,
    layouts: group.layouts.map((layout, index) => localizeTemplateLayout(layout, index)),
  };
}

export function localizeTemplateLayout(layout: TemplateWithData, index: number): TemplateWithData {
  return {
    ...layout,
    layoutName: translateLayoutName(layout.layoutName, index),
    layoutDescription: translateLayoutDescription(layout.layoutDescription),
    sampleData: localizeSampleValue(layout.sampleData) as Record<string, unknown>,
  };
}
