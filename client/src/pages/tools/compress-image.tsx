import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

export default function CompressImageTool() {
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (files: File[]) => {
    if (!files.length) throw new Error("No image selected");

    setIsProcessing(true);
    try {
      const file = files[0];

      // Load image
      const img = new Image();
      const objUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objUrl;
      });

      // Draw to canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(img, 0, 0);

      // Compress
      const type = file.type === "image/png" ? "image/jpeg" : file.type; // Force JPEG for PNG compression if they really want smaller size, or use original if JPEG/WebP
      const dataUrl = canvas.toDataURL(type, quality / 100);

      // Convert back to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      URL.revokeObjectURL(objUrl);
      setIsProcessing(false);

      // Calculate savings
      const savings = Math.round((1 - blob.size / file.size) * 100);
      const message = savings > 0
        ? `Image compressed successfully! Saved ${savings}% size.`
        : `Image processed. No size reduction achieved at this quality level.`;

      return { data: new Uint8Array(await blob.arrayBuffer()), message, type: blob.type };
    } catch (err) {
      setIsProcessing(false);
      throw err;
    }
  };

  return (
    <ToolPage
      toolId="compress-image"
      onProcess={processImage}
      onDownload={(data) => {
        // Need to know the extension, default to jpg
        downloadBlob(data, "compressed_image.jpg");
      }}
      downloadLabel="Download Compressed Image"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Quality: {quality}%</Label>
              <Slider
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={10}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Lower quality means smaller file size but more visual artifacts.
              </p>
            </div>

            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || isProcessing}
            >
              {(status === "processing" || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Compress Image
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
