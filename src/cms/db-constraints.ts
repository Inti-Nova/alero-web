import type { Payload } from "payload";

/**
 * Restricciones que Payload no modela y que la base de datos debe garantizar.
 *
 * bookings_no_overlap: dos reservas activas (pendiente o confirmada) no pueden
 * superponerse en el tiempo. Es la última línea de defensa frente a dos personas
 * reservando el mismo horario en el mismo instante; la validación en el hook de la
 * colección da el mensaje amable, esta restricción garantiza la consistencia.
 */
const statements = [
  `DO $$
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap') THEN
       ALTER TABLE bookings
         ADD CONSTRAINT bookings_no_overlap
         EXCLUDE USING gist (tstzrange(start_at, end_at) WITH &&)
         WHERE (status IN ('pending', 'confirmed'));
     END IF;
   END $$;`,
];

interface PoolLike {
  query: (sql: string) => Promise<unknown>;
}

export async function ensureDatabaseConstraints(payload: Payload) {
  const pool = (payload.db as unknown as { pool?: PoolLike }).pool;
  if (!pool) {
    payload.logger.warn("No se encontró el pool de Postgres; se omiten las restricciones manuales.");
    return;
  }
  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (error) {
      payload.logger.error({ err: error }, "No se pudo aplicar una restricción manual de base de datos");
    }
  }
}
