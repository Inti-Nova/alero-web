# Alero Web

Sitio web y sistema de agendamiento de la academia Alero: información de los programas y
reserva de clases y asesorías.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Vitest para pruebas unitarias

## Estructura

```
src/
  app/
    (marketing)/     páginas públicas: inicio, programas
    (booking)/       flujo de reserva
    admin/           panel de la academia
    api/             endpoints HTTP (health, webhooks)
  modules/
    scheduling/      disponibilidad, slots y reservas (lógica pura, con tests)
    catalog/         servicios y precios
    notifications/   correos
    auth/            autenticación del panel
  lib/               cliente de base de datos, variables de entorno
prisma/
  schema.prisma      modelo de datos
  seed.ts            datos iniciales
  sql/               copia de referencia del SQL manual (restricción contra reservas dobles)
```

## Desarrollo local

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Abrir http://localhost:3000.

## Scripts

| Script            | Qué hace                                   |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo                     |
| `npm run build`   | Build de producción                        |
| `npm run lint`    | ESLint                                     |
| `npm run test`    | Pruebas unitarias                          |
| `npm run db:migrate` | Crea y aplica migraciones de Prisma     |
| `npm run db:seed` | Carga datos iniciales                      |
| `npm run db:studio` | Abre Prisma Studio                       |

## Decisiones

- Las fechas se guardan en UTC; la zona horaria se guarda aparte como string IANA.
- Los horarios disponibles no se almacenan: se calculan a partir de las reglas de
  disponibilidad menos las reservas y excepciones existentes.
- La base de datos impide reservas superpuestas con una restricción `EXCLUDE`
  escrita a mano en la migración `20261006210800_booking_no_overlap`.
