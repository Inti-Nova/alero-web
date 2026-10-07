import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/** Dominio público del bucket de imágenes (Cloudflare R2), si está configurado. */
const mediaHost = (() => {
  try {
    return process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  turbopack: {
    // Evita que Next tome como raíz la carpeta de usuario por un package-lock.json ajeno.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: mediaHost ? [{ protocol: "https", hostname: mediaHost }] : [],
  },
};

export default withPayload(nextConfig);
