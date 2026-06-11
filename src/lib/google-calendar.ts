import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "google_calendar_access_token";
const REFRESH_TOKEN_COOKIE = "google_calendar_refresh_token";
const EXPIRES_AT_COOKIE = "google_calendar_expires_at";

export type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start: string;
  end: string;
  allDay: boolean;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleCalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

type CalendarCookieStore = {
  get(name: string): { value: string } | undefined;
};

export function getGoogleConfig(origin: string) {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${origin}/api/google/callback`,
  };
}

export function hasGoogleConfig(origin: string) {
  const config = getGoogleConfig(origin);
  return Boolean(config.clientId && config.clientSecret);
}

export function setTokenCookies(response: NextResponse, token: GoogleTokenResponse) {
  if (!token.access_token) return;

  const secure = process.env.NODE_ENV === "production";
  const maxAge = token.expires_in ?? 3600;

  response.cookies.set(ACCESS_TOKEN_COOKIE, token.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });

  if (token.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, token.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }

  response.cookies.set(EXPIRES_AT_COOKIE, String(Date.now() + maxAge * 1000), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(EXPIRES_AT_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function refreshAccessToken(
  origin: string,
  refreshToken: string,
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getGoogleConfig(origin);

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId ?? "",
      client_secret: clientSecret ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  return tokenResponse.json();
}

export async function getAccessToken(
  origin: string,
  cookieStore: CalendarCookieStore,
): Promise<{ accessToken: string | null; refreshedToken?: GoogleTokenResponse }> {
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const expiresAt = Number(cookieStore.get(EXPIRES_AT_COOKIE)?.value ?? 0);

  if (accessToken && expiresAt > Date.now() + 60_000) {
    return { accessToken };
  }

  if (!refreshToken) {
    return { accessToken: null };
  }

  const refreshedToken = await refreshAccessToken(origin, refreshToken);
  return {
    accessToken: refreshedToken.access_token ?? null,
    refreshedToken,
  };
}

export async function fetchTodayEvents(params: {
  accessToken: string;
  timeMin: string;
  timeMax: string;
  timeZone?: string;
}): Promise<CalendarEvent[]> {
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeMin", params.timeMin);
  url.searchParams.set("timeMax", params.timeMax);
  if (params.timeZone) {
    url.searchParams.set("timeZone", params.timeZone);
  }

  const eventsResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${params.accessToken}` },
  });

  if (!eventsResponse.ok) {
    throw new Error(`Google Calendar returned ${eventsResponse.status}`);
  }

  const data = (await eventsResponse.json()) as { items?: GoogleCalendarEvent[] };

  return (data.items ?? []).map((event) => ({
    id: event.id ?? crypto.randomUUID(),
    summary: event.summary ?? "Untitled event",
    description: event.description,
    location: event.location,
    htmlLink: event.htmlLink,
    start: event.start?.dateTime ?? event.start?.date ?? "",
    end: event.end?.dateTime ?? event.end?.date ?? "",
    allDay: Boolean(event.start?.date),
  }));
}
