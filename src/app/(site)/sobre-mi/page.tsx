import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { Disclaimer } from "@/components/disclaimer";
import { Card, Eyebrow, PageHeader, Section } from "@/components/ui";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sobre mí y mi metodología",
  description:
    "Educadora bilingüe de primera infancia con experiencia en CLIL y TPR, y especialización en curso en Psicología Educativa. Acompaño, no trato.",
};

const training = [
  "Licenciatura en educación, con énfasis en primera infancia",
  "Experiencia de aula en entornos bilingües con metodologías CLIL y TPR",
  "Especialización en Psicología Educativa, actualmente en curso",
];

const methods = [
  {
    name: "CLIL",
    full: "Aprendizaje integrado de contenido y lengua",
    text: "El idioma se aprende usándolo para algo real: un experimento, una receta, una historia. En casa se traduce en rutinas donde el inglés tiene una función, no en repetir vocabulario.",
  },
  {
    name: "TPR",
    full: "Respuesta Física Total",
    text: "Primero el cuerpo entiende, después la boca habla. Con niños pequeños, moverse mientras escuchan es la forma más natural y menos ansiosa de entrar a un idioma.",
  },
  {
    name: "DUA",
    full: "Diseño Universal de Aprendizaje",
    text: "No existe un solo camino para aprender. Diseño cada clase con varias formas de presentar, de participar y de demostrar, para que ningún niño quede por fuera por aprender distinto.",
  },
  {
    name: "Neuroplasticidad",
    full: "Cómo cambia el cerebro al aprender",
    text: "Lo uso para decidir cuándo y cómo intervenir: la infancia es una ventana favorable para el segundo idioma y también para aprender a regularse. Eso guía el ritmo y la forma de cada sesión.",
  },
];

export default function SobreMiPage() {
  return (
    <>
      <PageHeader eyebrow="Sobre mí" title={siteConfig.ownerName} lead="Educadora bilingüe de primera infancia. Acompaño a familias con lo que aprendí en años de aula y en cómo aprende y se regula un niño pequeño." />

      <Section tone="crema-dark">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 text-lg">
            <Eyebrow>Mi historia</Eyebrow>
            {/* TODO: reemplazar por el texto personal que envíe Violeta. */}
            <p>
              Llevo años en aulas de primera infancia, muchas de ellas bilingües. Ahí aprendí que la
              adaptación al colegio y el primer contacto con otro idioma se parecen más de lo que
              parece: en los dos, lo que necesita un niño es seguridad, repetición y adultos que
              sepan qué hacer.
            </p>
            <p>
              Con el tiempo me di cuenta de que muchas familias llegaban a la puerta del salón con
              las mismas preguntas y sin nadie que las respondiera en un lenguaje práctico. Por eso
              empecé a acompañar a padres y madres, y por eso estoy estudiando Psicología Educativa:
              para entender mejor cómo aprende y se regula un niño, y traducirlo en estrategias que
              funcionen en casa.
            </p>
          </div>
          <Card>
            <h2 className="text-2xl">Formación y experiencia</h2>
            <ul className="mt-4 space-y-3">
              {training.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-terracota" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Lo que quiero que sepas antes de trabajar conmigo</Eyebrow>
          <blockquote className="rounded-card border border-terracota/40 bg-terracota-soft/60 p-6 font-heading text-2xl sm:p-8 sm:text-3xl">
            <p>
              “No soy psicóloga, soy educadora con formación en psicología educativa. Mi trabajo no
              es tratar, es acompañar: doy estrategias concretas basadas en años de aula y en cómo
              aprende y se regula un niño pequeño.”
            </p>
          </blockquote>
          <p className="mt-6 text-tinta-soft">
            Si en algún momento veo que lo que necesita tu familia es una evaluación o un
            tratamiento, te lo digo y te oriento sobre a quién acudir.
          </p>
        </div>
      </Section>

      <Section tone="salvia-soft">
        <div className="max-w-2xl">
          <Eyebrow accent="salvia">Metodología</Eyebrow>
          <h2 className="text-3xl sm:text-4xl">Cuatro ideas que están detrás de todo lo que hago</h2>
          <p className="mt-4 text-tinta-soft">
            Explicadas como las aplico, no como términos sueltos.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {methods.map((m) => (
            <Card key={m.name} accent="salvia" className="h-full">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-salvia-deep">{m.name}</p>
              <h3 className="mt-1 text-xl">{m.full}</h3>
              <p className="mt-3 text-tinta-soft">{m.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Disclaimer />
      </Section>

      <CtaBand />
    </>
  );
}
