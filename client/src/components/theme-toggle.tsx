import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/lib/theme";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const nextLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Button type="button" variant="ghost" size="icon" onClick={onToggle} aria-label={nextLabel} title={nextLabel} data-testid="theme-toggle">
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </Button>
  );
}
