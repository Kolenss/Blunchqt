# Reward System Implementation Plan

## Project Context

This repo is a Next.js 16.2.6 App Router project with a FastAPI/Supabase backend.

Before editing Next.js code, read the local Next docs under `node_modules/next/dist/docs/` as required by `AGENTS.md`.

Important files:

- Frontend home/countdown UI: `src/app/page.tsx`, `src/components/countdown.tsx`
- Study tracker checkboxes: `src/components/table.tsx`
- DSM-5 checkbox tracker: `src/app/dsm5/page.tsx`
- TOS progress table: `src/components/hierarchical-table.tsx`
- Score tracker: `src/components/scoretable.tsx`
- Local email API route: `src/app/api/tobeng/route.ts`
- Backend API: `server.py`
- Supabase settings: `config.py`

Current external backend base URL used by the frontend:

```txt
https://blunchqt-1.onrender.com
```

## Feature Goal

Add a reward/shop system:

1. User earns 1 coin whenever they complete a study action by checking a topic checkbox.
2. The existing food/request image row in `Countdown` should be removed.
3. Replace it with a Shop button.
4. Clicking Shop opens a modal/popup showing purchasable items such as bread, chicken, drinks, flower, fries, and sweets.
5. Each shop item has a coin price.
6. User can spend coins to buy an item if their balance is high enough.

## Recommended Product Behavior

### Coin Earning

Award coins only when a checkbox changes from unchecked to checked.

Do not award coins when:

- The checkbox is already checked.
- The user unchecks a checkbox.
- The user re-checks a checkbox that already awarded coins before.
- The backend update fails.

This prevents users from farming coins by toggling the same checkbox repeatedly.

### Which Actions Earn Coins

First pass should reward these checkbox-based actions:

- `src/components/table.tsx`
  - `is_read`
  - `is_youtube`
  - `is_drills`
- `src/app/dsm5/page.tsx`
  - `status`

Optional later enhancement:

- `src/components/hierarchical-table.tsx`
  - Award 1 coin when status changes from `undone` or `inprogress` to `done`.
  - This is not a checkbox, so keep it out of the first pass unless requested.

### Coin Spending

When buying an item:

- If balance is enough, subtract the item price and record the purchase.
- If balance is too low, show a small disabled/error state such as "Not enough coins".
- Purchases should be persisted in Supabase, not only local React state.

## Suggested Supabase Schema

Use a transaction ledger instead of only storing a raw balance. This makes the system auditable and prevents duplicate rewards.

### `coin_transactions`

Suggested columns:

```sql
id bigint generated always as identity primary key,
created_at timestamptz default now(),
amount integer not null,
kind text not null,
source_type text,
source_table text,
source_id bigint,
source_field text,
item_id text,
note text
```

Suggested constraints:

```sql
check (kind in ('earn', 'spend'))
```

Suggested unique index to prevent repeated rewards:

```sql
create unique index unique_coin_reward_source
on coin_transactions (source_type, source_table, source_id, source_field)
where kind = 'earn';
```

Balance is computed as:

```sql
select coalesce(sum(amount), 0) as balance
from coin_transactions;
```

Earn transactions use positive `amount`, for example `1`.

Spend transactions use negative `amount`, for example `-5`.

### Optional `shop_items`

For the first pass, shop items can be hardcoded in frontend TypeScript. If the app needs editable shop items later, create this table:

```sql
id text primary key,
name text not null,
price integer not null,
image_path text not null,
enabled boolean default true
```

## Backend API Plan

Add these endpoints in `server.py`.

### `GET /coins`

Returns the current balance.

Example response:

```json
{
  "balance": 12
}
```

### `POST /coins/earn`

Called after a topic checkbox update succeeds.

Request body:

```json
{
  "source_type": "tracker_checkbox",
  "source_table": "abnormal_psychology",
  "source_id": 123,
  "source_field": "is_read"
}
```

Behavior:

- Insert a `coin_transactions` row with `kind = 'earn'` and `amount = 1`.
- If the unique index detects a duplicate reward source, return success with no new coin.
- Return the latest balance and whether a coin was awarded.

Example response:

```json
{
  "awarded": true,
  "balance": 13
}
```

Duplicate example:

```json
{
  "awarded": false,
  "balance": 13
}
```

### `POST /shop/purchase`

Request body:

```json
{
  "item_id": "chicken",
  "price": 8
}
```

Behavior:

- Check current coin balance.
- If balance is lower than price, return 400 with an error.
- If enough coins, insert a spend transaction with `amount = -price`, `kind = 'spend'`, and `item_id`.
- Return latest balance.

Example success response:

```json
{
  "purchased": true,
  "balance": 5
}
```

Example failure response:

```json
{
  "error": "Not enough coins",
  "balance": 3
}
```

## Frontend Implementation Plan

### Shared Coin API Helpers

Create a small helper module, for example:

```txt
src/lib/coins.ts
```

It should export:

- `getCoinBalance()`
- `earnCoin(payload)`
- `purchaseShopItem(payload)`

Use the same backend URL currently used throughout the app. A later cleanup can move the URL into an env var.

### Coin State

For the first pass, keep coin state local to the components that need it:

- `Countdown` fetches and displays balance.
- Tracker checkbox handlers call `earnCoin`.

If several pages need live balance later, add a client-side context provider.

### Update `src/components/table.tsx`

In `handleCheckboxChange`:

1. Keep the existing `update_topic` request.
2. Only if the request succeeds and `currentValue` was `false`, call `earnCoin`.
3. Include enough source data for duplicate prevention:
   - `source_type`: `tracker_checkbox`
   - `source_table`: `title.toLowerCase().replace(' ', '_')`
   - `source_id`: `topicId`
   - `source_field`: field
4. Update local checkbox state as it already does.

Important: Award the coin after the backend topic update succeeds.

### Update `src/app/dsm5/page.tsx`

In `handleCheckboxChange`:

1. Keep the existing `update_dsm5` request.
2. Only if the request succeeds and `currentValue` was `false`, call `earnCoin`.
3. Use:
   - `source_type`: `dsm5_checkbox`
   - `source_table`: `dsm5_disorders`
   - `source_id`: `topicId`
   - `source_field`: `status`

### Update `src/components/countdown.tsx`

Remove:

- The `need` state if no longer used.
- `handleNeed`.
- The row of clickable food images that posts to `/api/tobeng`.

Add:

- Coin balance display.
- Shop button.
- Modal state.
- Shop modal component or inline modal.
- Purchase logic.

Suggested shop items:

```ts
const shopItems = [
  { id: 'bread', name: 'Bread', price: 3, image: '/bread.png' },
  { id: 'fries', name: 'Fries', price: 5, image: '/fries.png' },
  { id: 'drinks', name: 'Drinks', price: 5, image: '/drinks.png' },
  { id: 'sweets', name: 'Sweets', price: 6, image: '/sweets.png' },
  { id: 'chicken', name: 'Chicken', price: 8, image: '/chicken.png' },
  { id: 'flower', name: 'Flower', price: 10, image: '/flower.png' }
]
```

Use `next/image` for item images.

### UX Notes

The shop should feel like part of the existing soft/pink study dashboard style.

Recommended UI:

- A compact coin balance chip.
- A single "Shop" button below the motivational note.
- Modal overlay with a white or paper-style panel.
- Item grid with image, name, price, and Buy button.
- Disable Buy when balance is too low.
- Show a tiny success/error message after purchase.

Do not add a marketing/landing section. This is an app surface.

## Edge Cases To Handle

- Backend is offline: show balance as `0` or a loading/error state, but do not crash.
- Duplicate reward source: backend returns `awarded: false`; frontend should not show a fake coin gain.
- Purchase failure: preserve current balance and show "Not enough coins" or server error.
- Topic update failure: do not award coins.
- Unchecking: do not subtract coins in first pass.

## Validation Checklist

Run:

```bash
npm.cmd run lint
```

PowerShell may block `npm` because of script execution policy, so use `npm.cmd` on Windows.

Also run:

```bash
npm.cmd run build
```

Manual checks:

- Check a tracker checkbox and confirm balance increases by 1.
- Uncheck and re-check the same checkbox; balance should not increase again.
- Check a different checkbox on the same topic; balance should increase by 1.
- Open Shop modal from Countdown.
- Buy an affordable item and confirm balance decreases.
- Try buying an unaffordable item and confirm it fails gracefully.

## Known Existing Issues To Keep In Mind

The repo currently has lint warnings and one lint error before this feature:

- `src/components/hierarchical-table.tsx` has a React hooks lint error around calling `fetchTopics()` inside an effect.
- `src/components/countdown.tsx` has an unused `need` state, which this feature should remove.
- `src/components/sidebar.tsx` has unused `expandedItems` state.
- Some effects have missing dependency warnings.

Do not expand the scope into a large lint cleanup unless needed for this feature. Fix feature-related lint issues only.
