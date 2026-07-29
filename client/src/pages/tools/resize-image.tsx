import { useState, useEffect } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ResizeImageTool() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [originalRatio, setOriginalRatio] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileLoad = async (files: File[]) => {
    if (!files.length) return;

    const file = files[0];
    const img = new Image();
    const objUrl = URL.createObjectURL(file);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = objUrl;
    });

    setWidth(img.width.toString());
    setHeight(img.height.toString());
    setOriginalRatio(img.width / img.height);
    URL.revokeObjectURL(objUrl);
  };

  const processImage = async (files: File[]) => {
    if (!files.length) throw new Error("No image selected");

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
      canvas.width = parseInt(width) || img.width;
      canvas.height = parseInt(height) || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL(file.type, 0.92);
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      URL.revokeObjectURL(objUrl);
      setIsProcessing(false);

      return { data: new Uint8Array(await blob.arrayBuffer()), message: "Image resized successfully!" };
    } catch (err) {
      setIsProcessing(false);
      throw err;
    }
  };

  return (
    <ToolPage
      toolId="resize-image"
      onProcess={processImage}
      onDownload={(data) => {
        downloadBlob(data, "resized_image.png");
      }}
      downloadLabel="Download Resized Image"
      renderOptions={({ files, onProcess, status }) => {
        // Trigger load to get original dimensions when file is selected
        useEffect(() => {
          if (files.length > 0 && !width && !height) {
            handleFileLoad(files);
          }
        }, [files]);

        return files.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Width (px)</Label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    if (maintainRatio && e.target.value) {
                      setHeight(Math.round(parseInt(e.target.value) / originalRatio).toString());
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Height (px)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    if (maintainRatio && e.target.value) {
                      setWidth(Math.round(parseInt(e.target.value) * originalRatio).toString());
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="maintain-ratio"
                checked={maintainRatio}
                onCheckedChange={(checked) => setMaintainRatio(!!checked)}
              />
              <Label htmlFor="maintain-ratio" className="text-sm cursor-pointer">
                Maintain aspect ratio
              </Label>
            </div>

            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || isProcessing || !width || !height}
            >
              {(status === "processing" || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resize Image
            </Button>
          </div>
        ) : null
      }}
    >
      {() => null}
    </ToolPage>
  );
}
