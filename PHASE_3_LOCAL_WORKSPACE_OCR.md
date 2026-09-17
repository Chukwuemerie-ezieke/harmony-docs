# Phase 3 — Local workspace & client-side OCR

Phase 3 was originally scoped around optional accounts, encrypted **cloud**
history, **team** workspaces, large-file **server** jobs, OCR/comparison/
redaction APIs, and usage-based billing.

HarmonyDocs is deployed as a **static client** (GitHub Pages). The cloud,
account, team, server-job, and billing pieces genuinely require a backend +
database + auth, and cannot be delivered honestly on a static host — faking
them (e.g. pretending localStorage is "cloud sync") would repeat exactly the
kind of false guarantee that Phase 0 removed.

So this phase ships the **truthful static-client slice** of Phase 3 and
explicitly defers the rest.

## Delivered (runs entirely on the user's device)

### Local document workspace (IndexedDB)
- A small, dependency-free IndexedDB wrapper (`client/src/lib/idb.ts`) and a
  workspace API (`client/src/lib/workspace.ts`).
- **Recent-work history** — metadata only: tool id, output file name, output
  size, and a timestamp. **Never** document contents, extracted text,
  passwords, or personal data. Entries expire after 7 days and are capped at
  30, and everything can be removed.
- **Saved per-tool settings** — a small JSON blob per tool for remembering
  options.
- Surfaced as a **"Recent work"** section in the tools directory (open a tool
  again, remove an entry, or clear all), plus a **"Clear local workspace
  data"** control and a plain-language explanation on the Privacy page.
- Recorded on download from `ToolPage` (best-effort; never blocks the
  download).

### Client-side OCR ("Extract Text")
- A new tool (`/tool/ocr`) that reads text from an image or the first page of
  a PDF using **Tesseract.js (WASM)**, loaded on demand from a CDN — nothing is
  uploaded, and it adds nothing to the main bundle until used.
- Reports progress, supports cancellation (terminates the worker), previews the
  recognised text, and downloads it as a `.txt` file.
- Currently recognises **English**; reads the **first page** of a PDF (split or
  extract other pages first).

## Deferred (require a backend — intentionally NOT faked here)
- Optional **accounts** and authentication.
- **Cloud** history / cross-device sync.
- **Team** workspaces and shared templates.
- Large-file **asynchronous server** jobs.
- Server-side document comparison / redaction **APIs**.
- **Usage plans / billing** for server processing.

If a backend is introduced later, these can be built on top of the existing
typed tool registry and workflow layer. Until then, the product stays
local-first and honest about where processing happens.
