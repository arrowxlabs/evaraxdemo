import { motion } from "framer-motion";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  /** Optional italic gold word inside the title (will be rendered in gold italic). */
  accent?: string;
  /** Where to place the accent: before/after the title, or replace the title entirely. */
  accentPosition?: "before" | "after";
  subtitle?: string;
  align?: "center" | "left";
  /** Light variant for dark backgrounds */
  tone?: "default" | "light";
  className?: string;
}

/**
 * Editorial section header — Aman / Rosewood inspired.
 * Eyebrow (uppercase, wide-tracked) → Display serif title with optional gold italic accent → gold hairline.
 */
const SectionHeader = ({
  eyebrow,
  title,
  accent,
  accentPosition = "after",
  subtitle,
  align = "center",
  tone = "default",
  className = "",
}: SectionHeaderProps) => {
  const isLight = tone === "light";
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <motion.div
      className={`flex flex-col ${alignCls} ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span
        className="font-body uppercase mb-4"
        style={{
          fontSize: "10px",
          fontWeight: 400,
          letterSpacing: "0.45em",
          color: isLight ? "hsl(var(--background) / 0.55)" : "hsl(var(--muted-foreground) / 0.7)",
        }}
      >
        {eyebrow}
      </span>

      <h2
        className="font-display tracking-wide"
        style={{
          fontWeight: 300,
          fontSize: "clamp(1.6rem, 4vw, 2.75rem)",
          lineHeight: 1.1,
          color: isLight ? "hsl(var(--background))" : "hsl(var(--foreground))",
        }}
      >
        {accentPosition === "before" && accent && (
          <span className="italic mr-2" style={{ color: "hsl(var(--gold))" }}>
            {accent}
          </span>
        )}
        {title}
        {accentPosition === "after" && accent && (
          <>
            {" "}
            <span className="italic" style={{ color: "hsl(var(--gold))" }}>
              {accent}
            </span>
          </>
        )}
      </h2>

      <span
        className={`mt-4 block ${align === "center" ? "mx-auto" : ""}`}
        style={{
          height: 1,
          width: 56,
          background:
            align === "center"
              ? "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.7), transparent)"
              : "linear-gradient(90deg, hsl(var(--gold) / 0.7), transparent)",
        }}
      />

      {subtitle && (
        <p
          className={`mt-5 max-w-md text-sm font-body leading-relaxed ${align === "center" ? "mx-auto" : ""}`}
          style={{
            fontWeight: 300,
            color: isLight ? "hsl(var(--background) / 0.6)" : "hsl(var(--muted-foreground))",
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
