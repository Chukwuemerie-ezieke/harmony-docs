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
  return parsed.body.innerHTML;
}

async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  const html2canvas = (await import("https://esm.sh/html2canvas@1.4.1" as any)).default;
  const { PDFDocument } = await import("pdf-lib");

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#ffffff";
  container.style.padding = "24px";
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas: HTMLCanvasElement = await html2canvas(container, { backgroundColor: "#ffffff", useCORS: true, scale: 2 });
    const pdf = await PDFDocument.create();
    const pageWidth = 595.28;
    const imageWidth = pageWidth - 48;
    const scale = imageWidth / canvas.width;
    const scaledHeight = canvas.height * scale;
    const pageHeight = 841.89;
    const pngDataUrl = canvas.toDataURL("image/png");
    const pngBytes = Uint8Array.from(atob(pngDataUrl.split(",")[1]), (character) => character.charCodeAt(0));
    const image = await pdf.embedPng(pngBytes);

    let remainingHeight = scaledHeight;
    let sourceY = 0;
    while (remainingHeight > 0) {
      const page = pdf.addPage([pageWidth, pageHeight]);
      const drawHeight = Math.min(pageHeight - 48, remainingHeight);
      page.drawImage(image, {
        x: 24,
        y: pageHeight - 24 - drawHeight,
        width: imageWidth,
        height: drawHeight,
        clip: { x: 0, y: canvas.height - (sourceY + drawHeight / scale), width: canvas.width, height: drawHeight / scale },
      } as any);
      remainingHeight -= drawHeight;
      sourceY += drawHeight / scale;
    }

    return pdf.save();
  } finally {
    document.body.removeChild(container);
  }
}

export default function HtmlToPdfBrowserTool() {
  return (
    <ToolPage
      toolId="html-to-pdf"
      instructions={{
        title: "How to convert an HTML file to PDF",
        steps: [
          "Upload one .html or .htm file.",
          "HarmonyDocs renders the sanitised HTML in your browser.",
          "Download the generated PDF.",
        ],
      }}
      faqs={[
        { question: "Does this upload my HTML file to a server?", answer: "No. Rendering happens locally in your browser." },
        { question: "Will every website design be preserved?", answer: "Basic layout and text are preserved. External fonts, complex CSS, and interactive scripts may not render exactly as on the original page." },
      ]}
      onProcess={async (files) => {
        const file = files[0];
        if (!file) throw new Error("Choose one HTML file.");
        const safeHtml = sanitiseHtml(await file.text());
        const pdfBytes = await renderHtmlToPdf(safeHtml);
        return { data: pdfBytes, message: "HTML converted to PDF." };
      }}
      onDownload={(data: Uint8Array) => downloadBlob(data, "converted.pdf")}
      downloadLabel="Download PDF"
    >
      {() => null}
    </ToolPage>
  );
}
