-- Impide que dos reservas activas del mismo instructor se superpongan en el tiempo.
-- Las columnas son TIMESTAMP(3) sin zona (Prisma guarda UTC), por eso se usa tsrange y no tstzrange.
-- Prisma no modela restricciones EXCLUDE, por eso esta migración se escribió a mano.
-- Copia de referencia en prisma/sql/no_overlap_constraint.sql.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "instructorId" WITH =,
    tsrange("startAt", "endAt") WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));
