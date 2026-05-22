import logoUrl from "@/assets/harmony-logo.jpg";

export function HarmonyLogo({ className = "h-8" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      aria-label="Harmony Docs by Harmony Digital Consults Ltd"
    >
      <img
        src={logoUrl}
        alt="Harmony Digital Consults"
        className="h-full w-auto object-contain"
        style={{ aspectRatio: "1 / 1" }}
      />
      <div className="flex flex-col leading-none">
        <span
          className="font-bold tracking-tight text-foreground"
          style={{
            fontFamily: "'Cabinet Grotesk', 'General Sans', sans-serif",
            fontSize: "1.125rem",
            letterSpacing: "-0.02em",
          }}
        >
          Harmony <span style={{ color: "hsl(var(--primary))" }}>Docs</span>
        </span>
        <span
          className="text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground mt-0.5"
          style={{ fontFamily: "'General Sans', sans-serif" }}
        >
          Digital Consults
        </span>
      </div>
    </div>
  );
}
