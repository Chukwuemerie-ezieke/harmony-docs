import { describe, it, expect, vi } from "vitest";
import { canvasHasInk } from "@/lib/signature-utils";

/** Build a fake canvas whose 2D context returns the given alpha data. */
function fakeCanvas(width: number, height: number, alphas: number[]): HTMLCanvasElement {
  const data = new Uint8ClampedArray(width * height * 4);
  alphas.forEach((a, i) => {
    data[i * 4 + 3] = a; // set the alpha byte of pixel i
  });
  return {
    width,
    height,
    getContext: () =>
      ({
        getImageData: () => ({ data }),
      }) as unknown as CanvasRenderingContext2D,
  } as unknown as HTMLCanvasElement;
}

describe("canvasHasInk", () => {
  it("returns false for a fully transparent canvas", () => {
    expect(canvasHasInk(fakeCanvas(2, 2, [0, 0, 0, 0]))).toBe(false);
  });

  it("returns true when any pixel has non-zero alpha", () => {
    expect(canvasHasInk(fakeCanvas(2, 2, [0, 0, 255, 0]))).toBe(true);
  });

  it("returns false for a zero-size canvas", () => {
    expect(canvasHasInk(fakeCanvas(0, 0, []))).toBe(false);
  });

  it("returns false when no 2D context is available", () => {
    const canvas = { width: 10, height: 10, getContext: vi.fn(() => null) } as unknown as HTMLCanvasElement;
    expect(canvasHasInk(canvas)).toBe(false);
  });
});
