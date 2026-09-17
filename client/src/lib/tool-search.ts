import type { ToolDefinition } from "@shared/schema";

/**
 * Rank tools against a free-text query. Pure and side-effect free so it can be
 * unit tested and reused by the tools directory and the header search.
 *
 * Scoring favours, in order: exact/prefix name matches, name substring,
 * description substring, then keyword matches. A zero score means no match.
 */
export function scoreTool(tool: ToolDefinition, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const name = tool.name.toLowerCase();
  const description = tool.description.toLowerCase();
  const keywords = (tool.keywords ?? []).map((k) => k.toLowerCase());

  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (keywords.some((k) => k === q || k.includes(q))) return 45;
  if (description.includes(q)) return 30;

  // Token match: every whitespace-separated term appears somewhere.
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length > 1) {
    const haystack = `${name} ${description} ${keywords.join(" ")}`;
    if (terms.every((term) => haystack.includes(term))) return 20;
  }

  return 0;
}

export interface ToolFilter {
  query?: string;
  category?: string | null;
}

/**
 * Filter and rank a list of tools. When a query is present, results are sorted
 * by relevance; otherwise the original order is preserved (optionally filtered
 * by category).
 */
export function searchTools(all: ToolDefinition[], filter: ToolFilter): ToolDefinition[] {
  const { query = "", category = null } = filter;
  let list = all;
  if (category) {
    list = list.filter((tool) => tool.category === category);
  }
  if (!query.trim()) {
    return list;
  }
  return list
    .map((tool) => ({ tool, score: scoreTool(tool, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .map((entry) => entry.tool);
}
