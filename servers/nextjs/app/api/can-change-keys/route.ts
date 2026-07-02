import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const canChangeKeys = process.env.CAN_CHANGE_KEYS !== "false";

function getFastApiBaseUrl(): string {
  const internal = process.env.FAST_API_INTERNAL_URL?.trim();
  if (internal) return internal.replace(/\/+$/, "");
  const configured = process.env.NEXT_PUBLIC_FAST_API?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return "http://127.0.0.1:8000";
}

async function isAdmin(request: Request): Promise<boolean> {
  try {
    const response = await fetch(`${getFastApiBaseUrl()}/api/v1/auth/status`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data?.authenticated === true && data?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ canChange: canChangeKeys && await isAdmin(request) })
}
