import type { CollectionConfig } from "payload";
import { ValidationError } from "payload";
import { authenticated } from "../access";
import { revalidateSitePaths } from "../revalidate";

export const BlockedDates: CollectionConfig = {
  slug: "blocked-dates",
  labels: { singular: "Bloqueo", plural: "Bloqueos" },
  admin: {
    useAsTitle: "reason",
    group: "Agenda",
    defaultColumns: ["reason", "startAt", "endAt"],
    description:
      "Vacaciones, festivos o compromisos. Durante estos periodos no se ofrecen horarios aunque haya horario semanal.",
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.startAt && data?.endAt && new Date(data.endAt) <= new Date(data.startAt)) {
          throw new ValidationError({
            collection: "blocked-dates",
            errors: [{ path: "endAt", message: "El fin del bloqueo debe ser posterior al inicio." }],
          });
        }
        return data;
      },
    ],
    afterChange: [() => revalidateSitePaths(["/agenda"])],
    afterDelete: [() => revalidateSitePaths(["/agenda"])],
  },
  fields: [
    {
      name: "reason",
      label: "Motivo",
      type: "text",
      required: true,
      admin: { placeholder: "Vacaciones, festivo, cita médica…" },
    },
    {
      type: "row",
      fields: [
        {
          name: "startAt",
          label: "Desde",
          type: "date",
          required: true,
          admin: {
            date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy HH:mm", timeIntervals: 15 },
          },
        },
        {
          name: "endAt",
          label: "Hasta",
          type: "date",
          required: true,
          admin: {
            date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy HH:mm", timeIntervals: 15 },
          },
        },
      ],
    },
  ],
  typescript: { interface: "BlockedDate" },
};
