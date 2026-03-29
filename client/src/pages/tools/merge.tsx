import { ToolPage } from "@/pages/tool-page";
import { mergePDFs, downloadBlob } from "@/lib/pdf-engine";

export default function MergeTool() {
  return (
    <ToolPage
      toolId="merge"
      onProcess={async (files) => {
        const data = await mergePDFs(files);
        return { data, message: `Merged ${files.length} PDFs successfully` };
      }}
      onDownload={(data) => downloadBlob(data, "merged.pdf")}
      downloadLabel="Download merged PDF"
    >
      {() => null}
    </ToolPage>
  );
}
