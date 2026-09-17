import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, mergePDFs } from "@/lib/pdf-engine";
import { BatchFileQueue } from "@/components/batch-file-queue";

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
            <button
              type="button"
              onClick={onProcess}
              disabled={status === "processing" || files.length < 2}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "processing" ? "Merging PDFs…" : "Merge PDFs"}
            </button>
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
