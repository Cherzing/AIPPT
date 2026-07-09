# Built-In Template Inventory

Generated for Task 3 on 2026-07-07.

## Method

- Scope: `servers/nextjs/app/presentation-templates/index.tsx` registered built-in templates and their imported `Schema` declarations under `servers/nextjs/app/presentation-templates`.
- Extraction: parsed `createTemplateEntry(...)` registrations, resolved imported template source files, and extracted top-level Zod schema keys from `export const Schema = z.object({ ... })`.
- Classification: `taicang-coal-power-report` is marked Level A because a dedicated native builder exists; other templates are classified from schema/content fields using the Task 3 A/B/D rules. No imported PPT templates were present, so Level C count is zero.
- Limitation: this inventory is schema/static-source based. It does not execute React layouts or inspect runtime-rendered CSS/JSX fidelity, so Level B means structurally convertible rather than visually native-complete.

## Summary

| Template Group | Layouts | A | B | C | D | Notes |
|---|---:|---:|---:|---:|---:|---|
| code | 16 | 0 | 15 | 0 | 1 | Mixed structured and legacy-only schemas. |
| education | 14 | 0 | 14 | 0 | 0 | Structured schemas with possible complex fields. |
| general | 12 | 0 | 0 | 0 | 12 | No recognized simple structured fields in extracted schemas. |
| modern | 10 | 0 | 0 | 0 | 10 | No recognized simple structured fields in extracted schemas. |
| neo-general | 29 | 0 | 3 | 0 | 26 | Mixed structured and legacy-only schemas. |
| neo-modern | 17 | 0 | 4 | 0 | 13 | Mixed structured and legacy-only schemas. |
| neo-standard | 17 | 0 | 4 | 0 | 13 | Mixed structured and legacy-only schemas. |
| neo-swift | 15 | 0 | 2 | 0 | 13 | Mixed structured and legacy-only schemas. |
| pitch-deck | 25 | 0 | 22 | 0 | 3 | Mixed structured and legacy-only schemas. |
| product-overview | 21 | 0 | 20 | 0 | 1 | Mixed structured and legacy-only schemas. |
| report | 22 | 0 | 21 | 0 | 1 | Mixed structured and legacy-only schemas. |
| standard | 11 | 0 | 0 | 0 | 11 | No recognized simple structured fields in extracted schemas. |
| swift | 9 | 0 | 0 | 0 | 9 | No recognized simple structured fields in extracted schemas. |
| taicang-coal-power-report | 10 | 10 | 0 | 0 | 0 | Dedicated coal-power native builder. |
| **Total** | **228** | **10** | **105** | **0** | **113** | Static inventory of all registered layouts. |

## Findings

| Template Group | Layout | Level | Reason | Supported Fields | Unsupported Fields |
|---|---|---|---|---|---|
| code | cover-slide | B | structured fields plus complex fields | title, subtitle | companyName |
| code | code-explanation-split-slide | B | structured fields plus complex fields | title, description | codeSnippet, descriptionTitle |
| code | api-request-response-slide | B | structured fields plus complex fields | title | method, endpoint, headers, requestSnippet, responseSnippet |
| code | cards-grid-slide | B | structured fields plus complex fields | title | features |
| code | table-slide | B | structured fields plus complex fields | title | tableColumns, rows |
| code | workflow-slide | B | structured fields plus complex fields | title | steps |
| code | bullet-list-slide | B | structured fields only | title, items | none |
| code | description-text-slide | B | structured fields plus complex fields | title, description | descriptionTitle |
| code | table-of-content-slide | B | structured fields only | title, items | none |
| code | description-and-metrics-slide | B | structured fields plus complex fields | title | explanationTitle, explanation, metrics |
| code | metrics-grid-slide | B | structured fields plus complex fields | title | metrics |
| code | code:FullCodeBlockSlide | B | structured fields plus complex fields | title, description | codeSnippet |
| code | code:CodeDiffComparisonSlide | B | structured fields plus complex fields | title, summary | before, after, impact |
| code | code:TerminalCommandSlide | B | structured fields plus complex fields | title, description | terminal, note |
| code | code:FileTreeStructureSlide | B | structured fields plus complex fields | title, description | rootLabel, tree, highlights |
| code | code:CodeOutputSlide | D | contains code/html-like fields | title, summary | code, output, insight |
| education | cover-slide | B | structured fields plus complex fields | name, title | backgroundImage |
| education | table-of-contents-slide | B | structured fields only | title, items | none |
| education | about-slide | B | structured fields plus complex fields | name | intro, body, topPanelText, bottomPanelText, topFeatureImage, bottomFeatureImage |
| education | content-split-slide | B | structured fields plus complex fields | heading | tagline, body, images |
| education | image-gallery-slide | B | structured fields plus complex fields | title | body, galleryImages |
| education | report-chart-slide | B | structured fields plus complex fields | title | body, footnote, chartTitle, dateRange, chartType, chartData, series, divergingLabels, showLegend, showStatusMessage, statusMessageTitle, statusMessageBody |
| education | services-split-slide | B | structured fields plus complex fields | title | sections |
| education | statistics-grid-slide | B | structured fields plus complex fields | title, description | stats |
| education | timeline-slide | B | structured fields plus complex fields | title | milestones |
| education | numbered-outcome-cards-slide | B | structured fields plus complex fields | title, subtitle | outcomes |
| education | module-grid-slide | B | structured fields plus complex fields | title, subtitle | modules |
| education | agenda-timeline-slide | B | structured fields plus complex fields | title, subtitle | sessionInfo, agenda |
| education | evaluation-matrix-slide | B | structured fields plus complex fields | title, subtitle | criteria |
| education | closing-contact-slide | B | structured fields plus complex fields | title, image | message, presenter, contactItems |
| product-overview | cover-slide | D | no recognized structured fields in schema | none | label, titleLine1, titleLine2, backgroundImage |
| product-overview | table-of-content-slide | B | structured fields plus complex fields | title, description | sections |
| product-overview | introduction-slide | B | structured fields plus complex fields | title | portraitImage, blocks |
| product-overview | text-blocks-with-image-block-slide | B | structured fields plus complex fields | title, image | topleftTextBlockLabel, topleftTextBlockBody, bottomleftTextBlockLabel, bottomleftTextBlockBody |
| product-overview | two-panel-contrast-metrics-slide | B | structured fields plus complex fields | title, subtitle | problem, solution, metrics |
| product-overview | title-with-blocks-text-slide | B | structured fields plus complex fields | title | blocks |
| product-overview | title-description-with-cards-text-slide | B | structured fields plus complex fields | title | taglineLabel, taglineBody, heroImage, cards |
| product-overview | segment-cards-slide | B | structured fields plus complex fields | title, subtitle | segments |
| product-overview | title-description-with-image-block-slide | B | structured fields plus complex fields | title | taglineLabel, taglineBody, featureImage, services |
| product-overview | card-grid-with-labels-slide | B | structured fields plus complex fields | title, subtitle | features |
| product-overview | scenario-cards-slide | B | structured fields plus complex fields | title, subtitle | useCases |
| product-overview | title-with-process-steps-slide | B | structured fields plus complex fields | title | steps |
| product-overview | phase-timeline-cards-slide | B | structured fields plus complex fields | title, subtitle | phases |
| product-overview | comparison-status-table-slide | B | structured fields plus complex fields | title, subtitle | columns, highlightedColumnIndex, rows, checkIcon, crossIcon |
| product-overview | title-description-with-table-slide | B | structured fields plus complex fields | title, subtitle | columns, highlightedHeaderIndex, rows |
| product-overview | title-with-kpi-cards-slide | B | structured fields plus complex fields | title, items | kpiIcon, backgroundImage |
| product-overview | title-description-with-chart-and-kpi-cards-slide | B | structured fields plus complex fields | title | taglineLabel, taglineBody, sideImage, chartStyle, chartTitle, miniBars, donutData, groupedBars, trendLines, legendLabels, xAxisName, yAxisName, extraction-failed |
| product-overview | title-cards-list-with-text-slide | B | structured fields plus complex fields | title | featureIcon, plans |
| product-overview | title-description-with-cards-slide | B | structured fields plus complex fields | title | taglineLabel, taglineBody, members |
| product-overview | title-description-with-image-gallery-slide | B | structured fields plus complex fields | title, description | topCenterImage, topRightImage, bottomWideImage, bottomCenterImage, bottomRightImage |
| product-overview | closing-actions-contact-slide | B | structured fields plus complex fields | title | message, actions, contact |
| report | intro-slide | B | structured fields plus complex fields | name | titleFirstLine, titleSecondLine, position |
| report | section-index-slide | B | structured fields plus complex fields | title, subtitle | sections |
| report | summary-cards-slide | B | structured fields plus complex fields | title, subtitle, summary | metrics, highlights, conclusion |
| report | title-description-image-slide | B | structured fields plus complex fields | title | body, bullets, featureImage |
| report | method-source-panels-slide | B | structured fields plus complex fields | title, subtitle | steps, sources, parameters |
| report | metrics-slide | B | structured fields plus complex fields | title | body, bullets, statColumns |
| report | title-image-bullet-cards-slide | B | structured fields plus complex fields | title | showImage, featureImage, cards |
| report | milestone-slide | B | structured fields plus complex fields | title, items | activeIndex |
| report | bullet-list-with-icon-title-description-slide | B | structured fields plus complex fields | title, items | itemIcon |
| report | bar-chart-with-bullet-list-title-description-icon-slide | B | structured fields plus complex fields | title, items | itemIcon, chartData, legendLabel |
| report | title-description-chart-slide | B | structured fields plus complex fields | title | insightIcon, insightBody, chartData, legendLabel |
| report | title-chart-metrics-cards-slide | B | structured fields plus complex fields | title | seriesALabel, seriesBLabel, chartData, legendLabel, statColumns |
| report | data-analysis-dashboard-slide | B | structured fields plus complex fields | title | summaryCards, charts |
| report | finding-cards-slide | B | structured fields plus complex fields | title, subtitle | findings |
| report | title-metrics-slide | B | structured fields plus complex fields | title | columns |
| report | recommendation-cards-slide | B | structured fields plus complex fields | title, subtitle | recommendations |
| report | risk-limitation-matrix-slide | B | structured fields plus complex fields | title, subtitle | risks, limitations |
| report | action-plan-table-slide | B | structured fields plus complex fields | title, subtitle | actions |
| report | title-workflow-with-title-description-slide | B | structured fields plus complex fields | title, items | activeIndex |
| report | horizontal-height-spanning-images-with-title-slide | D | no recognized structured fields in schema | none | members |
| report | appendix-notes-slide | B | structured fields plus complex fields | title, subtitle | notes, footnotes |
| report | closing-contact-slide | B | structured fields plus complex fields | title | message, contact, contactItems |
| pitch-deck | centered-cover-with-footer-meta | B | structured fields plus complex fields | title, subtitle | footerItems |
| pitch-deck | full-width-statement | D | no recognized structured fields in schema | none | label, statement |
| pitch-deck | problem-evidence-slide | B | structured fields plus complex fields | title | problemStatement, audience, painPoints, evidence |
| pitch-deck | value-proposition-slide | B | structured fields plus complex fields | title | valueStatement, supportingText, pillars |
| pitch-deck | product-workflow-slide | B | structured fields plus complex fields | title, summary, image | steps |
| pitch-deck | media-and-text-split | D | no recognized structured fields in schema | none | none |
| pitch-deck | text-and-chart-split-layout | B | structured fields plus complex fields | title | leadText, supportingText, chart, showAccentGlow |
| pitch-deck | cards-with-chart-split | B | structured fields plus complex fields | title, items | chart, showAccentGlow |
| pitch-deck | market-size-slide | B | structured fields plus complex fields | title, subtitle | layers, segmentNote |
| pitch-deck | business-model-slide | B | structured fields plus complex fields | title, summary | revenueStreams, unitMetrics |
| pitch-deck | traction-metrics-slide | B | structured fields plus complex fields | title, summary | metrics, milestones |
| pitch-deck | go-to-market-slide | B | structured fields plus complex fields | title | strategy, channels, funnel |
| pitch-deck | competitive-positioning-slide | B | structured fields plus complex fields | title, summary | axes, competitors, positionLabel |
| pitch-deck | defensibility-slide | B | structured fields plus complex fields | title | statement, advantages |
| pitch-deck | financial-projection-slide | B | structured fields plus complex fields | title, subtitle | periods, rows, assumptions |
| pitch-deck | funding-ask-slide | B | structured fields plus complex fields | title | askAmount, askContext, runway, allocations, milestones |
| pitch-deck | team-credentials-slide | B | structured fields plus complex fields | title, summary | members |
| pitch-deck | closing-contact-slide | B | structured fields plus complex fields | title | statement, contactName, contactRole, contactItems |
| pitch-deck | adaptive-value-card-grid | B | structured fields only | title, items | none |
| pitch-deck | adaptive-media-card-grid | B | structured fields plus complex fields | title | cards |
| pitch-deck | headline-with-detail-columns | B | structured fields plus complex fields | title | sections |
| pitch-deck | numbered-multi-column-overview | B | structured fields only | title, items | none |
| pitch-deck | panel-list-with-media | D | no recognized structured fields in schema | none | none |
| pitch-deck | horizontal-timeline | B | structured fields plus complex fields | title, items | isContinue, showEndLabel, endLabel |
| pitch-deck | overlapping-circle-cards | B | structured fields only | title, items | none |
| neo-general | neo-general:TextSplitWithEmphasisBlock | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TitleWithGridBasedHeadingAndDescriptionLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TitleWithFullWidthChartLayout | B | structured fields plus complex fields | title | chart |
| neo-general | neo-general:TitleMetricsWithChartLayout | B | structured fields plus complex fields | title, description | chart, metrics |
| neo-general | neo-general:TitleTopDescriptionFourTeamMembersGridLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TitleThreeColumnRiskConstraintsLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TitleMetricValueMetricLabelFunnelStages | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:ThankYouContactInfoFooterImageSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TimelineLayoutLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:IndexedThreeColumnListLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:LayoutTextBlockWithMetricCardsLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:LeftAlignQuotesLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TitleDescriptionWithTableLayout | B | structured fields plus complex fields | title, description | sections |
| neo-general | neo-general:ChallengeAndOutcomeWithOneStatLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:GridBasedEightMetricsSnapshotsLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:HeadlineTextWithBulletsAndStatsLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:HeadlineDescriptionWithImageLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:HeadlineDescriptionWithDoubleImageLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:BulletIconsOnlySlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:BulletWithIconsSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:ChartWithBulletsSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:MetricsWithImageSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:NumberedBulletsSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:QuoteSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TableOfContentWithoutPageNumber | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TeamSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:MultiChartGridSlideLayout | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TitleDescriptionMultiChartGridWithMetrics | D | no recognized structured fields in schema | none | none |
| neo-general | neo-general:TitleDescriptionMultiChartGridWithBullets | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleBadgeChartLayout | B | structured fields plus complex fields | title | badgeText, topDescription, bottomDescription, chartType, graphData |
| neo-standard | neo-standard:TitleDescriptionBulletList | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionContactCardsLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionIconListLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionImageRightLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionRadialCardsLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionTableLayout | B | structured fields plus complex fields | title, description | table |
| neo-standard | neo-standard:TitleDescriptionTimelineLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDualChartsComparisonLayout | B | structured fields plus complex fields | title | comparisonSections |
| neo-standard | neo-standard:TitleDualComparisonCardsLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleKpiGridLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleMetricsChartLayout | B | structured fields plus complex fields | title, description | metrics, chart |
| neo-standard | neo-standard:TitleMetricsImageLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitlePointsDonutGridLayout | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionMultiChartGrid | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionMultiChartGridWithMetrics | D | no recognized structured fields in schema | none | none |
| neo-standard | neo-standard:TitleDescriptionMultiChartGridWithBullets | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionBulletList | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionContactListLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionDualMetricsGridLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionIconTimelineLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionImageRightModernLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionMetricsChartLayout | B | structured fields plus complex fields | title, description | metricCards, chartTitle, chartCategory, chartFooterLabel, chartType, chartData |
| neo-modern | neo-modern:TitleDescriptionMetricsImageLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionMetricsTableLayout | B | structured fields plus complex fields | title, description | table |
| neo-modern | neo-modern:TitleDualComparisonChartsLayout | B | structured fields plus complex fields | title | comparisonCards |
| neo-modern | neo-modern:TitleDualComparisonCardsModernLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleHorizontalAltenenatingTimelineLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleKpiSnapshotGridLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleSubtitlesChartLayout | B | structured fields plus complex fields | title | subtitleLeft, subtitleRight, footerLabel, chartType, graphData |
| neo-modern | neo-modern:TitleTwoColumnNumberListLayout | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionMultiChartGrid | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionMultiChartGridWithMetrics | D | no recognized structured fields in schema | none | none |
| neo-modern | neo-modern:TitleDescriptionMultiChartGridWithBullets | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleCenteredChartLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleChartMetricsSidebarLayout | B | structured fields plus complex fields | title | chartType, chart, metrics |
| neo-swift | neo-swift:TitleDescriptionBulletListLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleDescriptionDataTableLayout | B | structured fields plus complex fields | title, description | table |
| neo-swift | neo-swift:TitleDescriptionImageRightSwiftLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleDescriptionMetricsGridLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleDescriptionMetricsGridImageLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleDualComparisionBlockLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleLabelDescriptionStatCardsLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleSubtitleTeamMemberCardsLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleTaglineDescriptionNumberedStepsLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleThreeByThreeMetricsGridLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleDescriptionSixChartsGridLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleDescriptionSixChartsFourMetricsLayout | D | no recognized structured fields in schema | none | none |
| neo-swift | neo-swift:TitleDescriptionFourChartsSixBulletsLayout | D | no recognized structured fields in schema | none | none |
| general | general:IntroSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:BasicInfoSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:BulletIconsOnlySlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:BulletWithIconsSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:ChartWithBulletsSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:MetricsSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:MetricsWithImageSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:NumberedBulletsSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:QuoteSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:TableInfoSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:TableOfContentsSlideLayout | D | no recognized structured fields in schema | none | none |
| general | general:TeamSlideLayout | D | no recognized structured fields in schema | none | none |
| modern | modern:IntroSlideLayout | D | no recognized structured fields in schema | none | none |
| modern | modern:BulletsWithIconsDescriptionGrid | D | no recognized structured fields in schema | none | none |
| modern | modern:BulletWithIconsSlideLayout | D | no recognized structured fields in schema | none | none |
| modern | modern:ChartOrTableWithDescription | D | no recognized structured fields in schema | none | none |
| modern | modern:ChartOrTableWithMetricsDescription | D | no recognized structured fields in schema | none | none |
| modern | modern:ImageAndDescriptionLayout | D | no recognized structured fields in schema | none | none |
| modern | modern:ImageListWithDescriptionSlideLayout | D | no recognized structured fields in schema | none | none |
| modern | modern:ImagesWithDescriptionLayout | D | no recognized structured fields in schema | none | none |
| modern | modern:MetricsWithDescription | D | no recognized structured fields in schema | none | none |
| modern | modern:TableOfContentsLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:IntroSlideLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:ChartLeftTextRightLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:ContactLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:HeadingBulletImageDescriptionLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:IconBulletDescriptionLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:IconImageDescriptionLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:ImageListWithDescriptionLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:MetricsDescriptionLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:NumberedBulletSingleImageLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:TableOfContentsLayout | D | no recognized structured fields in schema | none | none |
| standard | standard:VisualMetricsSlideLayout | D | no recognized structured fields in schema | none | none |
| swift | swift:IntroSlideLayout | D | no recognized structured fields in schema | none | none |
| swift | swift:BulletsWithIconsTitleDescription | D | no recognized structured fields in schema | none | none |
| swift | swift:IconBulletListDescription | D | no recognized structured fields in schema | none | none |
| swift | swift:ImageListDescription | D | no recognized structured fields in schema | none | none |
| swift | swift:MetricsNumbers | D | no recognized structured fields in schema | none | none |
| swift | swift:SimpleBulletPointsLayout | D | no recognized structured fields in schema | none | none |
| swift | swift:TableOfContents | D | no recognized structured fields in schema | none | none |
| swift | swift:TableorChart | D | no recognized structured fields in schema | none | none |
| swift | swift:Timeline | D | no recognized structured fields in schema | none | none |
| taicang-coal-power-report | coal-power-cover-slide | A | dedicated coal-power native builder exists | title, organization, presenter | none |
| taicang-coal-power-report | coal-power-agenda-slide | A | dedicated coal-power native builder exists | title, items | none |
| taicang-coal-power-report | coal-power-section-divider-slide | A | dedicated coal-power native builder exists | number, title, subtitle | none |
| taicang-coal-power-report | coal-power-kpi-snapshot-slide | A | dedicated coal-power native builder exists | title, metrics, leftBlock, rightBlock, timeline, coreMetrics, conclusion | none |
| taicang-coal-power-report | coal-power-two-column-progress-slide | A | dedicated coal-power native builder exists | title, subtitle, subtitlePrefix, subtitleHighlight, subtitleSuffix, leftTitle, rightTitle, leftItems, rightItems, footer | none |
| taicang-coal-power-report | coal-power-timeline-slide | A | dedicated coal-power native builder exists | title, cards | none |
| taicang-coal-power-report | coal-power-performance-comparison-slide | A | dedicated coal-power native builder exists | title, metric, metricValue, metricText, metricNote1, metricNote2, sectionTitle, bullets, target, footer | none |
| taicang-coal-power-report | coal-power-card-grid-slide | A | dedicated coal-power native builder exists | title, columns, rows, conclusion | none |
| taicang-coal-power-report | coal-power-settlement-dashboard-slide | A | dedicated coal-power native builder exists | title, cards | none |
| taicang-coal-power-report | coal-power-closing-slide | A | dedicated coal-power native builder exists | none | none |
