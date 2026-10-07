import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { es } from "@payloadcms/translations/languages/es";
import { buildConfig } from "payload";
import sharp from "sharp";
import { AvailabilityRules } from "./cms/collections/availability-rules";
import { BlockedDates } from "./cms/collections/blocked-dates";
import { Bookings } from "./cms/collections/bookings";
import { Media } from "./cms/collections/media";
import { Posts } from "./cms/collections/posts";
import { Services } from "./cms/collections/services";
import { Students } from "./cms/collections/students";
import { Users } from "./cms/collections/users";
import { ensureDatabaseConstraints } from "./cms/db-constraints";
import { AgendaSettings } from "./cms/globals/agenda-settings";
import { SiteSettings } from "./cms/globals/site-settings";
import { seedIfEmpty } from "./cms/seed";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    // El tema se define en src/app/(payload)/custom.css; se fuerza el modo claro
    // para que la paleta cálida de la marca se vea igual en cualquier dispositivo.
    theme: "light",
    meta: {
      titleSuffix: " · Alero",
      description: "Panel de administración de Alero",
    },
    dateFormat: "d MMM yyyy, HH:mm",
    components: {
      graphics: {
        Logo: "/cms/components/logo#Logo",
        Icon: "/cms/components/logo#Icon",
      },
      beforeDashboard: ["/cms/components/welcome#Welcome"],
    },
  },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: "es",
  },
  collections: [Bookings, Students, AvailabilityRules, BlockedDates, Services, Posts, Media, Users],
  globals: [SiteSettings, AgendaSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
  }),
  sharp,
  onInit: async (payload) => {
    await ensureDatabaseConstraints(payload);
    await seedIfEmpty(payload);
  },
});
