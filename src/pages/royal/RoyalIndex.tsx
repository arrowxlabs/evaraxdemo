import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { hotels } from "@/data/hotels";
import { ArrowUpRight, Menu, X, Phone, Mail, Instagram } from "lucide-react";
import HotelZoomTransition from "@/components/HotelZoomTransition";
import EvaraGifTransition from "@/components/EvaraGifTransition";
import { useMediaUrl } from "@/hooks/useHotelMedia";
import {
  RoyalCrown,
  FleurDeLis,
  Chandelier,
  OrnateFrame,
  WaxSeal,
  RoyalDivider,
} from "@/components/royal/RoyalCrest";

// ————————————————————————————————————————————————————————————
// Curtain reveal intro — velvet burgundy curtains part like a stage
// ————————————————————————————————————————————————————————————
const CurtainIntro = ({ onDone }: { onDone: () => void }) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => { setPhase(3); onDone(); }, 2600),
    ];
    return () => t.forEach(clearTimeout);
  }, [onDone]);
  if (phase >= 3) return null;
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: phase >= 2 ? "-100%" : 0 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          background:
            "repeating-linear-gradient(90deg, hsl(350 60% 14%) 0px, hsl(350 55% 22%) 40px, hsl(350 60% 14%) 80px)",
          boxShadow: "inset -20px 0 60px hsl(350 70% 8%)",
        }}
      />
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: phase >= 2 ? "100%" : 0 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background:
            "repeating-linear-gradient(90deg, hsl(350 60% 14%) 0px, hsl(350 55% 22%) 40px, hsl(350 60% 14%) 80px)",
          boxShadow: "inset 20px 0 60px hsl(350 70% 8%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: phase >= 1 && phase < 2 ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-gold"
      >
        <RoyalCrown className="w-24 h-12 mb-6" />
        <div className="font-display tracking-[0.4em] text-2xl sm:text-4xl uppercase">Maison Evara</div>
        <div className="mt-3 text-[10px] tracking-[0.6em] uppercase opacity-70">Anno · MMXXIV</div>
      </motion.div>
    </div>
  );
};

// ————————————————————————————————————————————————————————————
// Fixed chandelier that sways subtly on scroll
// ————————————————————————————————————————————————————————————
const HangingChandelier = () => {
  const { scrollY } = useScroll();
  const rot = useTransform(scrollY, [0, 800], [-2, 2]);
  return (
    <motion.div
      style={{ rotate: rot, transformOrigin: "50% 0%" }}
      className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 z-30 text-gold/50 hidden md:block"
    >
      <Chandelier className="w-24 h-32 opacity-70" />
    </motion.div>
  );
};

// ————————————————————————————————————————————————————————————
// Hotel portrait card — ornate gilded frame
// ————————————————————————————————————————————————————————————
const RoyalHotelPortrait = ({
  hotel,
  index,
  onClick,
  onHover,
}: {
  hotel: typeof hotels[0];
  index: number;
  onClick: (h: typeof hotels[0], rect: DOMRect) => void;
  onHover: (id: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const cardImage = useMediaUrl(hotel.id, "homepage-card", hotel.cardImage);
  const [failed, setFailed] = useState(false);
  const img = failed ? hotel.cardImage : cardImage;
  const roman = ["I", "II", "III", "IV", "V"][index] || "•";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="group cursor-pointer relative"
      onMouseEnter={() => onHover(hotel.id)}
      onTouchStart={() => onHover(hotel.id)}
      onClick={() => {
        const el = ref.current?.querySelector("img");
        const r = el?.getBoundingClientRect() || ref.current?.getBoundingClientRect();
        if (r) onClick(hotel, r as DOMRect);
      }}
    >
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-gold/70 font-display text-xs tracking-[0.5em] z-10">
        CHAMBRE {roman}
      </div>
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* Ornate frame overlay */}
        <OrnateFrame className="absolute inset-0 w-full h-full text-gold/80 z-20 pointer-events-none" />
        {/* Inner burgundy mat */}
        <div className="absolute inset-4 bg-gradient-to-b from-[hsl(350_55%_18%)] to-[hsl(350_60%_10%)] z-0" />
        {/* Portrait image */}
        <motion.img
          src={img}
          alt={hotel.name}
          onError={() => setFailed(true)}
          className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] object-cover z-10 sepia-[.15] contrast-[1.05]"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.8 }}
        />
        {/* Bottom nameplate */}
        <div className="absolute bottom-6 left-6 right-6 z-30 text-center">
          <div className="mx-auto w-fit px-6 py-3 bg-[hsl(40_40%_92%)] border border-gold/60 shadow-[0_10px_30px_-15px_hsl(350_60%_10%)]">
            <FleurDeLis className="w-3 h-4 mx-auto mb-1 text-gold-dark" />
            <div className="font-display uppercase tracking-[0.28em] text-[11px] sm:text-sm text-[hsl(350_55%_18%)]">
              {hotel.name}
            </div>
            <div className="text-[8px] tracking-[0.4em] uppercase text-gold-dark/80 mt-1">
              {hotel.id === "evara-exotica" ? "Bientôt" : hotel.city}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-3 text-gold-dark opacity-80 group-hover:opacity-100 transition">
        <span className="text-[10px] tracking-[0.4em] uppercase font-display">Entrer</span>
        <ArrowUpRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
};

// ————————————————————————————————————————————————————————————
// Vertical marquee — endless scrolling royal motto
// ————————————————————————————————————————————————————————————
const VerticalMarquee = ({ text }: { text: string }) => (
  <div className="absolute inset-y-0 left-0 w-10 overflow-hidden opacity-30 pointer-events-none hidden lg:block">
    <motion.div
      animate={{ y: ["0%", "-50%"] }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="flex flex-col text-gold font-display text-[10px] tracking-[0.6em] uppercase"
      style={{ writingMode: "vertical-rl" }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="py-8">{text} · </span>
      ))}
    </motion.div>
  </div>
);

// ————————————————————————————————————————————————————————————
// Main
// ————————————————————————————————————————————————————————————
const RoyalIndex = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(
    typeof window !== "undefined" && sessionStorage.getItem("evara-royal-intro") === "1"
  );

  const [zoomActive, setZoomActive] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | undefined>();
  const [zoomRect, setZoomRect] = useState<DOMRect | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [transitionActive, setTransitionActive] = useState(false);
  const [transitionScope, setTransitionScope] = useState<string>("__global__");

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleClick = useCallback(async (hotel: typeof hotels[0], rect: DOMRect) => {
    setPendingPath(`/hotel/${hotel.id}`);
    if (hotel.id === "evara") {
      setTransitionScope(hotel.id);
      setTransitionActive(true);
      return;
    }
    try {
      const { fetchTransitionVideo } = await import("@/hooks/useTransitionVideo");
      const t = await fetchTransitionVideo(hotel.id);
      if (t.isCustom && t.scope === hotel.id) {
        setTransitionScope(hotel.id);
        setTransitionActive(true);
        return;
      }
    } catch { /* noop */ }
    setZoomImage(hotel.cardImage);
    setZoomRect(rect);
    setZoomActive(true);
  }, []);

  const warmed = useRef<Set<string>>(new Set());
  const handleHover = useCallback(async (id: string) => {
    if (warmed.current.has(id)) return;
    warmed.current.add(id);
    try {
      const { fetchTransitionVideo } = await import("@/hooks/useTransitionVideo");
      const t = await fetchTransitionVideo(id);
      fetch(t.mp4Url, { cache: "force-cache", priority: "low" as RequestPriority }).catch(() => {});
    } catch { /* noop */ }
  }, []);

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      {!introDone && (
        <CurtainIntro
          onDone={() => {
            sessionStorage.setItem("evara-royal-intro", "1");
            setIntroDone(true);
          }}
        />
      )}

      <HangingChandelier />

      {/* Nav — palace parchment bar */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/80 border-b border-gold/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <RoyalCrown className="w-10 h-5 text-gold" />
            <div className="font-display uppercase tracking-[0.4em] text-sm">Maison Evara</div>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-display text-[11px] tracking-[0.35em] uppercase">
            <a href="#chapters" className="hover:text-gold transition">Chapitres</a>
            <a href="#palaces" className="hover:text-gold transition">Palais</a>
            <a href="#halls" className="hover:text-gold transition">Salons</a>
            <a href="#correspondence" className="hover:text-gold transition">Contact</a>
          </nav>
          <button className="md:hidden" onClick={() => setMenuOpen(true)}><Menu className="w-5 h-5" /></button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[hsl(350_60%_10%)] text-gold flex flex-col items-center justify-center gap-8"
          >
            <button className="absolute top-6 right-6" onClick={() => setMenuOpen(false)}><X className="w-6 h-6" /></button>
            <RoyalCrown className="w-24 h-12" />
            {["Chapitres","Palais","Salons","Contact"].map((l)=>(
              <a key={l} onClick={()=>setMenuOpen(false)} href={`#${l.toLowerCase()}`} className="font-display uppercase tracking-[0.5em] text-xl">{l}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ————— HERO ————— */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Parallax parchment layers */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(40_45%_94%)] via-background to-[hsl(40_30%_86%)]" />
          {/* radiating gold sunburst */}
          <svg viewBox="0 0 800 800" className="absolute inset-0 w-full h-full opacity-[0.08]">
            {Array.from({ length: 48 }).map((_, i) => (
              <line key={i} x1="400" y1="400" x2={400 + 500 * Math.cos((i * Math.PI) / 24)} y2={400 + 500 * Math.sin((i * Math.PI) / 24)} stroke="hsl(42 60% 40%)" strokeWidth="1" />
            ))}
          </svg>
          {/* Fixed arch silhouette */}
          <svg viewBox="0 0 800 600" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110%] opacity-[0.13]" preserveAspectRatio="xMidYMax slice">
            <path d="M100 600 V300 Q400 60, 700 300 V600 Z" fill="none" stroke="hsl(350 60% 20%)" strokeWidth="2"/>
            <path d="M200 600 V330 Q400 150, 600 330 V600 Z" fill="none" stroke="hsl(350 60% 20%)" strokeWidth="1.5" opacity="0.6"/>
            <path d="M380 600 V420 Q400 380, 420 420 V600 Z" fill="hsl(350 60% 20%)" opacity="0.3"/>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: introDone ? 1 : 0, y: introDone ? 0 : 40 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <RoyalCrown className="w-28 h-14 mx-auto text-gold mb-8" />
          <div className="text-[10px] tracking-[0.6em] uppercase text-gold-dark/80 mb-6 font-display">Anno · MMXXIV · Bihar</div>
          <h1 className="font-display text-[15vw] md:text-[9vw] leading-[0.9] tracking-[0.02em] text-[hsl(350_55%_18%)]">
            <span className="italic font-light">Maison</span>
            <span className="block mt-2">EVARA</span>
          </h1>
          <div className="mt-8 max-w-xl mx-auto text-sm sm:text-base italic font-light text-muted-foreground leading-relaxed">
            « Un héritage de grâce, sculpté dans la pierre et le velours —
            hôtels de rêve dans le cœur de l'Inde royale. »
          </div>
          <RoyalDivider className="mt-10" />
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#palaces" className="btn-lux-forest">Découvrir les Palais</a>
            <a href="#correspondence" className="btn-lux-bronze">Correspondance</a>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold text-[10px] tracking-[0.5em] uppercase font-display"
        >
          Défilez ↓
        </motion.div>
      </section>

      {/* ————— CHAPTER I : LEGACY ————— */}
      <section id="chapters" className="relative py-32 sm:py-48 px-6 overflow-hidden bg-[hsl(40_35%_92%)]">
        <VerticalMarquee text="Legatum · Gratia · Traditio" />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}
          >
            <div className="text-gold-dark font-display text-xs tracking-[0.5em] uppercase mb-4">Chapitre I</div>
            <h2 className="font-display text-4xl md:text-6xl text-[hsl(350_55%_18%)] leading-[1.05] mb-6">
              An heirloom<br/><span className="italic">carved in velvet</span>
            </h2>
            <RoyalDivider className="!justify-start !mx-0 [&>div]:!w-16" />
            <p className="mt-6 text-muted-foreground leading-loose italic font-light">
              Behind every hand-painted cornice, every drop of amber crystal, lies a promise older than the walls
              themselves — to greet each guest as sovereign. Maison Evara restores the grammar of hospitality
              once reserved for royal households of the old world.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                ["MMXXIV", "Founded"],
                ["III", "Palaces"],
                ["∞", "Devotion"],
              ].map(([n, l]) => (
                <div key={l as string} className="text-center border-l border-gold/40 first:border-l-0 pl-4 first:pl-0">
                  <div className="font-display text-3xl text-gold-dark">{n}</div>
                  <div className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground mt-1">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 1.2 }}
            className="relative aspect-[3/4] max-w-md mx-auto"
          >
            <OrnateFrame className="absolute inset-0 w-full h-full text-gold z-10 pointer-events-none" />
            <div className="absolute inset-6 bg-gradient-to-br from-[hsl(350_55%_22%)] via-[hsl(350_60%_16%)] to-[hsl(350_65%_10%)] flex items-center justify-center">
              <div className="text-center text-gold">
                <RoyalCrown className="w-24 h-12 mx-auto mb-4 opacity-90" />
                <div className="font-display italic text-3xl">Maison</div>
                <div className="font-display tracking-[0.4em] text-lg mt-1">EVARA</div>
                <div className="mt-4 h-px w-20 mx-auto bg-gold/60"/>
                <div className="mt-3 text-[9px] tracking-[0.5em] uppercase opacity-70">Anno MMXXIV</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ————— CHAPTER II : PALACES (hotel portraits) ————— */}
      <section id="palaces" className="relative py-32 sm:py-40 px-6 bg-gradient-to-b from-[hsl(40_30%_88%)] via-background to-[hsl(40_35%_90%)]">
        <div className="text-center mb-20">
          <div className="text-gold-dark font-display text-xs tracking-[0.5em] uppercase mb-4">Chapitre II</div>
          <h2 className="font-display text-4xl md:text-6xl text-[hsl(350_55%_18%)] leading-[1.05]">
            The <span className="italic">Palaces</span>
          </h2>
          <RoyalDivider className="mt-8" />
          <p className="mt-6 max-w-xl mx-auto text-sm text-muted-foreground italic">
            Three residences, one lineage. Choose your chamber.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-16 sm:gap-12 lg:gap-8">
          {hotels.map((h, i) => (
            <RoyalHotelPortrait key={h.id} hotel={h} index={i} onClick={handleClick} onHover={handleHover} />
          ))}
        </div>
      </section>

      {/* ————— CHAPTER III : GRAND HALLS ————— */}
      <section id="halls" className="relative py-32 sm:py-40 px-6 bg-[hsl(350_50%_14%)] text-gold overflow-hidden">
        {/* baroque wallpaper pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30px 30px, hsl(42 60% 60%) 1.5px, transparent 2px), radial-gradient(circle at 60px 60px, hsl(42 60% 60%) 1px, transparent 1.5px)",
            backgroundSize: "80px 80px, 80px 80px",
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="font-display text-xs tracking-[0.5em] uppercase mb-4 opacity-80">Chapitre III</div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05]">
              <span className="italic font-light">The</span> Grand Halls
            </h2>
            <RoyalDivider className="mt-8 [&_div]:!bg-gold" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "The Ballroom", note: "For coronations of the heart.", icon: "crown" },
              { title: "The Salon", note: "Where soirées linger past dawn.", icon: "fleur" },
              { title: "The Orangery", note: "Sunlit banquets under glass.", icon: "laurel" },
            ].map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, delay: i * 0.15 }}
                className="relative border border-gold/40 p-10 text-center bg-[hsl(350_55%_10%)]/60 backdrop-blur-sm hover:border-gold transition-colors"
              >
                <div className="mx-auto w-16 h-16 flex items-center justify-center text-gold mb-6">
                  {h.icon === "crown" && <RoyalCrown className="w-16 h-8" />}
                  {h.icon === "fleur" && <FleurDeLis className="w-8 h-12" />}
                  {h.icon === "laurel" && <FleurDeLis className="w-8 h-12 rotate-180" />}
                </div>
                <h3 className="font-display text-2xl mb-3 text-gold">{h.title}</h3>
                <div className="h-px w-12 mx-auto bg-gold/50 mb-4" />
                <p className="italic text-gold/70 text-sm leading-relaxed">{h.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ————— CHAPTER IV : CORRESPONDENCE ————— */}
      <section id="correspondence" className="relative py-32 sm:py-40 px-6 bg-[hsl(40_40%_94%)]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-gold-dark font-display text-xs tracking-[0.5em] uppercase mb-4">Chapitre IV</div>
          <h2 className="font-display text-4xl md:text-6xl text-[hsl(350_55%_18%)] leading-[1.05]">
            <span className="italic">By Royal</span> Correspondence
          </h2>
          <RoyalDivider className="mt-8" />

          <div className="relative mt-16 bg-[hsl(40_45%_96%)] border border-gold/40 p-10 md:p-16 shadow-[0_30px_60px_-30px_hsl(350_60%_20%)]">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <WaxSeal className="w-16 h-16" />
            </div>
            <div className="mt-4 font-display italic text-lg text-[hsl(350_55%_18%)] leading-relaxed">
              "To reserve your chambers, dispatch a courier —<br/>or press the bell below."
            </div>
            <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
              {[
                { i: <Phone className="w-4 h-4"/>, l: "Téléphone", v: "+91 · Bihar" },
                { i: <Mail className="w-4 h-4"/>, l: "Courrier", v: "concierge@evara" },
                { i: <Instagram className="w-4 h-4"/>, l: "Salon", v: "@maisonevara" },
              ].map((c) => (
                <div key={c.l} className="border-l border-gold/40 pl-4">
                  <div className="flex items-center gap-2 text-gold-dark text-[10px] tracking-[0.4em] uppercase font-display">
                    {c.i}{c.l}
                  </div>
                  <div className="mt-2 font-display text-lg text-[hsl(350_55%_18%)]">{c.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <a href="#palaces" className="btn-lux-forest">Réserver une Chambre</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 bg-[hsl(350_60%_10%)] text-gold text-center">
        <RoyalCrown className="w-20 h-10 mx-auto mb-6 opacity-80" />
        <div className="font-display tracking-[0.5em] uppercase text-sm">Maison Evara</div>
        <div className="mt-2 italic text-xs opacity-70">Un héritage de grâce · MMXXIV</div>
        <RoyalDivider className="mt-8 [&_div]:!bg-gold/60" />
        <div className="mt-6 text-[10px] tracking-[0.4em] uppercase opacity-60">
          © MMXXIV Maison Evara · Tous droits réservés
        </div>
      </footer>

      {/* Transitions */}
      <HotelZoomTransition
        isActive={zoomActive} targetImage={zoomImage} cardRect={zoomRect}
        onMidpoint={() => { if (pendingPath) navigate(pendingPath); }}
        onComplete={() => setZoomActive(false)}
      />
      <EvaraGifTransition
        isActive={transitionActive} scope={transitionScope}
        onMidpoint={() => { if (pendingPath) navigate(pendingPath); }}
        onComplete={() => setTransitionActive(false)}
      />
    </div>
  );
};

export default RoyalIndex;
