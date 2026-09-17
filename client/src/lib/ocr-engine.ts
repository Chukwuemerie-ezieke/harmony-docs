import { throwIfAborted, AppError } from "@/lib/tool-errors";
import type { ProcessContext } from "@/lib/tool-workflow";

/**
 * Client-side OCR using Tesseract.js (WASM). Runs entirely in the browser —
 * no file or text is uploaded. The engine, worker, and English language data
 * are loaded on demand from a CDN (consistent with how this app loads pdf.js),
 * so the OCR tool adds nothing to the main bundle until it's used.
 */

const TESSERACT_CDN = "https://esm.sh/tesseract.js@5.1.1";
const PDFJS_VERSION = "4.4.168";

/** Render the first page of a PDF to a PNG data URL for OCR. */
async function firstPdfPageToImage(file: File, signal: AbortSignal): Promise<string> {
  const pdfjsLib: any = await import(/* @vite-ignore */ `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.mjs`);
  throwIfAborted(signal);
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await pdf.getPage(1);
  // Higher scale improves OCR accuracy on small text.
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new AppError("unsupported", "Image rendering is not available in this browser.");
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
}

export interface OcrResult {
  text: string;
}

/**
 * Extract text from an image or the first page of a PDF.
 * Reports progress (0..1) and honours cancellation via the ProcessContext.
 */
export async function extractText(file: File, context: ProcessContext): Promise<OcrResult> {
  const { signal, onProgress } = context;
  throwIfAborted(signal);
  onProgress({ fraction: 0, stage: "Loading OCR engine…" });

  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const source: string | File = isPdf ? await firstPdfPageToImage(file, signal) : file;
  throwIfAborted(signal);

  const Tesseract: any = await import(/* @vite-ignore */ TESSERACT_CDN);
  throwIfAborted(signal);

  const worker = await Tesseract.createWorker("eng", 1, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress({ fraction: m.progress, stage: `Reading text… ${Math.round(m.progress * 100)}%` });
      }
    },
  });

  // If the user cancels, terminate the worker so it stops consuming CPU.
  const onAbort = () => {
    void worker.terminate();
  };
  signal.addEventListener("abort", onAbort, { once: true });

  try {
    const { data } = await worker.recognize(source);
    throwIfAborted(signal);
    const text = (data?.text ?? "").trim();
    if (!text) {
      throw new AppError("processing_error", "No readable text was found in this file.");
    }
    onProgress({ fraction: 1, stage: "Done" });
    return { text };
  } finally {
    signal.removeEventListener("abort", onAbort);
    await worker.terminate();
  }
}

/** Build a downloadable UTF-8 text blob from OCR output. */
export function textToBlob(text: string): Blob {
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}
