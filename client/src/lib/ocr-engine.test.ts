import { describe, it, expect } from "vitest";
import { textToBlob } from "@/lib/ocr-engine";

// jsdom's Blob lacks .text() but the test setup polyfills .arrayBuffer().
async function blobText(blob: Blob): Promise<string> {
  return new TextDecoder().decode(new Uint8Array(await blob.arrayBuffer()));
}

describe("textToBlob", () => {
  it("creates a UTF-8 text blob", async () => {
    const blob = textToBlob("hello world");
    expect(blob.type).toContain("text/plain");
    expect(await blobText(blob)).toBe("hello world");
  });

  it("preserves newlines and unicode", async () => {
    const content = "line one\nline two\ncafé — résumé";
    const blob = textToBlob(content);
    expect(await blobText(blob)).toBe(content);
  });
});
