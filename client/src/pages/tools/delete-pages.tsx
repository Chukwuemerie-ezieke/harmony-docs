import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { deletePDFPages, downloadBlob, getPDFPageCount } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DeleteTool() {
  const [deleteStr, setDeleteStr] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);

  return (
    <ToolPage
      toolId="delete"
      onProcess={async (files) => {
        const toDelete = deleteStr.split(/[\s,-]+/).map(s => parseInt(s) - 1).filter(n => !isNaN(n) && n >= 0);
        if (toDelete.length === 0) throw new Error("Invalid format");

        const data = await deletePDFPages(files[0], toDelete);
        return { data, message: "Pages deleted successfully" };
      }}
      onDownload={(data) => downloadBlob(data, "modified.pdf")}
      downloadLabel="Download modified PDF"
      instructions={{
        title: "How to delete pages",
        steps: [
          "Upload your PDF.",
          "Enter the pages you want to remove (e.g. 2, 4).",
          "Click Delete to create a new PDF without those pages."
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
                <Label>Pages to Delete (Total Pages: {pageCount})</Label>
                <Input
                  value={deleteStr}
                  onChange={(e) => setDeleteStr(e.target.value)}
                  placeholder="e.g. 2, 4"
                />
              </div>
            </div>
          ) : null
        );
      }}
    </ToolPage>
  );
}
