"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

import { getApiUrl } from "@/utils/api";
import { isAuthDisabled } from "@/utils/auth";
import { formatFastApiDetail, UNAUTHORIZED_DETAIL } from "@/utils/authErrors";
import { notify } from "@/components/ui/sonner";

type AuthStatus = {
  configured: boolean;
  authenticated: boolean;
  username: string | null;
  role?: "admin" | "user" | null;
};

const initialStatus: AuthStatus = {
  configured: false,
  authenticated: false,
  username: null,
  role: null,
};

export default function AuthGate() {
  const [status, setStatus] = useState<AuthStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const isSetupMode = useMemo(() => !status.configured, [status.configured]);
  const isRegisterMode = status.configured && authMode === "register";

  useEffect(() => {
    if (isAuthDisabled()) {
      setStatus({
        configured: true,
        authenticated: true,
        username: "electron",
        role: "admin",
      });
      setIsLoading(false);
      return;
    }

    void refreshStatus();
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isLoading ||
      !status.authenticated ||
      isRedirecting
    ) {
      return;
    }

    setIsRedirecting(true);
    window.location.replace("/");
  }, [isLoading, isRedirecting, status.authenticated]);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "unauthorized") {
      if (status.configured && !status.authenticated) {
        notify.error("需要登录", "请登录后继续访问该页面。", {
          id: "auth-unauthorized-redirect",
          duration: 5000,
        });
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isLoading, status.authenticated, status.configured]);

  const refreshStatus = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/auth/status"), {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not load login state");
      }

      const data = (await response.json()) as AuthStatus;
      setStatus({
        configured: Boolean(data.configured),
        authenticated: Boolean(data.authenticated),
        username: data.username ?? null,
        role: data.role ?? null,
      });
    } catch (fetchError) {
      console.error(fetchError);
      notify.error("登录服务不可用", "无法连接登录服务，请刷新后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedUsername = username.trim();
    if (cleanedUsername.length < 3) {
      notify.warning("用户名过短", "用户名至少需要 3 个字符。");
      return;
    }

    if (password.length < 6) {
      notify.warning("密码过短", "密码至少需要 6 个字符。");
      return;
    }

    if ((isSetupMode || isRegisterMode) && password !== confirmPassword) {
      notify.warning("两次密码不一致", "请确认两次输入的密码完全一致。");
      return;
    }

    setIsSubmitting(true);

    try {
      const authPath = isSetupMode
        ? "/api/v1/auth/setup"
        : isRegisterMode
          ? "/api/v1/auth/register"
          : "/api/v1/auth/login";
      const response = await fetch(getApiUrl(authPath), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanedUsername,
          password,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        const detail = formatFastApiDetail(payload?.detail);
        notify.error(
          isSetupMode ? "无法创建管理员" : isRegisterMode ? "注册失败" : "登录失败",
          response.status === 401 && detail === UNAUTHORIZED_DETAIL
            ? "用户名或密码不正确，请重新输入。"
            : detail || "请求处理失败，请稍后重试。"
        );
        return;
      }

      if (isSetupMode) {
        setStatus({
          configured: true,
          authenticated: false,
          username: (payload as AuthStatus).username ?? cleanedUsername,
          role: (payload as AuthStatus).role ?? "admin",
        });
        setPassword("");
        setConfirmPassword("");
        notify.success("管理员已创建", "请使用新账号登录 AIPPT。", {
          duration: 6000,
        });
        return;
      }

      setStatus({
        configured: Boolean((payload as AuthStatus).configured),
        authenticated: Boolean((payload as AuthStatus).authenticated),
        username: (payload as AuthStatus).username ?? cleanedUsername,
        role: (payload as AuthStatus).role ?? null,
      });
      setPassword("");
      setConfirmPassword("");
      notify.success("登录成功", "正在进入 AIPPT 工作台。");
    } catch (submitError) {
      console.error(submitError);
      notify.error("登录服务不可用", "请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isRedirecting || status.authenticated) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--aippt-bg)] p-6">
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <section className="aippt-soft-card relative z-10 w-full max-w-md rounded-[28px] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-black text-white shadow-[0_18px_42px_rgba(79,70,229,0.28)]">
            A
          </div>
          <h1 className="text-xl font-bold text-slate-950">AIPPT</h1>
          <p className="mt-3 text-sm text-slate-500">正在准备你的工作台...</p>
          <div className="mt-6 flex justify-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-600 [animation-delay:0.2s]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600 [animation-delay:0.4s]" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--aippt-bg)] p-6">
      <div className="pointer-events-none absolute left-[-10rem] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-violet-200/40 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="aippt-soft-card hidden rounded-[32px] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-black text-white shadow-[0_18px_42px_rgba(79,70,229,0.28)]">
              A
            </div>
            <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              AI 演示文稿平台
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.05em] text-slate-950">
              用 AIPPT 更快生成高质量 PPT
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              管理模板、生成文稿、维护账号权限，在一个清晰的工作台内完成。
            </p>
          </div>
          <div className="grid gap-3">
            {["私有文稿隔离", "管理员统一管理", "模板驱动生成"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="aippt-soft-card rounded-[32px] p-7 sm:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {isSetupMode ? "初始化管理员" : isRegisterMode ? "注册普通用户" : "安全登录"}
              </p>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                {isSetupMode ? "创建管理员账号" : isRegisterMode ? "创建你的账号" : "登录 AIPPT"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {isSetupMode
                  ? "首次启动需要创建管理员账号，后续可在设置页管理普通用户。"
                  : isRegisterMode
                    ? "普通用户注册后，只能看到自己生成的 PPT。"
                    : "请输入账号密码进入工作台。"}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <LockKeyhole className="h-5 w-5" />
            </div>
          </div>

          {!isSetupMode ? (
            <div className="mb-7 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  authMode === "login"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  authMode === "register"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                注册
              </button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-800">
                用户名
              </label>
              <input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="请输入用户名"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                密码
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isSetupMode || isRegisterMode ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 6 个字符"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                disabled={isSubmitting}
              />
            </div>

            {isSetupMode || isRegisterMode ? (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-800">
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="再次输入密码"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  disabled={isSubmitting}
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-bold text-white shadow-[0_16px_36px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isSetupMode
                  ? "正在创建..."
                  : isRegisterMode
                    ? "正在注册..."
                    : "正在登录..."
                : isSetupMode
                  ? "创建管理员"
                  : isRegisterMode
                    ? "注册账号"
                    : "登录"}
              {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
