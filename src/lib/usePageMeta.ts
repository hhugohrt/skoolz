import { useEffect } from "react";

export const SITE_URL = "https://www.skoolz.club";

function upsert<T extends HTMLElement>(selector: string, create: () => T): T {
  const existing = document.head.querySelector<T>(selector);
  if (existing) return existing;
  const el = create();
  document.head.appendChild(el);
  return el;
}

interface PageMeta {
  title: string;
  description?: string;
  // Seule la page d'accueil est destinée à être référencée ; le reste (compte, app, upload mobile)
  // est en noindex, y compris le jour où le site sera ouvert au public.
  indexable?: boolean;
  path?: string;
}

// Le site est une SPA : index.html porte les balises par défaut (utiles aux robots qui n'exécutent
// pas le JS, comme les aperçus de partage), et chaque page les ajuste ici pour les navigateurs et Google.
export function usePageMeta({ title, description, indexable = false, path = "/" }: PageMeta) {
  useEffect(() => {
    document.title = title;

    const robots = upsert<HTMLMetaElement>('meta[name="robots"]', () => {
      const el = document.createElement("meta");
      el.name = "robots";
      return el;
    });
    robots.content = indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow";

    if (description) {
      const meta = upsert<HTMLMetaElement>('meta[name="description"]', () => {
        const el = document.createElement("meta");
        el.name = "description";
        return el;
      });
      meta.content = description;
    }

    const canonical = upsert<HTMLLinkElement>('link[rel="canonical"]', () => {
      const el = document.createElement("link");
      el.rel = "canonical";
      return el;
    });
    canonical.href = `${SITE_URL}${path}`;
  }, [title, description, indexable, path]);
}
