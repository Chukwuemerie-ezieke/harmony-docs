import { STORE_HISTORY, STORE_SETTINGS, idbPut, idbGetAll, idbDelete, idbClear } from "@/lib/idb";

/**
 * Local document workspace: recent-work history and saved per-tool settings.
 *
 * PRIVACY: this stores METADATA ONLY — a tool id, the output file name, its
 * size, and a timestamp. It never stores document contents, extracted text,
 * passwords, or personal data. Everything lives in the browser's IndexedDB on
 * the user's device and is never uploaded. History entries expire automatically.
 */

/** How long a history entry is kept before it is considered expired. */
export const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
/** Cap on stored history entries to keep the store small. */
export const HISTORY_LIMIT = 30;

export interface HistoryEntry {
  id: string;
  toolId: string;
  /** Human-readable output name, e.g. "merged.pdf". Not the source file name. */
  outputName: string;
  /** Output size in bytes, for display only. */
  outputBytes: number;
  /** Epoch millis when the work completed. */
  completedAt: number;
}

export interface ToolSettings {
  toolId: string;
  /** Small JSON-serialisable settings blob (e.g. watermark text, quality). */
  values: Record<string, unknown>;
  updatedAt: number;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Record a completed piece of work (metadata only). */
export async function recordWork(input: {
  toolId: string;
  outputName: string;
  outputBytes: number;
}): Promise<void> {
  const entry: HistoryEntry = {
    id: newId(),
    toolId: input.toolId,
    outputName: input.outputName,
    outputBytes: input.outputBytes,
    completedAt: Date.now(),
  };
  await idbPut(STORE_HISTORY, entry);
  // Opportunistically prune so the store stays bounded.
  await pruneHistory();
}

/** Return recent work, newest first, excluding expired entries. */
export async function getHistory(now: number = Date.now()): Promise<HistoryEntry[]> {
  const all = await idbGetAll<HistoryEntry>(STORE_HISTORY);
  return all
    .filter((entry) => now - entry.completedAt < HISTORY_TTL_MS)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, HISTORY_LIMIT);
}

/** Remove expired entries and trim to the limit. Safe to call anytime. */
export async function pruneHistory(now: number = Date.now()): Promise<void> {
  const all = await idbGetAll<HistoryEntry>(STORE_HISTORY);
  const live = all
    .filter((entry) => now - entry.completedAt < HISTORY_TTL_MS)
    .sort((a, b) => b.completedAt - a.completedAt);
  const keep = new Set(live.slice(0, HISTORY_LIMIT).map((e) => e.id));
  await Promise.all(all.filter((e) => !keep.has(e.id)).map((e) => idbDelete(STORE_HISTORY, e.id)));
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await idbDelete(STORE_HISTORY, id);
}

export async function clearHistory(): Promise<void> {
  await idbClear(STORE_HISTORY);
}

/** Save (small) settings for a tool, so options are remembered next visit. */
export async function saveToolSettings(toolId: string, values: Record<string, unknown>): Promise<void> {
  const record: ToolSettings = { toolId, values, updatedAt: Date.now() };
  await idbPut(STORE_SETTINGS, record);
}

export async function getToolSettings<T extends Record<string, unknown>>(
  toolId: string,
): Promise<T | undefined> {
  const all = await idbGetAll<ToolSettings>(STORE_SETTINGS);
  const match = all.find((s) => s.toolId === toolId);
  return match?.values as T | undefined;
}

/** Wipe everything the workspace stores — the user-facing "clear all". */
export async function clearWorkspace(): Promise<void> {
  await Promise.all([idbClear(STORE_HISTORY), idbClear(STORE_SETTINGS)]);
}
