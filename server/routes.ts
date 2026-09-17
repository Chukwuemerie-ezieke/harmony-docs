import type { Express } from "express";
import { type Server } from "http";

// NOTE (Phase 0 — Quality & Trust):
// The previous /api/protect, /api/unlock and /api/html-to-pdf endpoints were
// removed. They relied on native binaries (qpdf/wkhtmltopdf) that are not
// present in the static GitHub Pages deployment, and their catch-all fallbacks
// returned the *original* file as a "protected"/"unlocked" success — a false
// security guarantee. These operations now run genuinely in the browser:
//   - Protect / Unlock: QPDF compiled to WebAssembly (client/src/lib/pdf-security.ts)
//   - HTML to PDF: rendered locally (client/src/pages/tools/html-to-pdf-browser.tsx)
// If server-side processing is reintroduced later, it must fail closed, validate
// input, run untrusted converters in isolation, and never substitute the input.

export async function registerRoutes(
  httpServer: Server,
  _app: Express,
): Promise<Server> {
  return httpServer;
}
