export const metadata = { title: "Panel | Alero" };

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Panel de administración</h1>
      <p className="mt-4 text-neutral-600">
        Agenda, confirmación y cancelación de reservas, y gestión de disponibilidad.
        Protegido con autenticación en la fase 2.
      </p>
    </main>
  );
}
