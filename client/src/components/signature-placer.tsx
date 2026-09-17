import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { SignaturePlacement } from "@/lib/signature-utils";

const PDFJS_VERSION = "4.4.168";

interface SignaturePlacerProps {
  file: File;
  pageIndex: number;
  signatureDataUrl: string | null;
  placement: SignaturePlacement;
  onPlacementChange: (placement: SignaturePlacement) => void;
  /** Aspect ratio (height / width) of the signature image, for sizing. */
  signatureAspect: number;
}

/**
 * Renders the selected PDF page and lets the user drag the signature to a
 * position. Placement is stored as page-fraction coordinates so it maps
 * exactly onto the real page when stamped with pdf-lib.
 */
export function SignaturePlacer({
  file, pageIndex, signatureDataUrl, placement, onPlacementChange, signatureAspect,
}: SignaturePlacerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pagePreview, setPagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPagePreview(null);

    async function render() {
      try {
        const pdfjsLib: any = await import(/* @vite-ignore */ `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.mjs`);
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("no context");
        await page.render({ canvasContext: context, viewport }).promise;
        if (!cancelled) {
          setPagePreview(canvas.toDataURL("image/png"));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    void render();
    return () => { cancelled = true; };
  }, [file, pageIndex]);

  function moveTo(clientX: number, clientY: number) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // Position is the signature's centre under the pointer, clamped to page.
    const halfW = placement.width / 2;
    const halfH = (placement.width * signatureAspect) / 2;
    let x = (clientX - rect.left) / rect.width - halfW;
    let y = (clientY - rect.top) / rect.height - halfH;
    x = Math.max(0, Math.min(x, 1 - placement.width));
    y = Math.max(0, Math.min(y, 1 - placement.width * signatureAspect));
    onPlacementChange({ ...placement, x, y });
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg border bg-muted/30"
        style={{ aspectRatio: "1 / 1.414" }}
        data-testid="signature-placer"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" role="status" aria-live="polite">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <span className="ml-2 text-sm text-muted-foreground">Loading page preview…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
            Page preview unavailable. You can still place your signature; it will be added to the selected page.
          </div>
        )}
        {pagePreview && (
          <img src={pagePreview} alt={`Page ${pageIndex + 1} preview`} className="h-full w-full object-contain" />
        )}
        {signatureDataUrl && (
          <img
            src={signatureDataUrl}
            alt="Signature position"
            draggable={false}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              setDragging(true);
              moveTo(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => dragging && moveTo(e.clientX, e.clientY)}
            onPointerUp={() => setDragging(false)}
            className="absolute cursor-move touch-none select-none rounded border border-dashed border-primary/60"
            style={{
              left: `${placement.x * 100}%`,
              top: `${placement.y * 100}%`,
              width: `${placement.width * 100}%`,
            }}
            data-testid="signature-overlay"
          />
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Drag the signature to position it on the page.
      </p>
    </div>
  );
}
