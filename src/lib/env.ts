import { z } from "zod";

/**
 * Variables de entorno del servidor. Las públicas (NEXT_PUBLIC_*) se leen
 * directamente en src/config/site.ts porque Next las reemplaza en build.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  PAYLOAD_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export const env = schema.parse(process.env);
