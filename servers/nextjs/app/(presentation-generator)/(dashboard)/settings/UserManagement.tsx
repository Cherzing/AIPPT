"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { notify } from "@/components/ui/sonner";
import { getApiUrl } from "@/utils/api";

type ManagedUser = {
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

export default function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [renameInputs, setRenameInputs] = useState<Record<string, string>>({});
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});

  const normalUsers = useMemo(
    () => users.filter((user) => user.role !== "admin"),
    [users]
  );
  const adminUsers = useMemo(
    () => users.filter((user) => user.role === "admin"),
    [users]
  );

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/users"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const data = await response.json();
      setUsers(data);
      setRenameInputs(
        Object.fromEntries(
          data
            .filter((user: ManagedUser) => user.role !== "admin")
            .map((user: ManagedUser) => [user.username, user.username])
        )
      );
    } catch (error) {
      notify.error(
        "无法加载用户",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedUsername = username.trim();
    if (!cleanedUsername || password.length < 6) {
      notify.warning("无法创建用户", "用户名不能为空，密码至少 6 位。");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/users"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanedUsername, password }),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      setUsername("");
      setPassword("");
      notify.success("用户已创建", `${cleanedUsername} 已添加为普通用户。`);
      await loadUsers();
    } catch (error) {
      notify.error(
        "无法创建用户",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renameUser = async (targetUsername: string) => {
    const newUsername = (renameInputs[targetUsername] || "").trim();
    if (newUsername.length < 3) {
      notify.warning("无法修改用户名", "用户名至少 3 个字符。");
      return;
    }
    if (newUsername === targetUsername) {
      notify.warning("无需修改", "新用户名与当前用户名一致。");
      return;
    }

    try {
      const response = await fetch(
        getApiUrl(`/api/v1/auth/users/${encodeURIComponent(targetUsername)}`),
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: newUsername }),
        }
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      notify.success("用户名已修改", `${targetUsername} 已改为 ${newUsername}。`);
      await loadUsers();
    } catch (error) {
      notify.error(
        "无法修改用户名",
        error instanceof Error ? error.message : "请稍后重试"
      );
    }
  };

  const resetPassword = async (targetUsername: string) => {
    const newPassword = resetPasswords[targetUsername] || "";
    if (newPassword.length < 6) {
      notify.warning("无法重置密码", "新密码至少 6 位。");
      return;
    }

    try {
      const response = await fetch(
        getApiUrl(`/api/v1/auth/users/${encodeURIComponent(targetUsername)}/password`),
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        }
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      setResetPasswords((prev) => ({ ...prev, [targetUsername]: "" }));
      notify.success("密码已重置", `${targetUsername} 需要使用新密码重新登录。`);
    } catch (error) {
      notify.error(
        "无法重置密码",
        error instanceof Error ? error.message : "请稍后重试"
      );
    }
  };

  const deleteUser = async (targetUsername: string) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/auth/users/${encodeURIComponent(targetUsername)}`),
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      notify.success("用户已删除", `${targetUsername} 已不能再登录。`);
      await loadUsers();
    } catch (error) {
      notify.error(
        "无法删除用户",
        error instanceof Error ? error.message : "请稍后重试"
      );
    }
  };

  return (
    <div className="w-full max-w-6xl overflow-y-auto pb-28 pr-6">
      <div className="aippt-soft-card p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="aippt-section-eyebrow">管理员工具</p>
            <h4 className="mt-3 text-lg font-bold text-slate-950">
              用户管理
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              管理普通用户账号。管理员账号只用于系统配置，不允许在这里修改或删除。
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="aippt-ghost-button aippt-focus min-h-0 px-4 py-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
        </div>

        <form
          onSubmit={createUser}
          className="mt-7 grid gap-3 rounded-[20px] border border-[var(--aippt-border)] bg-white/55 p-4 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="普通用户用户名"
            className="aippt-input"
          />
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="初始密码，至少 6 位"
            className="aippt-input"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="aippt-gradient-button aippt-focus disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            创建用户
          </button>
        </form>

        <div className="mt-7 space-y-3">
          <p className="text-xs font-semibold text-slate-600">
            管理员账号
          </p>
          {adminUsers.map((user) => (
            <div
              key={user.username}
              className="rounded-[18px] border border-[var(--aippt-border)] bg-white/75 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
            >
              <div className="text-sm font-semibold text-slate-950">
                {user.username}
              </div>
              <div className="mt-1 text-xs font-semibold text-indigo-600">
                管理员
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 space-y-3">
          <p className="text-xs font-semibold text-slate-600">
            普通用户
          </p>
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-[18px] border border-[var(--aippt-border)] bg-white/70 px-4 py-5 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在加载用户...
            </div>
          ) : normalUsers.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-indigo-200 bg-indigo-50/45 px-4 py-8 text-center text-sm text-slate-600">
              暂无普通用户。可以使用上方表单创建。
            </div>
          ) : (
            normalUsers.map((user) => (
              <div
                key={user.username}
                 className="grid gap-3 rounded-[20px] border border-[var(--aippt-border)] bg-white/75 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] xl:grid-cols-[180px_220px_auto_220px_auto_auto] xl:items-center"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-950">
                    {user.username}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    普通用户
                  </div>
                </div>

                <input
                  value={renameInputs[user.username] || user.username}
                  onChange={(event) =>
                    setRenameInputs((prev) => ({
                      ...prev,
                      [user.username]: event.target.value,
                    }))
                  }
                  placeholder="新用户名"
                  className="aippt-input min-h-10 px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => void renameUser(user.username)}
                  className="aippt-ghost-button aippt-focus min-h-10 px-4 py-2 text-xs"
                >
                  修改用户名
                </button>

                <input
                  type="password"
                  value={resetPasswords[user.username] || ""}
                  onChange={(event) =>
                    setResetPasswords((prev) => ({
                      ...prev,
                      [user.username]: event.target.value,
                    }))
                  }
                  placeholder="新密码"
                  className="aippt-input min-h-10 px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => void resetPassword(user.username)}
                  className="aippt-ghost-button aippt-focus min-h-10 px-4 py-2 text-xs"
                >
                  重置密码
                </button>
                <button
                  type="button"
                  onClick={() => void deleteUser(user.username)}
                  className="aippt-focus inline-flex min-h-10 items-center justify-center gap-1 rounded-full border border-red-100 bg-white/70 px-4 py-2 text-xs font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
