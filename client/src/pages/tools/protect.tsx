import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadBlob } from "@/lib/pdf-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function ProtectTool() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ToolPage
      toolId="protect"
      onProcess={async (files) => {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 4) {
          throw new Error("Password must be at least 4 characters");
        }

        // Send to server for actual encryption
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("password", password);

        const response = await fetch("./api/protect", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(err || "Failed to protect PDF");
        }

        const data = await response.arrayBuffer();
        return {
          data: new Uint8Array(data),
          message: "PDF password protection applied",
        };
      }}
      onDownload={(data) => downloadBlob(data, "protected.pdf")}
      downloadLabel="Download protected PDF"
      renderOptions={({ files, onProcess, status }) => (
        files.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  data-testid="password-input"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Confirm password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                data-testid="confirm-password-input"
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
            <Button
              onClick={onProcess}
              className="w-full"
              size="lg"
              disabled={
                status === "processing" ||
                !password ||
                password !== confirmPassword ||
                password.length < 4
              }
              data-testid="process-btn"
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
