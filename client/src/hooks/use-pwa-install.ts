import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "harmonydocs-install-dismissed";

/**
 * Captures the browser's install prompt so we can surface it at a natural
 * moment rather than letting the browser's default mini-infobar decide.
 * Respects a user's prior dismissal and hides once installed.
 */
export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismissed =
    typeof window !== "undefined" && window.localStorage?.getItem(DISMISS_KEY) === "1";

  const canInstall = Boolean(deferred) && !installed && !dismissed;

  const promptInstall = useCallback(async () => {
    if (!deferred) return "unavailable" as const;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome;
  }, [deferred]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage?.setItem(DISMISS_KEY, "1");
    } catch {
      // best-effort
    }
    setDeferred(null);
  }, []);

  return { canInstall, promptInstall, dismiss, installed };
}
