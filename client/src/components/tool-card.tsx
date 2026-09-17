import { Link } from "wouter";
import { Star } from "lucide-react";
import {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock, PenTool, FileSearch,
} from "lucide-react";
import type { ToolDefinition } from "@shared/schema";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers, Scissors, Minimize2, RotateCw, Hash,
  ImagePlus, Image, Globe, Droplets, Type, Lock, Unlock, PenTool, FileSearch,
};

interface ToolCardProps {
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
}

export function ToolCard({ tool, isFavorite, onToggleFavorite }: ToolCardProps) {
  const Icon = iconMap[tool.icon] ?? Layers;
  return (
    <div className="group relative h-full" data-testid={`tool-card-${tool.id}`}>
      <Link href={`#${tool.route}`} className="block h-full">
        <div className="flex h-full flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 transition-all duration-200 hover:border-primary hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-110", tool.color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2 pr-8">
              {tool.name}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(tool.id);
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Remove ${tool.name} from favourites` : `Add ${tool.name} to favourites`}
        className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        data-testid={`favorite-toggle-${tool.id}`}
      >
        <Star className={cn("h-4 w-4", isFavorite && "fill-amber-400 text-amber-500")} aria-hidden="true" />
      </button>
    </div>
  );
}
