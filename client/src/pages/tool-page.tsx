import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { FileDropzone } from "@/components/file-dropzone";
import { ProcessingState } from "@/components/processing-state";
import { getToolById } from "@/lib/tools";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock,
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
  instructions?: { title: string; steps: string[] };
  faqs?: { question: string; answer: string }[];
}

export function ToolPage({
  toolId,
  children,
  renderOptions,
  onProcess,
  onDownload,
  downloadLabel,
  instructions,
  faqs,
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
          <p className="text-muted-foreground font-medium">Tool not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
         <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 text-center">
            {/* Tool header */}
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
        {/* Back nav */}
        <Link href="/#tools" data-testid="back-link">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to tools
          </div>
        </Link>

        {/* Main Workspace */}
        <div className="bg-card rounded-2xl shadow-xl border border-border/60 p-4 sm:p-8 space-y-6">
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
                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/25 transition-all"
                    size="lg"
                    disabled={false}
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

      {/* Instructions & FAQs Section */}
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
