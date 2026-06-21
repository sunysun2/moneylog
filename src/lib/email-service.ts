import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getSmtpConfig(): SMTPTransport.Options {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  };
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "MoneyLog";
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS
  );
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const transporter = nodemailer.createTransport(getSmtpConfig());

  await transporter.sendMail({
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}
