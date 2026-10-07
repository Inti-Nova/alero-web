import type { Access } from "payload";

/** Solo usuarios con sesión en el panel. */
export const authenticated: Access = ({ req }) => Boolean(req.user);

/** Cualquiera, incluido el sitio público sin sesión. */
export const anyone: Access = () => true;

/** Lectura pública solo de documentos publicados; con sesión se ve todo. */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};
