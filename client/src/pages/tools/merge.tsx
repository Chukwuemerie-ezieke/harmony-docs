import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, mergePDFs } from "@/lib/pdf-engine";
import { BatchFileQueue } from "@/components/batch-file-queue";
import { Button } from "@/components/ui/button";

export default function MergeTool() {
  return (
    <ToolPage
      toolId="merge"
      onProcess={async (files) => {
        const data = await mergePDFs(files);
        return { data, message: `${files.length} PDFs merged successfully` };
      }}
      onDownload={(data) => downloadBlob(data, "merged.pdf")}
      downloadLabel="Download merged PDF"
      renderOptions={({ files, setFiles, onProcess, status }) =>
        files.length > 0 ? (
          <div className="space-y-4">
            <BatchFileQueue
              files={files}
              accept="pdfs"
              title="Merge order"
              onChange={(next) => setFiles(next)}
            />
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || files.length < 2}
              data-testid="process-btn"
            >
              {status === "processing" ? "Merging PDFs…" : "Merge PDFs"}
            </Button>
            {files.length < 2 && (
              <p className="text-sm text-muted-foreground">Add at least two PDF files to merge.</p>
            )}
          </div>
        ) : null
      }
    >
      {() => null}
    </ToolPage>
  );
}
