export type PublicAnalyticsEvent =
  | "tool_viewed"
  | "tool_opened"
  | "upload_started"
  | "process_completed"
  | "processing_completed"
  | "process_failed"
  | "processing_failed"
  | "download_clicked"
  | "cta_clicked"
  | "consultation_cta_clicked"
  | "lead_form_started"
  | "lead_form_submitted";

export type PublicAnalyticsAttributes = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const allowedKeys = new Set([
  "tool_slug",
  "tool_id",
  "tool_category",
  "cta_id",
  "cta_placement",
  "source_page",
  "source_tool",
  "outcome",
  "error_code",
]);

const eventAliases: Partial<Record<PublicAnalyticsEvent, PublicAnalyticsEvent>> = {
  tool_viewed: "tool_opened",
  process_completed: "processing_completed",
  process_failed: "processing_failed",
  cta_clicked: "consultation_cta_clicked",
};

const blockedKeyPattern =
  /(file|document|name|email|phone|ip|content|text|ocr|address|token|password)/i;

const startedFormKeys = new Set<string>();

export function sanitiseAttributes(
  attributes: PublicAnalyticsAttributes,
): Record<string, string | number | boolean> {
  const result = Object.entries(attributes).reduce<Record<string, string | number | boolean>>(
    (acc, [key, value]) => {
      if (value === undefined || !allowedKeys.has(key) || blockedKeyPattern.test(key)) {
        return acc;
      }
      acc[key] = typeof value === "string" ? value.slice(0, 120) : value;
      return acc;
    },
    {},
  );

  if (typeof result.tool_slug === "string" && result.tool_id === undefined) {
    result.tool_id = result.tool_slug;
  }
  if (typeof result.tool_id === "string" && result.tool_slug === undefined) {
    result.tool_slug = result.tool_id;
  }
  if (typeof result.cta_id === "string" && result.cta_placement === undefined) {
    result.cta_placement = result.cta_id;
  }
  if (typeof result.tool_id === "string" && result.source_tool === undefined) {
    result.source_tool = result.tool_id;
  }

  return result;
}

function sendToGa4(
  event: PublicAnalyticsEvent,
  attributes: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventAliases[event] ?? event, attributes);
}

export async function trackPublicEvent(
  event: PublicAnalyticsEvent,
  attributes: PublicAnalyticsAttributes = {},
  endpoint = import.meta.env.VITE_PUBLIC_ANALYTICS_ENDPOINT as string | undefined,
): Promise<void> {
  const safeAttributes = sanitiseAttributes(attributes);

  if (event === "lead_form_started") {
    const startKey = [
      String(safeAttributes.tool_id ?? ""),
      String(safeAttributes.cta_id ?? ""),
      String(safeAttributes.source_page ?? ""),
    ].join(":");
    if (startedFormKeys.has(startKey)) return;
    startedFormKeys.add(startKey);
  }

  try {
    sendToGa4(event, safeAttributes);
  } catch {
    // Analytics must never interrupt a document tool or consultation request.
  }

  if (!endpoint) return;

  const body = {
    event: eventAliases[event] ?? event,
    occurred_at: new Date().toISOString(),
    attributes: safeAttributes,
  };

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt a document tool or consultation request.
  }
}
