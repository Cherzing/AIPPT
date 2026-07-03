import React from "react";
import ProfilePage from "./ProfilePage";

export const metadata = {
  title: "个人信息 | AIPPT",
  description: "管理当前登录用户的账号信息",
};

export default function page() {
  return <ProfilePage />;
}
