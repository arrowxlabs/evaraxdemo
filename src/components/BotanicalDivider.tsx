import LuxuryOrnament from "./LuxuryOrnament";

interface BotanicalDividerProps {
  /** Vertical rhythm around the ornament */
  spacing?: "sm" | "md" | "lg";
  /** Ornament tone: bronze on light bg, or cream/gold on dark bg */
  tone?: "gold" | "light";
  /** Width of the ornament in px */
  width?: number;
  /** Optional short label rendered under the ornament (uppercase eyebrow) */
  label?: string;
  className?: string;
}

const spacingMap = {
  sm: "py-6 md:py-8",
  md: "py-10 md:py-14",
  lg: "py-16 md:py-24",
} as const;

/**
 * Consistent luxury forest section divider — botanical leaf ornament
 * flanked by tapered hairlines, optionally with a small eyebrow label.
 * Use anywhere a section needs a graceful break.
 */
const BotanicalDivider = ({
  spacing = "md",
  tone = "gold",
  width = 200,
  label,
  className = "",
}: BotanicalDividerProps) => {
  const isLight = tone === "light";
  return (
    <div className={`flex flex-col items-center justify-center ${spacingMap[spacing]} ${className}`}>
      <LuxuryOrnament width={width} tone={tone} />
      {label && (
        <span
          className="mt-3 font-body uppercase"
          style={{
            fontSize: "9px",
            letterSpacing: "0.5em",
            color: isLight
              ? "hsl(var(--background) / 0.65)"
              : "hsl(var(--muted-foreground) / 0.8)",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default BotanicalDivider;
