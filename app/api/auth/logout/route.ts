import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await logout();
  const url = request.nextUrl.origin + "/admin/login";
  return NextResponse.redirect(url);
}
