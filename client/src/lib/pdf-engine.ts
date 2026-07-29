// Re-export common functions and set up the Web Worker bridge
let worker: Worker | null = null;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("../workers/pdf.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

function runInWorker(action: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const id = Math.random().toString(36).substring(7);

    const handler = (e: MessageEvent) => {
      if (e.data.id === id) {
        w.removeEventListener("message", handler);
        if (e.data.status === "success") {
          resolve(e.data.data);
        } else {
          reject(new Error(e.data.error));
        }
      }
    };

    w.addEventListener("message", handler);
    w.postMessage({ id, action, payload });
  });
}

// Convert File to Uint8Array for transferring to worker
async function fileToBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const bytesArray = await Promise.all(files.map(fileToBytes));
  return runInWorker("merge", { files: bytesArray });
}

export async function splitPDF(file: File): Promise<{ name: string; data: Uint8Array }[]> {
  const bytes = await fileToBytes(file);
  return runInWorker("split", { file: bytes, filename: file.name });
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("compress", { file: bytes });
}

export async function rotatePDF(file: File, angle: number): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("rotate", { file: bytes, angle });
}

export async function addPageNumbers(
  file: File,
  position: "bottom-center" | "bottom-right" | "bottom-left" = "bottom-center",
  startFrom: number = 1
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("page-numbers", { file: bytes, position, startFrom });
}

export async function addWatermark(
  file: File,
  text: string,
  opacity: number = 0.15,
  fontSize: number = 48
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("watermark", { file: bytes, text, opacity, fontSize });
}

export async function addText(
  file: File,
  textContent: string,
  x: number,
  y: number,
  fontSize: number = 14,
  pageIndex: number = 0
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("add-text", { file: bytes, textContent, x, y, fontSize, pageIndex });
}

export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const bytesArray = await Promise.all(files.map(fileToBytes));
  const types = files.map(f => f.type);
  return runInWorker("images-to-pdf", { files: bytesArray, types });
}

export async function protectPDF(
  file: File,
  password: string
): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("protect", { file: bytes, password });
}

export async function rearrangePDF(file: File, order: number[]): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("rearrange", { file: bytes, order });
}

export async function extractPDF(file: File, pagesToExtract: number[]): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("extract", { file: bytes, pagesToExtract });
}

export async function deletePDFPages(file: File, pagesToDelete: number[]): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  return runInWorker("delete", { file: bytes, pagesToDelete });
}

export function downloadBlob(data: Uint8Array | Blob, filename: string) {
  const mimeType = filename.endsWith('.zip') ? 'application/zip' : 
                   filename.endsWith('.png') ? 'image/png' : 'application/pdf';

  // When coming back from a worker, sometimes it's passed as a plain object instead of a Uint8Array depending on serialization. Let's ensure it's a true Uint8Array or Blob.
  let validData = data;
  if (!(data instanceof Blob) && !(data instanceof Uint8Array)) {
     // Force convert it
     validData = new Uint8Array(Object.values(data));
  }

  const blob = validData instanceof Blob ? validData : new Blob([validData], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  // Directly use the anchor tag click method. window.open gets blocked by default in many browsers as a popup.
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 100);
  
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function downloadAsZip(
  files: { name: string; data: Uint8Array }[],
  zipName: string
) {
  const JSZip = (await import("https://esm.sh/jszip@3.10.1" as any)).default;
  const zip = new JSZip();
  files.forEach((f) => {
      // Re-hydrate Uint8Array if it was broken by worker serialization
      let validData = f.data;
      if (!(validData instanceof Uint8Array)) {
         validData = new Uint8Array(Object.values(validData));
      }
      zip.file(f.name, validData);
  });
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, zipName);
}

// Re-export this for UI features that need page counts without running full worker tasks
export async function getPDFPageCount(file: File): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  return pdf.getPageCount();
}
