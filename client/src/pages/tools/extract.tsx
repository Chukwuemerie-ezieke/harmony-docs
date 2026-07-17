import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { extractPDF, downloadBlob, getPDFPageCount } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExtractTool() {
  const [extractStr, setExtractStr] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);

  return (
    <ToolPage
      toolId="extract"
      onProcess={async (files) => {
        const toExtract = extractStr.split(/[\s,-]+/).map(s => parseInt(s) - 1).filter(n => !isNaN(n) && n >= 0);
        if (toExtract.length === 0) throw new Error("Invalid format");

        const data = await extractPDF(files[0], toExtract);
        return { data, message: "Pages extracted successfully" };
      }}
      onDownload={(data) => downloadBlob(data, "extracted.pdf")}
      downloadLabel="Download extracted PDF"
      instructions={{
        title: "How to extract pages",
        steps: [
          "Upload your PDF.",
          "Enter the pages you want to keep (e.g. 1, 3, 5).",
          "Click Extract to create a new PDF with only those pages."
        ]
      }}
    >
      {({ files }) => {
        if (files.length > 0 && pageCount === null) {
          getPDFPageCount(files[0]).then(setPageCount);
        } else if (files.length === 0 && pageCount !== null) {
          setPageCount(null);
        }

        return (
          files.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pages to Extract (Total Pages: {pageCount})</Label>
                <Input
                  value={extractStr}
                  onChange={(e) => setExtractStr(e.target.value)}
                  placeholder="e.g. 1, 3, 5"
                />
              </div>
            </div>
          ) : null
        );
      }}
    </ToolPage>
  );
}
