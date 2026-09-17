import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { extractText, textToBlob } from "@/lib/ocr-engine";

export default function OcrTool() {
  return (
    <ToolPage
      toolId="ocr"
      onProcess={async (files, context) => {
        const { text } = await extractText(files[0], context);
        const words = text.split(/\s+/).filter(Boolean).length;
        return { data: text, message: `Extracted ${words} word${words === 1 ? "" : "s"} of text.` };
      }}
      onDownload={(text: string) => downloadBlob(textToBlob(text), "extracted-text.txt")}
      downloadLabel="Download text (.txt)"
      outputName="extracted-text.txt"
      resultPreview={(text: string) =>
        typeof text === "string" ? (
          <div className="space-y-2" data-testid="ocr-result">
            <p className="text-sm font-medium text-foreground">Recognised text</p>
            <textarea
              readOnly
              value={text}
              rows={12}
              className="w-full rounded-lg border border-border/60 bg-muted/20 p-3 font-mono text-sm text-foreground"
              aria-label="Recognised text"
            />
          </div>
        ) : null
      }
      instructions={{
        title: "How to extract text from a scan",
        steps: [
          "Upload a photo, scan, or PDF page containing text.",
          "HarmonyDocs reads the text in your browser — nothing is uploaded.",
          "Review the recognised text and download it as a .txt file.",
        ],
      }}
      faqs={[
        { question: "Does my file get uploaded?", answer: "No. Text recognition runs entirely in your browser using WebAssembly. Your file and the recognised text never leave your device." },
        { question: "Which languages are supported?", answer: "This tool currently recognises English text. Accuracy depends on the clarity and resolution of the scan." },
        { question: "Can it read a whole multi-page PDF?", answer: "It reads the first page of a PDF. For other pages, split or extract the page first, then run OCR on it." },
      ]}
    >
      {() => null}
    </ToolPage>
  );
}
