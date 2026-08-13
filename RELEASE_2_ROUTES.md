# Release 2 route registration

## Router changes

- Added `/tool/organize` for the visual Organize PDF page.
- Added `/tool/pdf-to-images` for the enhanced PDF-to-images page.
- Replaced the broken server-dependent HTML conversion import with the browser-based `html-to-pdf-browser` implementation.
- Preserved all existing routes, including the original rearrange and PDF-to-image pages for regression comparison.

## Registry changes

- Added `Organize PDF`.
- Added `PDF to Images Pro`.
- Renamed the public HTML tool description to reflect the honest browser-preview flow.

## Required validation

Run `npm run check` and `npm run build`, then test every registered route directly through the deployed hash-based URLs before merging to `main`.
