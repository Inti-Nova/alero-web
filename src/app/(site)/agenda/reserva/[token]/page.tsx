import config from "@payload-config";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { bookingStatusLabels, type BookingStatus } from "@/cms/collections/bookings";
import { ButtonLink, Card, Eyebrow, PageHeader, Section } from "@/components/ui";
import { CancelForm } from "./cancel-form";

export const metadata: Metadata = {
  title: "Tu reserva",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function ReservaPage({ params }: Props) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/.test(token)) notFound();

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "bookings",
    where: { manageToken: { equals: token } },
    limit: 1,
    depth: 1,
  });
  const booking = result.docs[0];
  if (!booking) notFound();

  const service = typeof booking.service === "object" ? booking.service : null;
  const student = typeof booking.student === "object" ? booking.student : null;
  const tz = booking.studentTimezone || "America/Bogota";
  const start = new Date(booking.startAt);
  const status = booking.status as BookingStatus;
  const canCancel = (status === "pending" || status === "confirmed") && start > new Date();

  return (
    <>
      <PageHeader eyebrow="Tu reserva" title={service?.name ?? "Sesión"} />

      <Section tone="crema-dark">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <Eyebrow>{bookingStatusLabels[status]}</Eyebrow>
            <dl className="space-y-3">
              <div>
                <dt className="font-bold">Cuándo</dt>
                <dd>
                  {formatInTimeZone(start, tz, "EEEE d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                  <span className="block text-sm text-tinta-soft">Hora de {tz}</span>
                </dd>
              </div>
              {service && (
                <div>
                  <dt className="font-bold">Duración</dt>
                  <dd>{service.durationMinutes} minutos · {service.format}</dd>
                </div>
              )}
              {student && (
                <div>
                  <dt className="font-bold">A nombre de</dt>
                  <dd>{student.parentName}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            {canCancel ? (
              <>
                <h2 className="text-2xl">¿Necesitas cambiar la fecha?</h2>
                <p className="mt-2 text-tinta-soft">
                  Cancela esta reserva y agenda un nuevo horario. Si prefieres, escríbenos y lo
                  movemos por ti.
                </p>
                <div className="mt-6">
                  <CancelForm token={token} />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl">Esta reserva no se puede modificar desde aquí</h2>
                <p className="mt-2 text-tinta-soft">
                  {status === "cancelled"
                    ? "Fue cancelada. Puedes agendar un nuevo horario cuando quieras."
                    : "La sesión ya ocurrió o está cerrada. Si necesitas algo, escríbenos."}
                </p>
              </>
            )}
            <ButtonLink href="/agenda" className="mt-6">
              Agendar un nuevo horario
            </ButtonLink>
          </Card>
        </div>
      </Section>
    </>
  );
}
