import { next } from "@vercel/edge";

// La page /m/:sessionId est ouverte par le téléphone en scannant un QR code
// (import de photos de cours) — elle doit rester accessible sans le mot de passe
// du site, sinon le téléphone se heurte au pop-up d'auth avant même d'arriver dessus.
// Les fichiers statiques (JS/CSS/images) dont cette page a besoin sont exclus pareil.
function isPublicPath(pathname: string): boolean {
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
