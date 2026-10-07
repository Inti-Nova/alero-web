import { env } from "@/lib/env";

/**
 * Envío de correos por la API HTTP de Resend. Sin clave configurada,
 * registra en consola para no perder el mensaje en desarrollo.
 */

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendEmail(input: EmailInput) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.info(`[notifications] correo no enviado (sin RESEND_API_KEY) → ${input.to}: ${input.subject}`);
    return { sent: false as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      reply_to: input.replyTo,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend respondió ${res.status}: ${await res.text()}`);
  }
  return { sent: true as const };
}

/** Plantilla mínima con los colores de la marca. */
export function emailLayout(title: string, body: string) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#f7f1e8;font-family:Nunito,Arial,sans-serif;color:#3a2e26">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1>
    <div style="font-size:16px;line-height:1.6">${body}</div>
  </div>
</body></html>`;
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  interest: string;
  childAge?: string;
  message: string;
  notifyTo: string;
}

export async function sendContactMessage(data: ContactMessage) {
  if (!data.notifyTo) {
    console.info("[notifications] mensaje de contacto recibido sin correo de destino:", data);
    return { sent: false as const };
  }

  const rows: Array<[string, string | undefined]> = [
    ["Nombre", data.name],
    ["Correo", data.email],
    ["WhatsApp", data.phone],
    ["Interés", data.interest],
    ["Edad del niño o niña", data.childAge],
    ["Mensaje", data.message],
  ];

  const body = `<table cellpadding="6">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v!)}</td></tr>`)
    .join("")}</table>`;

  return sendEmail({
    to: data.notifyTo,
    subject: `Contacto web: ${data.name} · ${data.interest}`,
    html: emailLayout("Nuevo mensaje desde el sitio web", body),
    replyTo: data.email,
  });
}
