import { useEffect, useRef, useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { canvasHasInk, type SignaturePlacement } from "@/lib/signature-utils";
import { SignaturePlacer } from "@/components/signature-placer";
import { AppError } from "@/lib/tool-errors";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PDFDocument } from "pdf-lib";

const DEFAULT_PLACEMENT: SignaturePlacement = { x: 0.62, y: 0.82, width: 0.3 };

export default function SignPdfTool() {
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureAspect, setSignatureAspect] = useState(0.4);
  const [pageIndex, setPageIndex] = useState(0);
  const [placement, setPlacement] = useState<SignaturePlacement>(DEFAULT_PLACEMENT);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  return (
    <ToolPage
      toolId="sign-pdf"
      onProcess={async (files) => {
        const dataUrl = await resolveSignature();
        if (!dataUrl) {
          throw new AppError("invalid_input", "Add your signature first — draw it or upload an image.");
        }
        const data = await stampSignature(files[0], dataUrl, pageIndex, placement);
        return { data, message: `Signature added to page ${pageIndex + 1}.` };
      }}
      onDownload={(data) => downloadBlob(data, "signed_document.pdf")}
      downloadLabel="Download signed PDF"
      instructions={{
        title: "How to sign a PDF",
        steps: [
          "Upload the PDF you want to sign.",
          "Draw or upload your signature, then choose the page.",
          "Drag the signature into position, set its size, and download the signed PDF.",
        ],
      }}
      renderOptions={({ files, onProcess, status }) => (
        <SignOptions
          file={files[0]}
          signatureMode={signatureMode}
          setSignatureMode={setSignatureMode}
          signatureImage={signatureImage}
          setSignatureImage={setSignatureImage}
          signatureDataUrl={signatureDataUrl}
          setSignatureDataUrl={setSignatureDataUrl}
          signatureAspect={signatureAspect}
          setSignatureAspect={setSignatureAspect}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          placement={placement}
          setPlacement={setPlacement}
          canvasRef={canvasRef}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          hasDrawn={hasDrawn}
          setHasDrawn={setHasDrawn}
          onProcess={onProcess}
          status={status}
        />
      )}
    >
      {() => null}
    </ToolPage>
  );

  // Resolve the active signature to a PNG data URL, validating it isn't blank.
  async function resolveSignature(): Promise<string | null> {
    if (signatureMode === "upload") {
      return signatureImage;
    }
    const canvas = canvasRef.current;
    if (!canvas || !canvasHasInk(canvas)) return null;
    return canvas.toDataURL("image/png");
  }
}

function SignOptions(props: {
  file: File | undefined;
  signatureMode: "draw" | "upload";
  setSignatureMode: (m: "draw" | "upload") => void;
  signatureImage: string | null;
  setSignatureImage: (v: string | null) => void;
  signatureDataUrl: string | null;
  setSignatureDataUrl: (v: string | null) => void;
  signatureAspect: number;
  setSignatureAspect: (v: number) => void;
  pageIndex: number;
  setPageIndex: (v: number) => void;
  placement: SignaturePlacement;
  setPlacement: (v: SignaturePlacement) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isDrawing: boolean;
  setIsDrawing: (v: boolean) => void;
  hasDrawn: boolean;
  setHasDrawn: (v: boolean) => void;
  onProcess: () => void;
  status: string;
}) {
  const {
    file, signatureMode, setSignatureMode, signatureImage, setSignatureImage,
    signatureDataUrl, setSignatureDataUrl, signatureAspect, setSignatureAspect,
    pageIndex, setPageIndex, placement, setPlacement, canvasRef,
    setIsDrawing, isDrawing, hasDrawn, setHasDrawn, onProcess, status,
  } = props;
  const { pageCount } = usePdfPageCount(file);

  // Keep the page selection valid as the document changes.
  useEffect(() => {
    if (pageCount > 0 && pageIndex > pageCount - 1) setPageIndex(0);
  }, [pageCount, pageIndex, setPageIndex]);

  // Prepare the drawing canvas for high-DPI displays.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || signatureMode !== "draw") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
  }, [signatureMode, canvasRef]);

  function pointer(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = pointer(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointer(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
    syncDrawnSignature();
  }

  function stopDraw() {
    setIsDrawing(false);
    syncDrawnSignature();
  }

  // Push the drawn signature to the live preview.
  function syncDrawnSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvasHasInk(canvas)) {
      setSignatureDataUrl(canvas.toDataURL("image/png"));
      setSignatureAspect(canvas.height / canvas.width);
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setSignatureDataUrl(null);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setSignatureImage(url);
      setSignatureDataUrl(url);
      const img = new Image();
      img.onload = () => setSignatureAspect(img.height / img.width || 0.4);
      img.src = url;
    };
    reader.readAsDataURL(uploaded);
  }

  if (!file) return null;

  const signatureReady = signatureMode === "upload" ? Boolean(signatureImage) : hasDrawn;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-semibold">Your signature</Label>
        <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as "draw" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-3 pt-4">
            <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-card/50">
              <canvas
                ref={canvasRef}
                className="h-40 w-full cursor-crosshair touch-none"
                aria-label="Signature drawing area"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseOut={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <Button variant="outline" size="sm" onClick={clearCanvas} className="absolute bottom-2 right-2" data-testid="clear-signature">
                Clear
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">Draw your signature above.</p>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3 pt-4">
            <Input type="file" accept="image/png, image/jpeg" onChange={handleUpload} aria-label="Upload signature image" data-testid="signature-upload" />
            {signatureImage && (
              <div className="flex justify-center rounded-lg border bg-white p-4">
                <img src={signatureImage} alt="Signature preview" className="max-h-24 object-contain" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {pageCount > 0 && (
        <div className="space-y-2">
          <Label htmlFor="sign-page" className="text-base font-semibold">Page to sign</Label>
          <Input
            id="sign-page"
            type="number"
            min={1}
            max={pageCount}
            value={pageIndex + 1}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!Number.isNaN(n)) setPageIndex(Math.min(Math.max(n - 1, 0), pageCount - 1));
            }}
            className="w-28"
            data-testid="sign-page-input"
          />
          <p className="text-xs text-muted-foreground">Document has {pageCount} page{pageCount === 1 ? "" : "s"}.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-base font-semibold">Signature size: {Math.round(placement.width * 100)}% of page width</Label>
        <Slider
          value={[Math.round(placement.width * 100)]}
          onValueChange={([v]) => setPlacement({ ...placement, width: v / 100 })}
          min={10}
          max={60}
          step={5}
          data-testid="signature-size"
        />
      </div>

      {signatureReady && signatureDataUrl && (
        <div className="space-y-2">
          <Label className="text-base font-semibold">Position</Label>
          <SignaturePlacer
            file={file}
            pageIndex={pageIndex}
            signatureDataUrl={signatureDataUrl}
            placement={placement}
            onPlacementChange={setPlacement}
            signatureAspect={signatureAspect}
          />
        </div>
      )}

      <Button
        onClick={onProcess}
        className="w-full"
        size="lg"
        disabled={status === "processing" || !signatureReady}
        data-testid="process-btn"
      >
        {status === "processing" ? "Signing…" : "Sign PDF"}
      </Button>
      {!signatureReady && (
        <p className="text-center text-xs text-muted-foreground">Add your signature to continue.</p>
      )}
    </div>
  );
}

/** Stamp the signature onto the chosen page using fractional placement. */
async function stampSignature(
  file: File,
  signatureDataUrl: string,
  pageIndex: number,
  placement: SignaturePlacement,
): Promise<Uint8Array> {
  const base64 = signatureDataUrl.split(",")[1];
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
  const pages = pdfDoc.getPages();
  const page = pages[Math.min(pageIndex, pages.length - 1)];
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const isPng = signatureDataUrl.startsWith("data:image/png");
  const sigImage = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
  const aspect = sigImage.height / sigImage.width;

  const drawWidth = placement.width * pageWidth;
  const drawHeight = drawWidth * aspect;
  const x = placement.x * pageWidth;
  // Placement y is measured from the top; pdf-lib's origin is bottom-left.
  const y = pageHeight - placement.y * pageHeight - drawHeight;

  page.drawImage(sigImage, { x, y, width: drawWidth, height: drawHeight });
  return pdfDoc.save();
}
