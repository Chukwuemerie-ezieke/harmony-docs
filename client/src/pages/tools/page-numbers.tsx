import { useEffect, useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { addPageNumbersToSelectedPages } from "@/lib/pdf-release1-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageRangeControls } from "@/components/page-range-controls";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";

type Position = "bottom-center" | "bottom-right" | "bottom-left";

export default function PageNumbersTool() {
  const [position, setPosition] = useState<Position>("bottom-center");
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
      renderOptions={({ files, onProcess, status }) => (
        <PageNumberOptions
          file={files[0]}
          position={position}
          setPosition={setPosition}
          startFrom={startFrom}
          setStartFrom={setStartFrom}
          onPages={setPages}
          onPageCount={setPageCount}
          onProcess={onProcess}
          status={status}
        />
      )}
    >
      {() => null}
    </ToolPage>
  );
}

function PageNumberOptions({
  file, position, setPosition, startFrom, setStartFrom, onPages, onPageCount, onProcess, status,
}: {
  file: File | undefined;
  position: Position;
  setPosition: (p: Position) => void;
  startFrom: number;
  setStartFrom: (n: number) => void;
  onPages: (pages: number[]) => void;
  onPageCount: (count: number) => void;
  onProcess: () => void;
  status: string;
}) {
  const { pageCount } = usePdfPageCount(file);
  useEffect(() => { onPageCount(pageCount); }, [pageCount, onPageCount]);
  if (!file) return null;
  return (
    <div className="space-y-5">
      {pageCount > 0 && <PageRangeControls pageCount={pageCount} onChange={onPages} />}
      <div className="space-y-2">
        <Label className="text-base">Position</Label>
        <div className="flex flex-wrap gap-2">
          {(["bottom-left", "bottom-center", "bottom-right"] as const).map((pos) => (
            <Button key={pos} variant={position === pos ? "default" : "outline"} onClick={() => setPosition(pos)} data-testid={`pos-${pos}`}>
              {pos.replace("bottom-", "").replace(/^\w/, (c) => c.toUpperCase())}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="start-from" className="text-base">Start from page number</Label>
        <Input id="start-from" type="number" value={startFrom} onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)} className="w-24" data-testid="start-from-input" />
      </div>
      <Button onClick={onProcess} className="w-full" size="lg" disabled={status === "processing"} data-testid="process-btn">
        {status === "processing" ? "Adding…" : "Add Page Numbers"}
      </Button>
    </div>
  );
}
