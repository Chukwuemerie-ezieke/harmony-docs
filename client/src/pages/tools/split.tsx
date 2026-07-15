import { ToolPage } from "@/pages/tool-page";
import { splitPDF, downloadAsZip } from "@/lib/pdf-engine";

export default function SplitTool() {
  return (
    <ToolPage
      toolId="split"
      onProcess={async (files) => {
        const pages = await splitPDF(files[0]);
        return { data: pages, message: `Split into ${pages.length} pages` };
      }}
      onDownload={(data) => downloadAsZip(data, "split-pages.zip")}
      downloadLabel="Download pages (ZIP)"
      instructions={{
        title: "How to split a PDF",
        steps: [
          "Upload the PDF file you want to split into individual pages.",
          "Click the 'Split PDF' button to begin processing.",
          "Download the resulting ZIP file containing all your separated PDF pages."
        ]
      }}
      faqs={[
        {
          question: "How are the split pages named?",
          answer: "The split pages will be named based on the original file name, with the page number appended (e.g., document_page_1.pdf)."
        },
        {
          question: "Will the quality be reduced?",
          answer: "No, splitting a PDF simply separates the pages into individual files. The quality of the content remains exactly the same."
        }
      ]}
    >
      {() => null}
    </ToolPage>
  );
}
