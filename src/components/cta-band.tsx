import type { Accent } from "@/content/services";
import { getContactLinks } from "@/modules/settings";
import { ButtonLink, Section } from "./ui";

export async function CtaBand({
  title = "¿Hablamos de lo que necesita tu familia?",
  text = "Agenda una sesión o escríbeme por WhatsApp. Te respondo con calma y sin compromiso.",
  accent = "terracota",
  agendaHref = "/agenda",
}: {
  title?: string;
  text?: string;
  accent?: Accent;
  agendaHref?: string;
}) {
  const { whatsappUrl } = await getContactLinks();
  return (
    <Section tone={accent === "terracota" ? "terracota-soft" : "salvia-soft"}>
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl">{title}</h2>
          <p className="mt-3 text-lg text-tinta-soft">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={agendaHref} variant={accent}>
            Agendar una sesión
          </ButtonLink>
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
    </Section>
  );
}
