import { useState, useRef, useEffect } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function SignPdfTool() {
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas styles
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, [signatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Keep scale intact by clearing based on logical size
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processSignature = async (files: File[]) => {
    if (!files.length) throw new Error("No PDF selected");

    setIsProcessing(true);
    try {
      let sigDataUrl = signatureImage;

      if (signatureMode === "draw") {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not found");
        sigDataUrl = canvas.toDataURL("image/png");
      }

      if (!sigDataUrl) {
        throw new Error("No signature provided");
      }

      // Convert data URL to ArrayBuffer
      const base64Data = sigDataUrl.split(",")[1];
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Load PDF directly here as the web worker might struggle with image embedding in some cases
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const sigImage = await pdfDoc.embedPng(bytes);
      const sigDims = sigImage.scale(0.5); // Scale down slightly

      const pages = pdfDoc.getPages();
      // For simplicity, add to the bottom right of the first page
      const firstPage = pages[0];
      const { width } = firstPage.getSize();

      firstPage.drawImage(sigImage, {
        x: width - sigDims.width - 50,
        y: 50,
        width: sigDims.width,
        height: sigDims.height,
      });

      const pdfData = await pdfDoc.save();

      setIsProcessing(false);
      return { data: pdfData, message: "Signature added successfully" };
    } catch (err) {
      setIsProcessing(false);
      throw err;
    }
  };

  return (
    <ToolPage
      toolId="sign-pdf"
      onProcess={processSignature}
      onDownload={(data) => downloadBlob(data, "signed_document.pdf")}
      downloadLabel="Download Signed PDF"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Your Signature</Label>
              <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="draw">Draw</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="draw" className="space-y-4 pt-4">
                  <div className="border-2 border-dashed border-border rounded-lg bg-card/50 overflow-hidden relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-48 cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseOut={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                      className="absolute bottom-2 right-2"
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Draw your signature in the box above</p>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4 pt-4">
                  <Input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageUpload}
                  />
                  {signatureImage && (
                    <div className="mt-4 p-4 border rounded-lg bg-white flex justify-center">
                      <img src={signatureImage} alt="Signature Preview" className="max-h-32 object-contain" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || isProcessing}
            >
              {(status === "processing" || isProcessing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign PDF
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              The signature will be placed at the bottom right of the first page.
            </p>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
