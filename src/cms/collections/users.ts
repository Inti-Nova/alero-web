import type { CollectionConfig } from "payload";
import { authenticated } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuario", plural: "Usuarios" },
  auth: true,
  admin: {
    useAsTitle: "name",
    group: "Administración",
    description: "Personas con acceso a este panel.",
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "name",
      label: "Nombre",
      type: "text",
      required: true,
    },
  ],
  typescript: { interface: "User" },
};
