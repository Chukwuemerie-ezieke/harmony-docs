import { ToolPage } from "@/pages/tool-page";
import { imagesToPDF, downloadBlob } from "@/lib/pdf-engine";

export default function ImgToPdfTool() {
  return (
    <ToolPage
      toolId="img-to-pdf"
      onProcess={async (files) => {
        const data = await imagesToPDF(files);
        return { data, message: `Converted ${files.length} image${files.length > 1 ? "s" : ""} to PDF` };
      }}
      onDownload={(data) => downloadBlob(data, "images.pdf")}
      downloadLabel="Download PDF"
    >
      {() => null}
    </ToolPage>
  );
}
