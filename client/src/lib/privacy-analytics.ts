export type PublicAnalyticsEvent =
  | "tool_viewed"
  | "upload_started"
  | "process_completed"
  | "process_failed"
  | "download_clicked"
  | "cta_clicked"
  | "lead_form_started"
  | "lead_form_submitted";

export type PublicAnalyticsAttributes = Record<string, string | number | boolean | undefined>;

const allowedKeys = new Set([
  "tool_slug",
  "tool_category",
  "cta_id",
  "source_page",
  "outcome",
  "error_code",
]);

const blockedKeyPattern = /(file|document|name|email|phone|ip|content|text|ocr|address|token|password)/i;

function sanitiseAttributes(attributes: PublicAnalyticsAttributes): Record<string, string | number | boolean> {
  return Object.entries(attributes).reduce<Record<string, string | number | boolean>>((result, [key, value]) => {
    if (value === undefined || !allowedKeys.has(key) || blockedKeyPattern.test(key)) return result;
    result[key] = typeof value === "string" ? value.slice(0, 120) : value;
    return result;
  }, {});
}

export async function trackPublicEvent(
  event: PublicAnalyticsEvent,
  attributes: PublicAnalyticsAttributes = {},
  endpoint = import.meta.env.VITE_PUBLIC_ANALYTICS_ENDPOINT as string | undefined,
): Promise<void> {
  if (!endpoint) return;

  const body = {
    event,
    occurred_at: new Date().toISOString(),
    attributes: sanitiseAttributes(attributes),
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
