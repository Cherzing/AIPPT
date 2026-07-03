# Account And Presentation Ownership Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善 AIPPT-zh 的管理员用户管理、普通用户个人中心/退出，以及 dashboard PPT 所属用户显示，并将项目推送到 GitHub。

**Architecture:** 继续使用 `app_data/userConfig.json` 的 `AUTH_USERS` 作为账号存储，不新增用户表。PPT 归属沿用 `presentations.owner_user`，后端已有管理员看全部、普通用户看自己的基础；前端补展示和入口。普通用户资料改名时同步更新历史 PPT 的 `owner_user`。

**Tech Stack:** FastAPI, SQLModel/SQLAlchemy async session, Next.js App Router, React client components, Docker Compose production.

---

### Task 1: 后端账号能力

**Files:**
- Modify: `servers/fastapi/utils/simple_auth.py`
- Modify: `servers/fastapi/api/v1/auth/router.py`
- Test: `servers/fastapi/tests/unit/test_auth_user_management.py`
- Test: `servers/fastapi/tests/integration/test_auth_endpoints.py`

- [ ] 增加失败测试：管理员可重命名普通用户、重置密码、删除；不能修改/删除管理员；普通用户可读取自己资料、修改用户名、修改密码。
- [ ] 运行后端相关测试，确认新测试先失败。
- [ ] 在 `simple_auth.py` 增加 `get_current_user_profile`、`rename_managed_user`、`update_current_user_profile`、`change_current_user_password`。
- [ ] 在 `auth/router.py` 增加 `GET /me`、`PUT /me`、`PUT /me/password`、`PUT /users/{username}`。
- [ ] 管理员重命名普通用户时由 router 同步更新 `PresentationModel.owner_user`。
- [ ] 运行后端测试确认通过。

### Task 2: 前端个人中心和退出入口

**Files:**
- Modify: `servers/nextjs/app/(presentation-generator)/(dashboard)/Components/DashboardSidebar.tsx`
- Create: `servers/nextjs/app/(presentation-generator)/(dashboard)/profile/page.tsx`
- Create: `servers/nextjs/app/(presentation-generator)/(dashboard)/profile/ProfilePage.tsx`
- Modify: `servers/nextjs/components/Auth/LogoutButton.tsx`

- [ ] 普通用户左侧栏显示“个人信息”和“退出登录”。
- [ ] 管理员左侧栏保留“设置”，同时也显示“退出登录”。
- [ ] 个人信息页支持查看用户名/角色、修改用户名、修改密码、退出登录。
- [ ] 退出按钮中文化提交状态。

### Task 3: 管理员设置页用户管理

**Files:**
- Modify: `servers/nextjs/app/(presentation-generator)/(dashboard)/settings/UserManagement.tsx`
- Modify: `servers/nextjs/app/(presentation-generator)/(dashboard)/settings/SettingSideBar.tsx`
- Modify: `servers/nextjs/app/(presentation-generator)/(dashboard)/settings/SettingPage.tsx`

- [ ] 用户管理支持创建、重命名、重置密码、删除普通用户。
- [ ] 删除设置页“使用分析”入口和内容。
- [ ] 管理员账号只展示，不允许在 UI 中改名、重置或删除。

### Task 4: Dashboard PPT 所属用户显示

**Files:**
- Modify: `servers/nextjs/app/(presentation-generator)/services/api/dashboard.ts`
- Modify: `servers/nextjs/app/(presentation-generator)/(dashboard)/dashboard/components/PresentationCard.tsx`

- [ ] `PresentationResponse` 增加 `owner_user`。
- [ ] 卡片在有 `owner_user` 时显示“所属用户：xxx”。管理员看全部时可以区分归属。

### Task 5: 验证、生产更新、GitHub

**Commands:**
- `python -m pytest tests/unit/test_auth_user_management.py tests/integration/test_auth_endpoints.py tests/unit/test_presentation_access.py -q`
- `npx tsc --noEmit`
- `npm run build`
- `docker compose -f docker-compose.yml up production --build -d`
- 浏览器验证：admin 用户管理、普通用户个人中心/退出、dashboard 所属用户显示。
- 初始化 Git 仓库、添加远端 `https://github.com/Cherzing/AIPPT.git`、提交并推送；如认证失败，停下并报告需要用户完成 GitHub 登录。
