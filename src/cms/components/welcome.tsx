import { siteConfig } from "@/config/site";

interface WelcomeProps {
  user?: { name?: string | null; email?: string | null } | null;
}

const links = [
  { href: "/admin/collections/bookings?where[status][equals]=pending", label: "Reservas por confirmar" },
  { href: "/admin/collections/bookings", label: "Todas las reservas" },
  { href: "/admin/collections/availability-rules", label: "Mi horario semanal" },
  { href: "/admin/collections/blocked-dates/create", label: "Bloquear un día" },
  { href: "/admin/collections/posts/create", label: "Escribir un recurso" },
  { href: "/admin/collections/services", label: "Servicios y precios" },
  { href: "/admin/globals/site-settings", label: "Contacto y formas de pago" },
];

/** Tarjeta de bienvenida que aparece arriba del tablero del panel. */
export function Welcome({ user }: WelcomeProps) {
  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <section className="alero-welcome" aria-labelledby="alero-welcome-title">
      <h2 id="alero-welcome-title">{firstName ? `Hola, ${firstName}.` : `Panel de ${siteConfig.name}`}</h2>
      <p>
        Desde aquí administras la agenda, los servicios con sus precios, los recursos del blog y los
        datos de contacto que aparecen en el sitio. Los textos de las páginas los cambia el equipo
        de desarrollo.
      </p>
      <ul className="alero-welcome__links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
