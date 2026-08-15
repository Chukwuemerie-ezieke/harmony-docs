import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, mergePDFs } from "@/lib/pdf-engine";
import { BatchFileQueue } from "@/components/batch-file-queue";

export default function MergeTool() {
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);

  return (
    <ToolPage
      toolId="merge"
      onProcess={async (files) => {
        const orderedFiles = queuedFiles.length === files.length ? queuedFiles : files;
        const data = await mergePDFs(orderedFiles);
        return { data, message: `${orderedFiles.length} PDFs merged successfully` };
      }}
      onDownload={(data) => downloadBlob(data, "merged.pdf")}
      downloadLabel="Download merged PDF"
      renderOptions={({ files, setFiles, onProcess, status }) => {
        const syncedFiles = queuedFiles.length === files.length && queuedFiles.every((file, index) => file === files[index]) ? queuedFiles : files;
        if (files.length && queuedFiles.length !== files.length) queueMicrotask(() => setQueuedFiles(files));
        return files.length > 0 ? (
          <div className="space-y-4">
            <BatchFileQueue
              files={syncedFiles}
              accept="pdfs"
              title="Merge order"
              onChange={(next) => { setQueuedFiles(next); setFiles(next); }}
            />
            <button type="button" onClick={onProcess} disabled={status === "processing" || syncedFiles.length < 2}>
              {status === "processing" ? "Merging PDFs…" : "Merge PDFs"}
            </button>
            {syncedFiles.length < 2 && <p className="text-sm text-muted-foreground">Add at least two PDF files to merge.</p>}
          </div>
        ) : null;
      }}
    >
      {() => null}
    </ToolPage>
  );
}
