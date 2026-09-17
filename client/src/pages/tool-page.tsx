import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { FileDropzone } from "@/components/file-dropzone";
import { ProcessingState } from "@/components/processing-state";
import { getToolById } from "@/lib/tools";
import { resolveTool } from "@/lib/tool-registry";
import { useRecordRecent } from "@/hooks/use-tool-preferences";
import { consumeHandoff, fileFromResult } from "@/lib/tool-handoff";
import { recordWork } from "@/lib/workspace";
import { trackPublicEvent } from "@/lib/privacy-analytics";
import { toUserError, CancelledError } from "@/lib/tool-errors";
import type { ProcessContext, ProcessProgress, ProcessOutcome, ToolStatus } from "@/lib/tool-workflow";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock, PenTool, FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock, PenTool, FileSearch,
};

interface ToolChildrenProps {
  files: File[];
  setFiles: (f: File[]) => void;
  status: ToolStatus;
  setStatus: (s: ToolStatus) => void;
  result: any;
  setResult: (r: any) => void;
  message: string;
  setMessage: (m: string) => void;
}

interface ToolRenderOptionsProps {
  files: File[];
  setFiles: (f: File[]) => void;
  onProcess: () => void;
  status: ToolStatus;
}

interface ToolPageProps {
  toolId: string;
  children: (props: ToolChildrenProps) => React.ReactNode;
  renderOptions?: (props: ToolRenderOptionsProps) => React.ReactNode;
  /**
   * The processing function. Receives the selected files plus an optional
   * ProcessContext (AbortSignal + progress reporter). Tools that don't need
   * progress/cancellation can simply ignore the second argument.
   */
  onProcess?: (files: File[], context: ProcessContext) => Promise<ProcessOutcome>;
  onDownload?: (result: any) => void;
  downloadLabel?: string;
  /**
   * Output file name recorded in the local workspace history (metadata only).
   * Defaults to `<toolId>-result`. Never the source file name.
   */
  outputName?: string;
  /** Optional preview of the result, rendered in the completed (done) state. */
  resultPreview?: (result: any) => React.ReactNode;
  instructions?: { title: string; steps: string[] };
  faqs?: { question: string; answer: string }[];
}

/** Best-effort byte size of a tool result for local history metadata. */
function resultByteSize(result: unknown): number {
  if (result instanceof Uint8Array) return result.byteLength;
  if (result instanceof Blob) return result.size;
  if (Array.isArray(result)) {
    return result.reduce((sum: number, item: unknown) => {
      const data = (item as { data?: unknown })?.data;
      if (data instanceof Uint8Array) return sum + data.byteLength;
      if (data instanceof Blob) return sum + data.size;
      return sum;
    }, 0);
  }
  return 0;
}

export function ToolPage({
  toolId,
  children,
  renderOptions,
  onProcess,
  onDownload,
  downloadLabel,
  outputName,
  resultPreview,
  instructions,
  faqs,
}: ToolPageProps) {
  const rawTool = getToolById(toolId);
  const tool = rawTool ? resolveTool(rawTool) : undefined;
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [notices, setNotices] = useState<string[]>([]);
  const hadFilesRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const analyticsAttributes = tool
    ? { tool_id: toolId, tool_slug: toolId, tool_category: tool.category }
    : { tool_id: toolId, tool_slug: toolId };

  // Record recently-used tools (local, device-only) for the discovery view.
  useRecordRecent(tool ? toolId : undefined);

  // Pick up a file handed off from a previous tool's "next step", so the user
  // continues with their result without re-uploading.
  useEffect(() => {
    const incoming = consumeHandoff(toolId);
    if (incoming) {
      hadFilesRef.current = true;
      setFiles([incoming]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  useEffect(() => {
    if (tool) {
      void trackPublicEvent("tool_opened", analyticsAttributes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  // Guard against un-downloaded work being lost if the user navigates away
  // mid-processing.
  useEffect(() => {
    if (status !== "processing") return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);

  const Icon = tool ? iconMap[tool.icon] : null;

  const handleFilesChange = useCallback((nextFiles: File[]) => {
    if (!hadFilesRef.current && nextFiles.length > 0) {
      hadFilesRef.current = true;
      void trackPublicEvent("upload_started", analyticsAttributes);
    }
    if (nextFiles.length === 0) {
      hadFilesRef.current = false;
    }
    setFiles(nextFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId, tool?.category]);

  const runProcess = useCallback(async () => {
    if (!onProcess || files.length === 0) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("processing");
    setProgress(null);
    setMessage("Processing your files…");
    try {
      const context: ProcessContext = {
        signal: controller.signal,
        onProgress: (next) => setProgress(next),
      };
      const res = await onProcess(files, context);
      if (controller.signal.aborted) return;
      setResult(res.data);
      setMessage(res.message);
      void trackPublicEvent("processing_completed", analyticsAttributes);
      setStatus("done");
    } catch (err: unknown) {
      if (err instanceof CancelledError || controller.signal.aborted) {
        setStatus("idle");
        setMessage("");
        setProgress(null);
        return;
      }
      const { message: userMessage, code } = toUserError(err);
      void trackPublicEvent("processing_failed", { ...analyticsAttributes, error_code: code });
      setMessage(userMessage);
      setStatus("error");
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, onProcess, toolId, tool?.category]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    // Return to the idle upload state immediately; the in-flight processor's
    // resolution is ignored because its controller is aborted.
    setStatus("idle");
    setMessage("");
    setProgress(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!onDownload) return;
    void trackPublicEvent("download_clicked", analyticsAttributes);
    onDownload(result);
    // Record metadata-only history in the local workspace (device-only).
    void recordWork({
      toolId,
      outputName: outputName ?? `${toolId}-result`,
      outputBytes: resultByteSize(result),
    }).catch(() => {
      // Workspace history is best-effort and must never block a download.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDownload, result, toolId, tool?.category, outputName]);

  const handleReset = () => {
    hadFilesRef.current = false;
    setFiles([]);
    setStatus("idle");
    setResult(null);
    setMessage("");
    setProgress(null);
    setNotices([]);
  };

  // Retry keeps the same files/settings and re-runs processing.
  const handleRetry = useCallback(() => {
    void runProcess();
  }, [runProcess]);

  // A single-file PDF result can be carried into a follow-up tool. Multi-file
  // results (e.g. split/pdf-to-images arrays) are not handed off.
  const handoffFile =
    status === "done" && result instanceof Uint8Array
      ? fileFromResult(result, `${toolId}-result.pdf`)
      : null;

  if (!tool) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground font-medium">Tool not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm", tool.color, "bg-background border border-border/50")}>
              {Icon && <Icon className="h-8 w-8" />}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{tool.name}</h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">{tool.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 -mt-16 relative z-10">
        <Link href="#/tools" data-testid="back-link">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to tools
          </div>
        </Link>

        <div className="bg-card rounded-2xl shadow-xl border border-border/60 p-4 sm:p-8 space-y-6">
          {status === "idle" || status === "error" ? (
            <>
              <FileDropzone
                accept={tool.acceptedTypes}
                multiple={tool.multiple}
                files={files}
                onFilesChange={handleFilesChange}
                reorderable={tool.multiple}
                maxFiles={tool.maxFiles}
                maxFileBytes={tool.maxFileBytes}
                notices={notices}
                onNotices={setNotices}
              />

              {children({ files, setFiles: handleFilesChange, status, setStatus, result, setResult, message, setMessage })}

              {renderOptions ? (
                renderOptions({ files, setFiles: handleFilesChange, onProcess: runProcess, status })
              ) : (
                files.length > 0 && (
                  <Button
                    onClick={runProcess}
                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
                    size="lg"
                    data-testid="process-btn"
                  >
                    {tool.name}
                  </Button>
                )
              )}
            </>
          ) : null}

          {status === "done" && resultPreview ? resultPreview(result) : null}

          <ProcessingState
            status={status}
            message={message}
            progress={progress}
            onDownload={onDownload ? handleDownload : undefined}
            onReset={handleReset}
            onCancel={handleCancel}
            onRetry={onProcess ? handleRetry : undefined}
            downloadLabel={downloadLabel}
            toolId={toolId}
            handoffFile={handoffFile}
          />
        </div>
      </div>

      {(instructions || faqs) && (
        <div className="bg-muted/30 border-t border-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-16">
            {instructions && (
              <div className="text-center space-y-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{instructions.title || `How to use ${tool.name}`}</h2>
                <div className="grid sm:grid-cols-3 gap-6 text-left">
                  {instructions.steps.map((step, index) => (
                    <div key={index} className="bg-card p-6 rounded-xl border border-border shadow-sm relative overflow-hidden">
                      <div className="text-5xl font-black text-primary/10 absolute -right-2 -bottom-4 pointer-events-none">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">Step {index + 1}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {faqs && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border px-6 rounded-xl overflow-hidden shadow-sm">
                      <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
