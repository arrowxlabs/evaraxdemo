import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { hotels } from "@/data/hotels";
import { Phone, Mail, Instagram, Menu, X, ArrowRight } from "lucide-react";
import HotelZoomTransition from "@/components/HotelZoomTransition";
import EvaraGifTransition from "@/components/EvaraGifTransition";
import LuxuryOrnament from "@/components/LuxuryOrnament";

// Staggered card component with scroll-triggered animation
const HotelCard = ({ hotel, index, onClickHotel, onHoverHotel }: { hotel: typeof hotels[0]; index: number; onClickHotel: (hotel: typeof hotels[0], rect: DOMRect) => void; onHoverHotel: (hotelId: string) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="cursor-pointer group"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => onHoverHotel(hotel.id)}
      onTouchStart={() => onHoverHotel(hotel.id)}
      onClick={() => {
        if (ref.current) {
          const imgEl = ref.current.querySelector("img");
          const rect = imgEl?.getBoundingClientRect() || ref.current.getBoundingClientRect();
          onClickHotel(hotel, rect);
        }
      }}
    >
      {/* Image shown directly on background — no box/shadow/border */}
      <div className="relative mb-5 md:mb-6">
        <motion.img
          src={hotel.cardImage}
          alt={hotel.name}
          className="w-full object-contain"
          loading="lazy"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Name + Reserve button — clean layout like reference */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-display tracking-wide text-foreground uppercase" style={{ fontWeight: 600, letterSpacing: "0.08em" }}>
            {hotel.name}
          </h3>
          {hotel.id !== "evara-exotica" && (
            <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/60 font-body mt-0.5 block" style={{ fontWeight: 300 }}>
              {hotel.city}
            </span>
          )}
        </div>

        <motion.button
          className="px-5 py-2 border border-foreground/20 rounded-full text-[9px] tracking-[0.2em] uppercase font-body text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          style={{ fontWeight: 400 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {hotel.id === "evara-exotica" ? "Coming Soon" : "Explore"}
        </motion.button>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introPhase, setIntroPhase] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Zoom transition state
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | undefined>();
  const [zoomRect, setZoomRect] = useState<DOMRect | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Evara-only cinematic GIF/video transition
  const [evaraTransitionActive, setEvaraTransitionActive] = useState(false);

  // Preload the transition video + audio once so playback is instant on click.
  // Kept on a ref so the browser doesn't drop the warmed cache before use.
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const supportsWebm = document
      .createElement("video")
      .canPlayType("video/webm");
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    (v as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
    v.src = supportsWebm
      ? "/transitions/evara-transition-fast.webm"
      : "/transitions/evara-transition-fast.mp4";
    v.load();
    preloadRef.current = v;
    const a = new Audio("/transitions/evara-chime.m4a");
    a.preload = "auto";
  }, []);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intro sequence
  // Only show intro on direct homepage visit, not when navigating back
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("evara-intro-seen");
    if (hasSeenIntro) {
      setIntroPhase(4);
      setIntroComplete(true);
      return;
    }
    const timers = [
      setTimeout(() => setIntroPhase(1), 200),
      setTimeout(() => setIntroPhase(2), 600),
      setTimeout(() => setIntroPhase(3), 1200),
      setTimeout(() => setIntroPhase(4), 2000),
      setTimeout(() => {
        setIntroComplete(true);
        sessionStorage.setItem("evara-intro-seen", "true");
      }, 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleClickHotel = useCallback((hotel: typeof hotels[0], rect: DOMRect) => {
    setPendingPath(`/hotel/${hotel.id}`);

    // Hotel Evara → cinematic parallax video transition (replaces old zoom)
    if (hotel.id === "evara") {
      setEvaraTransitionActive(true);
      return;
    }

    // All other hotels keep the existing zoom transition
    setZoomImage(hotel.cardImage);
    setZoomRect(rect);
    setZoomActive(true);
  }, []);

  const handleEvaraMidpoint = useCallback(() => {
    if (pendingPath) {
      navigate(pendingPath);
      window.scrollTo(0, 0);
    }
  }, [navigate, pendingPath]);

  const handleEvaraComplete = useCallback(() => {
    setEvaraTransitionActive(false);
    setPendingPath(null);
  }, []);

  const handleZoomMidpoint = useCallback(() => {
    if (pendingPath) {
      navigate(pendingPath);
      window.scrollTo(0, 0);
    }
  }, [navigate, pendingPath]);

  const handleZoomComplete = useCallback(() => {
    setZoomActive(false);
    setPendingPath(null);
    setZoomImage(undefined);
    setZoomRect(null);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden">
      <HotelZoomTransition
        isActive={zoomActive}
        targetImage={zoomImage}
        cardRect={zoomRect}
        onMidpoint={handleZoomMidpoint}
        onComplete={handleZoomComplete}
      />

      <EvaraGifTransition
        isActive={evaraTransitionActive}
        onMidpoint={handleEvaraMidpoint}
        onComplete={handleEvaraComplete}
      />

      {/* ===== INTRO LOADER ===== */}
      <AnimatePresence mode="wait">
        {!introComplete && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center"
            style={{ background: "hsl(var(--foreground))" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + i * 0.5,
                  height: 2 + i * 0.5,
                  background: `hsl(var(--gold) / ${0.15 + i * 0.05})`,
                  left: `${20 + i * 12}%`,
                  top: `${30 + (i % 3) * 15}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 3 + i * 0.4,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            <div className="flex flex-col items-center gap-6 z-10">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={introPhase >= 1 ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="w-8 h-px" style={{ background: "hsl(var(--gold) / 0.3)" }} />
                <motion.div
                  className="w-1.5 h-1.5 rotate-45"
                  style={{ border: "1px solid hsl(var(--gold) / 0.4)" }}
                  animate={{ rotate: [45, 225, 405] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <div className="w-8 h-px" style={{ background: "hsl(var(--gold) / 0.3)" }} />
              </motion.div>

              <div className="flex items-center gap-[0.15em]">
                {"EVARA".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2.8rem, 10vw, 5rem)",
                      fontWeight: 300,
                      letterSpacing: "0.35em",
                      color: "hsl(var(--gold-light))",
                    }}
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={introPhase >= 2 ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              <motion.div
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={introPhase >= 3 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    letterSpacing: "0.6em",
                    color: "hsl(var(--gold) / 0.5)",
                    fontWeight: 400,
                    textTransform: "uppercase",
                  }}
                >
                  Luxury Hospitality
                </span>
                <motion.div
                  className="h-px"
                  style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.5), transparent)" }}
                  initial={{ width: 0 }}
                  animate={introPhase >= 3 ? { width: 80 } : {}}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                />
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-full mt-4"
                style={{ width: 120, height: 2, background: "hsl(var(--gold) / 0.1)" }}
                initial={{ opacity: 0 }}
                animate={introPhase >= 3 ? { opacity: 1 } : {}}
              >
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: "hsl(var(--gold) / 0.6)" }}
                  initial={{ width: "0%" }}
                  animate={introPhase >= 3 ? { width: "100%" } : {}}
                  transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== NAVIGATION — White theme, matching reference ===== */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "hsl(var(--background) / 0.97)" : "hsl(var(--background) / 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid hsl(var(--border) / 0.3)" : "1px solid transparent",
        }}
        initial={{ y: -80 }}
        animate={introComplete ? { y: 0 } : { y: -80 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-10 flex items-center justify-between h-14 md:h-16">
          {/* Logo left — matching reference: EVARA in black, Co. in gold */}
          <div className="flex items-center gap-1">
            <span className="text-base sm:text-lg tracking-[0.25em] uppercase font-display" style={{ fontWeight: 400, color: "hsl(var(--foreground))" }}>
              EVARA
            </span>
            <span className="text-base sm:text-lg tracking-[0.06em] font-display" style={{ fontWeight: 300, color: "hsl(var(--gold))" }}>
              Co.
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="tel:+919031027961" className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body flex items-center gap-1.5" style={{ fontWeight: 400 }}>
              <Phone className="w-3.5 h-3.5" /> Contact
            </a>
            <a href="mailto:info@hotelevara.in" className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body flex items-center gap-1.5" style={{ fontWeight: 400 }}>
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors font-body flex items-center gap-1.5" style={{ fontWeight: 400 }}>
              <Instagram className="w-3.5 h-3.5" /> Follow
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-foreground p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden absolute top-full left-0 right-0 border-t border-border/30 shadow-lg"
              style={{ background: "hsl(var(--background) / 0.98)", backdropFilter: "blur(24px)" }}
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                <span className="text-[8px] tracking-[0.5em] uppercase text-muted-foreground/40 font-body">Menu</span>
                {[
                  { href: "tel:+919031027961", icon: Phone, label: "Contact Us" },
                  { href: "mailto:info@hotelevara.in", icon: Mail, label: "Send Email" },
                  { href: "https://instagram.com", icon: Instagram, label: "Follow Us", external: true },
                ].map((item, i) => (
                  <motion.a
                    key={i}
                    href={item.href}
                    {...((item as any).external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-4 text-foreground/70 hover:text-foreground transition-colors group py-1"
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                  >
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground/30 transition-colors">
                      <item.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <span className="text-sm tracking-[0.1em] uppercase font-body" style={{ fontWeight: 400 }}>{item.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ===== HERO SECTION — White theme matching reference ===== */}
      <motion.section
        className="relative min-h-[50vh] md:min-h-[60vh] flex items-center pt-14 md:pt-16"
        style={{ background: "hsl(var(--background))" }}
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Subtle grid pattern like reference */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--border) / 0.25) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.25) 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
        }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-14 py-24 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={introComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-px" style={{ background: "hsl(var(--muted-foreground) / 0.3)" }} />
              <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground/60 font-body" style={{ fontWeight: 400 }}>
                The Evara Collection
              </span>
            </div>

            <h1 className="font-display tracking-wide leading-[1.08]" style={{ fontWeight: 300 }}>
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground block">Where </span>
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic block" style={{ color: "hsl(var(--gold))" }}>Luxury</span>
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground block">Meets Legacy</span>
            </h1>

            <p className="mt-7 max-w-md text-sm md:text-base leading-relaxed font-body text-muted-foreground" style={{ fontWeight: 300 }}>
              Three extraordinary hotels, one defining philosophy — every stay is a story written in gold, silence, and pure indulgence.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-9">
              <a
                href="#properties"
                className="luxe-shimmer px-8 py-3.5 bg-foreground text-background text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2 hover:bg-foreground/90 transition-colors"
                style={{ fontWeight: 500 }}
              >
                Explore Hotels <ArrowRight className="w-3 h-3" />
              </a>

              <a
                href="#properties"
                className="px-6 py-3.5 text-[9px] tracking-[0.25em] uppercase font-body inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontWeight: 400 }}
              >
                Discover More <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== PROPERTIES SECTION — Card layout like reference ===== */}
      <main id="properties" className="pt-0 md:pt-2 pb-10 md:pb-16 px-5 sm:px-8 md:px-10" style={{ background: "hsl(var(--background))" }}>

        {/* Luxury section header with animated vector ornament */}
        <motion.div
          className="flex flex-col items-center text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-[9px] tracking-[0.45em] uppercase text-muted-foreground/60 font-body mb-4" style={{ fontWeight: 400 }}>
            Our Collection
          </span>
          <h2 className="font-display tracking-wide text-3xl sm:text-4xl md:text-5xl text-foreground" style={{ fontWeight: 300 }}>
            Three <span className="italic" style={{ color: "hsl(var(--gold))" }}>Iconic</span> Retreats
          </h2>
          <LuxuryOrnament width={200} className="mt-5" tone="gold" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          {hotels.map((hotel, index) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              index={index}
              onClickHotel={handleClickHotel}
            />
          ))}
        </div>
      </main>

      {/* ===== LUXURY FOOTER ===== */}
      <footer className="relative overflow-hidden" style={{ background: "hsl(var(--foreground))" }}>
        {/* Decorative top border */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }} />
        
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 pt-14 pb-8 md:pt-20 md:pb-10">
          {/* Logo section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-xl md:text-2xl tracking-[0.3em] uppercase font-display text-background" style={{ fontWeight: 300 }}>EVARA</span>
              <span className="text-xl md:text-2xl tracking-[0.06em] font-display" style={{ fontWeight: 300, color: "hsl(var(--gold))" }}>Co.</span>
            </div>
            <span className="text-[8px] tracking-[0.5em] uppercase font-body" style={{ fontWeight: 300, color: "hsl(var(--gold) / 0.5)" }}>Luxury Hospitality</span>
            <LuxuryOrnament width={160} className="mx-auto mt-4" tone="light" />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {/* Properties */}
            <div className="text-center md:text-left">
              <span className="text-[8px] tracking-[0.4em] uppercase text-background/30 font-body block mb-4" style={{ fontWeight: 500 }}>Our Properties</span>
              {hotels.map((h) => (
                <a key={h.id} onClick={() => navigate(`/hotel/${h.id}`)} className="block text-[11px] text-background/35 hover:text-background/70 transition-colors font-body mb-2 cursor-pointer" style={{ fontWeight: 300, letterSpacing: "0.05em" }}>
                  {h.name}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="text-center">
              <span className="text-[8px] tracking-[0.4em] uppercase text-background/30 font-body block mb-4" style={{ fontWeight: 500 }}>Get in Touch</span>
              <a href="tel:+919031027961" className="block text-[11px] text-background/35 hover:text-background/70 transition-colors font-body mb-2" style={{ fontWeight: 300 }}>+91 9031027961</a>
              <a href="mailto:info@hotelevara.in" className="block text-[11px] text-background/35 hover:text-background/70 transition-colors font-body mb-2" style={{ fontWeight: 300 }}>info@hotelevara.in</a>
              <p className="text-[10px] text-background/25 font-body mt-3 max-w-xs mx-auto leading-relaxed" style={{ fontWeight: 300 }}>Darbhanga, Bihar, India</p>
            </div>

            {/* Social */}
            <div className="text-center md:text-right">
              <span className="text-[8px] tracking-[0.4em] uppercase text-background/30 font-body block mb-4" style={{ fontWeight: 500 }}>Follow Us</span>
              <div className="flex gap-3 justify-center md:justify-end">
                {[
                  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
                  { href: "mailto:info@hotelevara.in", icon: Mail, label: "Email" },
                  { href: "tel:+919031027961", icon: Phone, label: "Phone" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    {...(link.label === "Instagram" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-background/30 hover:text-background/70 transition-all duration-300"
                    style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}
                  >
                    <link.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderTop: "1px solid hsl(var(--gold) / 0.08)" }}>
            <p className="text-[9px] text-background/20 font-body" style={{ fontWeight: 300 }}>© 2025 EVARA Co. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-[9px] text-background/20 hover:text-background/40 transition-colors cursor-pointer font-body" style={{ fontWeight: 300 }}>Privacy Policy</span>
              <span className="text-[9px] text-background/20 hover:text-background/40 transition-colors cursor-pointer font-body" style={{ fontWeight: 300 }}>Terms of Service</span>
            </div>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l border-t opacity-[0.06]" style={{ borderColor: "hsl(var(--gold))" }} />
        <div className="absolute top-6 right-6 w-12 h-12 border-r border-t opacity-[0.06]" style={{ borderColor: "hsl(var(--gold))" }} />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l border-b opacity-[0.06]" style={{ borderColor: "hsl(var(--gold))" }} />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b opacity-[0.06]" style={{ borderColor: "hsl(var(--gold))" }} />
      </footer>
    </div>
  );
};

export default Index;
