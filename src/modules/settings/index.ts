import config from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";
import { siteConfig } from "@/config/site";

export const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "site-settings", depth: 0 });
});

export const getAgendaSettings = cache(async () => {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "agenda-settings", depth: 0 });
});

export interface ContactLinks {
  whatsappUrl: string;
  email: string;
  instagramUrl: string;
  notifyEmail: string;
}

/** Enlaces de contacto listos para usar en la interfaz. */
export async function getContactLinks(): Promise<ContactLinks> {
  const settings = await getSiteSettings();
  const number = (settings.contact?.whatsappNumber ?? "").replace(/\D/g, "");
  const email = settings.contact?.email ?? "";
  return {
    whatsappUrl: number
      ? `https://wa.me/${number}?text=${encodeURIComponent(
          `Hola, vengo del sitio de ${siteConfig.name} y quiero más información.`,
        )}`
      : "",
    email,
    instagramUrl: settings.contact?.instagramUrl ?? "",
    notifyEmail: settings.contact?.notifyEmail || email,
  };
}
