import type { ProcessingMode, ToolDefinition } from "@shared/schema";
import { tools, getToolById as getToolByIdRaw } from "@/lib/tools";

/**
 * Platform defaults applied to every tool that does not override them.
 * These are intentionally conservative so large documents can't silently
 * hang or crash a browser tab.
 */
export const REGISTRY_DEFAULTS = {
  processingMode: "browser-worker" as ProcessingMode,
  /** 100 MB per file — comfortably above typical documents, below OOM risk. */
  maxFileBytes: 100 * 1024 * 1024,
  /** Applies to multi-file tools (merge, images-to-PDF). */
  maxFiles: 50,
  minFiles: 1,
};

/**
 * A tool definition with every platform field resolved to a concrete value.
 * Downstream code (validation, disclosures, the workflow shell) can rely on
 * these being present rather than repeating default handling.
 */
export interface ResolvedTool extends ToolDefinition {
  processingMode: ProcessingMode;
  maxFileBytes: number;
  maxFiles: number;
  minFiles: number;
}

export function resolveTool(tool: ToolDefinition): ResolvedTool {
  return {
    ...tool,
    processingMode: tool.processingMode ?? REGISTRY_DEFAULTS.processingMode,
    maxFileBytes: tool.maxFileBytes ?? REGISTRY_DEFAULTS.maxFileBytes,
    maxFiles: tool.multiple ? tool.maxFiles ?? REGISTRY_DEFAULTS.maxFiles : 1,
    minFiles: tool.minFiles ?? (tool.multiple ? 2 : 1),
  };
}

export function getResolvedTool(id: string): ResolvedTool | undefined {
  const tool = getToolByIdRaw(id);
  return tool ? resolveTool(tool) : undefined;
}

export const resolvedTools: ResolvedTool[] = tools.map(resolveTool);

/** Human-readable, per-tool processing description for disclosures. */
export function processingModeLabel(mode: ProcessingMode): string {
  switch (mode) {
    case "browser-wasm":
      return "Runs in your browser (WebAssembly). Files never leave your device.";
    case "browser-main":
    case "browser-worker":
    default:
      return "Runs entirely in your browser. Files never leave your device.";
  }
}

/** Maps a ProcessingMode to the FileProcessingNotice mode vocabulary. */
export function noticeModeFor(mode: ProcessingMode): "browser" | "server" | "unknown" {
  // All current processing modes are on-device.
  return mode === "browser-worker" || mode === "browser-wasm" || mode === "browser-main"
    ? "browser"
    : "unknown";
}
