import { useState } from "react";
import { parsePageRanges } from "@/lib/pdf-release1";

export function PageRangeControls({ pageCount, onChange }: { pageCount: number; onChange: (pages: number[]) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function apply(nextValue: string) {
    setValue(nextValue);
    if (!nextValue.trim()) {
      setError("");
      onChange(Array.from({ length: pageCount }, (_, index) => index));
      return;
    }
    try {
      const pages = parsePageRanges(nextValue, pageCount);
      setError("");
      onChange(pages);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid page range.");
    }
  }

  return (
    <label>
      Pages
      <input value={value} onChange={(event) => apply(event.target.value)} placeholder={`All pages, or e.g. 1-3, 5 (1-${pageCount})`} aria-invalid={Boolean(error)} />
      <span>Leave blank to apply to all pages.</span>
      {error && <span role="alert">{error}</span>}
    </label>
  );
}
