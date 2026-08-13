# Integrating public lead capture

## Purpose

The modules in `client/src/lib/lead-capture.ts` and `client/src/lib/privacy-analytics.ts` provide a privacy-safe foundation for optional consultation requests in a no-login HarmonyDocs experience.

## Contact form integration

1. Import `validateLeadInput`, `buildLeadPayload`, and `submitLead` into the contact or consultation component.
2. Maintain a hidden `website` field as a honeypot. Do not display it to users or label it as a required field.
3. Require `privacyConsent` before calling `buildLeadPayload`.
4. Keep `marketingConsent` optional and unchecked by default.
5. Build the context only from `sourceTool`, `sourceCta`, and permitted UTM campaign values. Do not pass filenames, document text, output names, file sizes, page counts, job IDs, browser IDs, or IP addresses.
6. Call `trackPublicEvent("lead_form_started")` when a visitor begins the form and `trackPublicEvent("lead_form_submitted", { source_page: "contact" })` only after a successful submission.

## Tool-result CTA integration

Display CTAs only after a user receives a result or reaches a result state. They must never gate document processing or downloading. Suitable categories are organisation, conversion, security, signing, and image tools. CTA copy must be contextual to the tool category, never to the uploaded content.

## Environment variables

- `VITE_LEAD_WEBHOOK_URL`: optional HTTPS endpoint that receives voluntary lead payloads.
- `VITE_PUBLIC_ANALYTICS_ENDPOINT`: optional HTTPS endpoint for allow-listed anonymous product events.

When these variables are absent, lead submission returns a safe local success response and analytics does nothing. Before production, configure a real lead destination and make the contact form copy accurately state what happens after submission.

## Webhook requirements

The receiving endpoint must validate input, rate-limit requests, reject unexpected fields, protect logs, set retention rules, and avoid storing uploaded-document information. A server-side integration should add notification email or CRM delivery; do not put CRM API secrets in the browser.
