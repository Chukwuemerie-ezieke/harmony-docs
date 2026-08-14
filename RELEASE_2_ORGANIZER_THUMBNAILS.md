# Organize PDF visual thumbnails

## What changed

`PdfPageOrganizer` now renders an actual PNG thumbnail of each PDF page using the same pinned PDF.js version already validated in the PDF to Images Pro fix, instead of showing plain "Page N" text labels.

## Interaction changes

- Pages are shown in a responsive thumbnail grid.
- Each page card is draggable; dropping it onto another card reorders pages.
- Move-left/move-right buttons remain as a keyboard/non-drag fallback.
- Selection checkboxes, duplicate, keep-selected-only, delete-selected, insert-blank, and reset are unchanged in behaviour.

## Resilience

If thumbnail rendering fails for any reason (unsupported PDF feature, network hiccup fetching the PDF.js module, etc.), the organiser still functions using text placeholders and the existing move/select/duplicate/delete/insert/reset/export actions.

## Validation required

Run `npm run check` and `npm run build`, then test with a multi-page PDF: verify thumbnails render, drag-and-drop reordering works, and the final exported PDF matches the displayed order.
