import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { unlockPDF, downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UnlockTool() {
  const [password, setPassword] = useState("");

  return (
    <ToolPage
      toolId="unlock"
      onProcess={async (files) => {
        const data = await unlockPDF(files[0], password);
        return {
          data,
          message: "PDF unlocked successfully",
        };
      }}
      onDownload={(data) => downloadBlob(data, "unlocked.pdf")}
      downloadLabel="Download unlocked PDF"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">PDF password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PDF password"
                data-testid="password-input"
              />
            </div>
            <Button
              onClick={onProcess}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
              size="lg"
              disabled={status === "processing" || !password}
              data-testid="process-btn"
            >
              Unlock PDF
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
