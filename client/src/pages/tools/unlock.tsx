import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UnlockTool() {
  const [password, setPassword] = useState("");

  return (
    <ToolPage
      toolId="unlock"
      onProcess={async (files) => {
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("password", password);

        const response = await fetch("./api/unlock", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(err || "Failed to unlock PDF. Check your password.");
        }

        const data = await response.arrayBuffer();
        return {
          data: new Uint8Array(data),
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
              className="w-full"
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
