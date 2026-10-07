"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { cancelBooking, type CancelState } from "./actions";

export function CancelForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<CancelState, FormData>(cancelBooking, { status: "idle" });

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-xl border border-salvia/50 bg-salvia-soft px-4 py-3">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.status === "error" && (
        <p role="alert" className="rounded-xl border border-terracota/40 bg-terracota-soft/60 px-4 py-3">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor="reason" className="font-semibold">
          Motivo <span className="font-normal text-tinta-soft">(opcional)</span>
        </label>
        <input
          id="reason"
          name="reason"
          maxLength={300}
          className="mt-1 w-full rounded-xl border border-linea bg-white/80 px-4 py-3"
        />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Cancelando…" : "Cancelar esta reserva"}
      </Button>
    </form>
  );
}
