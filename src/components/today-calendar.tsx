"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start: string;
  end: string;
  allDay: boolean;
};

type CalendarResponse = {
  connected: boolean;
  events: CalendarEvent[];
  error?: string;
};

type TodayCalendarProps = {
  compact?: boolean;
};

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function formatEventTime(event: CalendarEvent) {
  if (event.allDay) return "All day";

  const start = new Date(event.start);
  const end = new Date(event.end);
  const formatter = new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export default function TodayCalendar({ compact = false }: TodayCalendarProps) {
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const todayRange = useMemo(() => getTodayRange(), []);

  useEffect(() => {
    const params = new URLSearchParams(todayRange);

    fetch(`/api/google/events/today?${params.toString()}`)
      .then(async (response) => {
        const data = await response.json();
        setCalendar(data);
      })
      .catch(() => {
        setCalendar({
          connected: false,
          events: [],
          error: "Could not reach Google Calendar.",
        });
      })
      .finally(() => setLoading(false));
  }, [todayRange]);

  const events = calendar?.events ?? [];

  if (compact) {
    return (
      <section className="fixed right-4 bottom-4 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-[#f0c7d6] bg-white/95 p-4 text-gray-800 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-kaushan text-2xl text-[#8A3D58]">Today</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Google Calendar
            </p>
          </div>
          <a
            href="/calendar"
            className="rounded-md bg-[#8A3D58] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#6d2f45]"
          >
            Open
          </a>
        </div>

        <div className="mt-3 space-y-2">
          {loading && <p className="text-sm text-gray-600">Loading events...</p>}

          {!loading && !calendar?.connected && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Sign in to show today&apos;s events here.
              </p>
              <a
                href="/api/google/auth"
                className="inline-flex rounded-md bg-[#8A3D58] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6d2f45]"
              >
                Sign in with Google
              </a>
            </div>
          )}

          {!loading && calendar?.connected && events.length === 0 && (
            <p className="text-sm text-gray-600">No events today.</p>
          )}

          {!loading &&
            calendar?.connected &&
            events.slice(0, 3).map((event) => (
              <a
                key={event.id}
                href={event.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="block rounded-md bg-[#fdf2f7] px-3 py-2 transition-colors hover:bg-[#f9e8ef]"
              >
                <p className="truncate text-sm font-bold text-[#8A3D58]">
                  {event.summary}
                </p>
                <p className="text-xs text-gray-600">{formatEventTime(event)}</p>
              </a>
            ))}

          {calendar?.error && (
            <p className="text-xs font-semibold text-red-600">{calendar.error}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl rounded-lg bg-white/95 p-5 text-gray-800 shadow-xl">
      <div className="flex flex-col gap-3 border-b border-[#f0c7d6] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-kaushan text-4xl text-[#8A3D58]">Calendar</h1>
          <p className="text-sm text-gray-600">Today&apos;s Google Calendar events</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/google/auth"
            className="rounded-md bg-[#8A3D58] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6d2f45]"
          >
            Sign in
          </a>
          <a
            href="/api/google/logout"
            className="rounded-md border border-[#8A3D58] px-4 py-2 text-sm font-semibold text-[#8A3D58] transition-colors hover:bg-[#f9e8ef]"
          >
            Sign out
          </a>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading && <p className="text-sm text-gray-600">Loading today&apos;s events...</p>}

        {!loading && !calendar?.connected && (
          <p className="rounded-md bg-[#fdf2f7] p-4 text-sm text-gray-700">
            Sign in with Google to connect Calendar and retrieve events for today.
          </p>
        )}

        {!loading && calendar?.connected && events.length === 0 && (
          <p className="rounded-md bg-[#fdf2f7] p-4 text-sm text-gray-700">
            No events scheduled for today.
          </p>
        )}

        {!loading &&
          calendar?.connected &&
          events.map((event) => (
            <article key={event.id} className="rounded-lg border border-[#f0c7d6] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#8A3D58]">{event.summary}</h2>
                  <p className="text-sm font-semibold text-gray-600">
                    {formatEventTime(event)}
                  </p>
                </div>
                {event.htmlLink && (
                  <a
                    href={event.htmlLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[#8A3D58] underline-offset-4 hover:underline"
                  >
                    View in Google
                  </a>
                )}
              </div>
              {event.location && (
                <p className="mt-2 text-sm text-gray-600">{event.location}</p>
              )}
              {event.description && (
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                  {event.description}
                </p>
              )}
            </article>
          ))}

        {calendar?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">
            {calendar.error}
          </p>
        )}
      </div>
    </section>
  );
}
