import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../access";
import { revalidateSitePaths } from "../revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Ajustes del sitio",
  admin: {
    group: "Administración",
    description: "Datos de contacto y precios que aparecen en todo el sitio.",
  },
  access: { read: anyone, update: authenticated },
  hooks: {
    afterChange: [() => revalidateSitePaths(["/", "/precios", "/contacto", "/agenda"])],
  },
  fields: [
    {
      type: "group",
      name: "contact",
      label: "Contacto",
      fields: [
        {
          name: "whatsappNumber",
          label: "Número de WhatsApp",
          type: "text",
          admin: { description: "Formato internacional sin «+», por ejemplo 573001234567." },
        },
        { name: "email", label: "Correo público", type: "email" },
        { name: "instagramUrl", label: "Enlace de Instagram", type: "text" },
        {
          name: "notifyEmail",
          label: "Correo para recibir avisos",
          type: "email",
          admin: {
            description:
              "Aquí llegan los mensajes del formulario y las nuevas reservas. Si está vacío se usa el correo público.",
          },
        },
      ],
    },
    {
      type: "group",
      name: "pricing",
      label: "Precios",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "launchPriceFrom",
              label: "Rango de lanzamiento desde (COP)",
              type: "number",
              defaultValue: 150000,
            },
            {
              name: "launchPriceTo",
              label: "Rango de lanzamiento hasta (COP)",
              type: "number",
              defaultValue: 250000,
            },
          ],
        },
        {
          name: "paymentMethods",
          label: "Formas de pago",
          type: "array",
          labels: { singular: "Forma de pago", plural: "Formas de pago" },
          defaultValue: [
            { item: "Link de pago con tarjeta o PSE (Wompi o Bold)" },
            { item: "Transferencia directa por Nequi o Daviplata" },
            { item: "El pago se realiza antes de la primera sesión del paquete" },
          ],
          fields: [{ name: "item", label: "Texto", type: "text", required: true }],
        },
      ],
    },
  ],
  typescript: { interface: "SiteSetting" },
};
