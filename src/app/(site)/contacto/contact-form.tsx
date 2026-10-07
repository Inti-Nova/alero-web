"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui";
import { submitContact, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded-xl border border-linea bg-white/80 px-4 py-3 text-base placeholder:text-tinta-soft/70 focus-visible:border-terracota-deep";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-semibold text-terracota-deep">
      {message}
    </p>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-card border border-salvia/50 bg-salvia-soft p-6">
        <p className="text-xl font-semibold">Mensaje enviado</p>
        <p className="mt-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-xl border border-terracota/40 bg-terracota-soft/60 px-4 py-3">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-semibold">
            Tu nombre
          </label>
          <input id="name" name="name" autoComplete="name" required className={inputClass} />
          <FieldError message={errors.name} />
        </div>
        <div>
          <label htmlFor="email" className="font-semibold">
            Correo electrónico
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
          <FieldError message={errors.email} />
        </div>
        <div>
          <label htmlFor="phone" className="font-semibold">
            WhatsApp <span className="font-normal text-tinta-soft">(opcional)</span>
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <label htmlFor="interest" className="font-semibold">
            ¿Sobre qué quieres hablar?
          </label>
          <select id="interest" name="interest" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Elige una opción
            </option>
            <option value="adaptacion-escolar">Adaptación escolar</option>
            <option value="bilinguismo-temprano">Bilingüismo temprano</option>
            <option value="clases-de-ingles">Clases de inglés</option>
            <option value="otro">Otro</option>
          </select>
          <FieldError message={errors.interest} />
        </div>
      </div>

      <div>
        <label htmlFor="childAge" className="font-semibold">
          Edad de tu hijo o hija <span className="font-normal text-tinta-soft">(opcional)</span>
        </label>
        <input id="childAge" name="childAge" inputMode="numeric" placeholder="Por ejemplo: 4 años" className={inputClass} />
        <FieldError message={errors.childAge} />
      </div>

      <div>
        <label htmlFor="message" className="font-semibold">
          Cuéntame qué está pasando
        </label>
        <textarea id="message" name="message" rows={5} required className={inputClass} />
        <FieldError message={errors.message} />
      </div>

      {/* Campo trampa para bots, oculto a personas y lectores de pantalla. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex gap-3">
          <input type="checkbox" name="consent" required className="mt-1.5 h-4 w-4 shrink-0 accent-terracota-deep" />
          <span className="text-sm">
            Soy el padre, la madre o el adulto responsable, y autorizo el tratamiento de los datos
            que comparto en este formulario, incluidos los de mi hijo o hija, según la{" "}
            <Link href="/privacidad" className="font-bold text-terracota-deep underline-offset-4 hover:underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        <FieldError message={errors.consent} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
