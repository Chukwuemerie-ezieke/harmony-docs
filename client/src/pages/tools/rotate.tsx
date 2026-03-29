import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { rotatePDF, downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";

export default function RotateTool() {
  const [angle, setAngle] = useState(90);

  return (
    <ToolPage
      toolId="rotate"
      onProcess={async (files) => {
        const data = await rotatePDF(files[0], angle);
        return { data, message: `Rotated all pages by ${angle} degrees` };
      }}
      onDownload={(data) => downloadBlob(data, "rotated.pdf")}
      downloadLabel="Download rotated PDF"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Rotation:</span>
              {[90, 180, 270].map((a) => (
                <Button
                  key={a}
                  variant={angle === a ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAngle(a)}
                  data-testid={`rotate-${a}`}
                >
                  {a}°
                </Button>
              ))}
            </div>
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing"}
              data-testid="process-btn"
            >
              Rotate PDF
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
