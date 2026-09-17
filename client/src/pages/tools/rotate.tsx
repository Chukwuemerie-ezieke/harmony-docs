import { useEffect, useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { rotateSelectedPages } from "@/lib/pdf-release1-engine";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageRangeControls } from "@/components/page-range-controls";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";

export default function RotateTool() {
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState<number[]>([]);
  const [pageCount, setPageCount] = useState(0);

  return (
    <ToolPage
      toolId="rotate"
      onProcess={async (files) => {
        const selected = pages.length ? pages : Array.from({ length: pageCount }, (_, i) => i);
        const data = await rotateSelectedPages(files[0], selected, angle);
        const all = selected.length === pageCount;
        return { data, message: `Rotated ${all ? "all pages" : `${selected.length} page(s)`} by ${angle} degrees` };
      }}
      onDownload={(data) => downloadBlob(data, "rotated.pdf")}
      downloadLabel="Download rotated PDF"
      renderOptions={({ files, onProcess, status }) => (
        <RotateOptions
          file={files[0]}
          angle={angle}
          setAngle={setAngle}
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

function RotateOptions({
  file, angle, setAngle, onPages, onPageCount, onProcess, status,
}: {
  file: File | undefined;
  angle: number;
  setAngle: (a: number) => void;
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
        <Label className="text-base">Rotation</Label>
        <div className="flex flex-wrap gap-2">
          {[90, 180, 270].map((a) => (
            <Button key={a} variant={angle === a ? "default" : "outline"} onClick={() => setAngle(a)} data-testid={`rotate-${a}`}>{a}°</Button>
          ))}
        </div>
      </div>
      <Button onClick={onProcess} className="w-full" size="lg" disabled={status === "processing"} data-testid="process-btn">
        {status === "processing" ? "Rotating…" : "Rotate PDF"}
      </Button>
    </div>
  );
}
