/** Tipos puros del dominio de agenda. Sin dependencias de Next ni Prisma. */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AvailabilityRule {
  weekday: Weekday;
  /** Minutos desde medianoche en la zona horaria del instructor. */
  startMinute: number;
  endMinute: number;
}

export interface TimeRange {
  startAt: Date; // UTC
  endAt: Date; // UTC
}

export interface Slot extends TimeRange {}

export interface SlotQuery {
  /** Día en formato YYYY-MM-DD, interpretado en la zona del instructor. */
  date: string;
  instructorTimezone: string;
  durationMinutes: number;
  rules: AvailabilityRule[];
  /** Reservas activas y excepciones ya existentes. */
  busy: TimeRange[];
  /** Paso entre slots en minutos. Por defecto, la duración del servicio. */
  stepMinutes?: number;
}
