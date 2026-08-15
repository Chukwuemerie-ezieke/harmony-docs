import { CheckCircle2, Download, Loader2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolResultAssurance } from "@/components/tool-result-assurance";

type ProcessingStateProps = {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
  onDownload?: () => void;
  onReset?: () => void;
  downloadLabel?: string;
};

export function ProcessingState({ status, message, onDownload, onReset, downloadLabel = "Download" }: ProcessingStateProps) {
  if (status === "idle") return null;

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <div>
          <p className="font-medium">Processing your file…</p>
          <p className="text-sm text-muted-foreground">Please keep this tab open until processing is complete.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center" role="alert">
        <XCircle className="h-9 w-9 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium">We couldn’t process that file</p>
          {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
        </div>
        {onReset && <Button variant="outline" onClick={onReset}><RotateCcw className="mr-2 h-4 w-4" />Try another file</Button>}
      </div>
    );
  }

  return (
    <div className="py-8 text-center" role="status" aria-live="polite">
      <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />
      <p className="mt-3 font-medium">Your file is ready</p>
      {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onDownload && <Button onClick={onDownload}><Download className="mr-2 h-4 w-4" />{downloadLabel}</Button>}
        {onReset && <Button variant="outline" onClick={onReset}><RotateCcw className="mr-2 h-4 w-4" />Process another file</Button>}
      </div>
      <ToolResultAssurance />
    </div>
  );
}
