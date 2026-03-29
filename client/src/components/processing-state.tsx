import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProcessingStateProps {
  status: "idle" | "processing" | "done" | "error";
  message?: string;
  onDownload?: () => void;
  onReset?: () => void;
  downloadLabel?: string;
}

export function ProcessingState({
  status,
  message,
  onDownload,
  onReset,
  downloadLabel = "Download",
}: ProcessingStateProps) {
  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border p-6 text-center",
        status === "processing" && "border-primary/30 bg-primary/5",
        status === "done" && "border-emerald-500/30 bg-emerald-500/5",
        status === "error" && "border-destructive/30 bg-destructive/5"
      )}
      data-testid="processing-state"
    >
      {status === "processing" && (
        <>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">{message || "Processing your files..."}</p>
        </>
      )}

      {status === "done" && (
        <>
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">{message || "Processing complete"}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {onDownload && (
              <Button onClick={onDownload} data-testid="download-btn">
                {downloadLabel}
              </Button>
            )}
            {onReset && (
              <Button variant="outline" onClick={onReset} data-testid="reset-btn">
                Process another
              </Button>
            )}
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{message || "Something went wrong"}</p>
          {onReset && (
            <Button variant="outline" onClick={onReset} data-testid="retry-btn">
              Try again
            </Button>
          )}
        </>
      )}
    </div>
  );
}
