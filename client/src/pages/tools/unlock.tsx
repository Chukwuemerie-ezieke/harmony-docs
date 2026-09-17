import { useId, useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { decryptPDF } from "@/lib/pdf-security";
import { FileProcessingNotice } from "@/components/file-processing-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UnlockTool() {
  const [password, setPassword] = useState("");
  const passwordId = useId();

  return (
    <ToolPage
      toolId="unlock"
      onProcess={async (files) => {
        const data = await decryptPDF(files[0], password);
        return {
          data,
          message: "PDF unlocked. The password requirement has been removed.",
        };
      }}
      onDownload={(data) => downloadBlob(data, "unlocked.pdf")}
      downloadLabel="Download unlocked PDF"
      instructions={{
        title: "How to unlock a password-protected PDF",
        steps: [
          "Upload the encrypted PDF.",
          "Enter the password that currently opens the file.",
          "Click 'Unlock PDF' and download the unprotected copy.",
        ],
      }}
      faqs={[
        {
          question: "Does my file get uploaded to unlock it?",
          answer: "No. Decryption runs entirely in your browser using QPDF (WebAssembly). Your file and password are never sent to a server.",
        },
        {
          question: "What if I enter the wrong password?",
          answer: "The tool will tell you the password is incorrect and will not produce a file. You can try again with the correct password.",
        },
      ]}
      renderOptions={({ files, onProcess, status }) =>
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={passwordId} className="text-sm">PDF password</Label>
              <Input
                id={passwordId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PDF password"
                data-testid="password-input"
              />
            </div>
            <FileProcessingNotice
              mode="browser"
              retentionMessage="Your PDF is decrypted on your device and is never uploaded."
              className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground [&_a]:underline"
            />
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={status === "processing" || !password}
              data-testid="process-btn"
            >
              {status === "processing" ? "Unlocking…" : "Unlock PDF"}
            </Button>
          </div>
        ) : null
      }
    >
      {() => null}
    </ToolPage>
  );
}
