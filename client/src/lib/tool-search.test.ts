import { describe, it, expect } from "vitest";
import { scoreTool, searchTools } from "@/lib/tool-search";
import { tools } from "@/lib/tools";
import type { ToolDefinition } from "@shared/schema";

const merge = tools.find((t) => t.id === "merge")!;

describe("scoreTool", () => {
  it("returns 0 for an empty query", () => {
    expect(scoreTool(merge, "")).toBe(0);
  });

  it("scores exact name highest, then prefix, then substring", () => {
    const exact = scoreTool(merge, "merge pdf");
    const prefix = scoreTool(merge, "merg");
    const substring = scoreTool(merge, "pdf");
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(substring);
  });

  it("matches keywords", () => {
    expect(scoreTool(merge, "combine")).toBeGreaterThan(0);
  });

  it("matches description text", () => {
    // "single document" appears in merge's description but not name/keywords.
    expect(scoreTool(merge, "single document")).toBeGreaterThan(0);
  });

  it("returns 0 when nothing matches", () => {
    expect(scoreTool(merge, "xyzzy")).toBe(0);
  });
});

describe("searchTools", () => {
  it("returns all tools when there is no query or category", () => {
    expect(searchTools(tools, {})).toHaveLength(tools.length);
  });

  it("filters by category", () => {
    const security = searchTools(tools, { category: "security" });
    expect(security.length).toBeGreaterThan(0);
    expect(security.every((t) => t.category === "security")).toBe(true);
  });

  it("ranks an exact name match first", () => {
    const results = searchTools(tools, { query: "compress pdf" });
    expect(results[0].id).toBe("compress");
  });

  it("finds a tool by a task-phrase keyword", () => {
    const results = searchTools(tools, { query: "jpg to pdf" });
    expect(results.map((t) => t.id)).toContain("img-to-pdf");
  });

  it("returns an empty list when nothing matches", () => {
    expect(searchTools(tools, { query: "nonexistent-tool-xyz" })).toEqual([]);
  });

  it("combines category and query", () => {
    const custom: ToolDefinition[] = [
      { ...merge, category: "organize" },
      { ...merge, id: "merge-img", name: "Merge Images", route: "/x", category: "image", keywords: [] },
    ];
    const results = searchTools(custom, { query: "merge", category: "image" });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("merge-img");
  });
});
