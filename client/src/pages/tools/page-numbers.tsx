import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { addPageNumbers, downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PageNumbersTool() {
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "bottom-left">("bottom-center");
  const [startFrom, setStartFrom] = useState(1);

  return (
    <ToolPage
      toolId="page-numbers"
      onProcess={async (files) => {
        const data = await addPageNumbers(files[0], position, startFrom);
        return { data, message: "Page numbers added" };
      }}
      onDownload={(data) => downloadBlob(data, "numbered.pdf")}
      downloadLabel="Download numbered PDF"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Position</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {(["bottom-left", "bottom-center", "bottom-right"] as const).map((pos) => (
                  <Button
                    key={pos}
                    variant={position === pos ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPosition(pos)}
                    data-testid={`pos-${pos}`}
                  >
                    {pos.replace("bottom-", "").replace(/^\w/, c => c.toUpperCase())}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Start from page number</Label>
              <Input
                type="number"
                min={1}
                value={startFrom}
                onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)}
                className="w-24"
                data-testid="start-from-input"
              />
            </div>
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing"}
              data-testid="process-btn"
            >
              Add Page Numbers
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
