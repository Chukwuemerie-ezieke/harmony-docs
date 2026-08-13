# Selective page ranges added

## Updated tools

- Rotate PDF: rotate all pages (default) or a selected range.
- Page Numbers: number all pages (default) or a selected range.
- Watermark: watermark all pages (default) or a selected range.
- Split PDF: split into one file per page (default) or custom semicolon-separated ranges (e.g. `1-3;4-6;7`) to create multiple output files.

## Implementation

All four tools now use the Release 1 worker functions (`rotateSelectedPages`, `addPageNumbersToSelectedPages`, `watermarkSelectedPages`, `splitPdfByRanges`) and the shared `PageRangeControls` / `parsePageRanges` utilities already committed to the branch.

## Validation required

Run `npm run check` and `npm run build`, then test each tool with: no range entered (all pages), a valid range, and an invalid range (should show a clear error without crashing).
