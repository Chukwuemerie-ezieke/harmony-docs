import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/pdf-engine";

export default function PdfToImgTool() {
  const [images, setImages] = useState<{ name: string; blob: Blob }[]>([]);

  return (
    <ToolPage
      toolId="pdf-to-img"
      onProcess={async (files) => {
        // Use pdf.js via CDN to render pages
        const pdfjsLib = await import("https://esm.sh/pdfjs-dist@4.4.168/build/pdf.mjs" as any);
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs";

        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;
        const results: { name: string; blob: Blob }[] = [];

        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), "image/png")
          );

          const baseName = files[0].name.replace(".pdf", "");
          results.push({ name: `${baseName}_page_${i}.png`, blob });
        }

        setImages(results);
        return { data: results, message: `Converted ${pageCount} pages to images` };
      }}
      onDownload={async (data) => {
        if (data.length === 1) {
          downloadBlob(data[0].blob, data[0].name);
        } else {
          const JSZip = (await import("https://esm.sh/jszip@3.10.1" as any)).default;
          const zip = new JSZip();
          for (const img of data) {
            zip.file(img.name, img.blob);
          }
          const content = await zip.generateAsync({ type: "blob" });
          downloadBlob(content, "pdf_images.zip");
        }
      }}
      downloadLabel="Download images"
    >
      {() => null}
    </ToolPage>
  );
}
