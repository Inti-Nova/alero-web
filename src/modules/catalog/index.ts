import config from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";
import {
  accentForLine,
  hrefForService,
  type Accent,
  type ServiceLine,
} from "@/content/services";
import type { Service } from "@/payload-types";

/** Forma que usan las páginas del sitio, independiente del esquema del panel. */
export interface ServiceView {
  id: number | string;
  slug: string;
  line: ServiceLine;
  name: string;
  shortName: string;
  audience: string;
  summary: string;
  valueProposition: string;
  includes: string[];
  sessions: string;
  format: string;
  durationMinutes: number;
  priceCop: number | null;
  isLaunchPrice: boolean;
  accent: Accent;
  href: string;
}

export function toServiceView(doc: Service): ServiceView {
  const line = doc.line as ServiceLine;
  return {
    id: doc.id,
    slug: doc.slug,
    line,
    name: doc.name,
    shortName: doc.shortName,
    audience: doc.audience,
    summary: doc.summary,
    valueProposition: doc.valueProposition,
    includes: (doc.includes ?? []).map((row) => row.item),
    sessions: doc.sessionsLabel,
    format: doc.format,
    durationMinutes: doc.durationMinutes,
    priceCop: doc.priceCop ?? null,
    isLaunchPrice: Boolean(doc.isLaunchPrice),
    accent: accentForLine(line),
    href: hrefForService(line, doc.slug),
  };
}

export const listServices = cache(async (): Promise<ServiceView[]> => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "services",
    where: { active: { equals: true } },
    sort: "order",
    limit: 50,
    depth: 0,
  });
  return result.docs.map(toServiceView);
});

export const getServiceBySlug = cache(async (slug: string): Promise<ServiceView | null> => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "services",
    where: { and: [{ slug: { equals: slug } }, { active: { equals: true } }] },
    limit: 1,
    depth: 0,
  });
  const doc = result.docs[0];
  return doc ? toServiceView(doc) : null;
});
