import { ToolPage } from "@/pages/tool-page";
import { imagesToPDF, downloadBlob } from "@/lib/pdf-engine";

export default function ImgToPdfTool() {
  return (
    <ToolPage
      toolId="img-to-pdf"
      onProcess={async (files) => {
        const data = await imagesToPDF(files);
        return { data, message: "Images converted to PDF successfully" };
      }}
      onDownload={(data) => downloadBlob(data, "converted-images.pdf")}
      downloadLabel="Download PDF"
      instructions={{
        title: "How to convert Images to PDF",
        steps: [
          "Upload one or more image files (JPG, PNG).",
          "Rearrange the images by dragging them into your preferred order.",
          "Click the conversion button to combine them into a single PDF."
        ]
      }}
      faqs={[
        {
          question: "What image formats are supported?",
          answer: "Currently, we support the most common image formats: JPG and PNG."
        },
        {
          question: "Will the images lose quality?",
          answer: "We embed the images directly into the PDF document without aggressive re-compression, so they retain their original visual fidelity."
        }
      ]}
    >
      {() => null}
    </ToolPage>
  );
}
