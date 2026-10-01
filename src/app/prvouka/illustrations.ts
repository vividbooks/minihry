import { useEffect, useState } from 'react';

/**
 * Obrázky prvoukových miniher = knihovna ilustrací Laioutu (Vividbooks Ultra).
 * Katalog i soubory jsou veřejné ve storage, čtou se bez přihlášení.
 */
const ILLUSTRATIONS_BASE = 'https://qypiuvqglsmxdsnyazih.supabase.co/storage/v1/object/public/platform-shared/laiout-illustrations';

/**
 * Ilustrace, které katalog uvádí, ale ve storage chybí. Vyexportované z Figmy
 * „Prvouka 2. ročník“ (stránka moodboard) leží v `public/prvouka/ill`.
 */
const LOCAL_ILLUSTRATIONS = new Set([
  'prvouka-cap-hnizdo',
  'prvouka-colek',
  'prvouka-hasici',
  'prvouka-kachna',
  'prvouka-krev-z-nosu',
  'prvouka-lisaj',
  'prvouka-netopyr',
  'prvouka-policie',
  'prvouka-rehtacka',
  'prvouka-snezanka',
  'prvouka-srnka',
  'prvouka-sykora-sedici',
  'prvouka-vlastovka',
  'prvouka-vydra',
  'prvouka-zachranka',
]);

interface CatalogItem {
  id: string;
  file: string;
  thumb: string;
}

export type IllustrationLookup = {
  ready: boolean;
  /** Adresy ilustrace (náhled, pak plný soubor); prázdné, když v knihovně není. */
  urls: (id: string) => string[];
};

let cache: Map<string, string[]> | null = null;
let pending: Promise<Map<string, string[]>> | null = null;

function loadCatalog(): Promise<Map<string, string[]>> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(`${ILLUSTRATIONS_BASE}/catalog.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Katalog ilustrací: ${response.status}`);
        return response.json();
      })
      .then((raw: { items?: CatalogItem[] } | CatalogItem[]) => {
        const items = Array.isArray(raw) ? raw : raw.items ?? [];
        const map = new Map<string, string[]>();
        for (const item of items) {
          if (!item?.id) continue;
          const paths = [item.thumb, item.file].filter(Boolean).map((path) => `${ILLUSTRATIONS_BASE}/${path}`);
          map.set(item.id, [...new Set(paths)]);
        }
        cache = map;
        return map;
      })
      .catch((error) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}

export function usePrvoukaIllustrations(): IllustrationLookup {
  const [map, setMap] = useState<Map<string, string[]> | null>(cache);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    loadCatalog()
      .then((next) => !cancelled && setMap(next))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ready: Boolean(map) || failed,
    urls: (id) => (LOCAL_ILLUSTRATIONS.has(id) ? [`/prvouka/ill/${id}.png`] : map?.get(id) ?? []),
  };
}
