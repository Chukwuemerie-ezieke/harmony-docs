import { useState, useRef, useEffect } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CropImageTool() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDim, setImgDim] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate scaled dimensions to fit container
      const containerWidth = canvas.parentElement?.clientWidth || 500;
      const scale = Math.min(1, containerWidth / img.width);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      setImgDim({ width: canvas.width, height: canvas.height });

      // Initialize crop box to center 50%
      if (crop.width === 0) {
        setCrop({
          x: canvas.width * 0.25,
          y: canvas.height * 0.25,
          width: canvas.width * 0.5,
          height: canvas.height * 0.5
        });
      }

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear overlay in crop area
      ctx.clearRect(crop.x, crop.y, crop.width, crop.height);

      // Draw crop box border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

      // Draw image inside crop box
      ctx.drawImage(
        img,
        (crop.x / scale), (crop.y / scale), (crop.width / scale), (crop.height / scale),
        crop.x, crop.y, crop.width, crop.height
      );
    };
    img.src = imageSrc;
  }, [imageSrc, crop]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - crop.x,
      y: e.clientY - rect.top - crop.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newX = e.clientX - rect.left - dragStart.x;
    let newY = e.clientY - rect.top - dragStart.y;

    // Constrain to canvas
    newX = Math.max(0, Math.min(newX, imgDim.width - crop.width));
    newY = Math.max(0, Math.min(newY, imgDim.height - crop.height));

    setCrop({ ...crop, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

      const scale = imgDim.width / img.width;

      const canvas = document.createElement("canvas");
      canvas.width = crop.width / scale;
      canvas.height = crop.height / scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(
        img,
        crop.x / scale, crop.y / scale, crop.width / scale, crop.height / scale,
        0, 0, canvas.width, canvas.height
      );

      const dataUrl = canvas.toDataURL(file.type);
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      URL.revokeObjectURL(objUrl);
      setIsProcessing(false);

      return { data: new Uint8Array(await blob.arrayBuffer()), message: "Image cropped successfully!" };
    } catch (err) {
      setIsProcessing(false);
      throw err;
    }
  };

  return (
    <ToolPage
      toolId="crop-image"
      onProcess={processImage}
      onDownload={(data) => {
        downloadBlob(data, "cropped_image.png");
      }}
      downloadLabel="Download Cropped Image"
      renderOptions={({ files, onProcess, status }) => {
        useEffect(() => {
          if (files.length > 0 && !imageSrc) {
            const url = URL.createObjectURL(files[0]);
            setImageSrc(url);
            return () => URL.revokeObjectURL(url);
          }
        }, [files]);

        return files.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Adjust Crop Area</Label>
              <div className="border rounded-lg bg-card/50 overflow-hidden flex justify-center p-4">
                <canvas
                  ref={canvasRef}
                  className="cursor-move touch-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseOut={handleMouseUp}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Drag the highlighted area to crop your image.
              </p>
            </div>

            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || isProcessing}
            >
              {(status === "processing" || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crop Image
            </Button>
          </div>
        ) : null
      }}
    >
      {() => null}
    </ToolPage>
  );
}
