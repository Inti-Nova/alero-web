import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../access";
import { revalidateSitePaths } from "../revalidate";

export const AgendaSettings: GlobalConfig = {
  slug: "agenda-settings",
  label: "Ajustes de agenda",
  admin: {
    group: "Agenda",
    description: "Reglas generales de la agenda pública.",
  },
  access: { read: anyone, update: authenticated },
  hooks: {
    afterChange: [() => revalidateSitePaths(["/agenda"])],
  },
  fields: [
    {
      name: "timezone",
      label: "Zona horaria",
      type: "text",
      required: true,
      defaultValue: "America/Bogota",
      admin: {
        description: "Nombre IANA. Los horarios semanales se interpretan en esta zona.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "slotStepMinutes",
          label: "Cada cuántos minutos se ofrece un horario",
          type: "number",
          required: true,
          defaultValue: 30,
          min: 5,
          max: 120,
        },
        {
          name: "bufferMinutes",
          label: "Descanso entre sesiones (minutos)",
          type: "number",
          required: true,
          defaultValue: 15,
          min: 0,
          max: 120,
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "minNoticeHours",
          label: "Antelación mínima para reservar (horas)",
          type: "number",
          required: true,
          defaultValue: 24,
          min: 0,
        },
        {
          name: "maxDaysAhead",
          label: "Hasta cuántos días adelante se puede reservar",
          type: "number",
          required: true,
          defaultValue: 42,
          min: 1,
          max: 365,
        },
      ],
    },
    {
      name: "confirmationMessage",
      label: "Instrucciones tras reservar",
      type: "textarea",
      required: true,
      defaultValue:
        "Para confirmar tu sesión, realiza el pago del paquete por Nequi, Daviplata o con el link de pago que te enviaremos por WhatsApp. En cuanto lo recibamos te llegará la confirmación con el enlace de la videollamada.",
      admin: {
        description:
          "Se muestra en pantalla y en el correo cuando alguien reserva. Ideal para explicar cómo pagar.",
      },
    },
  ],
  typescript: { interface: "AgendaSetting" },
};
