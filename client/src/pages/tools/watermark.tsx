import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { addWatermark, downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function WatermarkTool() {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(15);
  const [fontSize, setFontSize] = useState(48);

  return (
    <ToolPage
      toolId="watermark"
      onProcess={async (files) => {
        const data = await addWatermark(files[0], text, opacity / 100, fontSize);
        return { data, message: "Watermark added to all pages" };
      }}
      onDownload={(data) => downloadBlob(data, "watermarked.pdf")}
      downloadLabel="Download watermarked PDF"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Watermark text</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter watermark text"
                data-testid="watermark-text"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Opacity: {opacity}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={([v]) => setOpacity(v)}
                min={5}
                max={80}
                step={5}
                data-testid="opacity-slider"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Font size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={16}
                max={96}
                step={2}
                data-testid="fontsize-slider"
              />
            </div>
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || !text.trim()}
              data-testid="process-btn"
            >
              Add Watermark
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
