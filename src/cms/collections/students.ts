import type { CollectionConfig } from "payload";
import { authenticated } from "../access";

export const Students: CollectionConfig = {
  slug: "students",
  labels: { singular: "Familia", plural: "Familias" },
  admin: {
    useAsTitle: "parentName",
    group: "Agenda",
    defaultColumns: ["parentName", "email", "phone", "childAge"],
    description:
      "Datos de contacto del adulto responsable y, si los compartió, del niño o niña. Se crean solos al reservar.",
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "parentName", label: "Nombre del adulto", type: "text", required: true },
        {
          name: "email",
          label: "Correo",
          type: "email",
          required: true,
          unique: true,
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "phone", label: "WhatsApp", type: "text" },
        { name: "childName", label: "Nombre del niño o niña", type: "text" },
        { name: "childAge", label: "Edad", type: "text" },
      ],
    },
    {
      name: "notes",
      label: "Notas internas",
      type: "textarea",
      admin: { description: "Solo visibles en este panel." },
    },
    {
      name: "consentAt",
      label: "Consentimiento parental aceptado el",
      type: "date",
      admin: {
        readOnly: true,
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime", displayFormat: "d MMM yyyy HH:mm" },
      },
    },
  ],
  typescript: { interface: "Student" },
};
