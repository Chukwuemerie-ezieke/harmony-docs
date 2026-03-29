import { ToolPage } from "@/pages/tool-page";
import { splitPDF, downloadBlob, downloadAsZip } from "@/lib/pdf-engine";

export default function SplitTool() {
  return (
    <ToolPage
      toolId="split"
      onProcess={async (files) => {
        const pages = await splitPDF(files[0]);
        return { data: pages, message: `Split into ${pages.length} pages` };
      }}
      onDownload={(data) => {
        if (data.length === 1) {
          downloadBlob(data[0].data, data[0].name);
        } else {
          downloadAsZip(data, "split_pages.zip");
        }
      }}
      downloadLabel="Download all pages"
    >
      {() => null}
    </ToolPage>
  );
}
