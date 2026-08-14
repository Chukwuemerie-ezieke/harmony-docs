# Privacy notice and consultation CTA on tool results

## Scope

Adds a shared `ToolResultAssurance` panel to the success state rendered by `ProcessingState`. Because tool pages use this shared success component, the panel appears after a successful result across HarmonyDocs tools without adding duplicate copy to individual pages.

## Content

- A plain-language privacy assurance: supported tasks are processed in-browser whenever possible, and completed files are not retained after download.
- A link to `/privacy` for detailed policy information.
- A consultation CTA linking to `/consultation`, which uses the existing lead-capture flow.

## Design rationale

The reassurance is shown after completion, next to the download/next-action moment where users most need confidence about their document and where a relevant workflow-consulting offer is least disruptive.

## Validation required

Run `npm run check` and `npm run build`. Complete a processing flow on at least one PDF tool and one image tool; verify the notice appears only after success, both links work, and download/reset controls remain functional.
