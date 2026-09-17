import { Link } from "wouter";
import { History, X, ArrowRight } from "lucide-react";
import { getToolById } from "@/lib/tools";
import { useWorkspaceHistory } from "@/hooks/use-workspace-history";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWhen(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return `${days} d ago`;
}

/**
 * Shows recent work recorded locally (metadata only) so users can jump back
 * into a tool. Renders nothing when there is no history.
 */
export function RecentWork() {
  const { entries, loaded, remove, clear } = useWorkspaceHistory();

  if (!loaded || entries.length === 0) return null;

  return (
    <div data-testid="recent-work" className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <History className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-foreground">Recent work</h3>
        <div className="h-px flex-1 bg-border/60" />
        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={clear} data-testid="clear-history">
          Clear
        </Button>
      </div>
      <p className="mb-4 -mt-3 text-xs text-muted-foreground">
        Stored only on this device — file names and sizes, never the documents themselves.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {entries.map((entry) => {
          const tool = getToolById(entry.toolId);
          if (!tool) return null;
          return (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
              data-testid={`history-item-${entry.id}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground" title={entry.outputName}>
                  {entry.outputName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tool.name} · {formatWhen(entry.completedAt)}
                  {entry.outputBytes > 0 ? ` · ${formatBytes(entry.outputBytes)}` : ""}
                </p>
              </div>
              <Link
                href={`#${tool.route}`}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                data-testid={`history-open-${entry.id}`}
              >
                Open
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Remove ${entry.outputName} from history`}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                data-testid={`history-remove-${entry.id}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
