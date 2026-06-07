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
