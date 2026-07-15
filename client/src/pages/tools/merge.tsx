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
      instructions={{
        title: "How to merge PDF files",
        steps: [
          "Select or drag and drop your PDF files into the dropzone.",
          "Drag the files to rearrange them in the order you want them merged.",
          "Click the 'Merge PDF' button to combine them and download the final document."
        ]
      }}
      faqs={[
        {
          question: "Is it safe to merge my PDFs here?",
          answer: "Yes! Your files are processed entirely in your web browser. They are never uploaded to any server, ensuring complete privacy and security."
        },
        {
          question: "Can I rearrange the pages before merging?",
          answer: "Yes, you can drag and drop the files in the list to reorder them before clicking merge."
        },
        {
          question: "Is there a limit to how many files I can merge?",
          answer: "Since processing happens locally, the limit depends on your device's memory. For most standard documents, merging dozens of files works seamlessly."
        }
      ]}
    >
      {() => null}
    </ToolPage>
  );
}
