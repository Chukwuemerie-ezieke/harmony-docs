import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock, PenTool, FileSearch,
} from "lucide-react";
import { getToolById } from "@/lib/tools";
import { stageHandoff } from "@/lib/tool-handoff";
import { trackPublicEvent } from "@/lib/privacy-analytics";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock, PenTool, FileSearch,
};

interface NextToolSuggestionsProps {
  /** The tool that just completed. */
  fromToolId: string;
  /**
   * A single-file PDF result that can be carried into the next tool, if any.
   * When present and the next tool accepts PDFs, the file is handed off so the
   * user doesn't re-upload.
   */
  handoffFile?: File | null;
}

export function NextToolSuggestions({ fromToolId, handoffFile }: NextToolSuggestionsProps) {
  const [, navigate] = useLocation();
  const current = getToolById(fromToolId);
  const relatedIds = current?.relatedTools ?? [];
  const suggestions = relatedIds
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  if (suggestions.length === 0) return null;

  function handleClick(toolId: string, route: string, acceptsPdf: boolean) {
    void trackPublicEvent("cta_clicked", {
      tool_id: fromToolId,
      tool_slug: fromToolId,
      cta_id: `next-tool-${toolId}`,
      cta_placement: "result_next_tool",
    });
    if (handoffFile && acceptsPdf) {
      stageHandoff(handoffFile, toolId);
    }
    navigate(`${route}`);
  }

  return (
    <div className="mt-6 rounded-lg border bg-muted/20 p-4 text-left" data-testid="next-tool-suggestions">
      <p className="text-sm font-semibold text-foreground">Next steps</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {handoffFile ? "Continue with your result — no need to re-upload." : "Common things to do next."}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {suggestions.map((tool) => {
          const Icon = iconMap[tool.icon] ?? Layers;
          const acceptsPdf = tool.acceptedTypes.includes(".pdf");
          const canCarry = Boolean(handoffFile) && acceptsPdf;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleClick(tool.id, tool.route, acceptsPdf)}
              className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-primary hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              data-testid={`next-tool-${tool.id}`}
            >
              <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md", tool.color)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <span className="truncate">{tool.name}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                {canCarry && <span className="text-xs text-primary">Uses your result</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
