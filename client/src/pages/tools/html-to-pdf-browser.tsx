import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";

function sanitiseHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelectorAll("script, iframe, object, embed, link[rel='preload'], link[rel='modulepreload']").forEach((node) => node.remove());
  parsed.querySelectorAll<HTMLElement>("*").forEach((element) => {
    for (const attribute of [...element.attributes]) {
      if (attribute.name.toLowerCase().startsWith("on")) element.removeAttribute(attribute.name);
    }
  });
  return `<!doctype html><html><head><meta charset="utf-8"><title>HarmonyDocs HTML to PDF</title></head><body>${parsed.body.innerHTML}</body></html>`;
}

export default function HtmlToPdfBrowserTool() {
  const [previewUrl, setPreviewUrl] = useState("");

  return (
    <ToolPage
      toolId="html-to-pdf"
      instructions={{
        title: "How to convert an HTML file to PDF",
        steps: [
          "Upload one .html or .htm file.",
          "HarmonyDocs prepares a safe browser preview.",
          "Use your browser’s Print option and choose Save as PDF.",
        ],
      }}
      faqs={[
        { question: "Does this upload my HTML file to a server?", answer: "No. This browser flow reads the file locally and prepares a preview on your device." },
        { question: "Will every website design be preserved?", answer: "Basic HTML content is preserved. External fonts, images, stylesheets, and interactive features may not appear unless your browser can access them." },
      ]}
      onProcess={async (files) => {
        const file = files[0];
        if (!file) throw new Error("Choose one HTML file.");
        const html = sanitiseHtml(await file.text());
        const blob = new Blob([html], { type: "text/html" });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return { data: blob, message: "Safe HTML preview is ready. Open it and use Print → Save as PDF." };
      }}
      onDownload={(blob: Blob) => downloadBlob(blob, "html-preview.html")}
      downloadLabel="Download safe HTML preview"
    >
      {({ status }) => status === "done" && previewUrl ? (
        <section aria-label="HTML preview actions">
          <p>Your safe HTML preview is ready. Open it in a new tab, then use your browser’s Print option and choose “Save as PDF”.</p>
          <a href={previewUrl} target="_blank" rel="noreferrer">Open safe HTML preview</a>
        </section>
      ) : null}
    </ToolPage>
  );
}
