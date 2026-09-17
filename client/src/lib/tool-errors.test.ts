import { describe, it, expect } from "vitest";
import { AppError, CancelledError, toUserError, throwIfAborted } from "@/lib/tool-errors";

describe("toUserError", () => {
  it("preserves an AppError's message and code", () => {
    const result = toUserError(new AppError("invalid_input", "Bad range"));
    expect(result).toEqual({ message: "Bad range", code: "invalid_input" });
  });

  it("maps a generic Error to processing_error with its message", () => {
    const result = toUserError(new Error("boom"));
    expect(result).toEqual({ message: "boom", code: "processing_error" });
  });

  it("maps a non-empty string", () => {
    expect(toUserError("worker died")).toEqual({ message: "worker died", code: "processing_error" });
  });

  it("falls back to a generic message for empty/unknown values", () => {
    expect(toUserError(null).code).toBe("processing_error");
    expect(toUserError(new Error("")).message).toMatch(/Something went wrong/);
  });
});

describe("CancelledError", () => {
  it("carries the cancelled code", () => {
    expect(new CancelledError().code).toBe("cancelled");
    expect(toUserError(new CancelledError()).code).toBe("cancelled");
  });
});

describe("throwIfAborted", () => {
  it("throws a CancelledError when the signal is aborted", () => {
    const controller = new AbortController();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow(CancelledError);
  });

  it("does nothing when not aborted or no signal", () => {
    expect(() => throwIfAborted(new AbortController().signal)).not.toThrow();
    expect(() => throwIfAborted(undefined)).not.toThrow();
  });
});
