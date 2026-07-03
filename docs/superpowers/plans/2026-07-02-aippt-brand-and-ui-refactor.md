# AIPPT Brand and UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the project to AIPPT across display, code, config, and external placeholder assets while refactoring the primary UI to a Soft UI Evolution + Bento Box Grid style.

**Architecture:** Use a safe source-only replacement pass for brand identifiers, then hand-edit high-traffic UI surfaces. Keep runtime data, build outputs, dependency folders, and generated caches excluded from replacement.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, FastAPI, Docker Compose, pytest, TypeScript.

---

### Task 1: Brand Replacement

**Files:**
- Modify source files under `servers/`, `electron/`, `scripts/`, `docs/`, root config files, and package manifests.
- Exclude: `.git/`, `node_modules/`, `.next/`, `.next-build/`, `app_data/`, `presentation-export/`, caches, and NOTICE/license dependency bundles.

- [ ] Replace all legacy project brand spellings with `AIPPT` / `aippt` according to display or code context.
- [ ] Rename auth cookie from `aippt_session` to `aippt_session`.
- [ ] Rename legacy project environment variables to `AIPPT_*`.
- [ ] Replace legacy remote template placeholder URLs with same-origin local placeholder assets where possible.

### Task 2: Core UI Redesign

**Files:**
- Modify `servers/nextjs/app/globals.css`
- Modify `servers/nextjs/app/(presentation-generator)/(dashboard)/layout.tsx`
- Modify `servers/nextjs/app/(presentation-generator)/(dashboard)/Components/DashboardSidebar.tsx`
- Modify `servers/nextjs/app/(presentation-generator)/(dashboard)/dashboard/components/DashboardPage.tsx`
- Modify `servers/nextjs/app/(presentation-generator)/(dashboard)/dashboard/components/PresentationCard.tsx`
- Modify `servers/nextjs/components/Header.tsx`
- Modify `servers/nextjs/components/Auth/AuthGate.tsx`

- [ ] Add AIPPT design tokens for soft surfaces, blue-violet primary color, card shadows, bento radius, and focus rings.
- [ ] Replace narrow icon-only sidebar with readable soft sidebar using logo mark, labels, active states, and clear logout/account affordances.
- [ ] Redesign dashboard header, create action, and presentation grid cards around soft cards and bento layout.
- [ ] Localize remaining English dashboard actions and delete dialog copy.

### Task 3: Verification

**Commands:**
- `python -m pytest tests/unit/test_auth_user_management.py tests/integration/test_auth_endpoints.py tests/unit/test_presentation_access.py -q`
- `npx tsc --noEmit`
- `npm run build`
- `docker compose -f docker-compose.yml up production --build -d`

- [ ] Confirm no source occurrences of the legacy project brand remain outside excluded dependency/legal/runtime files.
- [ ] Confirm `http://localhost:5001/dashboard` renders the AIPPT UI after production rebuild.
