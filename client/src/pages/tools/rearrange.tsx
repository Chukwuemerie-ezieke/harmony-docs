import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { rearrangePDF, downloadBlob, getPDFPageCount } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RearrangeTool() {
  const [orderStr, setOrderStr] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);

  return (
    <ToolPage
      toolId="rearrange"
      onProcess={async (files) => {
        // Parse order string: e.g. "3, 1, 2" or "3-1-2" -> [2, 0, 1] (0-indexed)
        const order = orderStr.split(/[\s,-]+/).map(s => parseInt(s) - 1).filter(n => !isNaN(n) && n >= 0);
        if (order.length === 0) throw new Error("Invalid order format");

        const data = await rearrangePDF(files[0], order);
        return { data, message: "PDF rearranged successfully" };
      }}
      onDownload={(data) => downloadBlob(data, "rearranged.pdf")}
      downloadLabel="Download rearranged PDF"
      instructions={{
        title: "How to rearrange pages",
        steps: [
          "Upload your PDF.",
          "Enter the desired page order (e.g. 3, 1, 2) in the input field.",
          "Click Rearrange to generate the new PDF."
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
                <Label>Page Order (Total Pages: {pageCount})</Label>
                <Input
                  value={orderStr}
                  onChange={(e) => setOrderStr(e.target.value)}
                  placeholder="e.g. 3, 1, 2"
                />
                <p className="text-xs text-muted-foreground">Enter page numbers separated by commas or spaces.</p>
              </div>
            </div>
          ) : null
        );
      }}
    </ToolPage>
  );
}
