import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { ButtonLink, Card, CheckList, Eyebrow, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Clases de inglés para niños mayores",
  description:
    "Clases de inglés 1:1 para niños desde los 7 años, con principios del Diseño Universal de Aprendizaje y una mirada desde la neuroplasticidad: varias formas de aprender y de mostrar lo aprendido.",
};

const dua = [
  {
    title: "Varias formas de presentar",
    text: "El mismo contenido llega por texto, audio, imagen y manipulación. Si un camino no funciona, hay otro.",
  },
  {
    title: "Varias formas de participar",
    text: "Proyectos conectados con lo que le gusta: videojuegos, fútbol, dibujo, ciencia. El interés sostiene el esfuerzo.",
  },
  {
    title: "Varias formas de mostrar lo aprendido",
    text: "No todo es un examen escrito. Puede ser un video, una presentación, un cómic o una conversación.",
  },
];

const looksLike = [
  "Clase inicial para conocer intereses, nivel real y cómo prefiere aprender.",
  "Plan por ciclos cortos con una meta visible para el niño y para la familia.",
  "Mezcla de conversación, lectura, escritura y proyectos, según la etapa.",
  "Retroalimentación concreta y amable: qué ya logra y cuál es el siguiente paso.",
  "Reporte sencillo de avances para la familia al cierre de cada ciclo.",
];

export default function NinosMayoresPage() {
  return (
    <>
      <PageHeader
        accent="salvia"
        eyebrow="Clases de inglés · desde los 7 años"
        title="Niños mayores"
        lead="A esta edad el cerebro sigue en una ventana muy favorable para un segundo idioma. Las clases aprovechan esa plasticidad con principios del Diseño Universal de Aprendizaje: múltiples caminos para aprender y para demostrar lo aprendido."
      >
        <ButtonLink href="/agenda?servicio=clases-de-ingles" variant="salvia">
          Agendar clase inicial
        </ButtonLink>
      </PageHeader>

      <Section tone="salvia-soft">
        <div className="max-w-2xl">
          <Eyebrow accent="salvia">Diseño Universal de Aprendizaje</Eyebrow>
          <h2 className="text-3xl">Tres principios que cambian cómo se siente una clase</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {dua.map((item) => (
            <Card key={item.title} accent="salvia" className="h-full">
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-3 text-tinta-soft">{item.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow accent="salvia">Neuroplasticidad, en palabras simples</Eyebrow>
            <h2 className="text-3xl">Por qué este es un buen momento</h2>
            <p className="mt-4 text-tinta-soft">
              El cerebro de un niño reorganiza sus conexiones con mucha facilidad. Eso significa que
              la exposición frecuente y con sentido al inglés deja huella rápido, sobre todo en
              pronunciación y en comprensión oral. No es una carrera contra el tiempo: es
              aprovechar una etapa en la que aprender cuesta menos.
            </p>
          </div>
          <div>
            <h3 className="text-2xl">Cómo se ven las clases</h3>
            <div className="mt-4">
              <CheckList items={looksLike} accent="salvia" />
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        accent="salvia"
        title="Empecemos por conocer cómo aprende."
        text="Agenda la clase inicial. Si ya tiene inglés del colegio, me cuentas en qué punto va."
        agendaHref="/agenda?servicio=clases-de-ingles"
      />
    </>
  );
}
