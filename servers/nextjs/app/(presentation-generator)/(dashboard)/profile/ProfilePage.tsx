"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Loader2, UserCircle } from "lucide-react";
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
    <div className="min-h-screen w-full px-3 pb-10 sm:px-6">
      <div className="sticky top-0 right-0 z-50 py-[28px] backdrop-blur mb-2">
        <h3 className="text-[28px] tracking-[-0.84px] font-syne font-normal text-[#101828] flex items-center gap-2">
          个人信息
        </h3>
      </div>

      <div className="max-w-3xl space-y-5">
        <section className="rounded-[20px] border border-[#EDEEEF] bg-white p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F3FF]">
              <UserCircle className="h-6 w-6 text-[#5146E5]" />
            </div>
            <div>
              <h4 className="font-unbounded text-lg font-normal text-black">
                当前账号
              </h4>
              <p className="mt-1 font-syne text-sm text-[#494A4D]">
                {isLoading
                  ? "正在加载..."
                  : `${profile?.username || "-"} · ${
                      profile?.role === "admin" ? "管理员" : "普通用户"
                    }`}
              </p>
            </div>
          </div>
        </section>

        <form
          onSubmit={updateProfile}
          className="rounded-[20px] border border-[#EDEEEF] bg-white p-7"
        >
          <h4 className="font-unbounded text-lg font-normal text-black">
            修改用户名
          </h4>
          <p className="mt-2 font-syne text-sm text-[#494A4D]">
            修改后，你历史生成的 PPT 归属会同步到新用户名。
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isLoading || isSavingProfile}
              className="flex-1 rounded-[11px] border border-[#EDEEEF] bg-white px-4 py-3 font-syne text-sm outline-none focus:border-[#a49cfc]"
              placeholder="用户名"
            />
            <button
              type="submit"
              disabled={isLoading || isSavingProfile}
              className="inline-flex items-center justify-center gap-2 rounded-[58px] bg-[#7C51F8] px-5 py-3 font-syne text-xs font-semibold text-white disabled:opacity-60"
            >
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              保存用户名
            </button>
          </div>
        </form>

        <form
          onSubmit={updatePassword}
          className="rounded-[20px] border border-[#EDEEEF] bg-white p-7"
        >
          <h4 className="font-unbounded text-lg font-normal text-black">
            修改密码
          </h4>
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={isSavingPassword}
              className="rounded-[11px] border border-[#EDEEEF] bg-white px-4 py-3 font-syne text-sm outline-none focus:border-[#a49cfc]"
              placeholder="当前密码"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSavingPassword}
              className="rounded-[11px] border border-[#EDEEEF] bg-white px-4 py-3 font-syne text-sm outline-none focus:border-[#a49cfc]"
              placeholder="新密码，至少 6 位"
            />
            <button
              type="submit"
              disabled={isSavingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-[58px] border border-[#D9D6FE] px-5 py-3 font-syne text-xs font-semibold text-[#5146E5] disabled:opacity-60"
            >
              {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              修改密码
            </button>
          </div>
        </form>

        <section className="rounded-[20px] border border-[#EDEEEF] bg-white p-7">
          <h4 className="font-unbounded text-lg font-normal text-black">
            退出登录
          </h4>
          <p className="mt-2 font-syne text-sm text-[#494A4D]">
            退出当前账号后，需要重新登录才能继续使用。
          </p>
          <LogoutButton
            label="退出登录"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-[58px] bg-[#7C51F8] px-5 py-3 font-syne text-xs font-semibold text-white"
          />
        </section>
      </div>
    </div>
  );
}
