import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Disclaimer } from "@/components/disclaimer";
import { ServiceCard } from "@/components/service-card";
import { Card, Eyebrow, PageHeader, Section } from "@/components/ui";
import { listServices } from "@/modules/catalog";

export const metadata: Metadata = {
  title: "Acompañamiento educativo para padres",
  description:
    "Orientación práctica para familias: adaptación escolar en niños de 2 a 6 años y bilingüismo temprano en casa. No es terapia.",
};

export const revalidate = 3600;

const forWhom = [
  "Tu hijo o hija entra al jardín o cambia de colegio y las despedidas se han vuelto difíciles.",
  "Quieres que crezca con el inglés desde pequeño, pero no sabes por dónde empezar en casa.",
  "Buscas estrategias concretas de alguien que ha estado en el aula, no un diagnóstico.",
];

const notForWhom = [
  "Si buscas evaluación, diagnóstico o tratamiento psicológico. En ese caso te oriento sobre a quién acudir.",
  "Si necesitas terapia de lenguaje o atención clínica. Puedo trabajar en paralelo con esos profesionales, no reemplazarlos.",
];

export default async function AcompanamientoPage() {
  const lines = (await listServices()).filter((s) => s.line === "acompanamiento");

  return (
    <>
      <PageHeader
        eyebrow="Para padres y madres"
        title="Acompañamiento educativo"
        lead="Orientación práctica, cercana y basada en el aula para dos momentos que mueven a cualquier familia: la adaptación al colegio y el inglés en casa desde la primera infancia."
      />

      <div className="container-site pb-12">
        <Disclaimer />
      </div>

      <Section tone="crema-dark">
        <div className="max-w-2xl">
          <Eyebrow>Dos líneas de acompañamiento</Eyebrow>
          <h2 className="text-3xl sm:text-4xl">Elige el tema que te trae hoy</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {lines.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="text-2xl">Es para ti si…</h2>
            <ul className="mt-4 space-y-3">
              {forWhom.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-terracota" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-2xl">No es lo que necesitas si…</h2>
            <ul className="mt-4 space-y-3">
              {notForWhom.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-tinta/30" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <CtaBand
        title="¿No sabes cuál de las dos líneas te sirve?"
        text="Escríbeme y lo definimos juntos antes de agendar. Sin costo y sin compromiso."
      />
    </>
  );
}
