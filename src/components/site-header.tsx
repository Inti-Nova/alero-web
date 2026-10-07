import Link from "next/link";
import { navigation, siteConfig } from "@/config/site";
import { MobileNav } from "./mobile-nav";
import { ButtonLink } from "./ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-crema/90 backdrop-blur">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-tinta focus:px-3 focus:py-2 focus:text-crema"
      >
        Saltar al contenido
      </a>
      <div className="container-site relative flex h-18 items-center justify-between gap-6">
        <Link href="/" className="font-heading text-2xl font-semibold tracking-tight">
          {siteConfig.name}
        </Link>

        <nav aria-label="Menú principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-2 font-semibold text-tinta-soft transition-colors hover:bg-crema-dark hover:text-tinta"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href="/agenda" className="hidden sm:inline-flex">
            Agendar
          </ButtonLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
