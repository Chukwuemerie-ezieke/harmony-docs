import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  LeadContext,
  LeadInput,
  LeadInterest,
  PreferredContactMethod,
  buildLeadPayload,
  submitLead,
  validateLeadInput,
} from "@/lib/lead-capture";
import { trackPublicEvent } from "@/lib/privacy-analytics";
import { getToolById } from "@/lib/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export interface LeadCaptureFormProps {
  context?: LeadContext;
  title?: string;
  description?: string;
  className?: string;
}

const interests: Array<{ value: LeadInterest; label: string }> = [
  { value: "document-automation", label: "Document automation" },
  { value: "ai-solutions", label: "AI solutions" },
  { value: "school-technology", label: "School technology" },
  { value: "website-software-development", label: "Website or software development" },
  { value: "data-privacy-compliance", label: "Data privacy or compliance" },
  { value: "training-consulting", label: "Training or consulting" },
  { value: "other", label: "Other" },
];

const contactMethods: Array<{ value: PreferredContactMethod; label: string }> = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "either", label: "Either" },
];

const initialForm: LeadInput = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  country: "Nigeria",
  interest: "document-automation",
  projectDescription: "",
  preferredContactMethod: "email",
  privacyConsent: false,
  marketingConsent: false,
  website: "",
};

const fieldError = "text-sm text-destructive font-medium";

export function LeadCaptureForm({
  context = {},
  title = "Discuss a project with Harmony Digital Consults",
  description = "Tell us what you need. This request is optional and does not affect your use of HarmonyDocs.",
  className,
}: LeadCaptureFormProps) {
  const [form, setForm] = useState<LeadInput>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const contextKey = useMemo(() => `${context.sourceTool ?? ""}:${context.sourceCta ?? ""}`, [context]);
  const sourceTool = context.sourceTool ? getToolById(context.sourceTool) : undefined;

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "", form: "" }));
  }

  function handleStart() {
    void trackPublicEvent("lead_form_started", {
      tool_id: context.sourceTool,
      tool_slug: context.sourceTool,
      source_tool: context.sourceTool,
      cta_id: context.sourceCta,
      source_page: context.sourceCta ? "tool_result" : "contact",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLeadInput(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setMessage("");
    try {
      const result = await submitLead(buildLeadPayload(form, context));
      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }
      setStatus("success");
      setMessage(result.message);
      setForm(initialForm);
      void trackPublicEvent("lead_form_submitted", {
        tool_id: context.sourceTool,
        tool_slug: context.sourceTool,
        source_tool: context.sourceTool,
        cta_id: context.sourceCta,
        source_page: context.sourceCta ? "tool_result" : "contact",
        outcome: "success",
      });
    } catch {
      setStatus("error");
      setMessage("We could not send your request right now. Please try again later.");
    }
  }

  if (status === "success") {
    return (
      <section className={className} aria-labelledby="consultation-form-title" data-context={contextKey}>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center" role="status" data-testid="lead-success">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
          <h2 id="consultation-form-title" className="mt-3 text-lg font-semibold text-foreground">Request received</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <p className="mt-2 text-sm text-muted-foreground">We typically respond within one business day.</p>
          <Button variant="outline" className="mt-4" onClick={() => setStatus("idle")} data-testid="lead-another">
            Send another request
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={className} aria-labelledby="consultation-form-title" data-context={contextKey}>
      <div className="mb-6">
        <h2 id="consultation-form-title" className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
        {sourceTool && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary" data-testid="lead-source-tool">
            About your use of {sourceTool.name}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} onFocus={handleStart} noValidate className="space-y-5" data-testid="lead-form">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Name</Label>
            <Input id="lead-name" value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
            {errors.name && <p className={fieldError} role="alert">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-email">Work email</Label>
            <Input id="lead-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} />
            {errors.email && <p className={fieldError} role="alert">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-phone">Phone number <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="lead-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-org">Organisation <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="lead-org" value={form.organisation} onChange={(e) => update("organisation", e.target.value)} autoComplete="organization" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-country">Country</Label>
            <Input id="lead-country" value={form.country} onChange={(e) => update("country", e.target.value)} autoComplete="country-name" aria-invalid={Boolean(errors.country)} />
            {errors.country && <p className={fieldError} role="alert">{errors.country}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-interest">Area of interest</Label>
            <Select value={form.interest} onValueChange={(v) => update("interest", v as LeadInterest)}>
              <SelectTrigger id="lead-interest"><SelectValue /></SelectTrigger>
              <SelectContent>
                {interests.map((interest) => (
                  <SelectItem key={interest.value} value={interest.value}>{interest.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead-description">Brief project description</Label>
          <Textarea id="lead-description" value={form.projectDescription} onChange={(e) => update("projectDescription", e.target.value)} maxLength={4000} rows={5} aria-invalid={Boolean(errors.projectDescription)} />
          {errors.projectDescription && <p className={fieldError} role="alert">{errors.projectDescription}</p>}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Preferred contact method</legend>
          <RadioGroup
            value={form.preferredContactMethod}
            onValueChange={(v) => update("preferredContactMethod", v as PreferredContactMethod)}
            className="flex gap-4"
          >
            {contactMethods.map((method) => (
              <div key={method.value} className="flex items-center gap-2">
                <RadioGroupItem value={method.value} id={`contact-${method.value}`} />
                <Label htmlFor={`contact-${method.value}`} className="font-normal">{method.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        {/* Honeypot field: hidden from users, catches bots. */}
        <div className="hidden" aria-hidden="true">
          <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox id="lead-privacy" checked={form.privacyConsent} onCheckedChange={(v) => update("privacyConsent", v === true)} aria-invalid={Boolean(errors.privacyConsent)} />
            <Label htmlFor="lead-privacy" className="font-normal leading-snug">
              I agree to the HarmonyDocs privacy notice for this consultation request.
            </Label>
          </div>
          {errors.privacyConsent && <p className={fieldError} role="alert">{errors.privacyConsent}</p>}
          <div className="flex items-start gap-2">
            <Checkbox id="lead-marketing" checked={form.marketingConsent} onCheckedChange={(v) => update("marketingConsent", v === true)} />
            <Label htmlFor="lead-marketing" className="font-normal leading-snug">
              I would like occasional practical updates from Harmony Digital Consults.
            </Label>
          </div>
        </div>

        {errors.form && <p className={fieldError} role="alert">{errors.form}</p>}
        {status === "error" && <p className={fieldError} role="alert">{message}</p>}

        <Button type="submit" size="lg" disabled={status === "submitting"} data-testid="lead-submit">
          {status === "submitting" ? "Sending request…" : "Request a consultation"}
        </Button>
      </form>
    </section>
  );
}
