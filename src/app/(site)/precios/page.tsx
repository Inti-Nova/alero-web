import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { ButtonLink, Card, CheckList, Eyebrow, PageHeader, Section } from "@/components/ui";
import { formatCop } from "@/lib/format";
import { listServices } from "@/modules/catalog";
import { getSiteSettings } from "@/modules/settings";

export const metadata: Metadata = {
  title: "Precios y paquetes",
  description:
    "Paquetes de acompañamiento en adaptación escolar, bilingüismo temprano y clases de inglés personalizadas. Precios de lanzamiento.",
};

export const revalidate = 3600;

export default async function PreciosPage() {
  const [services, settings] = await Promise.all([listServices(), getSiteSettings()]);
  const from = settings.pricing?.launchPriceFrom ?? null;
  const to = settings.pricing?.launchPriceTo ?? null;
  const payment = (settings.pricing?.paymentMethods ?? []).map((m) => m.item);

  return (
    <>
      <PageHeader
        eyebrow="Precios"
        title="Paquetes y precios de lanzamiento"
        lead="Tres líneas de servicio, paquetes cortos y precios de lanzamiento mientras arranca el proyecto. Los precios son por paquete completo, no por sesión."
      />

      {from !== null && to !== null && (
        <div className="container-site pb-12">
          <div className="rounded-card border border-terracota/40 bg-terracota-soft/60 px-5 py-4">
            <p>
              <strong className="font-bold">Precio de lanzamiento:</strong> entre {formatCop(from)} y{" "}
              {formatCop(to)} por paquete completo, según la línea. Es un precio de apertura y puede
              cambiar más adelante.
            </p>
          </div>
        </div>
      )}

      <Section tone="crema-dark">
        <div className="grid gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.slug} accent={service.accent} className="flex h-full flex-col">
              <Eyebrow accent={service.accent}>{service.shortName}</Eyebrow>
              <h2 className="text-2xl">{service.name}</h2>
              <p className="mt-1 text-sm font-semibold text-tinta-soft">{service.audience}</p>

              <p className="mt-6 font-heading text-3xl">
                {service.priceCop !== null ? formatCop(service.priceCop) : "Precio de lanzamiento"}
              </p>
              <p className="text-sm text-tinta-soft">
                {service.priceCop !== null
                  ? service.isLaunchPrice
                    ? "por paquete completo · precio de lanzamiento"
                    : "por paquete completo"
                  : "por confirmar"}
              </p>

              <dl className="mt-6 space-y-2 text-sm">
                <div>
                  <dt className="font-bold">Sesiones</dt>
                  <dd className="text-tinta-soft">{service.sessions}</dd>
                </div>
                <div>
                  <dt className="font-bold">Formato</dt>
                  <dd className="text-tinta-soft">{service.format}</dd>
                </div>
              </dl>

              <div className="mt-6 flex-1">
                <CheckList items={service.includes} accent={service.accent} />
              </div>

              <ButtonLink href={`/agenda?servicio=${service.slug}`} variant={service.accent} className="mt-8">
                Agendar
              </ButtonLink>
            </Card>
          ))}
        </div>
      </Section>

      {payment.length > 0 && (
        <Section>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Formas de pago</Eyebrow>
              <h2 className="text-3xl">Sencillo y sin plataformas raras</h2>
            </div>
            <CheckList items={payment} />
          </div>
        </Section>
      )}

      <CtaBand
        title="¿Dudas sobre cuál paquete te sirve?"
        text="Escríbeme y lo definimos antes de que pagues nada."
      />
    </>
  );
}
