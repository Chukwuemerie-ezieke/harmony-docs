import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCw, RotateCcw } from "lucide-react";

export default function RotateImageTool() {
  const [angle, setAngle] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const processImage = async (files: File[]) => {
    if (!files.length) throw new Error("No image selected");
    if (angle % 360 === 0) throw new Error("No rotation applied");

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
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const rads = angle * Math.PI / 180;

      if (Math.abs(angle % 180) === 90) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rads);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const dataUrl = canvas.toDataURL(file.type);
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      URL.revokeObjectURL(objUrl);
      setIsProcessing(false);

      return { data: new Uint8Array(await blob.arrayBuffer()), message: "Image rotated successfully!" };
    } catch (err) {
      setIsProcessing(false);
      throw err;
    }
  };

  return (
    <ToolPage
      toolId="rotate-image"
      onProcess={processImage}
      onDownload={(data) => {
        downloadBlob(data, "rotated_image.png");
      }}
      downloadLabel="Download Rotated Image"
      renderOptions={({ files, onProcess, status }) => {
        if (files.length > 0 && !imageSrc) {
            const url = URL.createObjectURL(files[0]);
            setImageSrc(url);
        }

        return files.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Label className="text-sm">Preview</Label>
              <div className="h-48 w-full border rounded-lg bg-card/50 flex items-center justify-center p-4 overflow-hidden">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain transition-transform duration-300"
                    style={{ transform: `rotate(${angle}deg)` }}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setAngle(a => a - 90)}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Left
              </Button>
              <Button
                variant="outline"
                onClick={() => setAngle(a => a + 90)}
              >
                Right <RotateCw className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || isProcessing || (angle % 360 === 0)}
            >
              {(status === "processing" || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rotate Image
            </Button>
          </div>
        ) : null
      }}
    >
      {() => null}
    </ToolPage>
  );
}
