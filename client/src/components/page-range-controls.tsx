import { useState } from "react";
import { parsePageRanges } from "@/lib/pdf-release1";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    <div className="space-y-2">
      <Label htmlFor="page-range" className="text-base">Pages</Label>
      <Input
        id="page-range"
        value={value}
        onChange={(event) => apply(event.target.value)}
        placeholder={`All pages, or e.g. 1-3, 5 (1-${pageCount})`}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      <div className="text-sm text-muted-foreground">
        Leave blank to apply to all pages.
      </div>
      {error && <p className="text-sm text-destructive font-medium" role="alert">{error}</p>}
    </div>
  );
}
