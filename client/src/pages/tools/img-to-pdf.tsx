import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, imagesToPDF } from "@/lib/pdf-engine";
import { BatchFileQueue } from "@/components/batch-file-queue";

export default function ImgToPdfTool() {
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);

  return (
    <ToolPage
      toolId="img-to-pdf"
      onProcess={async (files) => {
        const orderedFiles = queuedFiles.length === files.length ? queuedFiles : files;
        const data = await imagesToPDF(orderedFiles);
        return { data, message: `${orderedFiles.length} images converted to PDF` };
      }}
      onDownload={(data) => downloadBlob(data, "images.pdf")}
      downloadLabel="Download PDF"
      renderOptions={({ files, setFiles, onProcess, status }) => {
        const syncedFiles = queuedFiles.length === files.length && queuedFiles.every((file, index) => file === files[index]) ? queuedFiles : files;
        if (files.length && queuedFiles.length !== files.length) queueMicrotask(() => setQueuedFiles(files));
        return files.length > 0 ? (
          <div className="space-y-4">
            <BatchFileQueue
              files={syncedFiles}
              accept="images"
              title="Image page order"
              onChange={(next) => { setQueuedFiles(next); setFiles?.(next); }}
            />
            <button type="button" onClick={onProcess} disabled={status === "processing" || !syncedFiles.length}>
              {status === "processing" ? "Creating PDF…" : "Convert images to PDF"}
            </button>
          </div>
        ) : null;
      }}
    >
      {() => null}
    </ToolPage>
  );
}
