import { Link } from "wouter";

export function ToolResultAssurance() {
  return (
    <aside className="mt-6 rounded-lg border bg-muted/30 p-4" aria-label="Privacy and consultation information" data-testid="tool-result-assurance">
      <p className="text-sm font-semibold">Your document stays private</p>
      <p className="mt-1 text-sm text-muted-foreground">HarmonyDocs processes supported document tasks in your browser whenever possible. Your completed file is not retained by Harmony Digital Consults after you download it.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link href="#/privacy" className="text-sm underline">Read our privacy notice</Link>
        <Link href="#/contact" className="text-sm font-medium underline" data-testid="result-consultation-cta">Need help with document workflows? Contact us</Link>
      </div>
    </aside>
  );
}
