import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/cta-band";
import { Disclaimer } from "@/components/disclaimer";
import { ButtonLink, Card, CheckList, Eyebrow, PageHeader, Section } from "@/components/ui";
import { getServiceBySlug } from "@/modules/catalog";

export const metadata: Metadata = {
  title: "Adaptación escolar · acompañamiento para familias",
  description:
    "Acompañamiento para familias de niños de 2 a 6 años en la adaptación o cambio de colegio: estrategias prácticas para la ansiedad de separación y la transición escolar.",
};

export const revalidate = 3600;

const signs = [
  "Llora o se aferra en la entrada del jardín y la despedida se alarga cada día más.",
  "Volvió a despertarse de noche, a pedir pañal o a hablar como más pequeño desde que empezó el colegio.",
  "Cambió de colegio o de ciudad y no logra engancharse con el nuevo grupo.",
  "Como adulto, ya no sabes si insistir, ceder o esperar, y las mañanas se volvieron una batalla.",
];

const sessionPlan = [
  {
    title: "Sesión 1 · Entender lo que pasa",
    text: "Conversamos sobre tu hijo o hija, la rutina de casa y lo que ocurre en la entrada. Salimos con dos o tres ajustes para empezar ya.",
  },
  {
    title: "Sesión 2 · Afinar el plan",
    text: "Revisamos qué cambió en la semana. Trabajamos despedidas, rituales de entrada y cómo hablar del colegio en casa.",
  },
  {
    title: "Sesión 3 · Sostener el avance",
    text: "Consolidamos lo que funciona y preparamos los momentos que suelen reabrir la ansiedad: vacaciones, enfermedad, cambios de profesor.",
  },
];

export default async function AdaptacionEscolarPage() {
  const service = await getServiceBySlug("adaptacion-escolar");
  if (!service) notFound();
  const agendaHref = `/agenda?servicio=${service.slug}`;

  return (
    <>
      <PageHeader
        eyebrow="Acompañamiento educativo · Línea 1"
        title="Adaptación escolar"
        lead={service.valueProposition}
      >
        <ButtonLink href={agendaHref}>Agendar primera sesión</ButtonLink>
        <ButtonLink href="/precios" variant="outline">
          Ver el paquete y el precio
        </ButtonLink>
      </PageHeader>

      <Section tone="crema-dark">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>¿Te suena?</Eyebrow>
            <h2 className="text-3xl">Señales de que este acompañamiento puede ayudarte</h2>
            <p className="mt-4 text-tinta-soft">
              La ansiedad de separación entre los 2 y los 6 años es esperable. Lo que marca la
              diferencia es cómo la acompañamos los adultos.
            </p>
          </div>
          <CheckList items={signs} />
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <Eyebrow>Estructura del paquete</Eyebrow>
          <h2 className="text-3xl">{service.sessions}</h2>
          <p className="mt-4 text-tinta-soft">
            {service.format}. Entre sesiones puedes escribirme para ajustar lo que haga falta.
          </p>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {sessionPlan.map((s) => (
            <li key={s.title}>
              <Card className="h-full">
                <h3 className="text-xl">{s.title}</h3>
                <p className="mt-3 text-tinta-soft">{s.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="terracota-soft">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl">Qué incluye</h2>
          </div>
          <CheckList items={service.includes} />
        </div>
      </Section>

      <Section>
        <div className="space-y-6">
          <Disclaimer />
          <p className="text-tinta-soft">
            ¿Tu tema es más el inglés en casa que el colegio? Mira el acompañamiento en{" "}
            <Link href="/acompanamiento/bilinguismo-temprano" className="font-bold text-terracota-deep underline-offset-4 hover:underline">
              bilingüismo temprano
            </Link>
            .
          </p>
        </div>
      </Section>

      <CtaBand
        title="Las mañanas pueden volver a ser tranquilas."
        text="Agenda la primera sesión o escríbeme si quieres contarme el caso antes."
        agendaHref={agendaHref}
      />
    </>
  );
}
