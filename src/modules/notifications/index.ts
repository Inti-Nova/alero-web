/**
 * Envío de correos (confirmación, recordatorio, cancelación).
 * Fase 2: conectar con Resend u otro proveedor. Por ahora solo registra en consola.
 */

export interface BookingEmailPayload {
  to: string;
  studentName: string;
  serviceName: string;
  startAt: Date;
  timezone: string;
}

export async function sendBookingConfirmation(payload: BookingEmailPayload) {
  console.info("[notifications] confirmación pendiente de implementar", payload);
}
