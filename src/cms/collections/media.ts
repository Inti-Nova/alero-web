import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "../access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Imagen", plural: "Imágenes" },
  admin: {
    group: "Contenido",
    description: "Fotos e ilustraciones para los recursos.",
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    // Solo en local. En producción el adaptador S3 (src/cms/storage.ts) sube los archivos a R2.
    staticDir: path.resolve(dirname, "../../../media"),
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 900, height: 600, position: "centre" },
      { name: "hero", width: 1600, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      label: "Texto alternativo",
      type: "text",
      required: true,
      admin: {
        description:
          "Describe la imagen para quien no puede verla. Obligatorio por accesibilidad.",
      },
    },
  ],
  typescript: { interface: "Media" },
};
