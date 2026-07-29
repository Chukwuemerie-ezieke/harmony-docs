import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

export default function WatermarkImageTool() {
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(48);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (files: File[]) => {
    if (!files.length) throw new Error("No image selected");
    if (!text) throw new Error("Please enter watermark text");

    setIsProcessing(true);
    try {
      const file = files[0];

      const img = new Image();
      const objUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(img, 0, 0);

      // Draw watermark
      ctx.globalAlpha = opacity / 100;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Add shadow for visibility
      ctx.shadowColor = "black";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4); // Rotate 45 degrees
      ctx.fillText(text, 0, 0);

      const dataUrl = canvas.toDataURL(file.type);
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      URL.revokeObjectURL(objUrl);
      setIsProcessing(false);

      return { data: new Uint8Array(await blob.arrayBuffer()), message: "Watermark added successfully!" };
    } catch (err) {
      setIsProcessing(false);
      throw err;
    }
  };

  return (
    <ToolPage
      toolId="watermark-image"
      onProcess={processImage}
      onDownload={(data) => {
        downloadBlob(data, "watermarked_image.png");
      }}
      downloadLabel="Download Watermarked Image"
      renderOptions={({ files, onProcess, status }) => {
        return files.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Watermark Text</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter watermark text"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Opacity: {opacity}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={([v]) => setOpacity(v)}
                min={10}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={12}
                max={200}
                step={4}
              />
            </div>

            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || isProcessing || !text}
            >
              {(status === "processing" || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Watermark
            </Button>
          </div>
        ) : null
      }}
    >
      {() => null}
    </ToolPage>
  );
}
