import { motion } from "framer-motion";

interface LuxuryOrnamentProps {
  /** Overall width in px (height scales with the SVG aspect ratio) */
  width?: number;
  className?: string;
  /** Color theme: "gold" (bronze on light) or "light" (bronze/cream on dark) */
  tone?: "gold" | "light";
}

/**
 * Botanical leaf-sprig ornament — luxury forest theme.
 * A refined herbarium-style flourish: tapered hairlines flanking a small
 * central twig of paired leaves. Used across the site as a section
 * divider in place of the previous diamond ornament.
 */
const LuxuryOrnament = ({ width = 180, className = "", tone = "gold" }: LuxuryOrnamentProps) => {
  const bronze = tone === "gold" ? "hsl(var(--gold))" : "hsl(var(--gold-light))";
  const forest = tone === "gold" ? "hsl(var(--forest-mid))" : "hsl(var(--moss-light))";
  const leafFill = tone === "gold" ? "hsl(var(--moss) / 0.35)" : "hsl(var(--moss-light) / 0.5)";

  return (
    <motion.svg
      width={width}
      height={width * (32 / 180)}
      viewBox="0 0 180 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
      aria-hidden="true"
    >
      {/* Left tapering hairline */}
      <motion.line
        x1="2" y1="16" x2="70" y2="16"
        stroke={bronze}
        strokeWidth="0.75"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      />
      {/* Right tapering hairline */}
      <motion.line
        x1="178" y1="16" x2="110" y2="16"
        stroke={bronze}
        strokeWidth="0.75"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      />

      {/* Central botanical sprig with subtle sway */}
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "90px 16px" }}
      >
        {/* Central stem */}
        <line x1="90" y1="4" x2="90" y2="28" stroke={forest} strokeWidth="0.75" strokeLinecap="round" />

        {/* Upper leaf pair */}
        <path
          d="M90 10 Q83 8 80 12 Q83 14 90 12 Z"
          fill={leafFill}
          stroke={forest}
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path
          d="M90 10 Q97 8 100 12 Q97 14 90 12 Z"
          fill={leafFill}
          stroke={forest}
          strokeWidth="0.6"
          strokeLinejoin="round"
        />

        {/* Lower leaf pair (slightly larger) */}
        <path
          d="M90 20 Q81 18 77 22.5 Q81 25 90 22.5 Z"
          fill={leafFill}
          stroke={forest}
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path
          d="M90 20 Q99 18 103 22.5 Q99 25 90 22.5 Z"
          fill={leafFill}
          stroke={forest}
          strokeWidth="0.6"
          strokeLinejoin="round"
        />

        {/* Bronze berry at tip */}
        <circle cx="90" cy="4" r="1.4" fill={bronze} />
      </motion.g>
    </motion.svg>
  );
};

export default LuxuryOrnament;
