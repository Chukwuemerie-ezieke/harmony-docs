import { useEffect, useState } from "react";
import { getPDFPageCount } from "@/lib/pdf-engine";

interface PdfPageCountState {
  pageCount: number;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a PDF's page count in an effect (never during render), with loading
 * and error state. Resets when the file changes or is removed. This replaces
 * the fragile render-time `getPDFPageCount(...).then(setState)` pattern that
 * several tools previously used.
 */
export function usePdfPageCount(file: File | undefined): PdfPageCountState {
  const [state, setState] = useState<PdfPageCountState>({ pageCount: 0, loading: false, error: null });

  useEffect(() => {
    if (!file) {
      setState({ pageCount: 0, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ pageCount: 0, loading: true, error: null });
    getPDFPageCount(file)
      .then((count) => {
        if (!cancelled) setState({ pageCount: count, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ pageCount: 0, loading: false, error: "This PDF could not be read. It may be damaged or password protected." });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  return state;
}
