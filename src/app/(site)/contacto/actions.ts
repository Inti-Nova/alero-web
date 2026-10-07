"use server";

import { z } from "zod";
import { sendContactMessage } from "@/modules/notifications";
import { getContactLinks } from "@/modules/settings";

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  email: z.string().trim().email("Revisa el correo."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  interest: z.enum(["adaptacion-escolar", "bilinguismo-temprano", "clases-de-ingles", "otro"], {
    message: "Elige una opción.",
  }),
  childAge: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Cuéntame un poco más, al menos unas palabras.").max(3000),
  consent: z.literal("on", { message: "Necesitamos tu consentimiento para responderte." }),
  /** Campo trampa para bots: debe llegar vacío. */
  website: z.string().max(0).optional(),
});

const interestLabel: Record<z.infer<typeof schema>["interest"], string> = {
  "adaptacion-escolar": "Adaptación escolar",
  "bilinguismo-temprano": "Bilingüismo temprano",
  "clases-de-ingles": "Clases de inglés",
  otro: "Otro",
};

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof schema>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors };
  }

  const data = parsed.data;

  try {
    const { notifyEmail } = await getContactLinks();
    await sendContactMessage({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      interest: interestLabel[data.interest],
      childAge: data.childAge || undefined,
      message: data.message,
      notifyTo: notifyEmail,
    });
    return {
      status: "success",
      message: "Gracias por escribir. Te respondo en máximo dos días hábiles.",
    };
  } catch (error) {
    console.error("[contacto] error al enviar:", error);
    return {
      status: "error",
      message: "No pude enviar tu mensaje. Intenta de nuevo o escríbeme por WhatsApp.",
    };
  }
}
