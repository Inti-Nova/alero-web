import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/cta-band";
import { Disclaimer } from "@/components/disclaimer";
import { ButtonLink, Card, CheckList, Eyebrow, PageHeader, Section } from "@/components/ui";
import { getServiceBySlug } from "@/modules/catalog";

export const metadata: Metadata = {
  title: "Bilingüismo temprano · acompañamiento para padres",
  description:
    "Cómo apoyar el inglés de tu hijo en casa desde la primera infancia, con estrategias de estimulación tomadas de metodologías de aula como CLIL y TPR.",
};

export const revalidate = 3600;

const myths = [
  {
    myth: "“Si no hablo inglés perfecto, mejor no lo intento.”",
    truth:
      "No necesitas ser bilingüe. Necesitas rutinas cortas, repetidas y con sentido, y saber qué materiales usar y cuáles no.",
  },
  {
    myth: "“Dos idiomas lo van a confundir o retrasar.”",
    truth:
      "La evidencia muestra lo contrario cuando la exposición es natural y afectiva. Te explico cómo se ve eso en la práctica y qué esperar en cada edad.",
  },
  {
    myth: "“Con ponerle videos en inglés basta.”",
    truth:
      "La pantalla sola no enseña. El idioma se aprende en interacción: juego, canciones, cuerpo y rutina. Eso es lo que trabajamos.",
  },
];

export default async function BilinguismoTempranoPage() {
  const service = await getServiceBySlug("bilinguismo-temprano");
  if (!service) notFound();
  const agendaHref = `/agenda?servicio=${service.slug}`;

  return (
    <>
      <PageHeader
        eyebrow="Acompañamiento educativo · Línea 2"
        title="Bilingüismo temprano"
        lead={service.valueProposition}
      >
        <ButtonLink href={agendaHref}>Agendar primera sesión</ButtonLink>
        <ButtonLink href="/precios" variant="outline">
          Ver el paquete y el precio
        </ButtonLink>
      </PageHeader>

      <Section tone="crema-dark">
        <div className="max-w-2xl">
          <Eyebrow>Lo que suelo escuchar</Eyebrow>
          <h2 className="text-3xl">Tres ideas que frenan a muchas familias</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {myths.map((m) => (
            <Card key={m.myth} className="h-full">
              <p className="font-heading text-xl italic">{m.myth}</p>
              <p className="mt-4 text-tinta-soft">{m.truth}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Estructura del paquete</Eyebrow>
            <h2 className="text-3xl">{service.sessions}</h2>
            <p className="mt-4 text-tinta-soft">
              {service.format}. El espacio entre sesiones es a propósito: necesitas tiempo para
              probar en casa y volver con observaciones reales.
            </p>
            <p className="mt-4 text-tinta-soft">
              Las estrategias vienen del aula bilingüe: CLIL, que integra el idioma en actividades
              con contenido, y TPR, que une lenguaje y movimiento. Las adaptamos al tamaño de tu
              casa y de tu rutina.
            </p>
          </div>
          <div>
            <h3 className="text-2xl">Qué incluye</h3>
            <div className="mt-4">
              <CheckList items={service.includes} />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="space-y-6">
          <Disclaimer />
          <p className="text-tinta-soft">
            ¿Prefieres que sea yo quien trabaje directamente con tu hijo o hija? Mira las{" "}
            <Link href="/clases-de-ingles" className="font-bold text-salvia-deep underline-offset-4 hover:underline">
              clases de inglés personalizadas
            </Link>
            .
          </p>
        </div>
      </Section>

      <CtaBand
        title="El inglés en casa puede ser juego, no tarea."
        text="Agenda la primera sesión o cuéntame primero cómo es la rutina de tu familia."
        agendaHref={agendaHref}
      />
    </>
  );
}
