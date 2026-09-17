/**
 * Typed application errors with a user-safe message and a stable code for
 * analytics. Keeps internal/library error text out of the UI while still
 * giving the user something actionable.
 */
export type ToolErrorCode =
  | "invalid_input"
  | "no_files"
  | "cancelled"
  | "processing_error"
  | "unsupported"
  | "password_incorrect"
  | "already_encrypted";

export class AppError extends Error {
  readonly code: ToolErrorCode;

  constructor(code: ToolErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class CancelledError extends AppError {
  constructor(message = "Processing was cancelled.") {
    super("cancelled", message);
    this.name = "CancelledError";
  }
}

/** Narrow an unknown thrown value to a user-facing message + code. */
export function toUserError(err: unknown): { message: string; code: ToolErrorCode } {
  if (err instanceof AppError) {
    return { message: err.message, code: err.code };
  }
  if (err instanceof Error && err.message.trim()) {
    return { message: err.message, code: "processing_error" };
  }
  if (typeof err === "string" && err.trim()) {
    return { message: err, code: "processing_error" };
  }
  return { message: "Something went wrong while processing your file.", code: "processing_error" };
}

/** Throw a CancelledError if the signal has already been aborted. */
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new CancelledError();
  }
}
