import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "../access";
import { revalidateSitePaths } from "../revalidate";

export const Services: CollectionConfig = {
  slug: "services",
  labels: { singular: "Servicio", plural: "Servicios" },
  admin: {
    useAsTitle: "name",
    group: "Agenda",
    defaultColumns: ["name", "line", "priceCop", "durationMinutes", "active"],
    description:
      "Las líneas de servicio que se pueden agendar. Aquí se cambian precios, duración y qué incluye cada paquete.",
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    afterChange: [
      () => {
        revalidateSitePaths([
          "/",
          "/precios",
          "/agenda",
          "/acompanamiento",
          "/acompanamiento/adaptacion-escolar",
          "/acompanamiento/bilinguismo-temprano",
          "/clases-de-ingles",
        ]);
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", label: "Nombre", type: "text", required: true },
        {
          name: "shortName",
          label: "Nombre corto",
          type: "text",
          required: true,
          admin: { description: "Se usa en menús y etiquetas." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "slug",
          label: "Identificador en la URL",
          type: "text",
          required: true,
          unique: true,
          admin: {
            description:
              "No cambiarlo una vez publicado: las páginas del sitio lo usan para enlazar.",
          },
        },
        {
          name: "line",
          label: "Línea",
          type: "select",
          required: true,
          options: [
            { label: "Acompañamiento educativo", value: "acompanamiento" },
            { label: "Clases de inglés", value: "clases-de-ingles" },
          ],
        },
      ],
    },
    {
      name: "audience",
      label: "Para quién",
      type: "text",
      required: true,
      admin: { description: "Por ejemplo: Familias con niños de 2 a 6 años." },
    },
    {
      name: "summary",
      label: "Resumen",
      type: "textarea",
      required: true,
      admin: { description: "Dos frases que aparecen en las tarjetas." },
    },
    {
      name: "valueProposition",
      label: "Propuesta de valor",
      type: "textarea",
      required: true,
      admin: { description: "Párrafo de apertura de la página del servicio." },
    },
    {
      name: "includes",
      label: "Qué incluye",
      type: "array",
      minRows: 1,
      labels: { singular: "Punto", plural: "Puntos" },
      fields: [{ name: "item", label: "Texto", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        {
          name: "sessionsLabel",
          label: "Sesiones",
          type: "text",
          required: true,
          admin: { description: "Por ejemplo: 3 sesiones de 45 a 60 minutos." },
        },
        {
          name: "format",
          label: "Formato",
          type: "text",
          required: true,
          defaultValue: "Por videollamada",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "durationMinutes",
          label: "Duración de cada sesión (minutos)",
          type: "number",
          required: true,
          min: 15,
          max: 240,
          defaultValue: 60,
          admin: { description: "Define el tamaño de los espacios en la agenda." },
        },
        {
          name: "priceCop",
          label: "Precio del paquete (COP)",
          type: "number",
          min: 0,
          admin: { description: "Déjalo vacío para mostrar «precio por confirmar»." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "isLaunchPrice",
          label: "Es precio de lanzamiento",
          type: "checkbox",
          defaultValue: true,
        },
        { name: "active", label: "Activo", type: "checkbox", defaultValue: true },
        {
          name: "order",
          label: "Orden",
          type: "number",
          defaultValue: 0,
          admin: { description: "Menor número aparece primero." },
        },
      ],
    },
  ],
  typescript: { interface: "Service" },
};
