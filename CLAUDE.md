# Claude Handoff Notes

Follow `AGENTS.md` before editing this project. This app uses Next.js 16, and the repo explicitly requires reading the relevant files in `node_modules/next/dist/docs/` before changing Next APIs, route handlers, metadata, or file conventions.

## Project

- Frontend: Next.js App Router in `src/app`
- Shared UI: `src/components`
- Shared browser/server helpers: `src/lib`
- Backend API base: configured in `src/lib/api.ts`

## Google Calendar

The app includes Google Calendar OAuth and a read-only "today's events" view.

Required environment variables:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Google OAuth redirect URI:

```text
http://localhost:3000/api/google/callback
```

Use the production domain version of the same path when deployed.

Routes:

- `GET /api/google/auth` starts Google OAuth.
- `GET /api/google/callback` exchanges the OAuth code and stores tokens in httpOnly cookies.
- `GET /api/google/logout` clears Google Calendar cookies.
- `GET /api/google/events/today` retrieves today's events from the primary Google Calendar.

UI:

- `src/components/today-calendar.tsx` renders both the home-screen popup and the full calendar view.
- `src/app/calendar/page.tsx` renders the full Calendar page.
- `src/app/page.tsx` shows the compact "today" popup.
