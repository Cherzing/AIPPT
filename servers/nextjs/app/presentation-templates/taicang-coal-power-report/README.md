# AIPPT 模板：新投产煤电项目汇报材料

本目录是根据 `新投产煤电项目汇报材料.pptx` 提炼的 AIPPT 自定义模板包，适配 AIPPT 当前源码目录：

```text
servers/nextjs/app/presentation-templates/taicang-coal-power-report
```

使用方式：

1. 将整个 `taicang-coal-power-report` 文件夹复制到 AIPPT 源码的 `servers/nextjs/app/presentation-templates/` 下。
2. 参考 `index-snippet.ts`，把该模板的 imports 和 `taicangCoalPowerReport` 注册到 `servers/nextjs/app/presentation-templates/index.tsx`。
3. 重启 AIPPT。
4. 打开 `/template-preview` 检查模板是否出现。
5. 生成汇报时选择该模板。

包含版式：

- `01-CoverSlide.tsx`：封面
- `02-AgendaSlide.tsx`：汇报提纲
- `03-SectionDividerSlide.tsx`：章节页
- `04-KpiSnapshotSlide.tsx`：核心指标页
- `05-TwoColumnProgressSlide.tsx`：尾工/整改双栏进展页
- `06-TimelineSlide.tsx`：阶段节点/验收计划页
- `07-PerformanceComparisonSlide.tsx`：运行指标对标页
- `08-CardGridSlide.tsx`：智慧电厂/验收事项卡片页
- `09-SettlementDashboardSlide.tsx`：工程结算/决算仪表页
- `10-ClosingSlide.tsx`：结束页

字体建议：

- 中文：Microsoft YaHei / Source Han Sans SC / Noto Sans SC
- 色彩：深蓝、红色、金色，匹配原汇报材料的正式央企项目汇报风格。

如果使用 AIPPT 的“Create Template / 上传 PPTX”入口，可上传同目录下生成的 `新投产煤电项目汇报材料-AIPPT样张.pptx`，并在提示上传字体时使用 `font/` 目录下的微软雅黑或思源字体。
