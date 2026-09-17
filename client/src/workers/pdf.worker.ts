// Canonical PDF worker. Consolidates the previously duplicated "whole document"
// and "Release 1 selection-based" workers into a single pdf-lib engine so there
// is one place to maintain PDF operations.
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

type PagePlanItem = number | "blank";

self.onmessage = async (e: MessageEvent) => {
  const { action, id, payload } = e.data;

  try {
    let result;
    switch (action) {
      // --- whole-document operations ---
      case "merge":
        result = await handleMerge(payload.files);
        break;
      case "compress":
        result = await handleCompress(payload.file);
        break;
      case "add-text":
        result = await handleAddText(payload.file, payload.textContent, payload.x, payload.y, payload.fontSize, payload.pageIndex);
        break;
      case "images-to-pdf":
        result = await handleImagesToPdf(payload.files, payload.types);
        break;
      case "rearrange":
        result = await handleRearrange(payload.file, payload.order);
        break;
      case "extract":
        result = await handleExtract(payload.file, payload.pagesToExtract);
        break;
      case "delete":
        result = await handleDelete(payload.file, payload.pagesToDelete);
        break;

      // --- selection/range-aware operations (formerly the release1 worker) ---
      case "split-ranges":
        result = await splitRanges(payload.file, payload.ranges, payload.filename);
        break;
      case "rotate-pages":
        result = await rotatePages(payload.file, payload.pages, payload.angle);
        break;
      case "page-numbers-pages":
        result = await pageNumbers(payload.file, payload.pages, payload.position, payload.startFrom);
        break;
      case "watermark-pages":
        result = await watermarkPages(payload.file, payload.pages, payload.text, payload.opacity, payload.fontSize);
        break;
      case "organize-plan":
        result = await organizePlan(payload.file, payload.plan);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    self.postMessage({ id, status: "success", data: result });
  } catch (error: any) {
    self.postMessage({ id, status: "error", error: error?.message || "PDF processing failed." });
  }
};

async function handleMerge(filesData: Uint8Array[]) {
  const mergedPdf = await PDFDocument.create();
  for (const bytes of filesData) {
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
}

async function handleCompress(bytes: Uint8Array) {
  const pdf = await PDFDocument.load(bytes);
  return await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
}

async function handleAddText(bytes: Uint8Array, textContent: string, x: number, y: number, fontSize: number, pageIndex: number) {
  const pdf = await PDFDocument.load(bytes);
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const page = pages[pageIndex];

  if (page) {
    page.drawText(textContent, {
      x,
      y,
      size: fontSize,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  }
  return await pdf.save();
}

async function handleImagesToPdf(filesData: Uint8Array[], types: string[]) {
  const pdf = await PDFDocument.create();

  for (let i = 0; i < filesData.length; i++) {
    const uint8 = filesData[i];
    const type = types[i];

    const image = type === "image/png" ? await pdf.embedPng(uint8) : await pdf.embedJpg(uint8);

    const dims = image.scale(1);
    const a4Width = 595.28;
    const a4Height = 841.89;
    const scale = Math.min(a4Width / dims.width, a4Height / dims.height, 1);
    const scaledWidth = dims.width * scale;
    const scaledHeight = dims.height * scale;

    const page = pdf.addPage([a4Width, a4Height]);
    page.drawImage(image, {
      x: (a4Width - scaledWidth) / 2,
      y: (a4Height - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    });
  }
  return await pdf.save();
}

async function handleRearrange(bytes: Uint8Array, order: number[]) {
  const originalPdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(originalPdf, order);
  copiedPages.forEach((page) => newPdf.addPage(page));
  return await newPdf.save();
}

async function handleExtract(bytes: Uint8Array, pagesToExtract: number[]) {
  const originalPdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(originalPdf, pagesToExtract);
  copiedPages.forEach((page) => newPdf.addPage(page));
  return await newPdf.save();
}

async function handleDelete(bytes: Uint8Array, pagesToDelete: number[]) {
  const originalPdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();
  const pageCount = originalPdf.getPageCount();

  const pagesToKeep: number[] = [];
  for (let i = 0; i < pageCount; i++) {
    if (!pagesToDelete.includes(i)) pagesToKeep.push(i);
  }

  if (pagesToKeep.length === 0) {
    throw new Error("Cannot delete all pages");
  }

  const copiedPages = await newPdf.copyPages(originalPdf, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));
  return await newPdf.save();
}

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
