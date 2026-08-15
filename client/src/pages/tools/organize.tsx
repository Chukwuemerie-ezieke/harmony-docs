import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { PdfPageOrganizer } from "@/components/pdf-page-organizer";

export default function OrganizePdfTool() {
  return (
    <ToolPage
      toolId="organize"
      instructions={{
        title: "How to organise PDF pages",
        steps: [
          "Upload one PDF.",
          "Select, move, duplicate, delete, or insert blank pages.",
          "Create and download a new organised PDF. The original file is not changed.",
        ],
      }}
      faqs={[
        { question: "Does this overwrite my original PDF?", answer: "No. HarmonyDocs creates a new output file for download." },
        { question: "Can I insert blank pages?", answer: "Yes. Use Insert blank after on any page in the organiser." },
      ]}
    >
      {({ files, setStatus, setResult, setMessage }) => files[0] ? (
        <PdfPageOrganizer
          file={files[0]}
          onComplete={(data) => {
            setResult(data);
            setMessage("PDF organised successfully.");
            setStatus("success");
          }}
        />
      ) : null}
    </ToolPage>
  );
}
