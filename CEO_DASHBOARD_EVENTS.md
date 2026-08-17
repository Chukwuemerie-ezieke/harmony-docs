# HarmonyDocs CEO dashboard events

These events are sent to GA4 Measurement ID `G-DQ50P3CHGP` after the activation PR is merged. Acquisition, device, country, and channel dimensions come from GA4 automatically.

## Events

| Event | When it fires | Allowed parameters |
| --- | --- | --- |
| `tool_opened` | A tool page is opened | `tool_id`, `tool_category` |
| `upload_started` | A visitor selects files for a tool | `tool_id`, `tool_category` |
| `processing_completed` | A tool finishes successfully | `tool_id`, `tool_category` |
| `processing_failed` | A tool fails | `tool_id`, `tool_category`, `error_code` |
| `download_clicked` | A visitor downloads a result | `tool_id`, `tool_category` |
| `consultation_cta_clicked` | A consultation CTA is clicked | `tool_id`, `cta_placement` |
| `lead_form_started` | A visitor begins the consultation form | `source_page`, `source_tool` |
| `lead_form_submitted` | A consultation request is accepted | `source_page`, `source_tool`, `outcome` |

## Explicitly excluded

Document files, filenames, PDF contents, passwords, email addresses, phone numbers, organisation names, project descriptions, IP addresses, upload metadata, and form field values are stripped before any event is sent.

## Current wiring

- Consultation CTA and lead-form events are live in this branch.
- Tool open, upload, processing, and download events still need a surgical `ToolPage` hook-up. That change is intentionally not guessed from incomplete page source.
