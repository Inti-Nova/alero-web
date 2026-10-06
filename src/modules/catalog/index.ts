import { db } from "@/lib/db";

/** Servicios activos visibles en la página pública de reservas. */
export function listActiveServices() {
  return db.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { instructor: { select: { id: true, name: true, timezone: true } } },
  });
}

export function getServiceBySlug(slug: string) {
  return db.service.findUnique({
    where: { slug },
    include: { instructor: true },
  });
}
