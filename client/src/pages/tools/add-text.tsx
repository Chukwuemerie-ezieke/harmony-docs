import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { addText, downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddTextTool() {
  const [textContent, setTextContent] = useState("");
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(750);
  const [fontSize, setFontSize] = useState(14);

  return (
    <ToolPage
      toolId="add-text"
      onProcess={async (files) => {
        const data = await addText(files[0], textContent, xPos, yPos, fontSize);
        return { data, message: "Text added to first page" };
      }}
      onDownload={(data) => downloadBlob(data, "annotated.pdf")}
      downloadLabel="Download annotated PDF"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Text to add</Label>
              <Input
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter text..."
                data-testid="text-content"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X position</Label>
                <Input
                  type="number"
                  min={0}
                  value={xPos}
                  onChange={(e) => setXPos(parseInt(e.target.value) || 0)}
                  data-testid="x-pos"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Y position</Label>
                <Input
                  type="number"
                  min={0}
                  value={yPos}
                  onChange={(e) => setYPos(parseInt(e.target.value) || 0)}
                  data-testid="y-pos"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Font size</Label>
                <Input
                  type="number"
                  min={8}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 14)}
                  data-testid="font-size"
                />
              </div>
            </div>
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || !textContent.trim()}
              data-testid="process-btn"
            >
              Add Text
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
