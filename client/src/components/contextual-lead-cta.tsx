import { LeadContext } from "@/lib/lead-capture";
import { trackPublicEvent } from "@/lib/privacy-analytics";

export type ToolCategory = "organisation" | "conversion" | "security" | "signing" | "image";
export interface ContextualLeadCtaProps { category: ToolCategory; toolSlug: string; onConsultationRequest?: (context: LeadContext) => void; contactHref?: string; className?: string; }
const copy: Record<ToolCategory, { heading: string; body: string }> = {
  organisation: { heading: "Need a document process built for your organisation?", body: "Harmony Digital Consults can help automate recurring document tasks and approvals." },
  conversion: { heading: "Need recurring document conversion or digitisation?", body: "Talk to Harmony Digital Consults about a dependable workflow for your organisation." },
  security: { heading: "Need stronger document controls?", body: "Talk to Harmony Digital Consults about secure workflows, document governance, and compliance support." },
  signing: { heading: "Need forms, approvals, or signature workflows?", body: "Harmony Digital Consults can help design a process that fits your organisation." },
  image: { heading: "Need a tailored digital workflow?", body: "Harmony Digital Consults builds practical web, document, and automation solutions." },
};
export function ContextualLeadCta({ category, toolSlug, onConsultationRequest, contactHref = "/contact", className }: ContextualLeadCtaProps) {
  const content = copy[category]; const context: LeadContext = { sourceTool: toolSlug, sourceCta: `${category}-result-cta` };
  function handleConsultation() { void trackPublicEvent("cta_clicked", { tool_slug: toolSlug, tool_category: category, cta_id: context.sourceCta }); onConsultationRequest?.(context); }
  return <aside className={className} aria-label="Harmony Digital Consults consultation invitation"><h2>{content.heading}</h2><p>{content.body}</p>{onConsultationRequest ? <button type="button" onClick={handleConsultation}>Discuss a project</button> : <a href={contactHref} onClick={handleConsultation}>Discuss a project</a>}<a href={contactHref}>Contact Harmony Digital Consults</a></aside>;
}
