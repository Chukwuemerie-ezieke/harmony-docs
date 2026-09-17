import { Layout } from "@/components/layout";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import type { LeadContext } from "@/lib/lead-capture";

/**
 * Reads consultation context from the hash query string, e.g.
 *   #/consultation?tool=merge&cta=result
 * plus optional UTM campaign params. Kept tolerant of a missing query.
 */
function readContextFromHash(): LeadContext {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash; // e.g. "#/consultation?tool=merge&cta=result"
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return {};
  const params = new URLSearchParams(hash.slice(queryIndex + 1));

  const campaign = {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    content: params.get("utm_content") ?? undefined,
  };
  const hasCampaign = Object.values(campaign).some(Boolean);

  return {
    sourceTool: params.get("tool") ?? undefined,
    sourceCta: params.get("cta") ?? undefined,
    campaign: hasCampaign ? campaign : undefined,
  };
}

export default function ConsultationPage() {
  const context = readContextFromHash();

  return (
    <Layout>
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Consultation
          </div>
          <LeadCaptureForm
            context={context}
            title="Book a consultation with Harmony Digital Consults"
            description="Tell us about your document or software needs. This request is optional and never affects your use of the free tools."
          />
          <p className="mt-8 text-sm text-muted-foreground">
            Prefer to reach us directly? See all our{" "}
            <a href="#/contact" className="text-primary underline">contact channels</a>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
