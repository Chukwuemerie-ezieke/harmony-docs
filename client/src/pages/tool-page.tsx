import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { FileDropzone } from "@/components/file-dropzone";
import { ProcessingState } from "@/components/processing-state";
import { getToolById } from "@/lib/tools";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock,
};

interface ToolPageProps {
  toolId: string;
  children: (props: {
    files: File[];
    setFiles: (f: File[]) => void;
    status: "idle" | "processing" | "done" | "error";
    setStatus: (s: "idle" | "processing" | "done" | "error") => void;
    result: any;
    setResult: (r: any) => void;
    message: string;
    setMessage: (m: string) => void;
  }) => React.ReactNode;
  renderOptions?: (props: {
    files: File[];
    onProcess: () => void;
    status: "idle" | "processing" | "done" | "error";
  }) => React.ReactNode;
  onProcess?: (files: File[]) => Promise<{ data: any; message: string }>;
  onDownload?: (result: any) => void;
  downloadLabel?: string;
}

export function ToolPage({
  toolId,
  children,
  renderOptions,
  onProcess,
  onDownload,
  downloadLabel,
}: ToolPageProps) {
  const tool = getToolById(toolId);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState("");

  const Icon = tool ? iconMap[tool.icon] : null;

  const handleProcess = useCallback(async () => {
    if (!onProcess || files.length === 0) return;
    setStatus("processing");
    setMessage("Processing your files...");
    try {
      const res = await onProcess(files);
      setResult(res.data);
      setMessage(res.message);
      setStatus("done");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
      setStatus("error");
    }
  }, [files, onProcess]);

  const handleReset = () => {
    setFiles([]);
    setStatus("idle");
    setResult(null);
    setMessage("");
  };

  if (!tool) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Tool not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Back nav */}
        <Link href="/" data-testid="back-link">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
            All tools
          </div>
        </Link>

        {/* Tool header */}
        <div className="flex items-start gap-3 mb-8">
          <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg shrink-0", tool.color)}>
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{tool.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-4">
          {status === "idle" || status === "error" ? (
            <>
              <FileDropzone
                accept={tool.acceptedTypes}
                multiple={tool.multiple}
                files={files}
                onFilesChange={setFiles}
                reorderable={tool.multiple}
              />

              {/* Custom children/options */}
              {children({ files, setFiles, status, setStatus, result, setResult, message, setMessage })}

              {/* Process button or custom options */}
              {renderOptions ? (
                renderOptions({ files, onProcess: handleProcess, status })
              ) : (
                files.length > 0 && (
                  <Button
                    onClick={handleProcess}
                    className="w-full"
                    size="lg"
                    disabled={status === "processing"}
                    data-testid="process-btn"
                  >
                    {tool.name}
                  </Button>
                )
              )}
            </>
          ) : null}

          <ProcessingState
            status={status}
            message={message}
            onDownload={onDownload ? () => onDownload(result) : undefined}
            onReset={handleReset}
            downloadLabel={downloadLabel}
          />
        </div>
      </div>
    </Layout>
  );
}
