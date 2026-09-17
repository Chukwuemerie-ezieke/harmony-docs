import { useEffect, useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { watermarkSelectedPages } from "@/lib/pdf-release1-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PageRangeControls } from "@/components/page-range-controls";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";

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
        const all = selected.length === pageCount;
        return { data, message: `Watermark added to ${all ? "all pages" : `${selected.length} page(s)`}` };
      }}
      onDownload={(data) => downloadBlob(data, "watermarked.pdf")}
      downloadLabel="Download watermarked PDF"
      renderOptions={({ files, onProcess, status }) => (
        <WatermarkOptions
          file={files[0]}
          text={text} setText={setText}
          opacity={opacity} setOpacity={setOpacity}
          fontSize={fontSize} setFontSize={setFontSize}
          onPages={setPages} onPageCount={setPageCount}
          onProcess={onProcess} status={status}
        />
      )}
    >
      {() => null}
    </ToolPage>
  );
}

function WatermarkOptions({
  file, text, setText, opacity, setOpacity, fontSize, setFontSize, onPages, onPageCount, onProcess, status,
}: {
  file: File | undefined;
  text: string; setText: (v: string) => void;
  opacity: number; setOpacity: (v: number) => void;
  fontSize: number; setFontSize: (v: number) => void;
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
        <Label htmlFor="wm-text" className="text-base">Watermark text</Label>
        <Input id="wm-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter watermark text" data-testid="watermark-text" />
      </div>
      <div className="space-y-2">
        <Label className="text-base">Opacity: {opacity}%</Label>
        <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={5} max={80} step={5} data-testid="opacity-slider" />
      </div>
      <div className="space-y-2">
        <Label className="text-base">Font size: {fontSize}px</Label>
        <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={16} max={96} step={2} data-testid="fontsize-slider" />
      </div>
      <Button onClick={onProcess} className="w-full" size="lg" disabled={status === "processing" || !text.trim()} data-testid="process-btn">
        {status === "processing" ? "Adding…" : "Add Watermark"}
      </Button>
    </div>
  );
}
