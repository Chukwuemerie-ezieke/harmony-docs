import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, downloadAsZip, getPDFPageCount } from "@/lib/pdf-engine";
import { PageRangeControls } from "@/components/page-range-controls";
import { PdfExportControls, type PdfImageExportOptions } from "@/components/pdf-export-controls";

const PDFJS_VERSION = "4.4.168";

export default function PdfToImagesRelease2Tool() {
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<number[]>([]);
  const [options, setOptions] = useState<PdfImageExportOptions>({ format: "png", scale: 2, quality: 0.9 });

  return (
    <ToolPage
      toolId="pdf-to-img"
      instructions={{
        title: "How to convert PDF pages to images",
        steps: ["Upload one PDF.", "Choose PNG or JPG, resolution, and optional page range.", "Convert and download one image or a ZIP of images."],
      }}
      onProcess={async (files) => {
        const file = files[0];
        if (!file) throw new Error("Choose one PDF file.");
        const pdfjsLib: any = await import(`https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.mjs` as any);
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const selectedPages = pages.length ? pages : Array.from({ length: pdf.numPages }, (_, index) => index);
        const results: Array<{ name: string; data: Uint8Array }> = [];
        const baseName = file.name.replace(/\.pdf$/i, "");
        const extension = options.format === "jpeg" ? "jpg" : "png";
        for (const pageIndex of selectedPages) {
          const page = await pdf.getPage(pageIndex + 1);
          const viewport = page.getViewport({ scale: options.scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Image rendering is not available in this browser.");
          await page.render({ canvasContext: context, viewport }).promise;
          const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image export failed.")), `image/${options.format}`, options.quality));
          results.push({ name: `${baseName}_page_${pageIndex + 1}.${extension}`, data: new Uint8Array(await blob.arrayBuffer()) });
        }
        return { data: results, message: `Converted ${results.length} page${results.length === 1 ? "" : "s"} to images.` };
      }}
      onDownload={(data: Array<{ name: string; data: Uint8Array }>) => {
        if (data.length === 1) downloadBlob(data[0].data, data[0].name);
        else void downloadAsZip(data, "pdf-images.zip");
      }}
      downloadLabel="Download images"
    >
      {({ files }) => {
        if (files[0] && !pageCount) void getPDFPageCount(files[0]).then((count) => { setPageCount(count); setPages(Array.from({ length: count }, (_, index) => index)); });
        if (!files[0] && pageCount) { setPageCount(0); setPages([]); }
        return files[0] && pageCount ? (
          <div>
            <PageRangeControls pageCount={pageCount} onChange={setPages} />
            <PdfExportControls options={options} onChange={setOptions} />
          </div>
        ) : null;
      }}
    </ToolPage>
  );
}
