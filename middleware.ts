import { next } from "@vercel/edge";

// La landing page ("/") est la vitrine publique du site — elle doit rester
// visible sans mot de passe, même si l'inscription/connexion restent protégées
// tant que le site n'est pas ouvert au public. La page /m/:sessionId (QR code
// d'import de photos) reste publique pour la même raison que le téléphone n'a
// jamais l'occasion de s'authentifier. Les fichiers statiques sont exclus pareil.
function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/m/")) return true;
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

// Protège tout le site par mot de passe tant qu'il n'est pas ouvert au public.
// Désactivé automatiquement si SITE_PASSWORD n'est pas défini.
export default function middleware(request: Request) {
  const { pathname } = new URL(request.url);
  if (isPublicPath(pathname)) {
    return next();
  }

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
