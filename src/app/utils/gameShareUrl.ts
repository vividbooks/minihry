/**
 * Sdílená URL minihry: krátký odkaz pro QR z tabule.
 *
 * Nové odkazy nesou jen odchylky od výchozího nastavení a kódují `config`
 * jednou (přes URLSearchParams). Staré odkazy s celým JSON a dvojitým
 * encodeURIComponent pořád načteme.
 */

export function settingsValuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => settingsValuesEqual(value, b[index]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    if (keys.length !== Object.keys(right).length) return false;
    return keys.every((key) => settingsValuesEqual(left[key], right[key]));
  }
  return false;
}

export function compactGameSettings(
  settings: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const delta: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    if (!settingsValuesEqual(value, defaults[key])) {
      delta[key] = value;
    }
  }
  return delta;
}

export function mergeGameSettings(
  defaults: Record<string, unknown>,
  override: Record<string, unknown> | null,
): Record<string, unknown> {
  return { ...defaults, ...(override || {}) };
}

/** Staré i nové `config` z query — URLSearchParams.get už jednou dekóduje. */
export function parseGameConfigParam(raw: string | null | undefined): Record<string, unknown> | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value) return null;

  const tryParse = (input: string): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(input);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // zkusí se další varianta
    }
    return null;
  };

  return tryParse(value) || tryParse(decodeURIComponent(value));
}

export function buildGameShareURL(
  baseUrl: string,
  gameId: string,
  compactSettings: Record<string, unknown>,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('game', gameId);
  url.searchParams.delete('config');
  if (Object.keys(compactSettings).length > 0) {
    url.searchParams.set('config', JSON.stringify(compactSettings));
  }
  return url.toString();
}
