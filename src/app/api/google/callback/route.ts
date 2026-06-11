import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getGoogleConfig, setTokenCookies } from "@/lib/google-calendar";

const STATE_COOKIE = "google_calendar_oauth_state";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const expectedState = (await cookies()).get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/calendar?calendar=auth-error", origin));
  }

  const { clientId, clientSecret, redirectUri } = getGoogleConfig(origin);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/calendar?calendar=missing-config", origin));
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/calendar?calendar=token-error", origin));
  }

  const token = await tokenResponse.json();
  const response = NextResponse.redirect(new URL("/calendar?calendar=connected", origin));
  response.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  setTokenCookies(response, token);

  return response;
}
