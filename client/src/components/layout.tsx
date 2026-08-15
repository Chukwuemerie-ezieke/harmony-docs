import { Link } from "wouter";
import { HarmonyLogo } from "./harmony-logo";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "@/hooks/use-theme";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
          <Link href="/" data-testid="logo-link">
            <HarmonyLogo className="h-10 text-foreground" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/about"
              className="px-2.5 sm:px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              data-testid="nav-about"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="px-2.5 sm:px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              data-testid="nav-contact"
            >
              Contact
            </Link>
            <ThemeToggle
              theme={theme as any}
              onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 bg-card/50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span className="font-semibold text-foreground">Harmony Digital Consults Ltd</span>
              <span className="hidden sm:inline text-border">•</span>
              <span>Transforming Education Through Technology</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <span className="text-border">•</span>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
              <span className="text-border">•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
