import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/lib/theme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      data-testid="theme-toggle"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
