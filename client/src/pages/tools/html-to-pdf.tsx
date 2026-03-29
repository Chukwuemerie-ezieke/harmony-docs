import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";

export default function HtmlToPdfTool() {
  return (
    <ToolPage
      toolId="html-to-pdf"
      onProcess={async (files) => {
        const formData = new FormData();
        formData.append("file", files[0]);

        const response = await fetch("./api/html-to-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to convert HTML to PDF");
        }

        const data = await response.arrayBuffer();
        return {
          data: new Uint8Array(data),
          message: "HTML converted to PDF",
        };
      }}
      onDownload={(data) => downloadBlob(data, "converted.pdf")}
      downloadLabel="Download PDF"
    >
      {() => null}
    </ToolPage>
  );
}
