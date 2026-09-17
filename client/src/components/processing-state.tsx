import { CheckCircle2, Download, Loader2, RotateCcw, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ToolResultAssurance } from "@/components/tool-result-assurance";
import { NextToolSuggestions } from "@/components/next-tool-suggestions";
import type { ProcessProgress, ToolStatus } from "@/lib/tool-workflow";

type ProcessingStateProps = {
  status: ToolStatus;
  message?: string;
  progress?: ProcessProgress | null;
  onDownload?: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  downloadLabel?: string;
  /** Tool id used to suggest relevant follow-up tools after success. */
  toolId?: string;
  /** A single-file PDF result to carry into the next tool, if applicable. */
  handoffFile?: File | null;
};

export function ProcessingState({
  status,
  message,
  progress,
  onDownload,
  onReset,
  onCancel,
  onRetry,
  downloadLabel = "Download",
  toolId,
  handoffFile,
}: ProcessingStateProps) {
  if (status === "idle") return null;

  if (status === "processing") {
    const hasFraction = typeof progress?.fraction === "number";
    const percent = hasFraction ? Math.round((progress!.fraction as number) * 100) : undefined;
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <div className="w-full max-w-sm space-y-2">
          <p className="font-medium">{progress?.stage || "Processing your file…"}</p>
          {hasFraction ? (
            <>
              <Progress value={percent} aria-label={`Processing progress: ${percent}%`} className="h-2" />
              <p className="text-xs text-muted-foreground">{percent}%</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Please keep this tab open until processing is complete.</p>
          )}
        </div>
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} data-testid="cancel-btn">
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Cancel
          </Button>
        )}
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
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} data-testid="retry-btn">
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          )}
          {onReset && (
            <Button variant="outline" onClick={onReset} data-testid="reset-btn">
              Use another file
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 text-center" role="status" aria-live="polite">
      <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden="true" />
      <p className="mt-3 font-medium">Your file is ready</p>
      {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onDownload && (
          <Button onClick={onDownload} data-testid="download-btn">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {downloadLabel}
          </Button>
        )}
        {onReset && (
          <Button variant="outline" onClick={onReset} data-testid="process-another-btn">
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Process another file
          </Button>
        )}
      </div>
      {toolId && <NextToolSuggestions fromToolId={toolId} handoffFile={handoffFile} />}
      <ToolResultAssurance toolId={toolId} />
    </div>
  );
}
