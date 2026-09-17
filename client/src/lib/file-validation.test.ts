import { describe, it, expect } from "vitest";
import { validateFiles } from "@/lib/file-validation";

function makeFile(name: string, bytes: number, type = ""): File {
  const content = new Uint8Array(bytes);
  return new File([content], name, { type });
}

const pdfTool = {
  acceptedTypes: [".pdf"],
  multiple: false,
  maxFiles: 1,
  maxFileBytes: 1000,
};

const imagesTool = {
  acceptedTypes: [".png", ".jpg"],
  multiple: true,
  maxFiles: 3,
  maxFileBytes: 1000,
};

describe("validateFiles — single-file tool", () => {
  it("accepts one valid file", () => {
    const result = validateFiles([makeFile("a.pdf", 100)], [], pdfTool);
    expect(result.accepted).toHaveLength(1);
    expect(result.rejections).toEqual([]);
  });

  it("rejects unsupported types with a message", () => {
    const result = validateFiles([makeFile("a.txt", 100)], [], pdfTool);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejections[0]).toMatch(/isn.t a supported file type/);
  });

  it("rejects empty files", () => {
    const result = validateFiles([makeFile("a.pdf", 0)], [], pdfTool);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejections[0]).toMatch(/is empty/);
  });

  it("rejects files over the size limit", () => {
    const result = validateFiles([makeFile("a.pdf", 2000)], [], pdfTool);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejections[0]).toMatch(/over the/);
  });

  it("keeps only the first valid file and notes it", () => {
    const result = validateFiles([makeFile("a.pdf", 100), makeFile("b.pdf", 100)], [], pdfTool);
    expect(result.accepted).toHaveLength(1);
    expect(result.accepted[0].name).toBe("a.pdf");
    expect(result.rejections[0]).toMatch(/one file at a time/);
  });

  it("accepts by MIME type when extension is absent", () => {
    const result = validateFiles([makeFile("scan", 100, "application/pdf")], [], {
      ...pdfTool,
      acceptedTypes: [".pdf", "application/pdf"],
    });
    expect(result.accepted).toHaveLength(1);
  });
});

describe("validateFiles — multi-file tool", () => {
  it("appends valid files to existing ones", () => {
    const existing = [makeFile("a.png", 100)];
    const result = validateFiles([makeFile("b.png", 100)], existing, imagesTool);
    expect(result.accepted.map((f) => f.name)).toEqual(["a.png", "b.png"]);
  });

  it("de-duplicates identical files", () => {
    const a = makeFile("a.png", 100);
    const result = validateFiles([a], [a], imagesTool);
    expect(result.accepted).toHaveLength(1);
    expect(result.rejections[0]).toMatch(/already in the list/);
  });

  it("caps at maxFiles and reports the cap", () => {
    const incoming = [makeFile("a.png", 10), makeFile("b.png", 10), makeFile("c.png", 10), makeFile("d.png", 10)];
    const result = validateFiles(incoming, [], imagesTool);
    expect(result.accepted).toHaveLength(3);
    expect(result.rejections.some((r) => /Only the first 3 files/.test(r))).toBe(true);
  });
});
