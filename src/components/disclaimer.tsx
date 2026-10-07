import { siteConfig } from "@/config/site";

/**
 * Aviso de que el acompañamiento no es terapia (sección 8 del brief).
 * Debe aparecer en las landings de acompañamiento, en Sobre mí y en el pie.
 */
export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <p className="text-sm text-tinta-soft">{siteConfig.disclaimer}</p>;
  }
  return (
    <aside
      role="note"
      className="rounded-card border border-terracota/40 bg-terracota-soft/60 px-5 py-4 text-sm sm:text-base"
    >
      <strong className="font-bold">Importante:</strong> {siteConfig.disclaimer}
    </aside>
  );
}
