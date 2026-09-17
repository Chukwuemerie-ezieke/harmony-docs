import { Download, X, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { trackPublicEvent } from "@/lib/privacy-analytics";

/**
 * A dismissible install banner shown only when the browser reports the app is
 * installable (and the user hasn't dismissed it before). Messaging is honest:
 * the document tools and their engines are precached, so they work offline
 * once installed.
 */
export function InstallPrompt() {
  const { canInstall, promptInstall, dismiss } = usePwaInstall();

  if (!canInstall) return null;

  async function handleInstall() {
    const outcome = await promptInstall();
    void trackPublicEvent("cta_clicked", {
      cta_id: "pwa-install",
      cta_placement: "install_banner",
      outcome: outcome === "accepted" ? "success" : "dismissed",
    });
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur-md sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm sm:rounded-xl sm:border"
      role="region"
      aria-label="Install HarmonyDocs"
      data-testid="install-prompt"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
          <WifiOff className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Install HarmonyDocs</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add it to your device to use the document tools even when you’re offline.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstall} data-testid="install-accept">
              <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss} data-testid="install-dismiss">
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
