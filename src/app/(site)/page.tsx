import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { Disclaimer } from "@/components/disclaimer";
import { ButtonLink, Card, Eyebrow, Section } from "@/components/ui";
import { siteConfig } from "@/config/site";

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

export default function HomePage() {
  return (
    <>
      <section className="container-site grid items-center gap-10 pt-14 pb-16 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        <div className="max-w-2xl">
          <Eyebrow>Acompañamiento educativo e inglés para niños</Eyebrow>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl">
            Estrategias concretas para que tu hijo se adapte al colegio y crezca con el inglés.
          </h1>
          <p className="mt-6 text-xl text-tinta-soft">
            Soy educadora bilingüe de primera infancia. Acompaño a padres y madres con orientación
            práctica, y doy clases de inglés uno a uno pensadas para cada etapa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/agenda">Agendar una sesión</ButtonLink>
            <ButtonLink href="#servicios" variant="outline">
              Ver los servicios
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-tinta-soft">
            Sesiones por videollamada · Para familias con niños de 2 a 6 años y niños mayores
          </p>
        </div>

        <div aria-hidden className="relative hidden h-80 lg:block">
          <div className="absolute top-4 right-10 h-56 w-56 rounded-full bg-terracota-soft" />
          <div className="absolute bottom-0 left-8 h-44 w-44 rounded-full bg-salvia-soft" />
          <div className="absolute top-24 left-28 h-28 w-28 rounded-full bg-terracota/70" />
        </div>
      </section>

      <Section id="servicios" tone="crema-dark">
        <div className="max-w-2xl">
          <Eyebrow>Dos caminos, una misma mirada</Eyebrow>
          <h2 className="text-3xl sm:text-4xl">¿Qué estás buscando hoy?</h2>
          <p className="mt-4 text-lg text-tinta-soft">
            Trabajo en dos líneas distintas. Elige la que se parece a lo que necesita tu familia.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card accent="terracota" className="flex flex-col">
            <Eyebrow accent="terracota">Para padres y madres</Eyebrow>
            <h3 className="text-2xl sm:text-3xl">Acompañamiento educativo</h3>
            <p className="mt-4 flex-1">
              Orientación práctica en dos temas: la adaptación al colegio en niños de 2 a 6 años, y
              cómo apoyar el inglés en casa desde la primera infancia. Paquetes cortos de sesiones,
              con estrategias que puedes aplicar esta misma semana.
            </p>
            <ul className="mt-5 space-y-1 text-sm font-semibold text-tinta-soft">
              <li>· Adaptación escolar</li>
              <li>· Bilingüismo temprano</li>
            </ul>
            <ButtonLink href="/acompanamiento" variant="terracota" className="mt-6 self-start">
              Conocer el acompañamiento
            </ButtonLink>
          </Card>

          <Card accent="salvia" className="flex flex-col">
            <Eyebrow accent="salvia">Para niños y niñas</Eyebrow>
            <h3 className="text-2xl sm:text-3xl">Clases de inglés personalizadas</h3>
            <p className="mt-4 flex-1">
              Clases uno a uno por videollamada. En los primeros años, juego, movimiento y
              canciones. Con niños mayores, varias formas de aprender y de mostrar lo aprendido,
              aprovechando la ventana que da la neuroplasticidad.
            </p>
            <ul className="mt-5 space-y-1 text-sm font-semibold text-tinta-soft">
              <li>· Primera infancia (2 a 6 años)</li>
              <li>· Niños mayores</li>
            </ul>
            <ButtonLink href="/clases-de-ingles" variant="salvia" className="mt-6 self-start">
              Conocer las clases
            </ButtonLink>
          </Card>
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <Eyebrow>Cómo trabajamos</Eyebrow>
          <h2 className="text-3xl sm:text-4xl">Sin teoría suelta. Con pasos para esta semana.</h2>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-card border border-linea bg-white/60 p-6">
              <span className="font-heading text-4xl text-terracota-deep">0{i + 1}</span>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-2 text-tinta-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="salvia-soft">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <Eyebrow accent="salvia">Quién te acompaña</Eyebrow>
            <h2 className="text-3xl sm:text-4xl">{siteConfig.ownerName}</h2>
            <p className="mt-4 text-lg">
              Educadora bilingüe de primera infancia, con experiencia de aula en metodologías CLIL y
              TPR, y especialización en curso en Psicología Educativa.
            </p>
            <Link
              href="/sobre-mi"
              className="mt-5 inline-block font-bold text-salvia-deep underline-offset-4 hover:underline"
            >
              Leer mi historia y mi metodología →
            </Link>
          </div>
          <blockquote className="rounded-card border border-salvia/50 bg-crema p-6 text-lg sm:p-8">
            <p>
              “No soy psicóloga, soy educadora con formación en psicología educativa. Mi trabajo no
              es tratar, es acompañar: doy estrategias concretas basadas en años de aula y en cómo
              aprende y se regula un niño pequeño.”
            </p>
          </blockquote>
        </div>
      </Section>

      <Section>
        <Disclaimer />
      </Section>

      <CtaBand />
    </>
  );
}
