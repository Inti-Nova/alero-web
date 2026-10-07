import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { CollectionConfig } from "payload";
import { ValidationError } from "payload";
import { sendBookingStatusEmail } from "@/modules/notifications/bookings";
import { authenticated } from "../access";
import { relationId, revalidateSitePaths } from "../revalidate";

export const bookingStatusLabels = {
  pending: "Pendiente de confirmar",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Realizada",
} as const;

export type BookingStatus = keyof typeof bookingStatusLabels;

export const activeBookingStatuses: BookingStatus[] = ["pending", "confirmed"];

export const Bookings: CollectionConfig = {
  slug: "bookings",
  labels: { singular: "Reserva", plural: "Reservas" },
  admin: {
    useAsTitle: "title",
    group: "Agenda",
    defaultColumns: ["title", "status", "student", "startAt"],
    listSearchableFields: ["title"],
    description:
      "Cada sesión reservada. Al cambiar el estado a «Confirmada» o «Cancelada» se envía un correo a la familia.",
  },
  defaultSort: "-startAt",
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc, operation }) => {
        if (!data) return data;

        const serviceId = relationId(data.service ?? originalDoc?.service);
        const startAt = data.startAt ?? originalDoc?.startAt;
        if (!serviceId || !startAt) return data;

        const service = await req.payload.findByID({
          collection: "services",
          id: serviceId,
          depth: 0,
          req,
        });
        const settings = await req.payload.findGlobal({ slug: "agenda-settings", depth: 0, req });

        const start = new Date(startAt);
        const end = addMinutes(start, service.durationMinutes);
        data.endAt = end.toISOString();
        data.title = `${service.shortName} · ${formatInTimeZone(start, settings.timezone, "d MMM yyyy, HH:mm")}`;

        const status = (data.status ?? originalDoc?.status ?? "pending") as BookingStatus;
        if (!activeBookingStatuses.includes(status)) return data;

        const overlapping = await req.payload.find({
          collection: "bookings",
          depth: 0,
          limit: 1,
          req,
          where: {
            and: [
              { status: { in: activeBookingStatuses } },
              { startAt: { less_than: end.toISOString() } },
              { endAt: { greater_than: start.toISOString() } },
              ...(operation === "update" && originalDoc?.id
                ? [{ id: { not_equals: originalDoc.id } }]
                : []),
            ],
          },
        });

        if (overlapping.totalDocs > 0) {
          throw new ValidationError({
            collection: "bookings",
            errors: [
              {
                path: "startAt",
                message: "Ese horario se cruza con otra reserva activa.",
              },
            ],
          });
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        revalidateSitePaths(["/agenda"]);
        if (operation !== "update") return;
        if (!previousDoc || previousDoc.status === doc.status) return;
        if (doc.status === "confirmed" || doc.status === "cancelled") {
          try {
            await sendBookingStatusEmail({ bookingId: doc.id, payload: req.payload });
          } catch (error) {
            req.payload.logger.error({ err: error }, "No se pudo enviar el correo de la reserva");
          }
        }
      },
    ],
    afterDelete: [() => revalidateSitePaths(["/agenda"])],
  },
  fields: [
    {
      name: "title",
      label: "Resumen",
      type: "text",
      admin: { readOnly: true, hidden: true },
    },
    {
      type: "row",
      fields: [
        {
          name: "service",
          label: "Servicio",
          type: "relationship",
          relationTo: "services",
          required: true,
        },
        {
          name: "student",
          label: "Familia",
          type: "relationship",
          relationTo: "students",
          required: true,
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "startAt",
          label: "Inicio",
          type: "date",
          required: true,
          admin: {
            date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy HH:mm", timeIntervals: 15 },
          },
        },
        {
          name: "endAt",
          label: "Fin",
          type: "date",
          admin: {
            readOnly: true,
            description: "Se calcula con la duración del servicio.",
            date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy HH:mm" },
          },
        },
      ],
    },
    {
      name: "status",
      label: "Estado",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: Object.entries(bookingStatusLabels).map(([value, label]) => ({ label, value })),
      admin: { position: "sidebar" },
    },
    {
      name: "notes",
      label: "Mensaje de la familia",
      type: "textarea",
    },
    {
      name: "cancelReason",
      label: "Motivo de cancelación",
      type: "text",
      admin: { condition: (data) => data?.status === "cancelled" },
    },
    {
      name: "studentTimezone",
      label: "Zona horaria de la familia",
      type: "text",
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "consentAt",
      label: "Consentimiento aceptado el",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy HH:mm" },
      },
    },
    {
      name: "source",
      label: "Origen",
      type: "select",
      defaultValue: "admin",
      options: [
        { label: "Sitio web", value: "web" },
        { label: "Panel", value: "admin" },
      ],
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "manageToken",
      label: "Token de gestión",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
    },
  ],
  typescript: { interface: "Booking" },
};
