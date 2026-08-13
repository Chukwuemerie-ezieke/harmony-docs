# Release 2 integration notes

## Added pages and shared components

- `organize.tsx`: visual page-plan organiser using the Release 1 worker. It currently uses accessible list controls rather than thumbnails; PDF.js thumbnails can be added after build validation.
- `pdf-to-images-release2.tsx`: improved PDF-to-image page with page ranges, PNG/JPG, resolution, JPG quality, single download, and ZIP download.
- `tool-experience.tsx`: shared processing notice and result CTA wrapper.
- `release2-routes.ts`: explicit route additions for the router and registry.

## Required router/registry edits

Add an `organize` registry entry or replace `rearrange` with the new visual organiser. Add lazy routes for `/tool/organize` and `/tool/pdf-to-images`. Keep the existing routes available until the replacements pass browser testing.

## Processing mode

These tools use browser-side PDF/image processing. Use `mode="browser"` in `ToolExperience` only after validating that the active page does not call the Express API.

## Validation required before merge

Run `npm run check` and `npm run build`; then test direct links, refresh behavior, output downloads, and the GitHub Pages/Vercel deployment.
