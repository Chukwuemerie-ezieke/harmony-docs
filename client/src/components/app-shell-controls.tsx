import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { applyTheme, getPreferredTheme, type Theme } from "@/lib/theme";

export function AppShellControls() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div
      style={{ position: "fixed", top: "env(safe-area-inset-top, 0.75rem)", right: "0.75rem", zIndex: 50 }}
      className="flex items-center gap-2"
      data-testid="app-shell-controls"
    >
      <PwaInstallButton />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </div>
  );
}
