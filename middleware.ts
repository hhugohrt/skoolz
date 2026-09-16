import { next } from "@vercel/edge";

// Protège tout le site par mot de passe tant qu'il n'est pas ouvert au public.
// Désactivé automatiquement si SITE_PASSWORD n'est pas défini.
export default function middleware(request: Request) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    return next();
  }

  const siteUser = process.env.SITE_USER ?? "skoolz";
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    if (user === siteUser && pass === sitePassword) {
      return next();
    }
  }

  return new Response("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Skoolz"' },
  });
}
