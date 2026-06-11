import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  fetchTodayEvents,
  getAccessToken,
  hasGoogleConfig,
  setTokenCookies,
} from "@/lib/google-calendar";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const timeMin = requestUrl.searchParams.get("timeMin");
  const timeMax = requestUrl.searchParams.get("timeMax");
  const timeZone = requestUrl.searchParams.get("timeZone") ?? undefined;

  if (!hasGoogleConfig(origin)) {
    return NextResponse.json(
      { connected: false, events: [], error: "Google Calendar is not configured." },
      { status: 500 },
    );
  }

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { connected: false, events: [], error: "Missing time range." },
      { status: 400 },
    );
  }

  const token = await getAccessToken(origin, await cookies());

  if (!token.accessToken) {
    return NextResponse.json({ connected: false, events: [] }, { status: 401 });
  }

  try {
    const events = await fetchTodayEvents({
      accessToken: token.accessToken,
      timeMin,
      timeMax,
      timeZone,
    });
    const response = NextResponse.json({ connected: true, events });

    if (token.refreshedToken) {
      setTokenCookies(response, token.refreshedToken);
    }

    return response;
  } catch (error) {
    console.error("Failed to fetch today's Google Calendar events:", error);
    return NextResponse.json(
      { connected: true, events: [], error: "Could not load today's events." },
      { status: 502 },
    );
  }
}
