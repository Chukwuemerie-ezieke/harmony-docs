/**
 * Shared workflow contract for tool processing.
 *
 * A tool's `onProcess` receives the selected files plus a context object that
 * lets long-running work report progress and observe cancellation. Both are
 * optional to use, so simple tools can ignore them.
 */

export interface ProcessProgress {
  /** 0..1 fraction complete, when the tool can estimate it. */
  fraction?: number;
  /** Short human-readable stage, e.g. "Rendering page 3 of 10". */
  stage?: string;
}

export interface ProcessContext {
  /** Aborted when the user cancels; pass to fetch/worker and check periodically. */
  signal: AbortSignal;
  /** Report incremental progress to the UI. */
  onProgress: (progress: ProcessProgress) => void;
}

export interface ProcessOutcome<T = unknown> {
  data: T;
  message: string;
}

/** The processing function every tool provides to ToolPage. */
export type ProcessFn<T = unknown> = (
  files: File[],
  context: ProcessContext,
) => Promise<ProcessOutcome<T>>;

export type ToolStatus = "idle" | "processing" | "done" | "error";
