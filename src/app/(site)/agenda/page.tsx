import type { Metadata } from "next";
import { Suspense } from "react";
import { Disclaimer } from "@/components/disclaimer";
import { PageHeader, Section } from "@/components/ui";
import { listServices } from "@/modules/catalog";
import { BookingWizard, type WizardService } from "./booking-wizard";

export const metadata: Metadata = {
  title: "Agenda una sesión",
  description:
    "Reserva tu sesión de acompañamiento en adaptación escolar o bilingüismo temprano, o una clase de inglés personalizada.",
};

export const revalidate = 600;

export default async function AgendaPage() {
  const services: WizardService[] = (await listServices()).map((s) => ({
    slug: s.slug,
    name: s.name,
    audience: s.audience,
    sessions: s.sessions,
    durationMinutes: s.durationMinutes,
    accent: s.accent,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Reserva tu sesión"
        lead="Elige el tipo de sesión, el día y la hora que mejor le sirva a tu familia. Recibirás un correo con los pasos para confirmar."
      />

      <Section tone="crema-dark">
        <Suspense fallback={<p className="text-tinta-soft">Cargando la agenda…</p>}>
          <BookingWizard services={services} />
        </Suspense>
      </Section>

      <Section>
        <div className="max-w-2xl space-y-4 text-tinta-soft">
          <p>
            Tus datos se usan solo para coordinar la sesión. Consulta la{" "}
            <a href="/privacidad" className="font-bold text-terracota-deep underline-offset-4 hover:underline">
              política de privacidad
            </a>
            .
          </p>
          <Disclaimer compact />
        </div>
      </Section>
    </>
  );
}
