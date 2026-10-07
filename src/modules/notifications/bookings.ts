import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import type { Payload } from "payload";
import { siteConfig } from "@/config/site";
import { emailLayout, escapeHtml, sendEmail } from "./index";

interface BookingEmailData {
  parentName: string;
  parentEmail: string;
  serviceName: string;
  startAt: Date;
  durationMinutes: number;
  studentTimezone: string;
  manageToken?: string | null;
  notes?: string | null;
}

function when(data: BookingEmailData) {
  const date = formatInTimeZone(data.startAt, data.studentTimezone, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  const time = formatInTimeZone(data.startAt, data.studentTimezone, "HH:mm");
  return `${date} a las ${time} (${data.studentTimezone})`;
}

function manageLink(token?: string | null) {
  if (!token) return "";
  const url = `${siteConfig.url}/agenda/reserva/${token}`;
  return `<p style="margin-top:20px;font-size:14px">¿Necesitas cancelar o cambiar la fecha? Usa este enlace: <a href="${url}">${url}</a></p>`;
}

export async function sendBookingReceivedEmails(
  data: BookingEmailData & { instructions: string; notifyTo: string },
) {
  const summary = `<p><strong>${escapeHtml(data.serviceName)}</strong><br>${when(data)}<br>Duración: ${data.durationMinutes} minutos · Por videollamada</p>`;

  await sendEmail({
    to: data.parentEmail,
    subject: `Recibimos tu reserva · ${siteConfig.name}`,
    html: emailLayout(
      `Hola, ${data.parentName}`,
      `<p>Gracias por reservar. Estos son los datos de tu sesión:</p>${summary}
       <p>${escapeHtml(data.instructions).replaceAll("\n", "<br>")}</p>
       ${manageLink(data.manageToken)}
       <p style="margin-top:24px;color:#6b5e54;font-size:14px">${escapeHtml(siteConfig.disclaimer)}</p>`,
    ),
  });

  if (data.notifyTo) {
    await sendEmail({
      to: data.notifyTo,
      subject: `Nueva reserva: ${data.serviceName} · ${data.parentName}`,
      html: emailLayout(
        "Nueva reserva desde el sitio",
        `${summary}<p><strong>Familia:</strong> ${escapeHtml(data.parentName)} · ${escapeHtml(data.parentEmail)}</p>
         ${data.notes ? `<p><strong>Mensaje:</strong> ${escapeHtml(data.notes)}</p>` : ""}
         <p>Confírmala desde el panel cuando recibas el pago: <a href="${siteConfig.url}/admin/collections/bookings">${siteConfig.url}/admin/collections/bookings</a></p>`,
      ),
      replyTo: data.parentEmail,
    });
  }
}

/** Correo a la familia cuando la reserva pasa a confirmada o cancelada desde el panel. */
export async function sendBookingStatusEmail({ bookingId, payload }: { bookingId: number | string; payload: Payload }) {
  const booking = await payload.findByID({ collection: "bookings", id: bookingId, depth: 1 });
  const student = typeof booking.student === "object" ? booking.student : null;
  const service = typeof booking.service === "object" ? booking.service : null;
  if (!student || !service) return;

  const data: BookingEmailData = {
    parentName: student.parentName,
    parentEmail: student.email,
    serviceName: service.name,
    startAt: new Date(booking.startAt),
    durationMinutes: service.durationMinutes,
    studentTimezone: booking.studentTimezone || "America/Bogota",
    manageToken: booking.manageToken,
  };

  if (booking.status === "confirmed") {
    await sendEmail({
      to: data.parentEmail,
      subject: `Sesión confirmada · ${siteConfig.name}`,
      html: emailLayout(
        `Tu sesión está confirmada, ${data.parentName}`,
        `<p><strong>${escapeHtml(data.serviceName)}</strong><br>${when(data)}</p>
         <p>Te enviaremos el enlace de la videollamada antes de la sesión. Si algo cambia, escríbenos.</p>
         ${manageLink(data.manageToken)}`,
      ),
    });
  }

  if (booking.status === "cancelled") {
    await sendEmail({
      to: data.parentEmail,
      subject: `Sesión cancelada · ${siteConfig.name}`,
      html: emailLayout(
        `Tu sesión fue cancelada`,
        `<p><strong>${escapeHtml(data.serviceName)}</strong><br>${when(data)}</p>
         ${booking.cancelReason ? `<p>Motivo: ${escapeHtml(booking.cancelReason)}</p>` : ""}
         <p>Puedes reservar un nuevo horario en <a href="${siteConfig.url}/agenda">${siteConfig.url}/agenda</a>.</p>`,
      ),
    });
  }
}

export async function sendBookingCancelledByFamily(data: BookingEmailData & { notifyTo: string }) {
  if (!data.notifyTo) return;
  await sendEmail({
    to: data.notifyTo,
    subject: `Reserva cancelada por la familia: ${data.serviceName} · ${data.parentName}`,
    html: emailLayout(
      "Una familia canceló su reserva",
      `<p><strong>${escapeHtml(data.serviceName)}</strong><br>${when(data)}</p>
       <p>${escapeHtml(data.parentName)} · ${escapeHtml(data.parentEmail)}</p>`,
    ),
  });
}
