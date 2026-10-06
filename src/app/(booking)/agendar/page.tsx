export const metadata = { title: "Agendar | Alero" };

export default function AgendarPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Agenda tu sesión</h1>
      <p className="mt-4 text-neutral-600">
        Flujo de reserva: elegir servicio → elegir fecha → elegir horario → tus datos →
        confirmación. Se implementa en la fase 2 sobre el módulo <code>scheduling</code>.
      </p>
    </main>
  );
}
