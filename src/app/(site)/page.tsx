import Link from "next/link";
import type { ReactNode } from "react";
import { Disclaimer } from "@/components/disclaimer";
import { ScrollLine } from "@/components/scroll-line";
import { ButtonLink, Card, Eyebrow } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { getContactLinks } from "@/modules/settings";

export const revalidate = 3600;

const steps = [
  {
    title: "Me cuentas qué está pasando",
    text: "Agendas una primera sesión y hablamos de tu hijo o hija, de la rutina de la familia y de lo que te preocupa.",
  },
  {
    title: "Construimos un plan concreto",
    text: "Salimos de la sesión con estrategias claras para esta semana, no con teoría. Ajustadas a la edad y a tu casa.",
  },
  {
    title: "Acompaño los ajustes",
    text: "En las siguientes sesiones revisamos qué funcionó, qué no, y afinamos. Puedes escribirme entre sesiones.",
  },
];

/**
 * Fila del diseño partido: contenido a un lado y, al otro, la figura que la
 * línea dibuja al pasar. El lado de la figura se alterna fila a fila.
 * En pantallas pequeñas solo se ve el contenido.
 */
function Row({
  figure,
  size,
  side,
  start = false,
  children,
}: {
  figure: string;
  size: number;
  side: "left" | "right";
  start?: boolean;
  children: ReactNode;
}) {
  const figureCell = (
    <div aria-hidden className="relative hidden lg:block">
      {start && <span data-line="start" className="absolute top-0 left-0 h-px w-px" />}
      <span data-line={figure} data-line-size={size} className="absolute top-1/2 left-1/2 h-px w-px" />
    </div>
  );
  const contentCell = (
    <div data-line-text className="relative z-10">
      {children}
    </div>
  );
  // El orden en el DOM define la columna: primero lo que va a la izquierda.
  return side === "left" ? (
    <>
      {figureCell}
      {contentCell}
    </>
  ) : (
    <>
      {contentCell}
      {figureCell}
    </>
  );
}

/** Figura de transición entre dos filas, centrada entre ambas columnas. */
function Transition({ figure, size, height }: { figure: string; size: number; height?: number }) {
  return (
    <div
      aria-hidden
      className="relative hidden lg:col-span-2 lg:block"
      style={{ height: height ?? Math.round(size * 0.6) }}
    >
      <span data-line={figure} data-line-size={size} className="absolute top-1/2 left-1/2 h-px w-px" />
    </div>
  );
}

export default async function HomePage() {
  const { whatsappUrl } = await getContactLinks();

  return (
    <div data-line-root className="container-site relative">
      <ScrollLine />

      <div className="grid gap-y-10 py-6 sm:py-8 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-12 lg:py-10">
        <Row figure="family" size={250} side="right" start>
          <Eyebrow>Acompañamiento educativo e inglés para niños</Eyebrow>
          <h1 className="text-3xl sm:text-4xl">
            Estrategias concretas para que tu hijo se adapte al colegio y crezca con el inglés.
          </h1>
          <p className="mt-5 text-lg text-tinta-soft">
            Soy educadora bilingüe de primera infancia. Acompaño a padres y madres con orientación
            práctica, y doy clases de inglés uno a uno pensadas para cada etapa.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/agenda">Agendar una sesión</ButtonLink>
            <ButtonLink href="#servicios" variant="outline">
              Ver los servicios
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-tinta-soft">
            Sesiones por videollamada · Para familias con niños de 2 a 6 años y niños mayores
          </p>
        </Row>

        <Row figure="book" size={200} side="left">
          <div id="servicios" className="scroll-mt-28">
            <Eyebrow>Dos caminos, una misma mirada</Eyebrow>
            <h2 className="text-2xl sm:text-3xl">¿Qué estás buscando hoy?</h2>
            <p className="mt-4 text-tinta-soft">
              Trabajo en dos líneas distintas. Elige la que se parece a lo que necesita tu familia.
            </p>
          </div>
          <Card accent="terracota" className="mt-5 flex flex-col">
            <Eyebrow accent="terracota">Para padres y madres</Eyebrow>
            <h3 className="text-xl">Acompañamiento educativo</h3>
            <p className="mt-3">
              Orientación práctica en dos temas: la adaptación al colegio en niños de 2 a 6 años, y
              cómo apoyar el inglés en casa desde la primera infancia. Paquetes cortos de sesiones,
              con estrategias que puedes aplicar esta misma semana.
            </p>
            <ButtonLink href="/acompanamiento" variant="terracota" className="mt-5 self-start">
              Conocer el acompañamiento
            </ButtonLink>
          </Card>
        </Row>

        <Transition figure="heart-pass" size={120} />

        <Row figure="person-speech" size={270} side="right">
          <Card accent="salvia" className="flex flex-col">
            <Eyebrow accent="salvia">Para niños y niñas</Eyebrow>
            <h3 className="text-xl">Clases de inglés personalizadas</h3>
            <p className="mt-3">
              Clases uno a uno por videollamada. En los primeros años, juego, movimiento y canciones.
              Con niños mayores, varias formas de aprender y de mostrar lo aprendido, aprovechando la
              ventana que da la neuroplasticidad.
            </p>
            <ButtonLink href="/clases-de-ingles" variant="salvia" className="mt-5 self-start">
              Conocer las clases
            </ButtonLink>
          </Card>
        </Row>

        <Row figure="hands-plant" size={250} side="left">
          <Eyebrow>Cómo trabajamos</Eyebrow>
          <h2 className="text-2xl sm:text-3xl">Sin teoría suelta. Con pasos para esta semana.</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[auto_1fr] gap-x-6">
                <span className="font-heading text-4xl leading-none text-terracota-deep">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-xl">{step.title}</h3>
                  <p className="mt-2 text-tinta-soft">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Row>

        <Row figure="frame" size={300} side="right">
          <Eyebrow accent="salvia">Quién te acompaña</Eyebrow>
          <h2 className="text-2xl sm:text-3xl">{siteConfig.ownerName}</h2>
          <p className="mt-4 text-lg">
            Educadora bilingüe de primera infancia, con experiencia de aula en metodologías CLIL y
            TPR, y especialización en curso en Psicología Educativa.
          </p>
          <blockquote className="mt-5 rounded-card border border-salvia/50 bg-salvia-soft/60 p-6 text-lg">
            <p>
              “No soy psicóloga, soy educadora con formación en psicología educativa. Mi trabajo no
              es tratar, es acompañar: doy estrategias concretas basadas en años de aula y en cómo
              aprende y se regula un niño pequeño.”
            </p>
          </blockquote>
          <Link
            href="/sobre-mi"
            className="mt-5 inline-block font-bold text-salvia-deep underline-offset-4 hover:underline"
          >
            Leer mi historia y mi metodología →
          </Link>
        </Row>

        <Transition figure="hands-hearts" size={240} height={250} />
        <Transition figure="heart-end" size={120} />

        <div data-line-text className="relative z-10 lg:col-span-2">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl">¿Hablamos de lo que necesita tu familia?</h2>
            <p className="mt-4 text-tinta-soft">
              Agenda una sesión o escríbeme por WhatsApp. Te respondo con calma y sin compromiso.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/agenda">Agendar una sesión</ButtonLink>
              {whatsappUrl ? (
                <ButtonLink href={whatsappUrl} variant="outline" target="_blank" rel="noopener">
                  Escribir por WhatsApp
                </ButtonLink>
              ) : (
                <ButtonLink href="/contacto" variant="outline">
                  Escribirme
                </ButtonLink>
              )}
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <Disclaimer />
          </div>
        </div>
      </div>
    </div>
  );
}
