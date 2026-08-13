import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, getPDFPageCount } from "@/lib/pdf-engine";
import { addPageNumbersToSelectedPages } from "@/lib/pdf-release1-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageRangeControls } from "@/components/page-range-controls";

export default function PageNumbersTool() {
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "bottom-left">("bottom-center");
  const [startFrom, setStartFrom] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<number[]>([]);

  return (
    <ToolPage
      toolId="page-numbers"
      onProcess={async (files) => {
        const selected = pages.length ? pages : Array.from({ length: pageCount }, (_, index) => index);
        const data = await addPageNumbersToSelectedPages(files[0], selected, position, startFrom);
        return { data, message: "Page numbers added" };
      }}
      onDownload={(data) => downloadBlob(data, "numbered.pdf")}
      downloadLabel="Download numbered PDF"
      renderOptions={({ files, onProcess, status }) => {
        if (files[0] && !pageCount) void getPDFPageCount(files[0]).then((count) => { setPageCount(count); setPages(Array.from({ length: count }, (_, index) => index)); });
        if (!files[0] && pageCount) { setPageCount(0); setPages([]); }
        return files.length > 0 ? (
          <div>
            {pageCount > 0 && <PageRangeControls pageCount={pageCount} onChange={setPages} />}
            <Label>Position</Label>
            {(["bottom-left", "bottom-center", "bottom-right"] as const).map((pos) => (
              <Button key={pos} variant={position === pos ? "default" : "outline"} onClick={() => setPosition(pos)} data-testid={`pos-${pos}`}>{pos.replace("bottom-", "").replace(/^\w/, (c) => c.toUpperCase())}</Button>
            ))}
            <Label>Start from page number</Label>
            <Input type="number" value={startFrom} onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)} className="w-24" data-testid="start-from-input" />
            <Button onClick={onProcess} disabled={status === "processing"}>Add Page Numbers</Button>
          </div>
        ) : null;
      }}
    >
      {() => null}
    </ToolPage>
  );
}
