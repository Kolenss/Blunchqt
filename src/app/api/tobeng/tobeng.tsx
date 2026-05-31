import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

type ContactFormData = {
  need: string;
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
    const body: ContactFormData = await req.json();

    const { need } = body;

    await transporter.sendMail({
      from: `"Your Future RPM" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      subject: `Your Baby Needs ${need}`,
      html: `
        <h2>New Request from Bengy</h2>
        <p><strong>Need:</strong> ${need}</p>
      `,
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email error:", error);

    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}