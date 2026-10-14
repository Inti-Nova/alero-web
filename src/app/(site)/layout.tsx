import type { Metadata } from "next";
import { Satisfy, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import "../globals.css";

/** Serif única para títulos y cuerpo, con eje óptico para que rinda en ambos tamaños. */
const serif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

/** Cursiva tipo firma, solo para el nombre de la marca. */
const script = Satisfy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${script.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
