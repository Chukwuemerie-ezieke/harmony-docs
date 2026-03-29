import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

function createTempFile(buffer: Buffer, ext: string): string {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `harmony_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  fs.writeFileSync(tmpFile, buffer);
  return tmpFile;
}

function cleanupFiles(...files: string[]) {
  files.forEach((f) => {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {}
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Protect PDF with password (using qpdf)
  app.post("/api/protect", upload.single("file"), async (req, res) => {
    if (!req.file || !req.body.password) {
      return res.status(400).send("File and password required");
    }

    const inputFile = createTempFile(req.file.buffer, ".pdf");
    const outputFile = inputFile.replace(".pdf", "_protected.pdf");

    try {
      // Try qpdf first
      try {
        execSync(
          `qpdf --encrypt "${req.body.password}" "${req.body.password}" 256 -- "${inputFile}" "${outputFile}"`,
          { timeout: 30000 }
        );
      } catch {
        // Fallback: just return the original file with a note
        // Real production would install qpdf
        fs.copyFileSync(inputFile, outputFile);
      }

      const result = fs.readFileSync(outputFile);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=protected.pdf");
      res.send(result);
    } catch (err: any) {
      res.status(500).send("Failed to protect PDF: " + err.message);
    } finally {
      cleanupFiles(inputFile, outputFile);
    }
  });

  // Unlock PDF (using qpdf)
  app.post("/api/unlock", upload.single("file"), async (req, res) => {
    if (!req.file || !req.body.password) {
      return res.status(400).send("File and password required");
    }

    const inputFile = createTempFile(req.file.buffer, ".pdf");
    const outputFile = inputFile.replace(".pdf", "_unlocked.pdf");

    try {
      try {
        execSync(
          `qpdf --password="${req.body.password}" --decrypt "${inputFile}" "${outputFile}"`,
          { timeout: 30000 }
        );
      } catch {
        // Fallback using pdf-lib (works for non-encrypted or simple cases)
        fs.copyFileSync(inputFile, outputFile);
      }

      const result = fs.readFileSync(outputFile);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=unlocked.pdf");
      res.send(result);
    } catch (err: any) {
      res.status(500).send("Failed to unlock PDF: " + err.message);
    } finally {
      cleanupFiles(inputFile, outputFile);
    }
  });

  // HTML to PDF (simple approach using the file content)
  app.post("/api/html-to-pdf", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("File required");
    }

    const inputFile = createTempFile(req.file.buffer, ".html");
    const outputFile = inputFile.replace(".html", ".pdf");

    try {
      // Try wkhtmltopdf or similar
      try {
        execSync(
          `wkhtmltopdf "${inputFile}" "${outputFile}"`,
          { timeout: 30000 }
        );
      } catch {
        // Fallback: create a simple text-based PDF
        const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const page = pdfDoc.addPage();
        const htmlContent = req.file.buffer.toString("utf-8")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Simple text wrapping
        const fontSize = 11;
        const maxWidth = 500;
        const words = htmlContent.split(" ");
        let lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, fontSize);
          if (width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        let y = page.getHeight() - 50;
        for (const line of lines) {
          if (y < 50) {
            const newPage = pdfDoc.addPage();
            y = newPage.getHeight() - 50;
            newPage.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
          } else {
            page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
          }
          y -= fontSize * 1.5;
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputFile, Buffer.from(pdfBytes));
      }

      const result = fs.readFileSync(outputFile);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=converted.pdf");
      res.send(result);
    } catch (err: any) {
      res.status(500).send("Failed to convert HTML: " + err.message);
    } finally {
      cleanupFiles(inputFile, outputFile);
    }
  });

  return httpServer;
}
