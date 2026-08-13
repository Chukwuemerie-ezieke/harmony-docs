# Release 2 bug fixes

## PDF to Images Pro worker mismatch

The page previously imported the bundled `pdfjs-dist` package without setting a matching `workerSrc`, causing PDF.js to fetch an incompatible worker script from a public CDN and fail with "Setting up fake worker failed".

Fix: dynamically import `pdfjs-dist` and its worker from the same pinned `esm.sh` version used by the existing working PDF-to-Image tool, keeping both in version lock-step.

## HTML File to PDF now outputs a real PDF

The previous implementation intentionally produced only a sanitised HTML preview and asked the user to manually use Print -> Save as PDF, which did not meet the expected "convert to PDF" outcome.

Fix: render the sanitised HTML into an off-screen container, capture it with `html2canvas`, and embed the resulting image into a multi-page PDF using `pdf-lib`, entirely in the browser. The tool now downloads an actual `.pdf` file.

## Known limitation

This HTML-to-PDF approach rasterises the page rather than preserving selectable text or complex CSS layouts perfectly. It is suitable for straightforward HTML documents. A future dedicated PDF text-layer renderer can be evaluated if higher fidelity is required.
