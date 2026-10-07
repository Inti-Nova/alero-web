import type { Payload } from "payload";
import { serviceSeeds } from "@/content/services";

/**
 * Carga inicial idempotente: solo escribe cuando las colecciones están vacías.
 * Así el primer arranque deja la agenda lista para probar.
 */
export async function seedIfEmpty(payload: Payload) {
  try {
    const services = await payload.count({ collection: "services" });
    if (services.totalDocs === 0) {
      for (const seed of serviceSeeds) {
        await payload.create({
          collection: "services",
          data: {
            ...seed,
            includes: seed.includes.map((item) => ({ item })),
            isLaunchPrice: true,
            active: true,
          },
        });
      }
      payload.logger.info("Servicios iniciales creados.");
    }

    const rules = await payload.count({ collection: "availability-rules" });
    if (rules.totalDocs === 0) {
      for (const weekday of ["1", "2", "3", "4", "5"] as const) {
        await payload.create({
          collection: "availability-rules",
          data: { weekday, startTime: "09:00", endTime: "17:00" },
        });
      }
      payload.logger.info("Horario semanal inicial creado (lunes a viernes, 9 a 17).");
    }
  } catch (error) {
    payload.logger.error({ err: error }, "La carga inicial falló");
  }
}
