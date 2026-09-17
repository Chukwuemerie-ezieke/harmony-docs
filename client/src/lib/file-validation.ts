import type { ResolvedTool } from "@/lib/tool-registry";

export interface FileValidationResult {
  /** Files that passed validation, capped to the tool's maxFiles. */
  accepted: File[];
  /** Human-readable reasons files were rejected or trimmed, for user feedback. */
  rejections: string[];
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

function isAcceptedType(file: File, accept: string[]): boolean {
  const ext = extensionOf(file.name);
  return accept.includes(ext) || accept.includes(file.type);
}

/**
 * Validate a set of incoming files against a tool's accepted types and limits.
 * Unlike the previous silent filtering, this returns explicit rejection
 * messages so the UI can tell the user exactly what happened and why.
 *
 * @param incoming   Newly selected/dropped files.
 * @param existing   Files already queued (for multi-file tools).
 * @param tool       The resolved tool definition (types + limits).
 */
export function validateFiles(
  incoming: File[],
  existing: File[],
  tool: Pick<ResolvedTool, "acceptedTypes" | "multiple" | "maxFiles" | "maxFileBytes">,
): FileValidationResult {
  const rejections: string[] = [];
  const passed: File[] = [];

  for (const file of incoming) {
    if (!isAcceptedType(file, tool.acceptedTypes)) {
      rejections.push(`"${file.name}" isn't a supported file type (${tool.acceptedTypes.join(", ")}).`);
      continue;
    }
    if (file.size === 0) {
      rejections.push(`"${file.name}" is empty.`);
      continue;
    }
    if (file.size > tool.maxFileBytes) {
      rejections.push(`"${file.name}" is ${formatBytes(file.size)}, over the ${formatBytes(tool.maxFileBytes)} limit.`);
      continue;
    }
    passed.push(file);
  }

  if (!tool.multiple) {
    // Single-file tool: keep only the first valid file.
    if (passed.length > 1) {
      rejections.push("This tool accepts one file at a time; using the first valid file.");
    }
    return { accepted: passed.slice(0, 1), rejections };
  }

  // Multi-file tool: append to existing, de-duplicate, then cap.
  const combined = [...existing];
  for (const file of passed) {
    const isDuplicate = combined.some(
      (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified,
    );
    if (isDuplicate) {
      rejections.push(`"${file.name}" is already in the list.`);
      continue;
    }
    combined.push(file);
  }

  if (combined.length > tool.maxFiles) {
    rejections.push(`Only the first ${tool.maxFiles} files are used (limit reached).`);
  }

  return { accepted: combined.slice(0, tool.maxFiles), rejections };
}
