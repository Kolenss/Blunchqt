import { NextResponse } from "next/server";
import { clearTokenCookies } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/calendar?calendar=signed-out", origin));
  clearTokenCookies(response);
  return response;
}
