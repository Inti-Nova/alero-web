import config from "@payload-config";
import { addDays, addHours, addMinutes, format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getPayload } from "payload";
import { activeBookingStatuses } from "@/cms/collections/bookings";
import { computeSlots } from "./slots";
import type { AvailabilityRule, TimeRange, Weekday } from "./types";

export interface MonthAvailability {
  /** Mes consultado, YYYY-MM, en la zona horaria de quien reserva. */
  month: string;
  viewerTimezone: string;
  /** Día local de quien reserva → inicios de sesión disponibles en ISO UTC. */
  days: Record<string, string[]>;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Calcula los horarios disponibles de un mes para un servicio.
 * Los horarios no se guardan: se derivan de horario semanal − bloqueos − reservas,
 * respetando antelación mínima, horizonte máximo y descanso entre sesiones.
 */
export async function getMonthAvailability(input: {
  serviceSlug: string;
  month: string;
  viewerTimezone: string;
  now?: Date;
}): Promise<MonthAvailability | null> {
  const payload = await getPayload({ config });
  const now = input.now ?? new Date();

  const serviceResult = await payload.find({
    collection: "services",
    where: { and: [{ slug: { equals: input.serviceSlug } }, { active: { equals: true } }] },
    limit: 1,
    depth: 0,
  });
  const service = serviceResult.docs[0];
  if (!service) return null;

  const settings = await payload.findGlobal({ slug: "agenda-settings", depth: 0 });
  const instructorTz = settings.timezone || "America/Bogota";

  // Límites del mes en la zona de quien reserva, convertidos a UTC.
  const monthStartUtc = fromZonedTime(`${input.month}-01T00:00:00`, input.viewerTimezone);
  const nextMonth = format(addDays(new Date(`${input.month}-01T00:00:00`), 32), "yyyy-MM");
  const monthEndUtc = fromZonedTime(`${nextMonth}-01T00:00:00`, input.viewerTimezone);

  const earliest = addHours(now, settings.minNoticeHours ?? 0);
  const latest = addDays(now, settings.maxDaysAhead ?? 42);

  if (monthStartUtc > latest || monthEndUtc < earliest) {
    return { month: input.month, viewerTimezone: input.viewerTimezone, days: {} };
  }

  const rangeStart = addDays(monthStartUtc, -1);
  const rangeEnd = addDays(monthEndUtc, 1);

  const [rulesResult, blockedResult, bookingsResult] = await Promise.all([
    payload.find({ collection: "availability-rules", limit: 200, depth: 0 }),
    payload.find({
      collection: "blocked-dates",
      limit: 500,
      depth: 0,
      where: {
        and: [
          { startAt: { less_than: rangeEnd.toISOString() } },
          { endAt: { greater_than: rangeStart.toISOString() } },
        ],
      },
    }),
    payload.find({
      collection: "bookings",
      limit: 1000,
      depth: 0,
      where: {
        and: [
          { status: { in: activeBookingStatuses } },
          { startAt: { less_than: rangeEnd.toISOString() } },
          { endAt: { greater_than: rangeStart.toISOString() } },
        ],
      },
    }),
  ]);

  const rules: AvailabilityRule[] = rulesResult.docs.map((r) => ({
    weekday: Number(r.weekday) as Weekday,
    startMinute: toMinutes(r.startTime),
    endMinute: toMinutes(r.endTime),
  }));

  const buffer = settings.bufferMinutes ?? 0;
  const busy: TimeRange[] = [
    ...blockedResult.docs.map((b) => ({ startAt: new Date(b.startAt), endAt: new Date(b.endAt) })),
    ...bookingsResult.docs.map((b) => ({
      startAt: addMinutes(new Date(b.startAt), -buffer),
      endAt: addMinutes(new Date(b.endAt!), buffer),
    })),
  ];

  const days: Record<string, string[]> = {};
  const firstDay = new Date(`${input.month}-01T00:00:00`);

  // Un día antes y uno después del mes, por si la zona horaria mueve horarios de un día a otro.
  for (let i = -1; i <= 32; i++) {
    const date = format(addDays(firstDay, i), "yyyy-MM-dd");
    const slots = computeSlots({
      date,
      instructorTimezone: instructorTz,
      durationMinutes: service.durationMinutes,
      rules,
      busy,
      stepMinutes: settings.slotStepMinutes ?? service.durationMinutes,
    });

    for (const slot of slots) {
      if (slot.startAt < earliest || slot.startAt > latest) continue;
      if (slot.startAt < monthStartUtc || slot.startAt >= monthEndUtc) continue;
      const viewerDay = formatInTimeZone(slot.startAt, input.viewerTimezone, "yyyy-MM-dd");
      (days[viewerDay] ??= []).push(slot.startAt.toISOString());
    }
  }

  for (const key of Object.keys(days)) {
    days[key] = Array.from(new Set(days[key])).sort();
  }

  return { month: input.month, viewerTimezone: input.viewerTimezone, days };
}

/** Comprueba que un inicio concreto siga disponible justo antes de reservar. */
export async function isSlotAvailable(input: {
  serviceSlug: string;
  startAt: Date;
  viewerTimezone: string;
}) {
  const month = formatInTimeZone(input.startAt, input.viewerTimezone, "yyyy-MM");
  const availability = await getMonthAvailability({
    serviceSlug: input.serviceSlug,
    month,
    viewerTimezone: input.viewerTimezone,
  });
  if (!availability) return false;
  const day = formatInTimeZone(input.startAt, input.viewerTimezone, "yyyy-MM-dd");
  return (availability.days[day] ?? []).includes(input.startAt.toISOString());
}
