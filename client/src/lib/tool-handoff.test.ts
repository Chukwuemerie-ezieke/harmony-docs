import { describe, it, expect, beforeEach } from "vitest";
import { stageHandoff, consumeHandoff, clearHandoff, fileFromResult } from "@/lib/tool-handoff";

function file(name = "a.pdf"): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "application/pdf" });
}

beforeEach(() => clearHandoff());

describe("tool handoff", () => {
  it("returns null when nothing is staged", () => {
    expect(consumeHandoff("compress")).toBeNull();
  });

  it("hands a staged file to the intended tool only", () => {
    const f = file();
    stageHandoff(f, "compress");
    expect(consumeHandoff("protect")).toBeNull(); // wrong tool
    expect(consumeHandoff("compress")).toBe(f);
  });

  it("is single-use", () => {
    stageHandoff(file(), "compress");
    expect(consumeHandoff("compress")).not.toBeNull();
    expect(consumeHandoff("compress")).toBeNull();
  });

  it("clearHandoff discards a staged file", () => {
    stageHandoff(file(), "compress");
    clearHandoff();
    expect(consumeHandoff("compress")).toBeNull();
  });
});

describe("fileFromResult", () => {
  it("builds a named PDF File from bytes", () => {
    const f = fileFromResult(new Uint8Array([9, 9]), "merge-result.pdf");
    expect(f).toBeInstanceOf(File);
    expect(f.name).toBe("merge-result.pdf");
    expect(f.type).toBe("application/pdf");
    expect(f.size).toBe(2);
  });
});
