# HTML File to PDF fix

## Problem

The previous tool posted uploaded files to `./api/html-to-pdf`. That endpoint is unavailable on a static GitHub Pages deployment, so visitors received “Failed to convert HTML to PDF.”

## Replacement

`html-to-pdf-browser.tsx` provides a static-site-compatible flow:

1. Reads the uploaded HTML file locally.
2. Removes scripts, embedded active content, and inline event-handler attributes.
3. Creates a safe local HTML preview URL.
4. Lets the visitor open the preview and use the browser’s Print → Save as PDF command.
5. Allows downloading the sanitised HTML preview.

## Honest limitation

This does not claim pixel-perfect webpage rendering. External stylesheets, fonts, images, authentication-protected resources, and interactive content may not be preserved. A future server-side renderer can provide full URL-to-PDF support after secure deployment and SSRF protections are in place.

## Router action required

Replace the existing `html-to-pdf` lazy import with `@/pages/tools/html-to-pdf-browser`, or add it as a temporary route such as `/tool/html-to-pdf-browser` until regression testing is complete.
