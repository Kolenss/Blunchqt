# TOS Topic Number Display Plan

## Goal

Update the TOS table so it displays the database `topic_number` before each topic.

Example:

```txt
topic_number = "1"
topic = "GENETIC CONTRIBUTIONS"
```

Should render as:

```txt
(1) GENETIC CONTRIBUTIONS
```

Decimal topic numbers should keep their exact text:

```txt
topic_number = "2.1"
topic = "CLASSICAL ORGANIZATION THEORY"
```

Should render as:

```txt
(2.1) CLASSICAL ORGANIZATION THEORY
```

## Project Context

This repo uses Next.js 16.2.6 App Router and FastAPI/Supabase.

Before editing Next.js code:

1. Read `AGENTS.md`.
2. Read the relevant local Next docs in `node_modules/next/dist/docs/`.

Important files:

- TOS table component: `src/components/hierarchical-table.tsx`
- TOS pages: `src/app/tos/page.tsx`, `src/app/tos/*/page.tsx`
- Backend endpoint: `server.py`

Current backend endpoint for TOS topics:

```txt
GET https://blunchqt-1.onrender.com/topics?subject={subject}
```

The backend currently uses:

```py
response = supabase.table("topics").select("*").eq("subject", subject).execute()
```

Because it selects `*`, `topic_number` should already be included if the column exists in Supabase.

## Required Frontend Change

Update `src/components/hierarchical-table.tsx`.

### 1. Update the `Topic` Type

Add `topic_number`.

Recommended:

```ts
interface Topic {
  id: number;
  subject: string;
  main_topic: string;
  sub_topic: string | null;
  topic_number: string | null;
  topic: string;
  status: 'undone' | 'inprogress' | 'done';
  comment: string | null;
}
```

Use `string | null` because the database column is text and some rows may not have a value.

### 2. Add a Small Formatter Helper

Add a helper inside the component file:

```ts
function formatTopicLabel(topic: Topic) {
  const topicText = topic.topic.trim();
  const topicNumber = topic.topic_number?.trim();

  if (!topicNumber) return topicText;

  // Avoid duplicate labels if old data still contains "(1)" in topic.
  if (/^\(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\)\s*/.test(topicText)) {
    return topicText;
  }

  return `(${topicNumber}) ${topicText}`;
}
```

This handles:

- `1`
- `2.1`
- `1-3`
- empty/null topic numbers
- old topic text that already starts with `(1)`

### 3. Render the Formatted Label

Find the topic cell currently rendering:

```tsx
{topic.topic}
```

Replace it with:

```tsx
{formatTopicLabel(topic)}
```

## Backend Check

In `server.py`, confirm this endpoint still selects all fields:

```py
response = supabase.table("topics").select("*").eq("subject", subject).execute()
```

No backend change should be needed if `topic_number` exists in the `topics` table.

If you want to be explicit, use:

```py
response = (
    supabase
    .table("topics")
    .select("id, subject, main_topic, sub_topic, topic_number, topic, status, comment")
    .eq("subject", subject)
    .execute()
)
```

Do not remove fields needed by the frontend.

## Optional Ordering Improvement

If rows appear out of order after adding topic numbers, do not sort by `topic_number` as plain text because values like `10` can come before `2`.

Prefer keeping the existing database order if it is already correct.

If an ordering column exists, use that instead, for example:

```py
.order("id")
```

or:

```py
.order("sort_order")
```

Only add ordering if needed.

## Edge Cases

Handle these safely:

- `topic_number` is `null`: render only topic.
- `topic_number` is an empty string: render only topic.
- `topic` already starts with `(1)`: do not render `(1) (1) TOPIC`.
- Decimal strings like `2.1` should stay as text.
- Ranges like `1-3` should stay as text.

## Validation Checklist

Manual checks:

- TOS topic with `topic_number = "1"` displays as `(1) TOPIC`.
- TOS topic with `topic_number = "2.1"` displays as `(2.1) TOPIC`.
- Topic with no `topic_number` still displays normally.
- Existing topic text that already includes `(1)` is not duplicated.
- Subject selector on `/tos` still works.
- Direct TOS routes under `/tos/*` still work.

Run:

```bash
npm.cmd run lint
```

If possible, also run:

```bash
npm.cmd run build
```

## Scope Control

Only update TOS topic-number display.

Do not redesign the TOS page.

Do not change tracker, scores, countdown, shop, or reward-system behavior for this task.
