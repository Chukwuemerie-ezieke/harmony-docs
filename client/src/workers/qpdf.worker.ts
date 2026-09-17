/// <reference lib="webworker" />
// Genuine browser-side PDF encryption/decryption using QPDF compiled to WebAssembly.
// Runs entirely on the user's device — no file ever leaves the browser.
import createQpdfModule, { type QpdfInstance } from "@neslinesli93/qpdf-wasm";

// The Emscripten FS also exposes writeFile/unlink at runtime; the shipped types omit them.
type QpdfFS = QpdfInstance["FS"] & {
  writeFile: (path: string, data: Uint8Array) => void;
  unlink: (path: string) => void;
};

type EncryptPayload = { file: Uint8Array; password: string; wasmUrl: string };
type DecryptPayload = { file: Uint8Array; password: string; wasmUrl: string };

let modulePromise: Promise<QpdfInstance> | null = null;

async function getQpdf(wasmUrl: string): Promise<QpdfInstance> {
  if (!modulePromise) {
    modulePromise = createQpdfModule({ locateFile: () => wasmUrl });
  }
  return modulePromise;
}

// A fresh Emscripten FS run for a single qpdf invocation. The module is a
// singleton, so we scope filenames per-call and always clean them up.
function runQpdf(qpdf: QpdfInstance, input: Uint8Array, args: (inPath: string, outPath: string) => string[]): Uint8Array {
  const fs = qpdf.FS as QpdfFS;
  const token = Math.random().toString(36).slice(2);
  const inPath = `/in_${token}.pdf`;
  const outPath = `/out_${token}.pdf`;

  fs.writeFile(inPath, input);
  try {
    const code = qpdf.callMain(args(inPath, outPath));
    // qpdf exit codes: 0 = success, 3 = success with warnings. Anything else is a failure.
    if (code !== 0 && code !== 3) {
      throw new Error(`qpdf exited with code ${code}`);
    }
    return fs.readFile(outPath);
  } finally {
    try { fs.unlink(inPath); } catch { /* ignore */ }
    try { fs.unlink(outPath); } catch { /* ignore */ }
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { id, action, payload } = event.data as {
    id: string;
    action: "encrypt" | "decrypt";
    payload: EncryptPayload | DecryptPayload;
  };

  try {
    const qpdf = await getQpdf(payload.wasmUrl);
    let result: Uint8Array;

    if (action === "encrypt") {
      const { file, password } = payload as EncryptPayload;
      // AES-256 encryption; same user/owner password protects open + permissions.
      result = runQpdf(qpdf, file, (inPath, outPath) => [
        "--encrypt", password, password, "256", "--",
        inPath, outPath,
      ]);
    } else {
      const { file, password } = payload as DecryptPayload;
      result = runQpdf(qpdf, file, (inPath, outPath) => [
        `--password=${password}`, "--decrypt",
        inPath, outPath,
      ]);
    }

    // Copy into a standalone ArrayBuffer so it survives structured cloning.
    const out = new Uint8Array(result);
    self.postMessage({ id, status: "success", data: out }, [out.buffer]);
  } catch (error) {
    self.postMessage({
      id,
      status: "error",
      error: error instanceof Error ? error.message : "PDF security operation failed.",
    });
  }
};
