"use server";

import config from "@payload-config";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import { z } from "zod";
import { sendBookingReceivedEmails } from "@/modules/notifications/bookings";
import { getMonthAvailability, isSlotAvailable, type MonthAvailability } from "@/modules/scheduling/availability";
import { getAgendaSettings, getContactLinks } from "@/modules/settings";

function safeTimezone(tz: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "America/Bogota";
  }
}

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function fetchAvailability(
  serviceSlug: string,
  month: string,
  timezone: string,
): Promise<MonthAvailability | null> {
  if (!monthPattern.test(month) || !/^[a-z0-9-]+$/.test(serviceSlug)) return null;
  return getMonthAvailability({ serviceSlug, month, viewerTimezone: safeTimezone(timezone) });
}

const bookingSchema = z.object({
  serviceSlug: z.string().regex(/^[a-z0-9-]+$/),
  startAt: z.string().datetime(),
  timezone: z.string().min(1),
  parentName: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  email: z.string().trim().email("Revisa el correo."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  childName: z.string().trim().max(80).optional().or(z.literal("")),
  childAge: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal("on", { message: "Necesitamos tu consentimiento para reservar." }),
  website: z.string().max(0).optional(),
});

type BookingInput = z.infer<typeof bookingSchema>;

export interface BookingFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof BookingInput, string>>;
  booking?: {
    serviceName: string;
    startAt: string;
    durationMinutes: number;
    timezone: string;
    manageToken: string;
    instructions: string;
  };
}

export async function createBooking(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: BookingFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof BookingInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors };
  }

  const data = parsed.data;
  const timezone = safeTimezone(data.timezone);
  const startAt = new Date(data.startAt);
  const payload = await getPayload({ config });

  const serviceResult = await payload.find({
    collection: "services",
    where: { and: [{ slug: { equals: data.serviceSlug } }, { active: { equals: true } }] },
    limit: 1,
    depth: 0,
  });
  const service = serviceResult.docs[0];
  if (!service) return { status: "error", message: "Ese servicio ya no está disponible." };

  const stillFree = await isSlotAvailable({ serviceSlug: service.slug, startAt, viewerTimezone: timezone });
  if (!stillFree) {
    return { status: "error", message: "Ese horario acaba de ocuparse. Elige otro, por favor." };
  }

  try {
    const existing = await payload.find({
      collection: "students",
      where: { email: { equals: data.email.toLowerCase() } },
      limit: 1,
      depth: 0,
    });

    const studentData = {
      parentName: data.parentName,
      email: data.email.toLowerCase(),
      phone: data.phone || undefined,
      childName: data.childName || undefined,
      childAge: data.childAge || undefined,
    };

    const student = existing.docs[0]
      ? await payload.update({ collection: "students", id: existing.docs[0].id, data: studentData })
      : await payload.create({
          collection: "students",
          data: { ...studentData, consentAt: new Date().toISOString() },
        });

    const manageToken = randomUUID();
    await payload.create({
      collection: "bookings",
      data: {
        service: service.id,
        student: student.id,
        startAt: startAt.toISOString(),
        status: "pending",
        studentTimezone: timezone,
        notes: data.notes || undefined,
        consentAt: new Date().toISOString(),
        source: "web",
        manageToken,
      },
    });

    const [agenda, contact] = await Promise.all([getAgendaSettings(), getContactLinks()]);

    try {
      await sendBookingReceivedEmails({
        parentName: data.parentName,
        parentEmail: data.email,
        serviceName: service.name,
        startAt,
        durationMinutes: service.durationMinutes,
        studentTimezone: timezone,
        manageToken,
        notes: data.notes || null,
        instructions: agenda.confirmationMessage,
        notifyTo: contact.notifyEmail,
      });
    } catch (error) {
      console.error("[agenda] la reserva se creó pero falló el correo:", error);
    }

    return {
      status: "success",
      booking: {
        serviceName: service.name,
        startAt: startAt.toISOString(),
        durationMinutes: service.durationMinutes,
        timezone,
        manageToken,
        instructions: agenda.confirmationMessage,
      },
    };
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    if (text.includes("bookings_no_overlap") || text.includes("se cruza")) {
      return { status: "error", message: "Ese horario acaba de ocuparse. Elige otro, por favor." };
    }
    console.error("[agenda] error al crear la reserva:", error);
    return {
      status: "error",
      message: "No pudimos guardar la reserva. Intenta de nuevo o escríbenos por WhatsApp.",
    };
  }
}
