export type PageRange = { start: number; end: number };

export function parsePageRanges(input: string, pageCount: number): number[] {
  const pages = new Set<number>();
  const parts = input.split(/[\s,]+/).filter(Boolean);
  for (const part of parts) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`Invalid page range: ${part}`);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) {
      throw new Error(`Page range ${part} is outside 1-${pageCount}.`);
    }
    for (let page = start; page <= end; page += 1) pages.add(page - 1);
  }
  return [...pages].sort((a, b) => a - b);
}

export function validatePageOrder(order: number[], pageCount: number): number[] {
  if (order.length !== pageCount) throw new Error(`Enter all ${pageCount} page numbers exactly once.`);
  const seen = new Set(order);
  if (seen.size !== pageCount || order.some((page) => page < 0 || page >= pageCount)) {
    throw new Error(`Page order must contain each page from 1 to ${pageCount}.`);
  }
  return order;
}

export function buildOrganizedPagePlan(pageCount: number, actions: Array<{ type: "duplicate" | "blank"; index: number }>): Array<number | "blank"> {
  const plan: Array<number | "blank"> = Array.from({ length: pageCount }, (_, index) => index);
  const sorted = [...actions].sort((a, b) => b.index - a.index);
  for (const action of sorted) {
    if (action.index < 0 || action.index > plan.length) throw new Error("Invalid page position.");
    plan.splice(action.index, 0, action.type === "blank" ? "blank" : action.index);
  }
  return plan;
}
