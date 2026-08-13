# Public lead-capture UI integration

## Components

- `LeadCaptureForm`: voluntary consultation form. Use on the existing contact page or inside a dialog opened from a result-page CTA.
- `ContextualLeadCta`: optional, content-blind CTA for a completed tool action or result state.
- `FileProcessingNotice`: explicit user notice before upload.

## Tool page pattern

1. Determine the tool category from the existing tool registry: organisation, conversion, security, signing, or image.
2. Render `FileProcessingNotice` immediately beside or below the upload control. Supply `mode="browser"` only where the tool is confirmed browser-only. Use `unknown` until server handling is verified.
3. After—not before—the user has a result, render `ContextualLeadCta`.
4. Pass its callback into a modal or route containing `LeadCaptureForm` with `{ sourceTool: tool.slug, sourceCta: "<category>-result-cta" }`.
5. Do not block a result, download, retry, or tool use with the CTA or form.

## Contact page pattern

Render `LeadCaptureForm` directly on the contact page with `{ sourceCta: "contact-page" }`. Keep existing direct contact channels available as alternatives.

## Accessibility and privacy

Do not visually hide consent requirements. The honeypot field is the only intentionally hidden control. Do not pass upload metadata, filenames, document contents, file IDs, or user identifiers into component props or analytics events.
