import { useId, useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { encryptPDF } from "@/lib/pdf-security";
import { FileProcessingNotice } from "@/components/file-processing-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProtectTool() {
  const [password, setPassword] = useState("");
  const passwordId = useId();

  return (
    <ToolPage
      toolId="protect"
      onProcess={async (files) => {
        const data = await encryptPDF(files[0], password);
        return { data, message: "PDF encrypted with AES-256. It now requires your password to open." };
      }}
      onDownload={(data) => downloadBlob(data, "protected.pdf")}
      downloadLabel="Download protected PDF"
      outputName="protected.pdf"
      instructions={{
        title: "How to password protect a PDF",
        steps: [
          "Upload the PDF you want to secure.",
          "Enter a strong password in the input field.",
          "Click 'Protect PDF' and download your AES-256 encrypted file."
        ]
      }}
      faqs={[
        {
          question: "Can anyone open my protected file without the password?",
          answer: "No. The file is encrypted with AES-256 and requires the exact password you set in order to be opened."
        },
        {
          question: "Do you save my password or my file?",
          answer: "No. Encryption runs entirely in your browser using QPDF (WebAssembly). Your file and password are never uploaded to any server."
        }
      ]}
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={passwordId}>Set Password</Label>
              <Input
                id={passwordId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
              />
            </div>
            <FileProcessingNotice
              mode="browser"
              retentionMessage="Your PDF is encrypted on your device and is never uploaded."
              className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground [&_a]:underline"
            />
            <Button
              onClick={onProcess}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
              size="lg"
              disabled={status === "processing" || !password}
            >
              {status === "processing" ? "Encrypting…" : "Protect PDF"}
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
