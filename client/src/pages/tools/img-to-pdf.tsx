import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, imagesToPDF } from "@/lib/pdf-engine";
import { BatchFileQueue } from "@/components/batch-file-queue";

export default function ImgToPdfTool() {
  return (
    <ToolPage
      toolId="img-to-pdf"
      onProcess={async (files) => {
        const data = await imagesToPDF(files);
        return { data, message: `${files.length} images converted to PDF` };
      }}
      onDownload={(data) => downloadBlob(data, "images.pdf")}
      downloadLabel="Download PDF"
      renderOptions={({ files, setFiles, onProcess, status }) =>
        files.length > 0 ? (
          <div className="space-y-4">
            <BatchFileQueue
              files={files}
              accept="images"
              title="Image page order"
              onChange={(next) => setFiles(next)}
            />
            <button
              type="button"
              onClick={onProcess}
              disabled={status === "processing" || !files.length}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing" ? "Creating PDF…" : "Convert images to PDF"}
            </button>
          </div>
        ) : null
      }
    >
      {() => null}
    </ToolPage>
  );
}
