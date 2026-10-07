import { revalidatePath } from "next/cache";

/**
 * Invalida páginas del sitio cuando cambia contenido en el panel.
 * Fuera de una petición de Next (por ejemplo, en la carga inicial) revalidatePath
 * lanza error; por eso se ignora en silencio.
 */
export function revalidateSitePaths(paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      // Sin contexto de Next: no hay nada que invalidar.
    }
  }
}

/** Obtiene el id de una relación, venga poblada o como id suelto. */
export function relationId<T extends { id: number | string }>(
  value: T | number | string | null | undefined,
): number | string | undefined {
  if (value == null) return undefined;
  return typeof value === "object" ? value.id : value;
}
