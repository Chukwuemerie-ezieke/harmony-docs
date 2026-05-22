import { Link } from "wouter";
import { HarmonyLogo } from "./harmony-logo";
import { ThemeToggle } from "./theme-toggle";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
          <Link href="/" data-testid="logo-link">
            <HarmonyLogo className="h-10 text-foreground" />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
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
            <p>© {new Date().getFullYear()} — All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
