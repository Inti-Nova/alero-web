-- Impide que dos reservas activas del mismo instructor se superpongan en el tiempo.
-- Las columnas son TIMESTAMP(3) sin zona (Prisma guarda UTC), por eso se usa tsrange y no tstzrange.
-- Prisma no modela restricciones EXCLUDE, así que vive en la migración manual
-- prisma/migrations/20261006210800_booking_no_overlap. Este archivo es solo referencia.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "instructorId" WITH =,
    tsrange("startAt", "endAt") WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));
