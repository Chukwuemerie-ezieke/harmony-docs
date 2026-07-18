import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Need to set workerSrc for pdf.js to work
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  file: File;
  className?: string;
}

export function PdfPreview({ file, className }: PdfPreviewProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      try {
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        const page = await pdf.getPage(1);

        const scale = 1.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext as any).promise;

        if (active) {
          setImgSrc(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error("Error generating PDF preview", err);
      }
    }

    loadPreview();

    return () => {
      active = false;
    };
  }, [file]);

  if (!imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-muted animate-pulse rounded overflow-hidden ${className}`}>
        <span className="text-xs text-muted-foreground font-medium">...</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`Preview of ${file.name}`}
      className={`object-cover border border-border/50 rounded shadow-sm ${className}`}
    />
  );
}
