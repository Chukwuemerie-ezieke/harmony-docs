import { FormEvent, useMemo, useState } from "react";
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

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "", form: "" }));
  }

  function handleStart() {
    void trackPublicEvent("lead_form_started", {
      tool_slug: context.sourceTool,
      cta_id: context.sourceCta,
      source_page: "consultation_form",
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
        tool_slug: context.sourceTool,
        cta_id: context.sourceCta,
        source_page: "consultation_form",
        outcome: "success",
      });
    } catch {
      setStatus("error");
      setMessage("We could not send your request right now. Please try again later.");
    }
  }

  return (
    <section className={className} aria-labelledby="consultation-form-title" data-context={contextKey}>
      <h2 id="consultation-form-title">{title}</h2>
      <p>{description}</p>
      {status === "success" ? <p role="status">{message}</p> : <form onSubmit={handleSubmit} onFocus={handleStart} noValidate>
        <label>Name<input value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" />{errors.name && <span role="alert">{errors.name}</span>}</label>
        <label>Work email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" />{errors.email && <span role="alert">{errors.email}</span>}</label>
        <label>Phone number (optional)<input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></label>
        <label>Organisation (optional)<input value={form.organisation} onChange={(event) => update("organisation", event.target.value)} autoComplete="organization" /></label>
        <label>Country<input value={form.country} onChange={(event) => update("country", event.target.value)} autoComplete="country-name" />{errors.country && <span role="alert">{errors.country}</span>}</label>
        <label>Area of interest<select value={form.interest} onChange={(event) => update("interest", event.target.value as LeadInterest)}>{interests.map((interest) => <option key={interest.value} value={interest.value}>{interest.label}</option>)}</select></label>
        <label>Brief project description<textarea value={form.projectDescription} onChange={(event) => update("projectDescription", event.target.value)} maxLength={4000} rows={5} />{errors.projectDescription && <span role="alert">{errors.projectDescription}</span>}</label>
        <fieldset><legend>Preferred contact method</legend>{contactMethods.map((method) => <label key={method.value}><input type="radio" name="preferredContactMethod" checked={form.preferredContactMethod === method.value} onChange={() => update("preferredContactMethod", method.value)} />{method.label}</label>)}</fieldset>
        <label style={{ display: "none" }} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label>
        <label><input type="checkbox" checked={form.privacyConsent} onChange={(event) => update("privacyConsent", event.target.checked)} />I agree to the HarmonyDocs privacy notice for this consultation request.</label>{errors.privacyConsent && <span role="alert">{errors.privacyConsent}</span>}
        <label><input type="checkbox" checked={form.marketingConsent} onChange={(event) => update("marketingConsent", event.target.checked)} />I would like occasional practical updates from Harmony Digital Consults.</label>
        {errors.form && <span role="alert">{errors.form}</span>}{status === "error" && <p role="alert">{message}</p>}
        <button type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending request…" : "Request a consultation"}</button>
      </form>}
    </section>
  );
}
