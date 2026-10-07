import type { Metadata } from "next";
import { Disclaimer } from "@/components/disclaimer";
import { ButtonLink, Card, Eyebrow, PageHeader, Section } from "@/components/ui";
import { getContactLinks } from "@/modules/settings";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbeme por el formulario o por WhatsApp. Te respondo en máximo dos días hábiles.",
};

export const revalidate = 3600;

export default async function ContactoPage() {
  const { whatsappUrl, email, instagramUrl } = await getContactLinks();

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Cuéntame qué está pasando"
        lead="Si no sabes qué servicio te sirve o prefieres hablar antes de agendar, este es el lugar. Te respondo con calma y sin compromiso."
      />

      <Section tone="crema-dark">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <ContactForm />
          </Card>

          <div className="space-y-6">
            <Card>
              <Eyebrow>Más directo</Eyebrow>
              <h2 className="text-2xl">Escríbeme por WhatsApp</h2>
              <p className="mt-2 text-tinta-soft">
                Es el canal más rápido. Cuéntame en un mensaje la edad de tu hijo o hija y qué te
                preocupa.
              </p>
              {whatsappUrl ? (
                <ButtonLink href={whatsappUrl} target="_blank" rel="noopener" className="mt-5">
                  Abrir WhatsApp
                </ButtonLink>
              ) : (
                <p className="mt-5 text-sm text-tinta-soft">El número de WhatsApp se publicará pronto.</p>
              )}
            </Card>

            {(email || instagramUrl) && (
              <Card>
                <h2 className="text-xl">Otros canales</h2>
                <ul className="mt-3 space-y-2">
                  {email && (
                    <li>
                      <a href={`mailto:${email}`} className="font-semibold underline-offset-4 hover:underline">
                        {email}
                      </a>
                    </li>
                  )}
                  {instagramUrl && (
                    <li>
                      <a href={instagramUrl} target="_blank" rel="noopener" className="font-semibold underline-offset-4 hover:underline">
                        Instagram
                      </a>
                    </li>
                  )}
                </ul>
              </Card>
            )}

            <Disclaimer compact />
          </div>
        </div>
      </Section>
    </>
  );
}
