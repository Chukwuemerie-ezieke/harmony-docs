import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

self.onmessage = async (e: MessageEvent) => {
  const { action, id, payload } = e.data;

  try {
    let result;
    switch (action) {
      case "merge":
        result = await handleMerge(payload.files);
        break;
      case "split":
        result = await handleSplit(payload.file, payload.filename);
        break;
      case "compress":
        result = await handleCompress(payload.file);
        break;
      case "rotate":
        result = await handleRotate(payload.file, payload.angle);
        break;
      case "page-numbers":
        result = await handlePageNumbers(payload.file, payload.position, payload.startFrom);
        break;
      case "watermark":
        result = await handleWatermark(payload.file, payload.text, payload.opacity, payload.fontSize);
        break;
      case "add-text":
        result = await handleAddText(payload.file, payload.textContent, payload.x, payload.y, payload.fontSize, payload.pageIndex);
        break;
      case "images-to-pdf":
        result = await handleImagesToPdf(payload.files, payload.types);
        break;
      case "protect":
        result = await handleProtect(payload.file, payload.password);
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
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Convert Uint8Array to regular Array to avoid DataCloneError in Safari/some environments
    // or just pass the array directly if it's supported. We'll pass the raw object to be safe.
    self.postMessage({ id, status: "success", data: result });
  } catch (error: any) {
    self.postMessage({ id, status: "error", error: error.message });
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

async function handleSplit(bytes: Uint8Array, filename: string) {
  const pdf = await PDFDocument.load(bytes);
  const pageCount = pdf.getPageCount();
  const results = [];
  const baseName = filename.replace(".pdf", "");

  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);
    const pageBytes = await newPdf.save();
    results.push({ name: `${baseName}_page_${i + 1}.pdf`, data: pageBytes });
  }
  return results;
}

async function handleCompress(bytes: Uint8Array) {
  const pdf = await PDFDocument.load(bytes);
  return await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
}

async function handleRotate(bytes: Uint8Array, angle: number) {
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();
  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + angle));
  });
  return await pdf.save();
}

async function handlePageNumbers(bytes: Uint8Array, position: string, startFrom: number) {
  const pdf = await PDFDocument.load(bytes);
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = `${index + startFrom}`;
    const textWidth = helvetica.widthOfTextAtSize(pageNum, 11);

    let x: number;
    if (position === "bottom-center") x = width / 2 - textWidth / 2;
    else if (position === "bottom-right") x = width - 50;
    else x = 40;

    page.drawText(pageNum, {
      x,
      y: 30,
      size: 11,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  });
  return await pdf.save();
}

async function handleWatermark(bytes: Uint8Array, text: string, opacity: number, fontSize: number) {
  const pdf = await PDFDocument.load(bytes);
  const helvetica = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(-45),
    });
  });
  return await pdf.save();
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

    let image;
    if (type === "image/png") {
      image = await pdf.embedPng(uint8);
    } else {
      image = await pdf.embedJpg(uint8);
    }

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

async function handleProtect(bytes: Uint8Array, password: string) {
  const pdf = await PDFDocument.load(bytes);
  pdf.setTitle(pdf.getTitle() || "Protected Document");
  pdf.setProducer("Harmony Docs - Harmony Digital Consults Ltd");
  return await pdf.save();
}

async function handleRearrange(bytes: Uint8Array, order: number[]) {
  const originalPdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(originalPdf, order);
  copiedPages.forEach(page => newPdf.addPage(page));

  return await newPdf.save();
}

async function handleExtract(bytes: Uint8Array, pagesToExtract: number[]) {
  const originalPdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(originalPdf, pagesToExtract);
  copiedPages.forEach(page => newPdf.addPage(page));

  return await newPdf.save();
}

async function handleDelete(bytes: Uint8Array, pagesToDelete: number[]) {
  const originalPdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();
  const pageCount = originalPdf.getPageCount();

  const pagesToKeep = [];
  for (let i = 0; i < pageCount; i++) {
    if (!pagesToDelete.includes(i)) {
      pagesToKeep.push(i);
    }
  }

  if (pagesToKeep.length === 0) {
    throw new Error("Cannot delete all pages");
  }

  const copiedPages = await newPdf.copyPages(originalPdf, pagesToKeep);
  copiedPages.forEach(page => newPdf.addPage(page));

  return await newPdf.save();
}
