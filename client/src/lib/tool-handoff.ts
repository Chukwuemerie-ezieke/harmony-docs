/**
 * In-memory handoff of a produced file from one tool to the next, powering
 * "use this result in another tool" without re-uploading. Kept in memory only
 * (never persisted) so document content never touches storage — consistent
 * with the local-first, privacy-first model. The handoff is single-use.
 */

let pendingFile: File | null = null;
let pendingForToolId: string | null = null;

/** Stage a file to be picked up by the next tool page that opens. */
export function stageHandoff(file: File, targetToolId: string): void {
  pendingFile = file;
  pendingForToolId = targetToolId;
}

/**
 * Consume a staged file if it was intended for the given tool. Returns null if
 * there is nothing staged for this tool. Clears the handoff on read.
 */
export function consumeHandoff(toolId: string): File | null {
  if (pendingFile && pendingForToolId === toolId) {
    const file = pendingFile;
    pendingFile = null;
    pendingForToolId = null;
    return file;
  }
  return null;
}

export function clearHandoff(): void {
  pendingFile = null;
  pendingForToolId = null;
}

/**
 * Build a File from produced bytes so it can be handed to the next tool.
 * Only used for single-file PDF outputs.
 */
export function fileFromResult(data: Uint8Array, filename: string, type = "application/pdf"): File {
  // Copy into a fresh ArrayBuffer to avoid handing over a detached/transferred buffer.
  const copy = new Uint8Array(data);
  return new File([copy], filename, { type });
}
