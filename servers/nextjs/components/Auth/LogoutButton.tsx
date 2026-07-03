"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { getApiUrl } from "@/utils/api";

type LogoutButtonProps = {
  label?: string;
  className?: string;
  iconClassName?: string;
  iconOnly?: boolean;
  iconWrapperClassName?: string;
};

export default function LogoutButton({
  label = "退出登录",
  className = "",
  iconClassName = "h-4 w-4",
  iconOnly = false,
  iconWrapperClassName,
}: LogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch(getApiUrl("/api/v1/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.replace("/");
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className={className}
      aria-label={label}
      title={label}
    >
      {iconWrapperClassName ? (
        <span className={iconWrapperClassName}>
          <LogOut className={iconClassName} />
        </span>
      ) : (
        <LogOut className={iconClassName} />
      )}
      {!iconOnly ? <span>{isSubmitting ? "正在退出..." : label}</span> : null}
    </button>
  );
}
