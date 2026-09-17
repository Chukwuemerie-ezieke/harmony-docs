import { useCallback, useEffect, useState } from "react";
import { getHistory, clearHistory, deleteHistoryEntry, type HistoryEntry } from "@/lib/workspace";

/** Reactive access to the local workspace history (device-only, metadata-only). */
export function useWorkspaceHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    void getHistory()
      .then(setEntries)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(
    (id: string) => {
      void deleteHistoryEntry(id).then(refresh);
    },
    [refresh],
  );

  const clear = useCallback(() => {
    void clearHistory().then(refresh);
  }, [refresh]);

  return { entries, loaded, refresh, remove, clear };
}
