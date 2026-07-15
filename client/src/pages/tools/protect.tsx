import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { protectPDF, downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProtectTool() {
  const [password, setPassword] = useState("");

  return (
    <ToolPage
      toolId="protect"
      onProcess={async (files) => {
        const data = await protectPDF(files[0], password);
        return { data, message: "PDF protected successfully" };
      }}
      onDownload={(data) => downloadBlob(data, "protected.pdf")}
      downloadLabel="Download protected PDF"
      instructions={{
        title: "How to password protect a PDF",
        steps: [
          "Upload the PDF you want to secure.",
          "Enter a strong password in the input field.",
          "Click the 'Protect PDF' button and download your encrypted file."
        ]
      }}
      faqs={[
        {
          question: "Can anyone open my protected file without the password?",
          answer: "No, once protected, the file will require the exact password you set in order to be opened or viewed."
        },
        {
          question: "Do you save my password?",
          answer: "We do not save your password or your files. Everything is processed locally on your device for maximum security."
        }
      ]}
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Set Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
              />
            </div>
            <Button
              onClick={onProcess}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
              size="lg"
              disabled={status === "processing" || !password}
            >
              Protect PDF
            </Button>
          </div>
        ) : null
      )}
    >
      {() => null}
    </ToolPage>
  );
}
