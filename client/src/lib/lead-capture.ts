export type LeadInterest =
  | "document-automation"
  | "ai-solutions"
  | "school-technology"
  | "website-software-development"
  | "data-privacy-compliance"
  | "training-consulting"
  | "other";

export type PreferredContactMethod = "email" | "phone" | "either";

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  country: string;
  interest: LeadInterest;
  projectDescription: string;
  preferredContactMethod: PreferredContactMethod;
  privacyConsent: boolean;
  marketingConsent?: boolean;
  website?: string;
}

export interface LeadContext {
  sourceTool?: string;
  sourceCta?: string;
  campaign?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface LeadPayload {
  submittedAt: string;
  lead: Omit<LeadInput, "website">;
  context: LeadContext;
}

export interface LeadSubmissionResult {
  ok: boolean;
  message: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxDescriptionLength = 4000;
const allowedInterests: readonly LeadInterest[] = [
  "document-automation",
  "ai-solutions",
  "school-technology",
  "website-software-development",
  "data-privacy-compliance",
  "training-consulting",
  "other",
];
const allowedContactMethods: readonly PreferredContactMethod[] = ["email", "phone", "either"];

function cleanText(value: string, limit: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function cleanOptionalText(value: string | undefined, limit: number): string | undefined {
  const cleaned = cleanText(value ?? "", limit);
  return cleaned || undefined;
}

function cleanCampaign(context: LeadContext): LeadContext["campaign"] {
  if (!context.campaign) return undefined;
  const campaign = {
    source: cleanOptionalText(context.campaign.source, 200),
    medium: cleanOptionalText(context.campaign.medium, 200),
    campaign: cleanOptionalText(context.campaign.campaign, 200),
    term: cleanOptionalText(context.campaign.term, 200),
    content: cleanOptionalText(context.campaign.content, 200),
  };
  return Object.values(campaign).some(Boolean) ? campaign : undefined;
}

export function validateLeadInput(input: LeadInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = cleanText(input.name, 160);
  const email = cleanText(input.email, 254);
  const country = cleanText(input.country, 100);
  const description = cleanText(input.projectDescription, maxDescriptionLength);

  if (!name) errors.name = "Enter your name.";
  if (!email || !emailPattern.test(email)) errors.email = "Enter a valid email address.";
  if (!country) errors.country = "Enter your country.";
  if (!allowedInterests.includes(input.interest)) errors.interest = "Choose an area of interest.";
  if (!description) errors.projectDescription = "Tell us briefly about your project.";
  if (description.length > maxDescriptionLength) {
    errors.projectDescription = `Keep your description under ${maxDescriptionLength} characters.`;
  }
  if (!allowedContactMethods.includes(input.preferredContactMethod)) {
    errors.preferredContactMethod = "Choose how you would like to be contacted.";
  }
  if (!input.privacyConsent) {
    errors.privacyConsent = "You must agree to the privacy notice before submitting.";
  }
  if (cleanText(input.website ?? "", 250)) {
    errors.form = "We could not accept this submission.";
  }
  return errors;
}

export function buildLeadPayload(input: LeadInput, context: LeadContext = {}): LeadPayload {
  const errors = validateLeadInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error("Lead input is invalid.");
  }

  return {
    submittedAt: new Date().toISOString(),
    lead: {
      name: cleanText(input.name, 160),
      email: cleanText(input.email, 254).toLowerCase(),
      phone: cleanOptionalText(input.phone, 80),
      organisation: cleanOptionalText(input.organisation, 160),
      country: cleanText(input.country, 100),
      interest: input.interest,
      projectDescription: cleanText(input.projectDescription, maxDescriptionLength),
      preferredContactMethod: input.preferredContactMethod,
      privacyConsent: true,
      marketingConsent: Boolean(input.marketingConsent),
    },
    context: {
      sourceTool: cleanOptionalText(context.sourceTool, 120),
      sourceCta: cleanOptionalText(context.sourceCta, 120),
      campaign: cleanCampaign(context),
    },
  };
}

export async function submitLead(
  payload: LeadPayload,
  endpoint = import.meta.env.VITE_LEAD_WEBHOOK_URL as string | undefined,
): Promise<LeadSubmissionResult> {
  if (!endpoint) {
    return {
      ok: true,
      message: "Thank you. Your consultation request is ready for follow-up.",
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "omit",
  });

  if (!response.ok) {
    return {
      ok: false,
      message: "We could not send your request right now. Please try again later.",
    };
  }

  return {
    ok: true,
    message: "Thank you. We have received your consultation request.",
  };
}
