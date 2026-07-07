# Coal Power Native PPTX Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export `taicang-coal-power-report` presentations as stable PowerPoint-native PPTX files instead of DOM/CSS converted slides.

**Architecture:** Keep TSX templates for browser preview/editing. Add a Next.js server-side native PPTX exporter that detects the coal-power template group, maps slide content into explicit PPTX primitives, and falls back to the existing bundled exporter for unsupported templates. Each native renderer uses fixed 16:9 coordinates, explicit Chinese fonts, font sizes, margins, line spacing, and simple shapes/images.

**Tech Stack:** Next.js route handlers, TypeScript, `pptxgenjs`, Node filesystem APIs, existing FastAPI presentation JSON response.

---

### Task 1: Add Native Export Contract

**Files:**
- Create: `servers/nextjs/lib/native-pptx/types.ts`
- Create: `servers/nextjs/lib/native-pptx/coal-power-exporter.ts`
- Create: `servers/nextjs/tests/native-pptx-coal-power.test.mjs`

- [ ] Write a test that passes a sample presentation with `layout_group: "taicang-coal-power-report"` and expects a PPTX file to be created with a valid ZIP package.
- [ ] Run `node --test tests/native-pptx-coal-power.test.mjs`; expected failure is missing module/exporter.
- [ ] Implement minimal `canExportCoalPowerNative` and `exportCoalPowerNativePptx` signatures.
- [ ] Re-run the test; expected pass once the file is generated.

### Task 2: Implement Coal-Power Slide Renderers

**Files:**
- Modify: `servers/nextjs/lib/native-pptx/coal-power-exporter.ts`

- [ ] Add constants: slide size 13.333 x 7.5 inches, conversion from 1280x720 px to inches, font face `Microsoft YaHei`, title/body colors, and background asset paths.
- [ ] Implement helpers: `addImageCover`, `addTextBox`, `addSectionTitle`, `addMetricCard`, `addBulletList`, `addPageNumber`.
- [ ] Implement renderers for 10 coal-power layouts using only PPTX native text, shapes, lines, and images.
- [ ] Avoid CSS-only behaviors: no flex, grid, filter, backdrop, CSS gradients, or HTML text wrapping assumptions.

### Task 3: Wire Native Export into API

**Files:**
- Modify: `servers/nextjs/app/api/export-presentation/route.ts`
- Create or modify: `servers/nextjs/lib/native-pptx/index.ts`

- [ ] In PPTX format requests, fetch presentation JSON using the request cookie.
- [ ] If every slide is in `taicang-coal-power-report`, call native exporter and return `/api/export-presentation/file?...`.
- [ ] If unsupported, preserve current bundled export path.

### Task 4: Validate

**Files:**
- Modify: `servers/nextjs/package.json`, `servers/nextjs/package-lock.json`

- [ ] Install `pptxgenjs` in `servers/nextjs`.
- [ ] Run `node --test tests/native-pptx-coal-power.test.mjs`.
- [ ] Run `npx tsc --noEmit --pretty false`.
- [ ] Run `npm run build`.
- [ ] Export a coal-power PPTX from the running app and inspect that the resulting file has real PPTX slides, not a browser screenshot conversion.
