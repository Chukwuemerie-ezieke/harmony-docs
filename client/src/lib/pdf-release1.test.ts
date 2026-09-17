import { describe, it, expect } from "vitest";
import { parsePageRanges, validatePageOrder, buildOrganizedPagePlan } from "@/lib/pdf-release1";

describe("parsePageRanges", () => {
  it("parses single pages into zero-based indices", () => {
    expect(parsePageRanges("1, 3, 5", 5)).toEqual([0, 2, 4]);
  });

  it("expands ranges inclusively", () => {
    expect(parsePageRanges("1-3", 5)).toEqual([0, 1, 2]);
  });

  it("de-duplicates and sorts overlapping input", () => {
    expect(parsePageRanges("3, 1-2, 2", 5)).toEqual([0, 1, 2]);
  });

  it("accepts whitespace and comma separators", () => {
    expect(parsePageRanges("1 2,3", 5)).toEqual([0, 1, 2]);
  });

  it("rejects malformed tokens", () => {
    expect(() => parsePageRanges("1-", 5)).toThrow(/Invalid page range/);
    expect(() => parsePageRanges("abc", 5)).toThrow(/Invalid page range/);
  });

  it("rejects ranges outside the document", () => {
    expect(() => parsePageRanges("6", 5)).toThrow(/outside 1-5/);
    expect(() => parsePageRanges("0", 5)).toThrow(/outside 1-5/);
    expect(() => parsePageRanges("3-2", 5)).toThrow(/outside 1-5/);
  });
});

describe("validatePageOrder", () => {
  it("accepts a complete permutation", () => {
    expect(validatePageOrder([2, 0, 1], 3)).toEqual([2, 0, 1]);
  });

  it("rejects wrong-length orders", () => {
    expect(() => validatePageOrder([0, 1], 3)).toThrow(/all 3 page numbers/);
  });

  it("rejects duplicates or out-of-range indices", () => {
    expect(() => validatePageOrder([0, 0, 1], 3)).toThrow(/each page from 1 to 3/);
    expect(() => validatePageOrder([0, 1, 3], 3)).toThrow(/each page from 1 to 3/);
  });
});

describe("buildOrganizedPagePlan", () => {
  it("returns the identity plan with no actions", () => {
    expect(buildOrganizedPagePlan(3, [])).toEqual([0, 1, 2]);
  });

  it("inserts a blank page at the given index", () => {
    expect(buildOrganizedPagePlan(2, [{ type: "blank", index: 1 }])).toEqual([0, "blank", 1]);
  });

  it("duplicates a page at the given index", () => {
    // Duplicate inserts the page index again at that position.
    expect(buildOrganizedPagePlan(2, [{ type: "duplicate", index: 1 }])).toEqual([0, 1, 1]);
  });

  it("applies multiple actions from the end so indices stay valid", () => {
    const plan = buildOrganizedPagePlan(2, [
      { type: "blank", index: 0 },
      { type: "blank", index: 2 },
    ]);
    expect(plan).toEqual(["blank", 0, 1, "blank"]);
  });

  it("rejects an out-of-bounds action index", () => {
    expect(() => buildOrganizedPagePlan(2, [{ type: "blank", index: 5 }])).toThrow(/Invalid page position/);
  });
});
