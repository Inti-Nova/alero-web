# Alero Web

Sitio web y sistema de agendamiento de la academia Alero: información de los programas y
reserva de clases y asesorías.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 con tokens de la marca
- Payload CMS 3 embebido en la misma app: panel en `/admin`, PostgreSQL
- Resend (por HTTP) para correos de contacto y reservas
- Vitest para la lógica de agenda

## Qué administra la clienta desde `/admin`

| Sección | Qué hace |
| --- | --- |
| Agenda → Reservas | Ver, confirmar y cancelar sesiones. Confirmar o cancelar envía correo a la familia. |
| Agenda → Familias | Datos de contacto de quienes reservan. Se crean solos al reservar. |
| Agenda → Horarios semanales | Franjas de atención por día de la semana. |
| Agenda → Bloqueos | Vacaciones, festivos, compromisos. |
| Agenda → Servicios | Nombre, duración, precio y qué incluye cada paquete. |
| Agenda → Ajustes de agenda | Zona horaria, antelación mínima, horizonte, descanso entre sesiones, instrucciones de pago. |
| Contenido → Recursos | Artículos del blog con borradores, autoguardado e imágenes. |
| Administración → Ajustes del sitio | WhatsApp, correo, Instagram, rango de precios y formas de pago. |

Los textos de las páginas (inicio, sobre mí, landings) viven en código y los cambia el equipo.

## Estructura

```
src/
  payload.config.ts    configuración de Payload (colecciones, globales, base de datos)
  cms/
    collections/       reservas, familias, horarios, bloqueos, servicios, recursos, imágenes, usuarios
    globals/           ajustes del sitio y de la agenda
    db-constraints.ts  restricción EXCLUDE contra reservas dobles (se aplica al arrancar)
    seed.ts            carga inicial de servicios y horario (solo si está vacío)
  app/
    (site)/            páginas públicas con cabecera y pie compartidos
      agenda/          calendario propio: servicio → día → hora → datos → confirmación
      agenda/reserva/[token]  página para que la familia cancele
      recursos/        lista y detalle de artículos desde Payload
    (payload)/         rutas del panel y de la API REST de Payload
    api/health         comprobación de vida
  components/          cabecera, pie, botones, tarjetas, aviso legal
  config/site.ts       nombre de marca, textos fijos, navegación
  content/services.ts  datos semilla de los servicios
  modules/
    scheduling/        cálculo de horarios (puro, con tests) y consulta de disponibilidad
    notifications/     correos de contacto y de reservas
    catalog/, posts/, settings/   lecturas tipadas desde Payload para las páginas
docs/brief/            especificación de marca y sitio entregada por la clienta
```

## Marca y contenido

- El nombre de marca es Alero. Se configura con `NEXT_PUBLIC_BRAND_NAME` por si hay que
  ajustar la escritura.
- Colores y tipografías del brief viven como tokens en `src/app/globals.css`.
  Los acentos originales no cumplen contraste AA con texto blanco, por eso los botones
  de acento usan texto oscuro y existen variantes `-deep` para texto y enlaces.
- El aviso de que el acompañamiento no es terapia aparece en el pie, en las landings de
  acompañamiento y en Sobre mí. No quitarlo.

## Desarrollo local

```bash
cp .env.example .env        # y completa PAYLOAD_SECRET
docker compose up -d
npm install
npm run generate:types
npm run dev
```

Abrir http://localhost:3000 y http://localhost:3000/admin. En el primer arranque Payload
crea las tablas, aplica la restricción contra reservas dobles, carga los servicios y un
horario de lunes a viernes, y pide crear el primer usuario del panel.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (sitio + panel) |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Pruebas unitarias de la agenda |
| `npm run generate:types` | Regenera `src/payload-types.ts` tras cambiar colecciones |
| `npm run generate:importmap` | Regenera el mapa de componentes del panel |
| `npm run migrate:create` | Crea una migración para producción tras cambiar el esquema |
| `npm run migrate` | Aplica migraciones en producción |

## Decisiones

- Agenda propia en lugar de Calendly: los datos de familias y menores quedan bajo control
  de la clienta, la reserva lleva consentimiento parental y todo se administra en un solo panel.
- Las fechas se guardan en UTC; la zona horaria de la familia se guarda aparte.
- Los horarios disponibles no se almacenan: se calculan a partir del horario semanal menos
  bloqueos y reservas, con antelación mínima, horizonte máximo y descanso entre sesiones.
- Una reserva nace «pendiente». La clienta la confirma desde el panel cuando recibe el pago y
  la familia recibe el correo de confirmación.
- La base de datos impide reservas superpuestas con una restricción `EXCLUDE` que se aplica
  al arrancar (`src/cms/db-constraints.ts`), además de la validación en la colección.
- En desarrollo Payload sincroniza el esquema solo. En producción se usan migraciones.
- Las imágenes se guardan en disco en `media/`. Antes de desplegar en Vercel hay que
  cambiar a un adaptador de almacenamiento (Vercel Blob o S3).
