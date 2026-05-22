export function HarmonyLogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Harmony Docs by Harmony Digital Consults"
    >
      {/* Hexagonal H mark — Harmony Digital Consults brand */}
      <g transform="translate(2, 2)">
        {/* Hexagon outer */}
        <path
          d="M20 1 L37 11 L37 29 L20 39 L3 29 L3 11 Z"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="hsl(var(--primary) / 0.08)"
        />
        {/* Letter H inside */}
        <path
          d="M13 13 L13 27 M27 13 L27 27 M13 20 L27 20"
          stroke="hsl(var(--primary))"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
      {/* Wordmark */}
      <text
        x="48"
        y="28"
        fontFamily="'Cabinet Grotesk', 'General Sans', sans-serif"
        fontWeight="700"
        fontSize="19"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        Harmony
      </text>
      <text
        x="146"
        y="28"
        fontFamily="'General Sans', sans-serif"
        fontWeight="500"
        fontSize="19"
        fill="hsl(var(--primary))"
        letterSpacing="-0.02em"
      >
        Docs
      </text>
    </svg>
  );
}
