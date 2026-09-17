/**
 * Local, device-only persistence for favourites and recently-used tools.
 * Everything lives in localStorage — no account, no upload — consistent with
 * HarmonyDocs' privacy-first, local-first positioning. Only tool ids (short,
 * non-personal strings) are stored; never file names or document content.
 */

const FAVORITES_KEY = "harmonydocs-favorites";
const RECENTS_KEY = "harmonydocs-recents";
const MAX_RECENTS = 8;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readIds(key: string): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Storage may be full or blocked (private mode); preferences are best-effort.
  }
}

export function getFavorites(): string[] {
  return readIds(FAVORITES_KEY);
}

export function isFavorite(toolId: string): boolean {
  return getFavorites().includes(toolId);
}

/** Toggle a favourite and return the updated list. */
export function toggleFavorite(toolId: string): string[] {
  const current = getFavorites();
  const next = current.includes(toolId)
    ? current.filter((id) => id !== toolId)
    : [...current, toolId];
  writeIds(FAVORITES_KEY, next);
  return next;
}

export function getRecents(): string[] {
  return readIds(RECENTS_KEY);
}

/** Record a tool as recently used (most-recent first, de-duplicated, capped). */
export function recordRecent(toolId: string): string[] {
  const current = getRecents().filter((id) => id !== toolId);
  const next = [toolId, ...current].slice(0, MAX_RECENTS);
  writeIds(RECENTS_KEY, next);
  return next;
}

export function clearRecents(): void {
  writeIds(RECENTS_KEY, []);
}

export const RECENTS_LIMIT = MAX_RECENTS;
