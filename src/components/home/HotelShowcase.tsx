import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { hotels } from "@/data/hotels";
import { useMediaUrl } from "@/hooks/useHotelMedia";
import LuxuryOrnament from "@/components/LuxuryOrnament";

type Hotel = typeof hotels[0];

const HotelShowcaseCard = ({
  hotel,
  index,
  onClickHotel,
}: {
  hotel: Hotel;
  index: number;
  onClickHotel: (hotel: Hotel) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: "-90px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-8%", "8%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.65, 0]);

  const cardImage = useMediaUrl(hotel.id, "homepage-card", hotel.cardImage);
  const [imgFailed, setImgFailed] = useState(false);
  const displayImage = imgFailed ? hotel.cardImage : cardImage;
  const comingSoon = hotel.id === "evara-exotica";

  return (
    <motion.article
      ref={ref}
      className="group relative cursor-pointer"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 80, rotateX: reduceMotion ? 0 : 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClickHotel(hotel)}
    >
      {/* Ambient halo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 blur-2xl"
        style={{
          opacity: glowOpacity,
          background:
            "radial-gradient(60% 50% at 50% 60%, hsl(var(--gold) / 0.22), transparent 70%)",
        }}
      />

      <div
        className="relative overflow-hidden rounded-[2px] transition-transform duration-700 ease-out group-hover:-translate-y-2"
        style={{
          border: "1px solid hsl(var(--foreground) / 0.1)",
          background: "hsl(var(--foreground) / 0.03)",
        }}
      >
        {/* Media */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={displayImage}
            alt={hotel.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-[116%] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
            style={{ y: imageY }}
          />

          {/* Cinematic scrim */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, hsl(var(--foreground) / 0.82) 0%, hsl(var(--foreground) / 0.25) 45%, transparent 75%)",
            }}
          />

          {/* Futuristic grid + scan sweep */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--background) / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background) / 0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 -top-1/3 h-1/3 translate-y-0 opacity-0 transition-all duration-[1400ms] ease-out group-hover:translate-y-[400%] group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(to bottom, transparent, hsl(var(--gold) / 0.28), transparent)",
            }}
          />

          {/* Corner brackets */}
          {[
            "left-4 top-4 border-l border-t",
            "right-4 top-4 border-r border-t",
            "left-4 bottom-4 border-l border-b",
            "right-4 bottom-4 border-r border-b",
          ].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute h-5 w-5 ${pos} transition-all duration-700 group-hover:h-7 group-hover:w-7`}
              style={{ borderColor: "hsl(var(--gold) / 0.55)" }}
            />
          ))}

          {/* Index numeral */}
          <span
            className="absolute left-6 top-6 font-display text-[11px] tracking-[0.3em]"
            style={{ color: "hsl(var(--gold))", fontWeight: 400 }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Status chip */}
          <span
            className="absolute right-6 top-6 rounded-full px-3 py-1 font-body text-[8px] uppercase tracking-[0.22em] backdrop-blur-md"
            style={{
              color: "hsl(var(--background))",
              background: "hsl(var(--background) / 0.12)",
              border: "1px solid hsl(var(--background) / 0.28)",
              fontWeight: 400,
            }}
          >
            {comingSoon ? "Opening Soon" : "Now Open"}
          </span>

          {/* Bottom caption over media */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h3
              className="font-display uppercase leading-tight tracking-[0.08em] text-xl sm:text-2xl"
              style={{ color: "hsl(var(--background))", fontWeight: 500 }}
            >
              {hotel.name}
            </h3>
            {!comingSoon && (
              <span
                className="mt-1 block font-body text-[9px] uppercase tracking-[0.25em]"
                style={{ color: "hsl(var(--background) / 0.65)", fontWeight: 300 }}
              >
                {hotel.city}
              </span>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid hsl(var(--foreground) / 0.08)" }}
        >
          <span
            className="font-body text-[9px] uppercase tracking-[0.3em] text-muted-foreground"
            style={{ fontWeight: 400 }}
          >
            {comingSoon ? "Preview" : "Discover the residence"}
          </span>
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 group-hover:rotate-45"
            style={{ border: "1px solid hsl(var(--gold) / 0.5)", color: "hsl(var(--gold))" }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Gold underline reveal */}
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-0 transition-all duration-700 ease-out group-hover:w-full"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)" }}
        />
      </div>
    </motion.article>
  );
};

const HotelShowcase = ({ onClickHotel }: { onClickHotel: (hotel: Hotel) => void }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const lineScale = useTransform(scrollYProgress, [0.05, 0.6], [0, 1]);
  const auroraY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={sectionRef}
      id="properties"
      className="relative overflow-hidden px-5 pb-16 pt-6 sm:px-8 md:px-10 md:pb-24 md:pt-10"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Aurora atmosphere */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          y: auroraY,
          background:
            "radial-gradient(45% 35% at 15% 20%, hsl(var(--gold) / 0.08), transparent 70%), radial-gradient(40% 40% at 85% 75%, hsl(var(--primary) / 0.07), transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <motion.div
          className="mb-12 flex flex-col items-center text-center md:mb-16"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="mb-4 font-body text-[9px] uppercase tracking-[0.45em] text-muted-foreground/60"
            style={{ fontWeight: 400 }}
          >
            Our Collection
          </span>
          <h2
            className="font-display text-3xl tracking-wide text-foreground sm:text-4xl md:text-5xl"
            style={{ fontWeight: 300 }}
          >
            Three <span className="italic" style={{ color: "hsl(var(--gold))" }}>Iconic</span> Retreats
          </h2>
          <LuxuryOrnament width={200} className="mt-5" tone="gold" />
          <motion.span
            aria-hidden
            className="mt-6 block h-px w-40 origin-center"
            style={{
              scaleX: lineScale,
              background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.7), transparent)",
            }}
          />
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-7">
          {hotels.map((hotel, index) => (
            <HotelShowcaseCard
              key={hotel.id}
              hotel={hotel}
              index={index}
              onClickHotel={onClickHotel}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelShowcase;
