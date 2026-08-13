import { useEffect, useMemo, useState } from "react";
import { organizePdfPlan } from "@/lib/pdf-release1-engine";

type PageItem = { id: string; sourceIndex: number | "blank"; selected: boolean };

function createItems(pageCount: number): PageItem[] {
  return Array.from({ length: pageCount }, (_, index) => ({ id: `page-${index}`, sourceIndex: index, selected: false }));
}

export function PdfPageOrganizer({ file, onComplete }: { file: File; onComplete: (data: Uint8Array) => void }) {
  const [items, setItems] = useState<PageItem[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        if (cancelled) return;
        setPageCount(pdf.getPageCount());
        setItems(createItems(pdf.getPageCount()));
      } catch {
        if (!cancelled) setError("This PDF could not be read. It may be damaged or password protected.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [file]);

  const selectedCount = useMemo(() => items.filter((item) => item.selected).length, [items]);

  function move(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateSelected(action: "duplicate" | "delete" | "extract") {
    setItems((current) => {
      if (action === "delete") return current.filter((item) => !item.selected);
      if (action === "extract") return current.filter((item) => item.selected);
      return current.flatMap((item) => item.selected ? [item, { ...item, id: crypto.randomUUID(), selected: false }] : [item]);
    });
  }

  function insertBlank(afterIndex: number) {
    setItems((current) => {
      const next = [...current];
      next.splice(afterIndex + 1, 0, { id: crypto.randomUUID(), sourceIndex: "blank", selected: false });
      return next;
    });
  }

  async function process() {
    if (items.length === 0) return;
    setProcessing(true);
    setError("");
    try {
      onComplete(await organizePdfPlan(file, items.map((item) => item.sourceIndex)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The PDF could not be organised.");
    } finally {
      setProcessing(false);
    }
  }

  if (error) return <p role="alert">{error}</p>;
  if (!pageCount) return <p>Reading PDF pages…</p>;

  return (
    <section aria-label="Organise PDF pages">
      <p>{items.length} pages in the output plan. {selectedCount} selected.</p>
      <div role="list" aria-label="PDF pages">
        {items.map((item, index) => (
          <article key={item.id} role="listitem">
            <label>
              <input type="checkbox" checked={item.selected} onChange={(event) => setItems((current) => current.map((page) => page.id === item.id ? { ...page, selected: event.target.checked } : page))} />
              {item.sourceIndex === "blank" ? "Blank page" : `Page ${item.sourceIndex + 1}`}
            </label>
            <button type="button" onClick={() => move(item.id, -1)} disabled={index === 0}>Move up</button>
            <button type="button" onClick={() => move(item.id, 1)} disabled={index === items.length - 1}>Move down</button>
            <button type="button" onClick={() => insertBlank(index)}>Insert blank after</button>
          </article>
        ))}
      </div>
      <div>
        <button type="button" onClick={() => updateSelected("duplicate")} disabled={!selectedCount}>Duplicate selected</button>
        <button type="button" onClick={() => updateSelected("extract")} disabled={!selectedCount}>Keep selected only</button>
        <button type="button" onClick={() => updateSelected("delete")} disabled={!selectedCount || selectedCount === items.length}>Delete selected</button>
        <button type="button" onClick={() => setItems(createItems(pageCount))}>Reset</button>
        <button type="button" onClick={() => void process()} disabled={processing || items.length === 0}>{processing ? "Creating PDF…" : "Create organised PDF"}</button>
      </div>
    </section>
  );
}
