import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, getPDFPageCount } from "@/lib/pdf-engine";
import { rotateSelectedPages } from "@/lib/pdf-release1-engine";
import { Button } from "@/components/ui/button";
import { PageRangeControls } from "@/components/page-range-controls";

export default function RotateTool() {
  const [angle, setAngle] = useState(90);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<number[]>([]);

  return (
    <ToolPage
      toolId="rotate"
      onProcess={async (files) => {
        const selected = pages.length ? pages : Array.from({ length: pageCount }, (_, index) => index);
        const data = await rotateSelectedPages(files[0], selected, angle);
        return { data, message: `Rotated ${selected.length === pageCount ? "all pages" : `${selected.length} page(s)`} by ${angle} degrees` };
      }}
      onDownload={(data) => downloadBlob(data, "rotated.pdf")}
      downloadLabel="Download rotated PDF"
      renderOptions={({ files, onProcess, status }) => {
        if (files[0] && !pageCount) void getPDFPageCount(files[0]).then((count) => { setPageCount(count); setPages(Array.from({ length: count }, (_, index) => index)); });
        if (!files[0] && pageCount) { setPageCount(0); setPages([]); }
        return files.length > 0 ? (
          <div>
            {pageCount > 0 && <PageRangeControls pageCount={pageCount} onChange={setPages} />}
            <div>
              Rotation:
              {[90, 180, 270].map((a) => (
                <Button key={a} variant={angle === a ? "default" : "outline"} onClick={() => setAngle(a)} data-testid={`rotate-${a}`}>{a}°</Button>
              ))}
            </div>
            <Button onClick={onProcess} disabled={status === "processing"}>Rotate PDF</Button>
          </div>
        ) : null;
      }}
    >
      {() => null}
    </ToolPage>
  );
}
