import type { CollectionConfig } from "payload";
import { ValidationError } from "payload";
import { anyone, authenticated } from "../access";
import { revalidateSitePaths } from "../revalidate";

export const weekdayLabels = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateTime(value: unknown) {
  if (typeof value !== "string" || !timePattern.test(value)) {
    return "Usa el formato HH:mm, por ejemplo 09:00 o 14:30.";
  }
  return true;
}

export const AvailabilityRules: CollectionConfig = {
  slug: "availability-rules",
  labels: { singular: "Horario semanal", plural: "Horarios semanales" },
  admin: {
    useAsTitle: "label",
    group: "Agenda",
    defaultColumns: ["label", "weekday", "startTime", "endTime"],
    description:
      "Franjas en las que atiendes cada semana. Puedes crear varias para un mismo día, por ejemplo mañana y tarde.",
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (data.startTime && data.endTime && data.startTime >= data.endTime) {
          throw new ValidationError({
            collection: "availability-rules",
            errors: [{ path: "endTime", message: "La hora de fin debe ser posterior a la hora de inicio." }],
          });
        }
        const day = weekdayLabels[Number(data.weekday)] ?? "";
        data.label = `${day} ${data.startTime ?? ""} – ${data.endTime ?? ""}`.trim();
        return data;
      },
    ],
    afterChange: [() => revalidateSitePaths(["/agenda"])],
    afterDelete: [() => revalidateSitePaths(["/agenda"])],
  },
  fields: [
    {
      name: "label",
      label: "Resumen",
      type: "text",
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "weekday",
      label: "Día",
      type: "select",
      required: true,
      options: weekdayLabels.map((label, value) => ({ label, value: String(value) })),
    },
    {
      type: "row",
      fields: [
        {
          name: "startTime",
          label: "Desde",
          type: "text",
          required: true,
          validate: validateTime,
          admin: { placeholder: "09:00" },
        },
        {
          name: "endTime",
          label: "Hasta",
          type: "text",
          required: true,
          validate: validateTime,
          admin: { placeholder: "17:00" },
        },
      ],
    },
  ],
  typescript: { interface: "AvailabilityRule" },
};
