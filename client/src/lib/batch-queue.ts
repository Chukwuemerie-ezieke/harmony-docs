export type BatchStatus = "queued" | "processing" | "done" | "error";
export interface BatchItem<T = unknown> { id: string; file: File; status: BatchStatus; result?: T; error?: string; }

export async function processBatch<T>(
  files: File[],
  process: (file: File) => Promise<T>,
  onUpdate: (items: Array<BatchItem<T>>) => void,
): Promise<Array<BatchItem<T>>> {
  const items: Array<BatchItem<T>> = files.map((file) => ({ id: crypto.randomUUID(), file, status: "queued" }));
  onUpdate(items);
  for (const item of items) {
    item.status = "processing";
    onUpdate([...items]);
    try {
      item.result = await process(item.file);
      item.status = "done";
    } catch (error) {
      item.status = "error";
      item.error = error instanceof Error ? error.message : "Processing failed.";
    }
    onUpdate([...items]);
  }
  return items;
}
