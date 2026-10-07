"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import { sendBookingCancelledByFamily } from "@/modules/notifications/bookings";
import { getContactLinks } from "@/modules/settings";

export interface CancelState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function cancelBooking(_prev: CancelState, formData: FormData): Promise<CancelState> {
  const token = String(formData.get("token") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);
  if (!/^[0-9a-f-]{36}$/.test(token)) return { status: "error", message: "Enlace no válido." };

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "bookings",
    where: { manageToken: { equals: token } },
    limit: 1,
    depth: 1,
  });
  const booking = result.docs[0];
  if (!booking) return { status: "error", message: "No encontramos esta reserva." };
  if (booking.status === "cancelled") return { status: "success", message: "Esta reserva ya estaba cancelada." };
  if (new Date(booking.startAt) < new Date()) {
    return { status: "error", message: "Esta sesión ya pasó y no se puede cancelar desde aquí." };
  }

  await payload.update({
    collection: "bookings",
    id: booking.id,
    data: {
      status: "cancelled",
      cancelReason: reason ? `Cancelada por la familia: ${reason}` : "Cancelada por la familia",
    },
  });

  const student = typeof booking.student === "object" ? booking.student : null;
  const service = typeof booking.service === "object" ? booking.service : null;
  if (student && service) {
    try {
      const { notifyEmail } = await getContactLinks();
      await sendBookingCancelledByFamily({
        parentName: student.parentName,
        parentEmail: student.email,
        serviceName: service.name,
        startAt: new Date(booking.startAt),
        durationMinutes: service.durationMinutes,
        studentTimezone: booking.studentTimezone || "America/Bogota",
        notifyTo: notifyEmail,
      });
    } catch (error) {
      console.error("[agenda] no se pudo avisar de la cancelación:", error);
    }
  }

  revalidatePath(`/agenda/reserva/${token}`);
  return { status: "success", message: "Tu reserva quedó cancelada. Puedes agendar un nuevo horario cuando quieras." };
}
