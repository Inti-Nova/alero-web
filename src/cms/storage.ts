import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin } from "payload";

/**
 * Almacenamiento de imágenes en producción.
 *
 * En local, sin variables S3_*, Payload guarda los archivos en la carpeta media/.
 * En Netlify el disco no persiste, así que las imágenes van a un bucket compatible
 * con S3 (Cloudflare R2). El bucket debe tener acceso público de lectura y
 * S3_PUBLIC_URL es la URL pública base, por ejemplo https://pub-xxxx.r2.dev
 * o un dominio propio como https://media.alero.co.
 */
const bucket = process.env.S3_BUCKET;
const publicUrl = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");

export const storageEnabled = Boolean(
  bucket && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_ENDPOINT,
);

export const storagePlugins: Plugin[] = storageEnabled
  ? [
      s3Storage({
        collections: {
          media: {
            // Las imágenes se sirven directo desde el bucket, sin pasar por una función.
            disablePayloadAccessControl: true,
            generateFileURL: ({ filename, prefix }) =>
              [publicUrl, prefix, filename].filter(Boolean).join("/"),
          },
        },
        bucket: bucket!,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION || "auto",
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
        },
      }),
    ]
  : [];
