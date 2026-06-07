# Shop Catalog Expansion Plan

## Goal

Expand the reward shop with more items grouped into categories:

- Snacks
- Drinks
- Meals

This plan assumes the coin/reward system from `CLAUDE_REWARD_SYSTEM_PLAN.md` will exist or be implemented first.

## Product Behavior

The shop should show categories/tabs or grouped sections so the item list stays easy to browse.

Recommended behavior:

- Show current coin balance at the top of the shop modal.
- Group items by category.
- Each item shows image, name, price, and Buy button.
- Disable Buy when the user does not have enough coins.
- Keep a small purchase result message, for example "Bought Takoyaki" or "Not enough coins".
- Keep the shop as a modal opened from `src/components/countdown.tsx`.

## Catalog Data Shape

Create a shared catalog file instead of hardcoding items directly inside the component.

Suggested file:

```txt
src/lib/shop-catalog.ts
```

Suggested TypeScript:

```ts
export type ShopCategory = 'snacks' | 'drinks' | 'meals'

export type ShopItem = {
  id: string
  name: string
  category: ShopCategory
  price: number
  image: string
}

export const shopItems: ShopItem[] = [
  // items here
]
```

Use stable lowercase kebab-case IDs. These IDs should be used by purchase APIs and transaction rows.

## Suggested Catalog

Prices are initial balancing suggestions. Adjust freely after testing.

### Snacks

```ts
[
  { id: 'takoyaki', name: 'Takoyaki', category: 'snacks', price: 10, image: '/shop/takoyaki.png' },
  { id: 'waffle', name: 'Waffle', category: 'snacks', price: 8, image: '/shop/waffle.png' },
  { id: 'donut', name: 'Donut', category: 'snacks', price: 7, image: '/shop/donut.png' },
  { id: 'bread', name: 'Bread', category: 'snacks', price: 3, image: '/bread.png' },
  { id: 'pan-de-sal', name: 'Pan de Sal', category: 'snacks', price: 4, image: '/shop/pan-de-sal.png' },
  { id: 'lumpia-tauge', name: 'Lumpia Tauge', category: 'snacks', price: 8, image: '/shop/lumpia-tauge.png' },
  { id: 'turon', name: 'Turon', category: 'snacks', price: 7, image: '/shop/turon.png' },
  { id: 'fries', name: 'Fries', category: 'snacks', price: 5, image: '/fries.png' },
  { id: 'green-piattos', name: 'Green Piattos', category: 'snacks', price: 9, image: '/shop/green-piattos.png' },
  { id: 'vcut', name: 'Vcut', category: 'snacks', price: 9, image: '/shop/vcut.png' },
  { id: 'kuno-crunch', name: 'Kuno Crunch', category: 'snacks', price: 8, image: '/shop/kuno-crunch.png' },
  { id: 'pringles', name: 'Pringles', category: 'snacks', price: 12, image: '/shop/pringles.png' },
  { id: 'pizza', name: 'Pizza', category: 'snacks', price: 15, image: '/shop/pizza.png' },
  { id: 'ice-cream', name: 'Ice Cream', category: 'snacks', price: 9, image: '/shop/ice-cream.png' },
  { id: 'tub-ice-cream', name: 'Tub Ice Cream', category: 'snacks', price: 18, image: '/shop/tub-ice-cream.png' },
  { id: 'tempura', name: 'Tempura', category: 'snacks', price: 8, image: '/shop/tempura.png' },
  { id: 'fishball', name: 'Fishball', category: 'snacks', price: 6, image: '/shop/fishball.png' },
  { id: 'kwek-kwek', name: 'Kwek-kwek', category: 'snacks', price: 7, image: '/shop/kwek-kwek.png' },
  { id: 'yum-burger', name: 'Yum Burger', category: 'snacks', price: 16, image: '/shop/yum-burger.png' },
  { id: 'chicken-burger', name: 'Chicken Burger', category: 'snacks', price: 18, image: '/shop/chicken-burger.png' },
  { id: 'shawarma', name: 'Shawarma', category: 'snacks', price: 20, image: '/shop/shawarma.png' }
]
```

Notes:

- User typed `toron`; suggested display is `Turon`.
- User typed `pingles`; suggested display is `Pringles`.
- User typed `iec cream`; suggested display is `Ice Cream`.

### Drinks

```ts
[
  { id: 'milk-tea', name: 'Milk Tea', category: 'drinks', price: 15, image: '/shop/milk-tea.png' },
  { id: 'softdrinks', name: 'Softdrinks', category: 'drinks', price: 8, image: '/shop/softdrinks.png' },
  { id: 'fruit-shake', name: 'Fruit Shake', category: 'drinks', price: 14, image: '/shop/fruit-shake.png' },
  { id: 'matcha', name: 'Matcha', category: 'drinks', price: 16, image: '/shop/matcha.png' },
  { id: 'pocari', name: 'Pocari', category: 'drinks', price: 10, image: '/shop/pocari.png' },
  { id: 'coke-float', name: 'Coke Float', category: 'drinks', price: 14, image: '/shop/coke-float.png' }
]
```

### Meals

```ts
[
  { id: 'chicken', name: 'Chicken', category: 'meals', price: 18, image: '/chicken.png' },
  { id: 'chicken-joy', name: 'Chickenjoy', category: 'meals', price: 28, image: '/shop/chicken-joy.png' },
  { id: 'burger-steak', name: 'Burger Steak', category: 'meals', price: 24, image: '/shop/burger-steak.png' },
  { id: 'ultimate-burger-steak', name: 'Ultimate Burger Steak', category: 'meals', price: 35, image: '/shop/ultimate-burger-steak.png' },
  { id: 'mushroom-pepper-steak', name: 'Mushroom Pepper Steak', category: 'meals', price: 32, image: '/shop/mushroom-pepper-steak.png' },
  { id: 'buwa', name: 'Buwa', category: 'meals', price: 25, image: '/shop/buwa.png' },
  { id: 'chowking', name: 'Chowking', category: 'meals', price: 30, image: '/shop/chowking.png' }
]
```

Notes:

- User typed `mushoom pepper steak`; suggested display is `Mushroom Pepper Steak`.
- `Buwa` is kept as typed because the intended item is unclear.

## Asset Plan

Existing assets:

- `/bread.png`
- `/chicken.png`
- `/fries.png`
- `/drinks.png`
- `/sweets.png`
- `/flower.png`

New catalog items need images. Recommended path:

```txt
public/shop/
```

Example:

```txt
public/shop/takoyaki.png
public/shop/milk-tea.png
public/shop/chicken-joy.png
```

If image assets are not available yet, use a temporary placeholder:

```txt
public/shop/placeholder.png
```

Then each item can use `/shop/placeholder.png` until custom images are added.

## Frontend Plan

### 1. Create Catalog Module

Create:

```txt
src/lib/shop-catalog.ts
```

Export:

- `shopItems`
- `shopCategories`
- `ShopItem`
- `ShopCategory`

### 2. Update Shop Modal

In `src/components/countdown.tsx` or a new component such as:

```txt
src/components/shop-modal.tsx
```

Add:

- Category tabs or segmented buttons: Snacks, Drinks, Meals
- Grid layout for items
- Buy button per item
- Disabled state when balance is too low

Use a stable layout:

- Desktop: 3 or 4 columns
- Mobile: 2 columns
- Keep text small enough to fit item cards

### 3. Purchase API Payload

Purchase requests should send only trusted fields:

```json
{
  "item_id": "takoyaki"
}
```

Best backend behavior:

- Backend owns price lookup from a trusted catalog or table.
- Frontend should not be trusted for price.

If the first implementation keeps prices in frontend only, include `price` temporarily:

```json
{
  "item_id": "takoyaki",
  "price": 10
}
```

But mark this as temporary.

## Backend Plan

Best option:

1. Add `shop_items` table in Supabase.
2. Seed it with the catalog.
3. Add `GET /shop/items`.
4. Make `POST /shop/purchase` look up the item price by `item_id`.

Simpler first pass:

1. Keep catalog in frontend.
2. `POST /shop/purchase` accepts `item_id` and `price`.
3. Record spend transaction in `coin_transactions`.

Recommended long-term endpoint:

```txt
GET /shop/items
POST /shop/purchase
```

## Suggested Supabase `shop_items` Table

```sql
create table shop_items (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null,
  image_path text not null,
  enabled boolean default true,
  created_at timestamptz default now()
);
```

Suggested check:

```sql
alter table shop_items
add constraint shop_items_category_check
check (category in ('snacks', 'drinks', 'meals'));
```

## Validation Checklist

- Shop opens from the Countdown section.
- Snacks, Drinks, and Meals categories display.
- All listed items appear under the correct category.
- Long names such as `Ultimate Burger Steak` and `Mushroom Pepper Steak` do not overflow.
- Existing images still render.
- Missing images use a placeholder instead of broken image icons.
- Buy button disables when balance is too low.
- Successful purchase subtracts the correct coin amount.
- Backend records the purchased `item_id`.

## Scope Control

Do not implement unrelated UI redesigns.

Do not change tracker behavior except what is needed for coin earning.

Do not remove existing public assets unless they are truly unused after the final shop design.
