import { Link } from "wouter";
import { HarmonyLogo } from "./harmony-logo";
import { ThemeToggle } from "./theme-toggle";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
          <Link href="/" data-testid="logo-link">
            <HarmonyLogo className="h-7 text-foreground" />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 bg-card/50 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>Harmony Digital Consults Ltd</p>
            <p>Document tools for educators and learners</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
