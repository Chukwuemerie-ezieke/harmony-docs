export function HarmonyLogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Harmony Docs"
    >
      {/* Icon - two overlapping document shapes forming an H */}
      <rect x="2" y="4" width="18" height="24" rx="3" stroke="currentColor" strokeWidth="2.2" fill="none" />
      <rect x="10" y="10" width="18" height="24" rx="3" stroke="currentColor" strokeWidth="2.2" fill="hsl(var(--primary) / 0.15)" />
      <line x1="14" y1="18" x2="24" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="22" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Text */}
      <text
        x="36"
        y="26"
        fontFamily="'Cabinet Grotesk', 'General Sans', sans-serif"
        fontWeight="700"
        fontSize="19"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        Harmony
      </text>
      <text
        x="134"
        y="26"
        fontFamily="'General Sans', sans-serif"
        fontWeight="400"
        fontSize="19"
        fill="hsl(var(--primary))"
        letterSpacing="-0.02em"
      >
        Docs
      </text>
    </svg>
  );
}
