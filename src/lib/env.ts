import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  DEFAULT_TIMEZONE: z.string().default("America/Bogota"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export const env = schema.parse(process.env);
