import { useCallback, useEffect, useState } from "react";
import {
  getFavorites,
  getRecents,
  toggleFavorite as toggleFavoriteStore,
  recordRecent as recordRecentStore,
  clearRecents as clearRecentsStore,
} from "@/lib/tool-preferences";

/**
 * Reactive access to favourites and recently-used tools. Backed by
 * localStorage and kept in sync across tabs via the `storage` event.
 */
export function useToolPreferences() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
    setRecents(getRecents());

    const onStorage = () => {
      setFavorites(getFavorites());
      setRecents(getRecents());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites(toggleFavoriteStore(toolId));
  }, []);

  const clearRecents = useCallback(() => {
    clearRecentsStore();
    setRecents([]);
  }, []);

  return {
    favorites,
    recents,
    isFavorite: (id: string) => favorites.includes(id),
    toggleFavorite,
    clearRecents,
  };
}

/** Records a tool as recently used exactly once per mount. */
export function useRecordRecent(toolId: string | undefined) {
  useEffect(() => {
    if (toolId) recordRecentStore(toolId);
  }, [toolId]);
}
