import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Alero</h1>
      <p className="text-lg text-neutral-600">
        Academia especializada en enseñarte a diseñar y dar asesorías y clases con
        intención, estructura y un diseño pensado para quien aprende.
      </p>
      <div className="flex gap-4">
        <Link
          href="/agendar"
          className="rounded-md bg-neutral-900 px-5 py-3 text-white hover:bg-neutral-700"
        >
          Agendar una sesión
        </Link>
        <Link href="/programas" className="rounded-md border px-5 py-3 hover:bg-neutral-50">
          Ver programas
        </Link>
      </div>
    </main>
  );
}
