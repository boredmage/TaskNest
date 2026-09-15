import { env } from "../env.ts";

type Mail = { to: string; subject: string; text: string };

/**
 * Minimal mail sender. Uses Resend when RESEND_API_KEY is set; otherwise logs
 * the message so local development never depends on an email provider.
 */
export async function sendMail(mail: Mail) {
  if (!env.RESEND_API_KEY) {
    console.log(
      `\n[mail] (not sent, RESEND_API_KEY unset)\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
    }),
  });

  if (!res.ok) {
    console.warn("[mail] Resend responded", res.status, await res.text());
  }
}
