/**
 * Configuración fija de la marca. Los datos de contacto y precios se administran
 * desde el panel (/admin → Ajustes del sitio) y se leen con src/modules/settings.
 *
 * Nombre definido por la clienta: Alero. Se mantiene en NEXT_PUBLIC_BRAND_NAME
 * para poder ajustar la escritura sin tocar código.
 */

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "Alero";

export const siteConfig = {
  name: brandName,
  ownerName: "Violeta Cortázar",
  tagline: "Acompañamiento educativo para familias y clases de inglés personalizadas",
  description:
    "Orientación práctica para padres en adaptación escolar y bilingüismo temprano, y clases de inglés 1:1 para niños. Educadora bilingüe de primera infancia, no terapia.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "es-CO",
  /** Año del aviso de copyright. Se mantiene estático para que la página pueda prerenderizarse. */
  copyrightYear: 2026,
  /** Aviso obligatorio (sección 8 del brief). Se muestra en pie de página y landings. */
  disclaimer:
    "El acompañamiento educativo no es terapia ni tratamiento psicológico. Quien lo ofrece es educadora con formación en psicología educativa, no psicóloga clínica.",
} as const;

export const navigation = [
  { href: "/acompanamiento", label: "Acompañamiento" },
  { href: "/clases-de-ingles", label: "Clases de inglés" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/precios", label: "Precios" },
  { href: "/recursos", label: "Recursos" },
  { href: "/contacto", label: "Contacto" },
] as const;
