import type { CollectionConfig } from "payload";
import { authenticated, publishedOrAuthenticated } from "../access";
import { revalidateSitePaths } from "../revalidate";

export const postTopics = [
  { label: "Adaptación escolar", value: "adaptacion-escolar" },
  { label: "Bilingüismo temprano", value: "bilinguismo-temprano" },
  { label: "Inglés para niños", value: "clases-de-ingles" },
] as const;

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Recurso", plural: "Recursos" },
  admin: {
    useAsTitle: "title",
    group: "Contenido",
    defaultColumns: ["title", "topic", "publishedAt", "_status"],
    description:
      "Artículos y guías de la sección Recursos. Guarda como borrador mientras escribes y publica cuando esté listo.",
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/recursos/${data?.slug ?? ""}`,
    },
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 20,
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        const paths = ["/recursos", `/recursos/${doc.slug}`];
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) paths.push(`/recursos/${previousDoc.slug}`);
        revalidateSitePaths(paths);
      },
    ],
    afterDelete: [({ doc }) => revalidateSitePaths(["/recursos", `/recursos/${doc.slug}`])],
  },
  fields: [
    { name: "title", label: "Título", type: "text", required: true },
    {
      name: "slug",
      label: "Identificador en la URL",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Se genera solo a partir del título si lo dejas vacío.",
      },
    },
    {
      name: "topic",
      label: "Tema",
      type: "select",
      required: true,
      options: [...postTopics],
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      label: "Fecha de publicación",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" },
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            if (siblingData?._status === "published" && !value) return new Date().toISOString();
            return value;
          },
        ],
      },
    },
    {
      name: "excerpt",
      label: "Resumen",
      type: "textarea",
      required: true,
      maxLength: 240,
      admin: { description: "Aparece en la lista de recursos y en redes al compartir." },
    },
    {
      name: "cover",
      label: "Imagen de portada",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "content",
      label: "Contenido",
      type: "richText",
      required: true,
    },
    {
      name: "instagramUrl",
      label: "Enlace al carrusel de Instagram",
      type: "text",
      admin: { position: "sidebar" },
    },
  ],
  typescript: { interface: "Post" },
};
