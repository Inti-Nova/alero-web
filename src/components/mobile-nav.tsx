"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { navigation } from "@/config/site";

export function MobileNav() {
  const pathname = usePathname();
  const panelId = useId();
  // El menú se considera abierto solo para la ruta en la que se abrió:
  // al navegar a otra página se cierra solo, sin efectos.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenAt(open ? null : pathname)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-tinta/20"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        <svg
          aria-hidden
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <nav
          id={panelId}
          aria-label="Menú principal"
          className="absolute inset-x-0 top-full border-b border-linea bg-crema shadow-lg"
        >
          <ul className="container-site flex flex-col py-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                  className="block rounded-lg px-3 py-3 text-lg font-semibold hover:bg-crema-dark aria-[current=page]:text-terracota-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 px-3 pb-2">
              <Link
                href="/agenda"
                className="block rounded-full bg-terracota px-5 py-3 text-center font-semibold text-tinta"
              >
                Agendar una sesión
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
