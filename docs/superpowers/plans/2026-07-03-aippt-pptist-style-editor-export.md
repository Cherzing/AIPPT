# AIPPT PPTist-Style Editor Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PPTist-inspired unified slide element pipeline for AIPPT so the coal-power template can be rendered, edited online, and exported to PPTX from the same element data.

**Architecture:** Add an AIPPT slide element model that represents text, images, shapes, lines, tables, and groups in a 1280x720 coordinate system. React preview and PPTX export both consume this model, while legacy TSX templates remain available during migration. Coal-power is the pilot template.

**Tech Stack:** Next.js, React, TypeScript, pptxgenjs, existing AIPPT presentation data, Node test runner.

---

### Task 1: Unified Element Model

**Files:**
- Create: `servers/nextjs/lib/pptx-model/types.ts`
- Create: `servers/nextjs/lib/pptx-model/geometry.ts`
- Test: `servers/nextjs/tests/pptx-model.test.mjs`

- [ ] **Step 1: Add model tests**

Create tests that assert 1280x720 pixel coordinates convert to 13.333333x7.5 inch PPTX coordinates and margins convert predictably.

- [ ] **Step 2: Add model types**

Define `AipptSlideDocument`, `AipptSlideElement`, `AipptTextElement`, `AipptImageElement`, `AipptShapeElement`, `AipptLineElement`, and `AipptTableElement`.

- [ ] **Step 3: Add geometry helpers**

Implement `pxToIn`, `boxToPptx`, and `ptToPx` helpers with stable rounding.

- [ ] **Step 4: Verify model tests**

Run: `node --test tests/pptx-model.test.mjs`

Expected: PASS.

### Task 2: React Element Renderer

**Files:**
- Create: `servers/nextjs/app/(presentation-generator)/components/aippt-canvas/AipptSlideCanvas.tsx`
- Create: `servers/nextjs/app/(presentation-generator)/components/aippt-canvas/AipptEditableCanvas.tsx`
- Modify: `servers/nextjs/app/(presentation-generator)/components/V1ContentRender.tsx`

- [ ] **Step 1: Render element documents**

Add a client React renderer that draws element documents with absolute-positioned native elements in the same 1280x720 coordinate system.

- [ ] **Step 2: Add basic editing**

Add selection, keyboard delete, drag move, resize handles, and inline text editing. Persist changes through the existing `updateSlideContent` Redux path by writing to `content.__aippt.elements`.

- [ ] **Step 3: Route migrated slides**

When `slide.content.__aippt` exists, render the AIPPT canvas instead of the legacy TSX template.

### Task 3: PPTX Native Element Export

**Files:**
- Create: `servers/nextjs/lib/pptx-model/export-pptx.ts`
- Modify: `servers/nextjs/lib/native-pptx/index.ts`
- Modify: `servers/nextjs/app/api/export-presentation/route.ts`
- Test: `servers/nextjs/tests/pptx-model.test.mjs`

- [ ] **Step 1: Export supported elements**

Map text to `addText`, images to `addImage`, shapes to `addShape`, lines to `addShape`, and tables to `addTable`.

- [ ] **Step 2: Use explicit native metrics**

Always set font face, font size, color, alignment, vertical alignment, margins, line spacing where supported, width, height, x, and y.

- [ ] **Step 3: Add export route detection**

If every slide has `content.__aippt`, use the model exporter. Otherwise keep existing coal-power/native and bundled fallback routes.

### Task 4: Coal-Power Pilot Converter

**Files:**
- Create: `servers/nextjs/lib/pptx-model/coal-power-template.ts`
- Modify: `servers/nextjs/app/presentation-templates/taicang-coal-power-report/sampleData.ts`
- Modify: `servers/nextjs/tests/native-pptx-coal-power.test.mjs`

- [ ] **Step 1: Convert representative coal layouts**

Generate `__aippt` documents for the coal-power layout types, using existing background images and fixed coordinates.

- [ ] **Step 2: Preserve template data**

Keep existing template schemas and readable fields; add generated `__aippt` alongside them so AI generation still has semantic content.

- [ ] **Step 3: Validate export**

Export a coal-power PPTX and inspect the generated XML for expected text, background image, and non-overlapping coordinates.

### Task 5: Visual Fidelity Fallback

**Files:**
- Create: `servers/nextjs/lib/pptx-model/image-export-mode.ts`
- Modify: `servers/nextjs/app/api/export-presentation/route.ts`

- [ ] **Step 1: Add mode field**

Accept an optional export mode: `native` or `image`. Default to `native`.

- [ ] **Step 2: Add image-mode placeholder**

Return a clear unsupported response until browser screenshot capture is wired, so the API contract is ready without silently producing bad output.

### Task 6: Validation

**Files:**
- Modify as needed from previous tasks only.

- [ ] **Step 1: Run targeted tests**

Run: `node --test tests/pptx-model.test.mjs tests/native-pptx-coal-power.test.mjs`

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit --pretty false`

- [ ] **Step 3: Build production bundle**

Run: `npm run build`

