import { useState } from "react";
import { Trash2, Check } from "lucide-react";
import { clearWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";

/**
 * User-facing control to wipe all locally stored workspace data (recent-work
 * history and saved tool settings). Favourites/recents in localStorage are
 * separate and managed from the tools directory.
 */
export function ClearWorkspaceButton() {
  const [status, setStatus] = useState<"idle" | "clearing" | "done">("idle");

  async function handleClear() {
    setStatus("clearing");
    try {
      await clearWorkspace();
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="clear-workspace">
      <Button variant="outline" onClick={handleClear} disabled={status === "clearing"} data-testid="clear-workspace-btn">
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
        {status === "clearing" ? "Clearing…" : "Clear local workspace data"}
      </Button>
      {status === "done" && (
        <span className="inline-flex items-center gap-1 text-sm text-primary" role="status">
          <Check className="h-4 w-4" aria-hidden="true" />
          Local data cleared
        </span>
      )}
    </div>
  );
}
