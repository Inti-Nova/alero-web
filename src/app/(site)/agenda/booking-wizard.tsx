"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { Button } from "@/components/ui";
import type { Accent } from "@/content/services";
import type { MonthAvailability } from "@/modules/scheduling/availability";
import { createBooking, fetchAvailability, type BookingFormState } from "./actions";

export interface WizardService {
  slug: string;
  name: string;
  audience: string;
  sessions: string;
  durationMinutes: number;
  accent: Accent;
}

const weekdays = ["L", "M", "X", "J", "V", "S", "D"];
const inputClass =
  "mt-1 w-full rounded-xl border border-linea bg-white/80 px-4 py-3 text-base placeholder:text-tinta-soft/70 focus-visible:border-terracota-deep";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

function monthTitle(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}

/** Zona horaria del navegador. En el servidor devuelve cadena vacía para no romper la hidratación. */
function useBrowserTimezone() {
  return useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Bogota",
    () => "",
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-semibold text-terracota-deep">
      {message}
    </p>
  );
}

export function BookingWizard({ services }: { services: WizardService[] }) {
  const params = useSearchParams();
  const requested = params.get("servicio");

  const timezone = useBrowserTimezone();
  const [serviceSlug, setServiceSlug] = useState<string>(
    services.find((s) => s.slug === requested)?.slug ?? "",
  );
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [availability, setAvailability] = useState<MonthAvailability | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const requestId = useRef(0);
  const [state, formAction, submitting] = useActionState<BookingFormState, FormData>(createBooking, {
    status: "idle",
  });

  const service = services.find((s) => s.slug === serviceSlug) ?? null;
  const currentMonth = monthKey(new Date());

  // Cambiar de servicio o de mes invalida la selección anterior.
  function chooseService(slug: string) {
    setServiceSlug(slug);
    setSelectedDay(null);
    setSelectedStart(null);
  }
  function changeMonth(delta: number) {
    setMonth((m) => shiftMonth(m, delta));
    setSelectedDay(null);
    setSelectedStart(null);
  }

  // Carga la disponibilidad cuando cambian servicio, mes o zona horaria.
  // Solo se actualiza estado al terminar la petición; la última petición gana.
  useEffect(() => {
    if (!serviceSlug || !timezone) return;
    const id = ++requestId.current;
    startLoading(async () => {
      const result = await fetchAvailability(serviceSlug, month, timezone);
      if (id === requestId.current) setAvailability(result);
    });
  }, [serviceSlug, month, timezone]);

  const grid = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(y, m, 0).getDate();
    const cells: Array<{ key: string; day: number } | null> = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= count; d++) {
      cells.push({ key: `${month}-${String(d).padStart(2, "0")}`, day: d });
    }
    return cells;
  }, [month]);

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: timezone || undefined }),
    [timezone],
  );
  const longFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone || undefined,
      }),
    [timezone],
  );

  if (state.status === "success" && state.booking) {
    const b = state.booking;
    return (
      <div role="status" className="max-w-2xl rounded-card border border-salvia/50 bg-salvia-soft p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-salvia-deep">Reserva recibida</p>
        <h2 className="mt-2 text-3xl">Gracias. Ya tenemos tu horario apartado.</h2>
        <dl className="mt-6 space-y-2">
          <div>
            <dt className="font-bold">Sesión</dt>
            <dd>{b.serviceName}</dd>
          </div>
          <div>
            <dt className="font-bold">Cuándo</dt>
            <dd>
              {longFormatter.format(new Date(b.startAt))} · {b.durationMinutes} minutos
              <span className="block text-sm text-tinta-soft">Hora de {b.timezone}</span>
            </dd>
          </div>
        </dl>
        <div className="mt-6 rounded-xl bg-crema p-4">
          <p className="font-bold">Siguiente paso</p>
          <p className="mt-1 whitespace-pre-line">{b.instructions}</p>
        </div>
        <p className="mt-6 text-sm text-tinta-soft">
          Te enviamos estos datos por correo. Si necesitas cancelar o cambiar la fecha, usa{" "}
          <Link href={`/agenda/reserva/${b.manageToken}`} className="font-bold text-terracota-deep underline-offset-4 hover:underline">
            este enlace
          </Link>
          .
        </p>
      </div>
    );
  }

  const accentRing = (accent: Accent) => (accent === "terracota" ? "border-terracota" : "border-salvia");

  return (
    <div className="space-y-12">
      {/* Paso 1 */}
      <fieldset>
        <legend className="mb-4 text-xl font-semibold">1. Elige el tipo de sesión</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {services.map((s) => {
            const active = s.slug === serviceSlug;
            return (
              <label
                key={s.slug}
                className={`block cursor-pointer rounded-card border-2 bg-white/70 p-4 transition-colors ${
                  active ? accentRing(s.accent) : "border-linea hover:border-tinta/30"
                }`}
              >
                <input
                  type="radio"
                  name="servicio"
                  value={s.slug}
                  checked={active}
                  onChange={() => chooseService(s.slug)}
                  className="sr-only"
                />
                <span className="block font-bold">{s.name}</span>
                <span className="mt-1 block text-sm text-tinta-soft">{s.audience}</span>
                <span className="mt-2 block text-sm text-tinta-soft">
                  {s.durationMinutes} min por sesión · {s.sessions}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Paso 2 */}
      {service && (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="mb-4 text-xl font-semibold">2. Elige el día</h2>
            <div className="rounded-card border border-linea bg-white/70 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={month <= currentMonth}
                  className="rounded-full border border-linea px-3 py-1 font-semibold disabled:opacity-40"
                  aria-label="Mes anterior"
                >
                  ←
                </button>
                <p className="font-heading text-xl capitalize">{monthTitle(month)}</p>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="rounded-full border border-linea px-3 py-1 font-semibold"
                  aria-label="Mes siguiente"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-tinta-soft">
                {weekdays.map((d, i) => (
                  <div key={i} className="py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1" aria-busy={loading}>
                {grid.map((cell, i) =>
                  cell ? (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={loading || !availability?.days[cell.key]?.length}
                      onClick={() => {
                        setSelectedDay(cell.key);
                        setSelectedStart(null);
                      }}
                      aria-pressed={selectedDay === cell.key}
                      className={`aspect-square rounded-xl text-sm font-semibold transition-colors disabled:text-tinta/30 ${
                        selectedDay === cell.key
                          ? "bg-tinta text-crema"
                          : availability?.days[cell.key]?.length
                            ? "bg-terracota-soft hover:bg-terracota"
                            : ""
                      }`}
                    >
                      {cell.day}
                    </button>
                  ) : (
                    <div key={`empty-${i}`} />
                  ),
                )}
              </div>
              <p className="mt-4 text-sm text-tinta-soft">
                {loading
                  ? "Buscando horarios…"
                  : availability && Object.keys(availability.days).length === 0
                    ? "No hay horarios disponibles este mes. Prueba el siguiente."
                    : `Horarios mostrados en la hora de ${timezone || "tu zona"}.`}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">3. Elige la hora</h2>
            {selectedDay && availability?.days[selectedDay] ? (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                {availability.days[selectedDay].map((iso) => (
                  <li key={iso}>
                    <button
                      type="button"
                      onClick={() => setSelectedStart(iso)}
                      aria-pressed={selectedStart === iso}
                      className={`w-full rounded-xl border-2 px-3 py-2 font-semibold transition-colors ${
                        selectedStart === iso
                          ? "border-tinta bg-tinta text-crema"
                          : "border-linea bg-white/70 hover:border-tinta/40"
                      }`}
                    >
                      {timeFormatter.format(new Date(iso))}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-card border border-dashed border-linea p-6 text-tinta-soft">
                Selecciona un día para ver las horas disponibles.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Paso 3 */}
      {service && selectedStart && (
        <form action={formAction} noValidate className="max-w-2xl space-y-5 rounded-card border border-linea bg-white/70 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">4. Tus datos</h2>
          <p className="text-tinta-soft">
            {service.name} · {longFormatter.format(new Date(selectedStart))}
          </p>

          <input type="hidden" name="serviceSlug" value={service.slug} />
          <input type="hidden" name="startAt" value={selectedStart} />
          <input type="hidden" name="timezone" value={timezone} />

          {state.status === "error" && state.message && (
            <p role="alert" className="rounded-xl border border-terracota/40 bg-terracota-soft/60 px-4 py-3">
              {state.message}
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="parentName" className="font-semibold">
                Tu nombre
              </label>
              <input id="parentName" name="parentName" autoComplete="name" required className={inputClass} />
              <FieldError message={state.fieldErrors?.parentName} />
            </div>
            <div>
              <label htmlFor="email" className="font-semibold">
                Correo electrónico
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
              <FieldError message={state.fieldErrors?.email} />
            </div>
            <div>
              <label htmlFor="phone" className="font-semibold">
                WhatsApp <span className="font-normal text-tinta-soft">(opcional)</span>
              </label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
            </div>
            <div>
              <label htmlFor="childAge" className="font-semibold">
                Edad de tu hijo o hija <span className="font-normal text-tinta-soft">(opcional)</span>
              </label>
              <input id="childAge" name="childAge" placeholder="Por ejemplo: 4 años" className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="childName" className="font-semibold">
              Nombre del niño o niña <span className="font-normal text-tinta-soft">(opcional)</span>
            </label>
            <input id="childName" name="childName" className={inputClass} />
          </div>

          <div>
            <label htmlFor="notes" className="font-semibold">
              ¿Algo que deba saber antes de la sesión? <span className="font-normal text-tinta-soft">(opcional)</span>
            </label>
            <textarea id="notes" name="notes" rows={4} className={inputClass} />
          </div>

          <div className="hidden" aria-hidden>
            <label htmlFor="website">Sitio web</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <label className="flex gap-3">
              <input type="checkbox" name="consent" required className="mt-1.5 h-4 w-4 shrink-0 accent-terracota-deep" />
              <span className="text-sm">
                Soy el padre, la madre o el adulto responsable, y autorizo el tratamiento de los datos
                que comparto aquí, incluidos los de mi hijo o hija, según la{" "}
                <Link href="/privacidad" className="font-bold text-terracota-deep underline-offset-4 hover:underline">
                  política de privacidad
                </Link>
                .
              </span>
            </label>
            <FieldError message={state.fieldErrors?.consent} />
          </div>

          <Button type="submit" variant={service.accent} disabled={submitting}>
            {submitting ? "Reservando…" : "Confirmar reserva"}
          </Button>
        </form>
      )}
    </div>
  );
}
