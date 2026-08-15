import { useEffect, useMemo, useRef, useState } from "react";
import { organizePdfPlan } from "@/lib/pdf-release1-engine";

const PDFJS_VERSION = "4.4.168";

type PageItem = { id: string; sourceIndex: number | "blank"; selected: boolean; thumbnail?: string };

function createItems(pageCount: number): PageItem[] {
  return Array.from({ length: pageCount }, (_, index) => ({ id: `page-${index}`, sourceIndex: index, selected: false }));
}

async function renderThumbnails(file: File, count: number): Promise<string[]> {
  const pdfjsLib: any = await import(/* @vite-ignore */ `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.mjs`);
  const pdfjsLib: any = await import(/* @vite-ignore */ `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.mjs` as any);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const thumbnails: string[] = [];
  for (let index = 1; index <= count; index += 1) {
    const page = await pdf.getPage(index);
    const viewport = page.getViewport({ scale: 0.35 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) continue;
    await page.render({ canvasContext: context, viewport }).promise;
    thumbnails.push(canvas.toDataURL("image/png"));
  }
  return thumbnails;
}

export function PdfPageOrganizer({ file, onComplete }: { file: File; onComplete: (data: Uint8Array) => void }) {
  const [items, setItems] = useState<PageItem[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loadingThumbnails, setLoadingThumbnails] = useState(true);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        if (cancelled) return;
        const count = pdf.getPageCount();
        setPageCount(count);
        setItems(createItems(count));
        try {
          const thumbnails = await renderThumbnails(file, count);
          if (!cancelled) {
            setItems((current) => current.map((item, index) => ({ ...item, thumbnail: thumbnails[index] })));
          }
        } catch {
          // Thumbnails are a visual aid; organising still works without them.
        } finally {
          if (!cancelled) setLoadingThumbnails(false);
        }
      } catch {
        if (!cancelled) { setError("This PDF could not be read. It may be damaged or password protected."); setLoadingThumbnails(false); }
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

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDrop(targetIndex: number) {
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    if (fromIndex === null || fromIndex === targetIndex) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, moved);
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
      <p>{items.length} pages in the output plan. {selectedCount} selected. {loadingThumbnails ? "Loading page previews…" : "Drag a page to reorder it."}</p>
      <div role="list" aria-label="PDF pages" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
        {items.map((item, index) => (
          <article
            key={item.id}
            role="listitem"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(index)}
            aria-grabbed={dragIndexRef.current === index}
            style={{ border: "1px solid var(--border, #ddd)", borderRadius: 8, padding: 8, cursor: "grab" }}
          >
            <div style={{ aspectRatio: "3/4", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 6 }}>
              {item.sourceIndex === "blank" ? (
                <span>Blank page</span>
              ) : item.thumbnail ? (
                <img src={item.thumbnail} alt={`Page ${item.sourceIndex + 1} preview`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span>Page {item.sourceIndex + 1}</span>
              )}
            </div>
            <label>
              <input type="checkbox" checked={item.selected} onChange={(event) => setItems((current) => current.map((page) => page.id === item.id ? { ...page, selected: event.target.checked } : page))} />
              {item.sourceIndex === "blank" ? "Blank page" : `Page ${item.sourceIndex + 1}`}
            </label>
            <div>
              <button type="button" onClick={() => move(item.id, -1)} disabled={index === 0} aria-label="Move page earlier">←</button>
              <button type="button" onClick={() => move(item.id, 1)} disabled={index === items.length - 1} aria-label="Move page later">→</button>
              <button type="button" onClick={() => insertBlank(index)}>Insert blank</button>
            </div>
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
