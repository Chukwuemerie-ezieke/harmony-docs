import { runInWorker } from "@/lib/pdf-engine";

// Selection/range-aware PDF operations. These share the single canonical PDF
// worker via runInWorker (defined in pdf-engine.ts).
function run<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  return runInWorker(action, payload) as Promise<T>;
}

async function bytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export async function splitPdfByRanges(file: File, ranges: number[][]): Promise<Array<{ name: string; data: Uint8Array }>> {
  return run("split-ranges", { file: await bytes(file), ranges, filename: file.name });
}

export async function rotateSelectedPages(file: File, pages: number[], angle: number): Promise<Uint8Array> {
  return run("rotate-pages", { file: await bytes(file), pages, angle });
}

export async function addPageNumbersToSelectedPages(file: File, pages: number[], position: string, startFrom: number): Promise<Uint8Array> {
  return run("page-numbers-pages", { file: await bytes(file), pages, position, startFrom });
}

export async function watermarkSelectedPages(file: File, pages: number[], text: string, opacity: number, fontSize: number): Promise<Uint8Array> {
  return run("watermark-pages", { file: await bytes(file), pages, text, opacity, fontSize });
}

export async function organizePdfPlan(file: File, plan: Array<number | "blank">): Promise<Uint8Array> {
  return run("organize-plan", { file: await bytes(file), plan });
}
