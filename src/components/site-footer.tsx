import Link from "next/link";
import { navigation, siteConfig } from "@/config/site";
import { getContactLinks } from "@/modules/settings";
import { Disclaimer } from "./disclaimer";

export async function SiteFooter() {
  const contact = await getContactLinks();

  return (
    <footer className="border-t border-linea bg-crema-dark text-sm">
      <div className="container-site grid gap-6 py-8 md:grid-cols-[1.2fr_1.3fr_0.9fr]">
        <div className="max-w-sm space-y-2">
          <p className="font-brand text-2xl leading-none">{siteConfig.name}</p>
          <p className="text-tinta-soft">{siteConfig.tagline}.</p>
          <Disclaimer compact />
        </div>

        <nav aria-label="Mapa del sitio">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-tinta-soft">Sitio</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/agenda" className="hover:underline">
                Agenda
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:underline">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-tinta-soft">
            Contacto
          </p>
          <ul className="space-y-1">
            {contact.whatsappUrl && (
              <li>
                <a href={contact.whatsappUrl} target="_blank" rel="noopener" className="hover:underline">
                  WhatsApp
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="hover:underline">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.instagramUrl && (
              <li>
                <a href={contact.instagramUrl} target="_blank" rel="noopener" className="hover:underline">
                  Instagram
                </a>
              </li>
            )}
            <li>
              <Link href="/contacto" className="hover:underline">
                Formulario de contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-linea">
        <p className="container-site py-3 text-xs text-tinta-soft">
          © {siteConfig.copyrightYear} {siteConfig.name} · {siteConfig.ownerName}. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
