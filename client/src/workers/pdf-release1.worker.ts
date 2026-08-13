import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

type PagePlanItem = number | "blank";

self.onmessage = async (event: MessageEvent) => {
  const { id, action, payload } = event.data;
  try {
    let result: unknown;
    if (action === "split-ranges") result = await splitRanges(payload.file, payload.ranges, payload.filename);
    else if (action === "rotate-pages") result = await rotatePages(payload.file, payload.pages, payload.angle);
    else if (action === "page-numbers-pages") result = await pageNumbers(payload.file, payload.pages, payload.position, payload.startFrom);
    else if (action === "watermark-pages") result = await watermarkPages(payload.file, payload.pages, payload.text, payload.opacity, payload.fontSize);
    else if (action === "organize-plan") result = await organizePlan(payload.file, payload.plan);
    else throw new Error(`Unknown action: ${action}`);
    self.postMessage({ id, status: "success", data: result });
  } catch (error) {
    self.postMessage({ id, status: "error", error: error instanceof Error ? error.message : "PDF processing failed." });
  }
};

async function splitRanges(bytes: Uint8Array, ranges: number[][], filename: string) {
  const source = await PDFDocument.load(bytes);
  const baseName = filename.replace(/\.pdf$/i, "");
  const outputs: Array<{ name: string; data: Uint8Array }> = [];
  for (const [index, pages] of ranges.entries()) {
    const output = await PDFDocument.create();
    const copied = await output.copyPages(source, pages);
    copied.forEach((page) => output.addPage(page));
    outputs.push({ name: `${baseName}_part_${index + 1}.pdf`, data: await output.save() });
  }
  return outputs;
}

async function rotatePages(bytes: Uint8Array, pages: number[], angle: number) {
  const pdf = await PDFDocument.load(bytes);
  const allPages = pdf.getPages();
  for (const pageIndex of pages) {
    const page = allPages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex + 1} does not exist.`);
    page.setRotation(degrees(page.getRotation().angle + angle));
  }
  return pdf.save();
}

async function pageNumbers(bytes: Uint8Array, pages: number[], position: string, startFrom: number) {
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const allPages = pdf.getPages();
  pages.forEach((pageIndex, numberIndex) => {
    const page = allPages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex + 1} does not exist.`);
    const label = String(startFrom + numberIndex);
    const { width } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, 11);
    const x = position === "bottom-right" ? width - textWidth - 40 : position === "bottom-left" ? 40 : width / 2 - textWidth / 2;
    page.drawText(label, { x, y: 30, size: 11, font, color: rgb(0.3, 0.3, 0.3) });
  });
  return pdf.save();
}

async function watermarkPages(bytes: Uint8Array, pages: number[], text: string, opacity: number, fontSize: number) {
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const allPages = pdf.getPages();
  for (const pageIndex of pages) {
    const page = allPages[pageIndex];
    if (!page) throw new Error(`Page ${pageIndex + 1} does not exist.`);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, { x: width / 2 - textWidth / 2, y: height / 2, size: fontSize, font, color: rgb(0.5, 0.5, 0.5), opacity, rotate: degrees(-45) });
  }
  return pdf.save();
}

async function organizePlan(bytes: Uint8Array, plan: PagePlanItem[]) {
  const source = await PDFDocument.load(bytes);
  const output = await PDFDocument.create();
  const sourcePageCount = source.getPageCount();
  for (const item of plan) {
    if (item === "blank") {
      output.addPage([595.28, 841.89]);
      continue;
    }
    if (item < 0 || item >= sourcePageCount) throw new Error(`Page ${item + 1} does not exist.`);
    const [page] = await output.copyPages(source, [item]);
    output.addPage(page);
  }
  return output.save();
}
