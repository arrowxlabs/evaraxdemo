import { motion } from "framer-motion";

interface LuxuryOrnamentProps {
  /** Overall width in px (height scales with the SVG aspect ratio) */
  width?: number;
  className?: string;
  /** Color theme: "gold" for light backgrounds, "light" for dark backgrounds */
  tone?: "gold" | "light";
}

/**
 * Animated vector flourish — a refined gold filigree divider with a central
 * diamond. Used across the site to reinforce the 5-star hotel aesthetic.
 * Pure SVG (sharp on every device) with a subtle continuous shimmer.
 */
const LuxuryOrnament = ({ width = 180, className = "", tone = "gold" }: LuxuryOrnamentProps) => {
  const stroke = tone === "gold" ? "hsl(var(--gold))" : "hsl(var(--gold-light))";
  const fill = tone === "gold" ? "hsl(var(--gold) / 0.5)" : "hsl(var(--gold-light) / 0.6)";

  return (
    <motion.svg
      width={width}
      height={width * (28 / 180)}
      viewBox="0 0 180 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
      aria-hidden="true"
    >
      {/* Left tapering line */}
      <motion.line
        x1="2" y1="14" x2="68" y2="14"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.55 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
      />
      {/* Right tapering line */}
      <motion.line
        x1="178" y1="14" x2="112" y2="14"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.55 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
      />
      {/* Left small dot */}
      <circle cx="74" cy="14" r="1.6" fill={fill} />
      {/* Right small dot */}
      <circle cx="106" cy="14" r="1.6" fill={fill} />

      {/* Central diamond with a gentle pulse */}
      <motion.g
        animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "90px 14px" }}
      >
        <rect x="84" y="8" width="12" height="12" rx="1.5"
          transform="rotate(45 90 14)"
          fill="none" stroke={stroke} strokeWidth="1" />
        <rect x="87" y="11" width="6" height="6"
          transform="rotate(45 90 14)"
          fill={fill} />
      </motion.g>
    </motion.svg>
  );
};

export default LuxuryOrnament;
