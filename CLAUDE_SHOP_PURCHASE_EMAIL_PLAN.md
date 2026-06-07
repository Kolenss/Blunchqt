# Shop Purchase Success Prompt and Email Plan

## Goal

When the user buys something in the reward shop:

1. Show a small success prompt in the shop UI, for example:

```txt
Successfully purchased Avocado for 10 coins.
```

2. Send an email using the existing Nodemailer setup so the owner receives a purchase notification, for example:

```txt
You purchased Avocado using 10 coins.
```

## Project Context

This repo uses Next.js 16.2.6 App Router.

Before editing Next.js code:

1. Read `AGENTS.md`.
2. Read relevant local Next docs under `node_modules/next/dist/docs/`.

Important existing file:

```txt
src/app/api/tobeng/route.ts
```

This route already uses Nodemailer with:

- `SMTP_EMAIL`
- `SMTP_PASSWORD`

It currently sends emails for the old "Need Something?" food image buttons.

## Recommended Approach

Create a new API route for shop purchase emails instead of mixing purchase behavior into `/api/tobeng`.

Suggested new file:

```txt
src/app/api/shop-purchase/route.ts
```

Reason:

- `/api/tobeng` is currently named for the old request feature.
- Shop purchases are a different action.
- A separate route keeps the code easier to understand.

It can reuse the same Nodemailer transporter pattern from `src/app/api/tobeng/route.ts`.

## API Route Plan

### Request Body

The frontend should call the email route after a successful shop purchase.

Suggested body:

```json
{
  "itemName": "Avocado",
  "itemId": "avocado",
  "price": 10,
  "balance": 25
}
```

### Response

Success:

```json
{
  "message": "Purchase email sent successfully"
}
```

Failure:

```json
{
  "message": "Failed to send purchase email"
}
```

## Example API Route

Use this as the implementation shape:

```ts
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

type PurchaseEmailData = {
  itemName: string;
  itemId: string;
  price: number;
  balance?: number;
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL as string,
    pass: process.env.SMTP_PASSWORD as string,
  },
});

export async function POST(req: Request) {
  try {
    const body: PurchaseEmailData = await req.json();
    const { itemName, itemId, price, balance } = body;

    if (!itemName || !itemId || typeof price !== "number") {
      return NextResponse.json(
        { message: "Invalid purchase email payload" },
        { status: 400 }
      );
    }

    await transporter.sendMail({
      from: `"Blunchqt Shop" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      subject: `Shop Purchase: ${itemName}`,
      html: `
        <h2>Shop Purchase</h2>
        <p><strong>Item:</strong> ${itemName}</p>
        <p><strong>Item ID:</strong> ${itemId}</p>
        <p><strong>Coins spent:</strong> ${price}</p>
        ${
          typeof balance === "number"
            ? `<p><strong>Remaining balance:</strong> ${balance}</p>`
            : ""
        }
      `,
    });

    return NextResponse.json(
      { message: "Purchase email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Purchase email error:", error);

    return NextResponse.json(
      { message: "Failed to send purchase email" },
      { status: 500 }
    );
  }
}
```

## Frontend Plan

Update the shop purchase handler, likely in:

```txt
src/components/countdown.tsx
```

or, if the shop was extracted:

```txt
src/components/shop-modal.tsx
```

### Purchase Flow

When the user clicks Buy:

1. Call the backend purchase endpoint, for example `POST /shop/purchase`.
2. If the purchase fails, show an error prompt:

```txt
Not enough coins.
```

3. If the purchase succeeds:
   - Update local coin balance.
   - Show a success prompt:

```txt
Successfully purchased Avocado for 10 coins.
```

   - Call the Next.js email route:

```txt
POST /api/shop-purchase
```

4. If the email fails, do not undo the purchase. The purchase already succeeded.
5. Optionally log the email failure to the console.

## Suggested UI State

Add a small status state:

```ts
const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
const [purchaseMessageType, setPurchaseMessageType] = useState<"success" | "error" | null>(null);
```

After successful purchase:

```ts
setPurchaseMessage(`Successfully purchased ${item.name} for ${item.price} coins.`);
setPurchaseMessageType("success");
```

After failed purchase:

```ts
setPurchaseMessage("Not enough coins.");
setPurchaseMessageType("error");
```

Render it near the top of the shop modal, under the balance.

Use restrained styling:

- success: soft green background/text
- error: soft red background/text

Keep it small and unobtrusive.

## Email Call Example

After purchase success:

```ts
await fetch("/api/shop-purchase", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    itemName: item.name,
    itemId: item.id,
    price: item.price,
    balance: newBalance,
  }),
});
```

Wrap this in a `try/catch` so email failure does not break the UI.

## Important Security Note

The email route is only for notifications. It should not decide whether a purchase is valid.

The real purchase validation should still happen in the backend coin/shop endpoint:

- Check coin balance.
- Subtract coins.
- Record transaction.

Only after that succeeds should the frontend call the email route.

## Validation Checklist

Manual checks:

- Buy an affordable item.
- A small success prompt appears in the shop modal.
- Coin balance decreases correctly.
- Email is sent with item name and coin price.
- Buy an unaffordable item.
- Error prompt appears.
- No purchase email is sent for failed purchase.
- If email sending fails, the purchase still remains successful.

Run:

```bash
npm.cmd run lint
```

If possible:

```bash
npm.cmd run build
```

## Scope Control

Only add purchase success/error prompt and purchase email notification.

Do not redesign the whole shop.

Do not change item prices or catalog names unless needed for the existing purchase handler.

Do not remove `/api/tobeng` unless the old feature is fully removed and confirmed unused.
