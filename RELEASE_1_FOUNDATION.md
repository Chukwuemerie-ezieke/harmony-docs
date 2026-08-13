# HarmonyDocs Release 1 foundation

This commit adds browser-compatible processing primitives that fit the current React/Vite/Web Worker architecture.

## Added

- Page-range parsing and validation.
- Page-order validation.
- Organised-page plan builder supporting duplicate and blank pages.
- Dedicated Release 1 PDF worker for split ranges, selected-page rotation, selected-page numbering, selected-page watermarking, and page-plan output.
- Worker bridge functions for the new actions.
- Sequential batch queue model with per-file queued/processing/done/error states.

## Deliberately not included

Office conversion, OCR, AI, redaction, PDF/A, signature requests, cloud imports, and server retention are not claimed here because they require additional server-side infrastructure or specialist services.

## Next integration step

Wire these primitives into the existing tool pages, add PDF.js thumbnails to the organiser, repair the router, and run the project build/tests before release.
