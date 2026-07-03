"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { KeyRound, Loader2, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { useDispatch } from "react-redux";

import LogoutButton from "@/components/Auth/LogoutButton";
import { notify } from "@/components/ui/sonner";
import { setAuthUser } from "@/store/slices/userConfig";
import { getApiUrl } from "@/utils/api";

type UserProfile = {
  username: string;
  role: "admin" | "user" | string;
};

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return String(data?.detail || data?.error || "操作失败");
  } catch {
    return "操作失败";
  }
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/me"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const data = await response.json();
      setProfile(data);
      setUsername(data.username || "");
      dispatch(
        setAuthUser({
          username: data.username || null,
          role: data.role === "admin" ? "admin" : "user",
        })
      );
    } catch (error) {
      notify.error(
        "无法加载个人信息",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedUsername = username.trim();
    if (cleanedUsername.length < 3) {
      notify.warning("无法保存", "用户名至少 3 个字符。");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/me"), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanedUsername }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const data = await response.json();
      setProfile(data);
      setUsername(data.username || "");
      dispatch(
        setAuthUser({
          username: data.username || null,
          role: data.role === "admin" ? "admin" : "user",
        })
      );
      notify.success("个人信息已更新", "新的用户名已生效。");
    } catch (error) {
      notify.error(
        "无法更新个人信息",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentPassword.length < 6 || newPassword.length < 6) {
      notify.warning("无法修改密码", "当前密码和新密码都至少 6 位。");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/me/password"), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
        }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      setCurrentPassword("");
      setNewPassword("");
      notify.success("密码已修改", "后续请使用新密码登录。");
    } catch (error) {
      notify.error(
        "无法修改密码",
        error instanceof Error ? error.message : "请确认当前密码是否正确"
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="aippt-page-shell w-full">
      <div className="aippt-page-content max-w-5xl">
        <div className="aippt-topbar">
          <div className="aippt-soft-card px-6 py-5">
            <p className="aippt-section-eyebrow">
              <UserCircle className="h-3.5 w-3.5" />
              账号中心
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[28px]">
              个人信息
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              管理当前账号资料、登录密码和会话状态。
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="aippt-soft-card p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                当前账号
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isLoading
                  ? "正在加载..."
                  : `${profile?.username || "-"} · ${
                      profile?.role === "admin" ? "管理员" : "普通用户"
                    }`}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-semibold text-slate-500">权限说明</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              普通用户仅能查看自己的 PPT；管理员可管理普通用户并查看全部 PPT。
            </p>
          </div>
        </section>

          <div className="space-y-5">
            <form onSubmit={updateProfile} className="aippt-soft-card p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">修改用户名</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    修改后，你历史生成的 PPT 归属会同步到新用户名。
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={isLoading || isSavingProfile}
                  className="aippt-input flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="用户名"
                />
                <button
                  type="submit"
                  disabled={isLoading || isSavingProfile}
                  className="aippt-gradient-button aippt-focus disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  保存用户名
                </button>
              </div>
            </form>

            <form onSubmit={updatePassword} className="aippt-soft-card p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">修改密码</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    新密码至少 6 位，保存后下次登录生效。
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={isSavingPassword}
                  className="aippt-input disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="当前密码"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isSavingPassword}
                  className="aippt-input disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="新密码，至少 6 位"
                />
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="aippt-ghost-button aippt-focus disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  修改密码
                </button>
              </div>
            </form>

            <section className="aippt-soft-card p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">退出登录</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    退出当前账号后，需要重新登录才能继续使用。
                  </p>
                </div>
              </div>
              <LogoutButton
                label="退出登录"
                className="aippt-gradient-button aippt-focus mt-5"
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
