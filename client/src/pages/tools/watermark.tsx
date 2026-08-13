import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob, getPDFPageCount } from "@/lib/pdf-engine";
import { watermarkSelectedPages } from "@/lib/pdf-release1-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PageRangeControls } from "@/components/page-range-controls";

export default function WatermarkTool() {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(15);
  const [fontSize, setFontSize] = useState(48);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<number[]>([]);

  return (
    <ToolPage
      toolId="watermark"
      onProcess={async (files) => {
        const selected = pages.length ? pages : Array.from({ length: pageCount }, (_, index) => index);
        const data = await watermarkSelectedPages(files[0], selected, text, opacity / 100, fontSize);
        return { data, message: `Watermark added to ${selected.length === pageCount ? "all pages" : `${selected.length} page(s)`}` };
      }}
      onDownload={(data) => downloadBlob(data, "watermarked.pdf")}
      downloadLabel="Download watermarked PDF"
      renderOptions={({ files, onProcess, status }) => {
        if (files[0] && !pageCount) void getPDFPageCount(files[0]).then((count) => { setPageCount(count); setPages(Array.from({ length: count }, (_, index) => index)); });
        if (!files[0] && pageCount) { setPageCount(0); setPages([]); }
        return files.length > 0 ? (
          <div>
            {pageCount > 0 && <PageRangeControls pageCount={pageCount} onChange={setPages} />}
            <Label>Watermark text</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter watermark text" data-testid="watermark-text" />
            <Label>Opacity: {opacity}%</Label>
            <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={5} max={80} step={5} data-testid="opacity-slider" />
            <Label>Font size: {fontSize}px</Label>
            <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={16} max={96} step={2} data-testid="fontsize-slider" />
            <Button onClick={onProcess} disabled={status === "processing"}>Add Watermark</Button>
          </div>
        ) : null;
      }}
    >
      {() => null}
    </ToolPage>
  );
}
