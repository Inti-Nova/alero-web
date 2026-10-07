import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/cta-band";
import { ButtonLink, Card, CheckList, Eyebrow, PageHeader, Section } from "@/components/ui";
import { getServiceBySlug } from "@/modules/catalog";

export const metadata: Metadata = {
  title: "Clases de inglés personalizadas para niños",
  description:
    "Clases de inglés 1:1 por videollamada para primera infancia y niños mayores, con metodologías CLIL y TPR, Diseño Universal de Aprendizaje y una mirada desde la neuroplasticidad.",
};

export const revalidate = 3600;

const stages = [
  {
    href: "/clases-de-ingles/primera-infancia",
    eyebrow: "2 a 6 años",
    title: "Primera infancia",
    text: "Juego, canciones, cuentos y movimiento. El inglés entra por el cuerpo y por la rutina, sin fichas ni traducción.",
    tags: ["TPR", "CLIL", "Aprendizaje a través del juego"],
  },
  {
    href: "/clases-de-ingles/ninos-mayores",
    eyebrow: "Desde los 7 años",
    title: "Niños mayores",
    text: "Varias formas de presentar el contenido, de participar y de mostrar lo aprendido, con proyectos que conectan con sus intereses.",
    tags: ["Diseño Universal de Aprendizaje", "Neuroplasticidad", "Proyectos"],
  },
];

export default async function ClasesDeInglesPage() {
  const service = await getServiceBySlug("clases-de-ingles");
  if (!service) notFound();
  const agendaHref = `/agenda?servicio=${service.slug}`;

  return (
    <>
      <PageHeader
        accent="salvia"
        eyebrow="Para niños y niñas"
        title="Clases de inglés personalizadas"
        lead={service.valueProposition}
      >
        <ButtonLink href={agendaHref} variant="salvia">
          Agendar clase inicial
        </ButtonLink>
        <ButtonLink href="/precios" variant="outline">
          Ver precios
        </ButtonLink>
      </PageHeader>

      <Section tone="salvia-soft">
        <div className="max-w-2xl">
          <Eyebrow accent="salvia">Una clase distinta para cada etapa</Eyebrow>
          <h2 className="text-3xl sm:text-4xl">¿Qué edad tiene tu hijo o hija?</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {stages.map((stage) => (
            <Card key={stage.href} accent="salvia" className="flex flex-col">
              <Eyebrow accent="salvia">{stage.eyebrow}</Eyebrow>
              <h3 className="text-2xl sm:text-3xl">{stage.title}</h3>
              <p className="mt-4 flex-1">{stage.text}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {stage.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-salvia-soft px-3 py-1 text-sm font-semibold text-salvia-deep"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <Link
                href={stage.href}
                className="mt-6 inline-flex items-center gap-2 font-bold text-salvia-deep underline-offset-4 hover:underline"
              >
                Cómo son las clases <span aria-hidden>→</span>
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow accent="salvia">Cómo funcionan</Eyebrow>
            <h2 className="text-3xl">{service.sessions}</h2>
            <p className="mt-4 text-tinta-soft">
              {service.format}. Empezamos con una clase inicial para conocernos y definir el plan.
              Después acordamos la frecuencia que le sirva a la familia.
            </p>
          </div>
          <div>
            <h3 className="text-2xl">Qué incluye</h3>
            <div className="mt-4">
              <CheckList items={service.includes} accent="salvia" />
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        accent="salvia"
        title="Empecemos con una clase para conocernos."
        text="Agenda la clase inicial o escríbeme para contarme cómo es tu hijo o hija."
        agendaHref={agendaHref}
      />
    </>
  );
}
