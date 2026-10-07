import { siteConfig } from "@/config/site";

/** Marca gráfica: dos círculos solapados, terracota y salvia, como en la portada del sitio. */
export function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <circle cx="15" cy="17" r="13" fill="#d98b6b" />
      <circle cx="25" cy="24" r="12" fill="#8fa894" fillOpacity="0.9" />
    </svg>
  );
}

/** Logo completo: se muestra en la pantalla de inicio de sesión. */
export function Logo() {
  return (
    <span className="alero-logo">
      <Mark size={40} />
      <span className="alero-logo__name">{siteConfig.name}</span>
    </span>
  );
}

/** Icono pequeño: se muestra en la barra lateral del panel. */
export function Icon() {
  return <Mark size={24} />;
}
