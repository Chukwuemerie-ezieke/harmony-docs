import { describe, it, expect } from "vitest";
import { resolveTool, getResolvedTool, resolvedTools, REGISTRY_DEFAULTS, noticeModeFor } from "@/lib/tool-registry";
import { tools } from "@/lib/tools";
import type { ToolDefinition } from "@shared/schema";

describe("resolveTool", () => {
  it("applies defaults when platform fields are absent", () => {
    const bare: ToolDefinition = {
      id: "x", name: "X", description: "", icon: "Layers", category: "organize",
      color: "", route: "/tool/x", acceptedTypes: [".pdf"], multiple: false,
    };
    const r = resolveTool(bare);
    expect(r.processingMode).toBe(REGISTRY_DEFAULTS.processingMode);
    expect(r.maxFileBytes).toBe(REGISTRY_DEFAULTS.maxFileBytes);
    expect(r.maxFiles).toBe(1); // single-file tool forces maxFiles=1
    expect(r.minFiles).toBe(1);
  });

  it("defaults multi-file tools to 2 minFiles and the default cap", () => {
    const multi: ToolDefinition = {
      id: "m", name: "M", description: "", icon: "Layers", category: "organize",
      color: "", route: "/tool/m", acceptedTypes: [".pdf"], multiple: true,
    };
    const r = resolveTool(multi);
    expect(r.maxFiles).toBe(REGISTRY_DEFAULTS.maxFiles);
    expect(r.minFiles).toBe(2);
  });

  it("respects explicit overrides", () => {
    const custom: ToolDefinition = {
      id: "c", name: "C", description: "", icon: "Layers", category: "image",
      color: "", route: "/tool/c", acceptedTypes: [".png"], multiple: true,
      maxFiles: 10, maxFileBytes: 500, minFiles: 1, processingMode: "browser-main",
    };
    const r = resolveTool(custom);
    expect(r.maxFiles).toBe(10);
    expect(r.maxFileBytes).toBe(500);
    expect(r.minFiles).toBe(1);
    expect(r.processingMode).toBe("browser-main");
  });
});

describe("registry integrity", () => {
  it("has unique tool ids", () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique routes", () => {
    const routes = tools.map((t) => t.route);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("resolves every registered tool", () => {
    for (const t of tools) {
      expect(getResolvedTool(t.id)).toBeDefined();
    }
    expect(resolvedTools).toHaveLength(tools.length);
  });

  it("returns undefined for unknown ids", () => {
    expect(getResolvedTool("does-not-exist")).toBeUndefined();
  });
});

describe("noticeModeFor", () => {
  it("maps all on-device modes to browser", () => {
    expect(noticeModeFor("browser-worker")).toBe("browser");
    expect(noticeModeFor("browser-wasm")).toBe("browser");
    expect(noticeModeFor("browser-main")).toBe("browser");
  });
});
