# AIPPT 用户管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `AIPPT-zh` 增加管理员/普通用户、注册登录、配置权限和 PPT 所属权隔离。

**Architecture:** 在 FastAPI 侧新增 SQL 用户表和会话角色，所有 PPT 查询/读取/编辑/删除在后端按当前用户校验。Next.js 前端只做入口隐藏和用户体验控制，不能作为唯一权限边界。

**Tech Stack:** FastAPI, SQLModel, SQLite/Postgres-compatible schema, Next.js App Router, existing `aippt_session` cookie.

---

### Task 1: 后端认证模型

**Files:**
- Create: `servers/fastapi/models/sql/user.py`
- Modify: `servers/fastapi/services/database.py`
- Modify: `servers/fastapi/utils/simple_auth.py`
- Modify: `servers/fastapi/api/v1/auth/router.py`

- [ ] Add `UserModel` with `username`, `password_hash`, `role`, timestamps.
- [ ] Replace single `AUTH_USERNAME` credential validation with SQL-backed users.
- [ ] Preserve first-run setup as admin creation.
- [ ] Add `/api/v1/auth/register` for normal users.
- [ ] Return `role` from status/login/verify.

### Task 2: PPT 所属权隔离

**Files:**
- Modify: `servers/fastapi/models/sql/presentation.py`
- Modify: `servers/fastapi/api/v1/ppt/endpoints/presentation.py`
- Modify: `servers/fastapi/api/v1/ppt/endpoints/outlines.py`
- Modify: `servers/fastapi/api/v1/ppt/endpoints/slide.py`
- Modify: `servers/fastapi/api/v1/ppt/endpoints/chat.py`

- [ ] Add nullable `owner_user_id` to presentations.
- [ ] Stamp owner on create/generate/derive.
- [ ] Filter `/presentation/all` by owner for normal users.
- [ ] Require owner/admin for get/update/delete/edit/derive/stream/prepare and dependent endpoints.

### Task 3: 前端权限体验

**Files:**
- Modify: `servers/nextjs/components/Auth/AuthGate.tsx`
- Modify: `servers/nextjs/store/slices/userConfig.ts`
- Modify: `servers/nextjs/app/ConfigurationInitializer.tsx`
- Modify: `servers/nextjs/app/(presentation-generator)/(dashboard)/Components/DashboardSidebar.tsx`
- Modify: `servers/nextjs/app/(presentation-generator)/(dashboard)/settings/SettingPage.tsx`

- [ ] Login page supports register mode after admin setup.
- [ ] Store `authUser` including role.
- [ ] Hide settings from non-admin users.
- [ ] Redirect non-admin `/settings` to dashboard.

### Task 4: Verification and deployment

**Commands:**
- Run focused backend tests where practical.
- Run `npm run build` in `servers/nextjs`.
- Run `docker compose -f docker-compose.yml up production --build -d` from `AIPPT-zh`.
