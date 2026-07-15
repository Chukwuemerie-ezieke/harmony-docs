import { ToolPage } from "@/pages/tool-page";
import { compressPDF, downloadBlob } from "@/lib/pdf-engine";

export default function CompressTool() {
  return (
    <ToolPage
      toolId="compress"
      onProcess={async (files) => {
        const original = files[0].size;
        const data = await compressPDF(files[0]);
        const compressed = data.length;
        const reduction = Math.round((1 - compressed / original) * 100);
        const msg = reduction > 0
          ? `Compressed: ${(original / 1024).toFixed(0)} KB → ${(compressed / 1024).toFixed(0)} KB (${reduction}% smaller)`
          : `Optimized to ${(compressed / 1024).toFixed(0)} KB`;
        return { data, message: msg };
      }}
      onDownload={(data) => downloadBlob(data, "compressed.pdf")}
      downloadLabel="Download compressed PDF"
      instructions={{
        title: "How to compress a PDF",
        steps: [
          "Upload the PDF you want to reduce in size.",
          "Wait a moment while we optimize the internal structure of your document.",
          "Download the compressed PDF file, ready for email or web use."
        ]
      }}
      faqs={[
        {
          question: "How does the compression work?",
          answer: "Our tool optimizes the internal structure of the PDF by stripping out unused objects and applying advanced compression algorithms without significantly degrading the visual quality."
        },
        {
          question: "Is my data uploaded to your servers?",
          answer: "No, all compression is done locally in your browser. Your files remain on your device."
        }
      ]}
    >
      {() => null}
    </ToolPage>
  );
}
