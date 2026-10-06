import { describe, expect, it } from "vitest";
import { computeSlots, overlaps } from "./slots";

const bogota = "America/Bogota";

describe("overlaps", () => {
  it("detecta superposición parcial", () => {
    const a = { startAt: new Date("2026-10-06T14:00:00Z"), endAt: new Date("2026-10-06T15:00:00Z") };
    const b = { startAt: new Date("2026-10-06T14:30:00Z"), endAt: new Date("2026-10-06T15:30:00Z") };
    expect(overlaps(a, b)).toBe(true);
  });

  it("no considera superposición cuando solo se tocan", () => {
    const a = { startAt: new Date("2026-10-06T14:00:00Z"), endAt: new Date("2026-10-06T15:00:00Z") };
    const b = { startAt: new Date("2026-10-06T15:00:00Z"), endAt: new Date("2026-10-06T16:00:00Z") };
    expect(overlaps(a, b)).toBe(false);
  });
});

describe("computeSlots", () => {
  it("genera slots de 60 min entre 9 y 12 hora Bogotá", () => {
    const slots = computeSlots({
      date: "2026-10-06", // martes
      instructorTimezone: bogota,
      durationMinutes: 60,
      rules: [{ weekday: 2, startMinute: 9 * 60, endMinute: 12 * 60 }],
      busy: [],
    });
    expect(slots.map((s) => s.startAt.toISOString())).toEqual([
      "2026-10-06T14:00:00.000Z",
      "2026-10-06T15:00:00.000Z",
      "2026-10-06T16:00:00.000Z",
    ]);
  });

  it("excluye slots ocupados", () => {
    const slots = computeSlots({
      date: "2026-10-06",
      instructorTimezone: bogota,
      durationMinutes: 60,
      rules: [{ weekday: 2, startMinute: 9 * 60, endMinute: 12 * 60 }],
      busy: [{ startAt: new Date("2026-10-06T15:00:00Z"), endAt: new Date("2026-10-06T16:00:00Z") }],
    });
    expect(slots).toHaveLength(2);
  });

  it("devuelve vacío en un día sin reglas", () => {
    const slots = computeSlots({
      date: "2026-10-04", // domingo
      instructorTimezone: bogota,
      durationMinutes: 60,
      rules: [{ weekday: 2, startMinute: 540, endMinute: 720 }],
      busy: [],
    });
    expect(slots).toEqual([]);
  });
});
