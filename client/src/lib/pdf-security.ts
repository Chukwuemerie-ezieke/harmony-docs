// Client-side PDF encryption/decryption bridge.
// All processing happens in a Web Worker via QPDF-WASM; files never leave the browser.

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../workers/qpdf.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

// Resolve the public URL of the wasm binary. `base: "./"` means we must build an
// absolute URL from the current document location so the worker can fetch it.
function wasmUrl(): string {
  return new URL("qpdf/qpdf.wasm", document.baseURI).toString();
}

function run(action: "encrypt" | "decrypt", file: Uint8Array, password: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const id = Math.random().toString(36).slice(2);

    const handler = (event: MessageEvent) => {
      if (event.data?.id !== id) return;
      w.removeEventListener("message", handler);
      if (event.data.status === "success") {
        resolve(event.data.data as Uint8Array);
      } else {
        reject(new Error(event.data.error || "PDF security operation failed."));
      }
    };

    w.addEventListener("message", handler);
    // The buffer is transferred to the worker for efficiency.
    w.postMessage({ id, action, payload: { file, password, wasmUrl: wasmUrl() } }, [file.buffer]);
  });
}

async function fileToBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export async function encryptPDF(file: File, password: string): Promise<Uint8Array> {
  if (!password) throw new Error("Enter a password to protect the PDF.");
  const bytes = await fileToBytes(file);
  try {
    return await run("encrypt", bytes, password);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/already encrypted|invalid password/i.test(message)) {
      throw new Error("This PDF is already password protected. Unlock it first, then protect it again.");
    }
    throw new Error("We couldn’t protect this PDF. It may be damaged or in an unsupported format.");
  }
}

export async function decryptPDF(file: File, password: string): Promise<Uint8Array> {
  const bytes = await fileToBytes(file);
  try {
    return await run("decrypt", bytes, password);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/invalid password|incorrect password/i.test(message)) {
      throw new Error("Incorrect password. Check the PDF password and try again.");
    }
    throw new Error("We couldn’t unlock this PDF. Confirm the password is correct and the file is a valid PDF.");
  }
}
