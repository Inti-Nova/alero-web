import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { ButtonLink, Card, CheckList, Eyebrow, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Clases de inglés para primera infancia (2 a 6 años)",
  description:
    "Clases de inglés 1:1 para niños de 2 a 6 años con TPR y CLIL: juego, movimiento, canciones y rutinas. Sin fichas ni traducción.",
};

const looksLike = [
  "Canciones con gestos que se repiten cada clase hasta que el niño las pide.",
  "Órdenes y juegos de movimiento: el cuerpo responde antes de que aparezca la palabra.",
  "Cuentos cortos con objetos reales, no solo en pantalla.",
  "Rutinas fijas de inicio y cierre que dan seguridad y marcan el cambio de idioma.",
  "Tareas para la casa que son juegos de cinco minutos, no deberes.",
];

export default function PrimeraInfanciaPage() {
  return (
    <>
      <PageHeader
        accent="salvia"
        eyebrow="Clases de inglés · 2 a 6 años"
        title="Primera infancia"
        lead="A esta edad el inglés no se estudia, se vive. Las clases se apoyan en TPR y CLIL, dos metodologías de aula que unen idioma, movimiento y contenido real, siempre a través del juego."
      >
        <ButtonLink href="/agenda?servicio=clases-de-ingles" variant="salvia">
          Agendar clase inicial
        </ButtonLink>
      </PageHeader>

      <Section tone="salvia-soft">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow accent="salvia">La metodología, en concreto</Eyebrow>
            <h2 className="text-3xl">Qué significan TPR y CLIL en una clase con un niño de cuatro años</h2>
          </div>
          <div className="space-y-6">
            <Card accent="salvia">
              <h3 className="text-xl">TPR · Respuesta Física Total</h3>
              <p className="mt-2 text-tinta-soft">
                El niño escucha y responde con el cuerpo: salta, toca, señala, se esconde. Hablar
                llega después, sin presión. Así es como aprendió su primer idioma.
              </p>
            </Card>
            <Card accent="salvia">
              <h3 className="text-xl">CLIL · Aprendizaje integrado de contenido y lengua</h3>
              <p className="mt-2 text-tinta-soft">
                El inglés es el vehículo, no el tema. Sembramos una semilla, clasificamos animales
                o preparamos una merienda, y el idioma aparece porque hace falta para jugar.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow accent="salvia">Cómo se ve una clase</Eyebrow>
            <h2 className="text-3xl">Treinta minutos que se sienten como juego</h2>
            <p className="mt-4 text-tinta-soft">
              La duración se ajusta a la edad y a la atención de cada niño. La constancia pesa más
              que la longitud de la clase.
            </p>
          </div>
          <CheckList items={looksLike} accent="salvia" />
        </div>
      </Section>

      <Section tone="crema-dark">
        <p className="max-w-2xl text-tinta-soft">
          Si lo que buscas es orientación para apoyar el inglés tú en casa, sin clases para el niño,
          mira el acompañamiento en{" "}
          <Link href="/acompanamiento/bilinguismo-temprano" className="font-bold text-terracota-deep underline-offset-4 hover:underline">
            bilingüismo temprano
          </Link>
          . Muchas familias combinan los dos.
        </p>
      </Section>

      <CtaBand
        accent="salvia"
        title="Una clase inicial para conocernos."
        text="Sin compromiso de paquete. Vemos cómo responde tu hijo o hija y definimos el plan."
        agendaHref="/agenda?servicio=clases-de-ingles"
      />
    </>
  );
}
