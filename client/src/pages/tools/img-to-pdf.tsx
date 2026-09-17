import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, imagesToPDF } from "@/lib/pdf-engine";
import { BatchFileQueue } from "@/components/batch-file-queue";
import { Button } from "@/components/ui/button";

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
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || !files.length}
              data-testid="process-btn"
            >
              {status === "processing" ? "Creating PDF…" : "Convert images to PDF"}
            </Button>
          </div>
        ) : null
      }
    >
      {() => null}
    </ToolPage>
  );
}
