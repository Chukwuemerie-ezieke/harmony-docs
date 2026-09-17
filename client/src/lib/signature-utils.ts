/**
 * Returns true if a canvas contains any visible (non-transparent) pixels.
 * Used to reject an empty "signature" so users can't export a blank stamp.
 */
export function canvasHasInk(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const { width, height } = canvas;
  if (width === 0 || height === 0) return false;
  const { data } = ctx.getImageData(0, 0, width, height);
  // Alpha channel is every 4th byte; any non-zero alpha means something drawn.
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) return true;
  }
  return false;
}

/** Placement of a signature on a page, expressed as fractions (0..1) of the
 * page's width/height, so it maps cleanly onto pdf-lib's coordinate space
 * regardless of the preview's pixel size. */
export interface SignaturePlacement {
  /** Left edge, fraction of page width. */
  x: number;
  /** Top edge, fraction of page height (from the top). */
  y: number;
  /** Signature width, fraction of page width. */
  width: number;
}
