import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addMinutes } from "date-fns";
import type { Slot, SlotQuery, TimeRange, Weekday } from "./types";

/** Dos rangos se superponen si uno empieza antes de que termine el otro. */
export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

/**
 * Calcula los slots disponibles de un día.
 * Los slots no se guardan: se derivan de reglas - ocupados.
 */
export function computeSlots(query: SlotQuery): Slot[] {
  const { date, instructorTimezone, durationMinutes, rules, busy } = query;
  const step = query.stepMinutes ?? durationMinutes;

  const dayStartLocal = new Date(`${date}T00:00:00`);
  const dayStartUtc = fromZonedTime(dayStartLocal, instructorTimezone);
  const weekday = toZonedTime(dayStartUtc, instructorTimezone).getDay() as Weekday;

  const slots: Slot[] = [];

  for (const rule of rules.filter((r) => r.weekday === weekday)) {
    let cursor = addMinutes(dayStartUtc, rule.startMinute);
    const windowEnd = addMinutes(dayStartUtc, rule.endMinute);

    while (addMinutes(cursor, durationMinutes) <= windowEnd) {
      const candidate: Slot = {
        startAt: cursor,
        endAt: addMinutes(cursor, durationMinutes),
      };
      if (!busy.some((b) => overlaps(b, candidate))) {
        slots.push(candidate);
      }
      cursor = addMinutes(cursor, step);
    }
  }

  return slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
