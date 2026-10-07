import Link from "next/link";
import type { ServiceView } from "@/modules/catalog";
import { Card, Eyebrow } from "./ui";

export function ServiceCard({ service, eyebrow }: { service: ServiceView; eyebrow?: string }) {
  const arrow = service.accent === "terracota" ? "text-terracota-deep" : "text-salvia-deep";
  return (
    <Card accent={service.accent} className="flex h-full flex-col">
      {eyebrow && <Eyebrow accent={service.accent}>{eyebrow}</Eyebrow>}
      <h3 className="text-2xl">{service.name}</h3>
      <p className="mt-1 text-sm font-semibold text-tinta-soft">{service.audience}</p>
      <p className="mt-4 flex-1">{service.summary}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-bold">Formato</dt>
          <dd className="text-tinta-soft">{service.format}</dd>
        </div>
        <div>
          <dt className="font-bold">Sesiones</dt>
          <dd className="text-tinta-soft">{service.sessions}</dd>
        </div>
      </dl>
      <Link
        href={service.href}
        className={`mt-6 inline-flex items-center gap-2 font-bold ${arrow} underline-offset-4 hover:underline`}
      >
        Conocer más <span aria-hidden>→</span>
      </Link>
    </Card>
  );
}
