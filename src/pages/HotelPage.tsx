import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hotels } from "@/data/hotels";
import { ArrowLeft, Star, X, Waves, Sparkles, UtensilsCrossed, TreePalm, Dumbbell, Wine, Car, Phone, Wifi, ArrowRight, Mail, Instagram, Coffee, Gamepad2, ParkingCircle, Droplets, Scissors, Menu, ArrowUpRight, MapPin, Clock, CheckCircle2, CalendarIcon, User, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import constructionImg from "@/assets/construction-coming-soon.png";
import SectionHeader from "@/components/SectionHeader";
import ReserveFlow from "@/components/ReserveFlow";
import MediaGallery from "@/components/MediaGallery";
import LoopVideo from "@/components/LoopVideo";
import RoomSection from "@/components/RoomSection";
import { useGallery, useMediaUrl } from "@/hooks/useHotelMedia";
import { galleryLoopVideo } from "@/data/hotels";


gsap.registerPlugin(ScrollTrigger);

const amenityIcons: Record<string, React.ReactNode> = {
  "Infinity Pool": <Waves className="w-4 h-4" />,
  "Cliffside Pool": <Waves className="w-4 h-4" />,
  "Natural Pool": <Waves className="w-4 h-4" />,
  "Swimming Pool": <Waves className="w-4 h-4" />,
  "Spa & Wellness": <Sparkles className="w-4 h-4" />,
  "Mediterranean Spa": <Sparkles className="w-4 h-4" />,
  "Luxury Spa": <Sparkles className="w-4 h-4" />,
  "Jungle Spa": <Sparkles className="w-4 h-4" />,
  "Spa & Salon": <Scissors className="w-4 h-4" />,
  "Fine Dining": <UtensilsCrossed className="w-4 h-4" />,
  "Gourmet Restaurant": <UtensilsCrossed className="w-4 h-4" />,
  "Michelin Restaurant": <UtensilsCrossed className="w-4 h-4" />,
  "Farm-to-Table Restaurant": <UtensilsCrossed className="w-4 h-4" />,
  "CHAUKAA Restaurant": <UtensilsCrossed className="w-4 h-4" />,
  "Multi-Cuisine Restaurant": <UtensilsCrossed className="w-4 h-4" />,
  "Coffee Shop": <Coffee className="w-4 h-4" />,
  "Private Beach": <TreePalm className="w-4 h-4" />,
  "Fitness Center": <Dumbbell className="w-4 h-4" />,
  "Wine Cellar": <Wine className="w-4 h-4" />,
  "Valet Parking": <Car className="w-4 h-4" />,
  "Car Parking": <ParkingCircle className="w-4 h-4" />,
  "Concierge": <Phone className="w-4 h-4" />,
  "Rain Dance Area": <Droplets className="w-4 h-4" />,
  "Kids Zone": <Gamepad2 className="w-4 h-4" />,
};

const toSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

// Fade-in section wrapper
const FadeSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

const ParallaxImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div ref={ref} className={`overflow-hidden ${className || ""}`}>
      <motion.img src={src} alt={alt} className="w-full h-[115%] object-cover" style={{ y }} loading="lazy" />
    </div>
  );
};

// RoomSection now lives in src/components/RoomSection.tsx

// Per-highlight card on hotel page — uses admin override image when present.
const HighlightCard = ({
  hotelId,
  highlight,
  index,
  onNavigate,
}: {
  hotelId: string;
  highlight: any;
  index: number;
  onNavigate: () => void;
}) => {
  const mainImage = useMediaUrl(hotelId, `highlight-${highlight.key}-main`, highlight.image);
  return (
    <FadeSection delay={0.1}>
      <div className="section-padding">
        <div className={`max-w-6xl mx-auto flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-6 md:gap-14 items-center`}>
          <div className="flex-1 w-full relative group">
            <ParallaxImage src={mainImage} alt={highlight.title} className="rounded-xl md:rounded-2xl aspect-[4/3]" />
            <div className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-xs font-display" style={{ background: "hsl(var(--background) / 0.9)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
              <span style={{ color: "hsl(var(--gold))" }}>0{index + 1}</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body" style={{ fontWeight: 300 }}>Experience</span>
            <h3 className="text-lg sm:text-xl md:text-3xl font-display mt-1 text-foreground tracking-wide" style={{ fontWeight: 500 }}>{highlight.title}</h3>
            <div className="w-10 h-px mt-2 mb-3" style={{ background: "hsl(var(--gold) / 0.4)" }} />
            <p className="text-muted-foreground font-body leading-relaxed text-sm" style={{ fontWeight: 300 }}>{highlight.description}</p>
            <button
              onClick={onNavigate}
              className="mt-5 group inline-flex items-center gap-2 text-[9px] tracking-[0.25em] uppercase text-primary font-body hover:gap-3 transition-all"
              style={{ fontWeight: 400 }}
            >
              Explore <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </FadeSection>
  );
};








const HotelPage = () => {
  const { id } = useParams();
  const navigateTo = useNavigate();
  const navigateWithTransition = (path: string) => navigateTo(path);
  const hotel = hotels.find((h) => h.id === id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  // Admin overrides for main page media (always called — safe defaults when hotel missing)
  const heroImageOverride = useMediaUrl(id || "", "hero", hotel?.heroImage || "");
  const stepIntoVideoItems = useGallery(id || "", "evara-loop-video", [], galleryLoopVideo);
  const stepIntoVideoUrl = stepIntoVideoItems[0]?.url || galleryLoopVideo;

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-display text-foreground" style={{ fontWeight: 300 }}>Hotel not found</h1>
          <button onClick={() => navigateWithTransition("/")} className="mt-4 text-muted-foreground underline font-body">Return home</button>
        </div>
      </div>
    );
  }

  const isComingSoon = hotel.id === "evara-exotica" || hotel.id === "dallan-resort";

  if (isComingSoon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background section-padding text-center overflow-hidden relative">
        {/* Subtle gold pattern backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23B8860B' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />

        <motion.img
          src={constructionImg}
          alt="Under Construction"
          className="w-56 md:w-80 mb-8 opacity-80 relative z-10"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 0.85, scale: 1, y: [0, -8, 0] }}
          transition={{ opacity: { duration: 0.8 }, scale: { duration: 0.8 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        />

        <div className="relative z-10 flex items-center gap-3 mb-4">
          <span className="h-px w-10" style={{ background: "hsl(var(--gold) / 0.6)" }} />
          <span className="text-[10px] tracking-[0.45em] uppercase font-body" style={{ color: "hsl(var(--gold))", fontWeight: 400 }}>Under Construction</span>
          <span className="h-px w-10" style={{ background: "hsl(var(--gold) / 0.6)" }} />
        </div>

        <h1 className="text-3xl md:text-5xl font-display text-foreground relative z-10" style={{ fontWeight: 300 }}>{hotel.name}</h1>

        {/* Animated shimmering Coming Soon */}
        <div className="relative z-10 mt-5 overflow-hidden">
          <motion.p
            className="text-base md:text-xl font-display tracking-[0.4em] uppercase"
            style={{
              backgroundImage: "linear-gradient(90deg, hsl(var(--gold) / 0.4) 0%, hsl(var(--gold)) 50%, hsl(var(--gold) / 0.4) 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 400,
            }}
            animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          >
            Coming Soon
          </motion.p>
        </div>

        <motion.div
          className="relative z-10 flex gap-1.5 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(var(--gold))" }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </motion.div>

        <button
          onClick={() => navigateWithTransition("/")}
          className="relative z-10 mt-10 group inline-flex items-center gap-2 border border-primary/30 text-primary px-7 py-2.5 text-[9px] tracking-[0.25em] uppercase font-body hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 rounded-full"
          style={{ fontWeight: 400 }}
        >
          Back to Home <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground font-body relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
    >
      {/* Luxury SVG pattern background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23B8860B' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex items-center justify-between h-12 md:h-14">
          <button onClick={() => navigateWithTransition("/")} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[9px] tracking-wider uppercase font-body hidden sm:inline" style={{ fontWeight: 300 }}>Back</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-xs tracking-[0.15em] uppercase font-display" style={{ fontWeight: 300 }}>{hotel.name}</span>
          </div>

          <div className="hidden md:flex items-center gap-5">
            {["About", "Experience", "Rooms", "Gallery", "Amenities"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground hover:text-primary transition-colors font-body" style={{ fontWeight: 300 }}>{item}</a>
            ))}
            <a
              href="#booking"
              className="ml-2 px-4 py-1.5 text-[9px] tracking-[0.2em] uppercase font-body bg-foreground text-background hover:bg-foreground/85 transition-colors"
              style={{ fontWeight: 400 }}
            >
              Reserve
            </a>
          </div>


          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-foreground">
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden overflow-hidden border-t border-border/40"
              style={{ background: "hsl(var(--background))" }}
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                <span className="text-[8px] tracking-[0.4em] uppercase text-muted-foreground/40 font-body">Navigate</span>
                {["About", "Experience", "Rooms", "Gallery", "Booking", "Amenities"].map((item, i) => (
                  <motion.a
                    key={i}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-foreground/50 hover:text-primary transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <span className="text-xs tracking-[0.15em] uppercase font-body" style={{ fontWeight: 300 }}>{item}</span>
                  </motion.a>
                ))}
                <div className="w-8 h-px bg-primary/15 mt-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ===== EDITORIAL HERO — responsive split layout ===== */}
      <section ref={heroRef} className="relative w-full overflow-hidden bg-background pt-16 md:pt-20">
        {/* Subtle gold pattern wash */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23B8860B' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Image — portrait shown in full, never cropped */}
            <motion.div
              className="lg:col-span-7 order-1 relative"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="relative w-full mx-auto" style={{ maxWidth: "min(100%, 640px)" }}>
                {/* Gold frame accents */}
                <div className="absolute -inset-2 sm:-inset-3 border border-[hsl(var(--gold)/0.35)] pointer-events-none" />
                <div className="absolute -top-3 -left-3 w-8 h-8 sm:w-10 sm:h-10 border-l-2 border-t-2 border-[hsl(var(--gold))] pointer-events-none" />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 border-r-2 border-b-2 border-[hsl(var(--gold))] pointer-events-none" />

                <motion.div className="relative overflow-hidden bg-[hsl(var(--muted))]" style={{ y: heroY }}>
                  <img
                    src={hotel.heroImage}
                    alt={`${hotel.name} — facade`}
                    className="block w-full h-auto object-cover object-center"
                    style={{ aspectRatio: "4 / 5" }}
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                </motion.div>

                {/* Floating rating plate */}
                <motion.div
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:right-4 lg:translate-x-0 flex items-center gap-2 px-4 py-2 bg-background border border-[hsl(var(--gold)/0.4)] shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  {Array.from({ length: hotel.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" style={{ color: "hsl(var(--gold))" }} />
                  ))}
                  <span className="text-[9px] tracking-[0.3em] uppercase font-body text-muted-foreground ml-1" style={{ fontWeight: 400 }}>Est. 2024</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="lg:col-span-5 order-2 text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
                <span className="h-px w-10" style={{ background: "hsl(var(--gold) / 0.75)" }} />
                <span className="text-[10px] tracking-[0.45em] uppercase font-body" style={{ color: "hsl(var(--gold))", fontWeight: 400 }}>
                  {hotel.tagline}
                </span>
                <span className="h-px w-10 lg:hidden" style={{ background: "hsl(var(--gold) / 0.75)" }} />
              </div>

              <h1
                className="font-display text-foreground leading-[1.05] tracking-wide"
                style={{
                  fontWeight: 300,
                  fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
                }}
              >
                {hotel.name}
              </h1>

              <div className="mt-5 flex items-start justify-center lg:justify-start gap-2 text-muted-foreground max-w-md mx-auto lg:mx-0">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--gold))" }} />
                <span className="text-[11px] sm:text-xs font-body tracking-wide leading-relaxed" style={{ fontWeight: 300 }}>
                  {hotel.address}
                </span>
              </div>

              <p className="mt-6 text-sm sm:text-[15px] text-muted-foreground/90 leading-relaxed font-body max-w-md mx-auto lg:mx-0" style={{ fontWeight: 300 }}>
                A boutique five-star retreat in the heart of Darbhanga, pairing modern elegance with warm Bihari hospitality.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="#booking"
                  className="luxe-shimmer px-7 py-3 text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2 transition-all duration-300 hover:opacity-90"
                  style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))", fontWeight: 400 }}
                >
                  Reserve a Stay <ArrowRight className="w-3 h-3" />
                </a>
                <a href="#about" className="btn-ghost-line">Discover</a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* About — single column editorial copy (facade picture removed per request) */}
      <FadeSection>
        <section id="about" className="section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10" style={{ background: "hsl(var(--gold) / 0.7)" }} />
              <span className="text-[10px] tracking-[0.45em] uppercase font-body" style={{ color: "hsl(var(--gold))", fontWeight: 400 }}>
                Welcome to
              </span>
              <span className="h-px w-10" style={{ background: "hsl(var(--gold) / 0.7)" }} />
            </div>

            <h2
              className="font-display text-foreground leading-[1.05] tracking-wide"
              style={{ fontWeight: 300, fontSize: "clamp(1.85rem, 4.6vw, 3.25rem)" }}
            >
              {hotel.name}
              <span className="block italic mt-1" style={{ color: "hsl(var(--gold))", fontWeight: 300 }}>
                Stay · Dine · Celebrate
              </span>
            </h2>

            <div className="w-16 h-px my-6 mx-auto" style={{ background: "hsl(var(--gold) / 0.5)" }} />

            <p className="text-muted-foreground font-body leading-[1.85] text-[15px] max-w-2xl mx-auto" style={{ fontWeight: 300 }}>
              {hotel.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-9 max-w-2xl mx-auto">
              {[
                { icon: Wifi, label: "High-Speed WiFi", value: "Complimentary" },
                { icon: Car, label: "Valet Parking", value: "Available" },
                { icon: Phone, label: "Concierge", value: "24 / 7" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: "hsl(var(--gold))" }} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[8px] tracking-[0.25em] uppercase text-muted-foreground/60 font-body block">{item.label}</span>
                    <span className="text-xs font-body text-foreground block mt-0.5" style={{ fontWeight: 400 }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-9">
              <a
                href="#booking"
                className="px-7 py-3 text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2 transition-all duration-300 hover:opacity-90"
                style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))", fontWeight: 400 }}
              >
                Reserve a Stay <ArrowRight className="w-3 h-3" />
              </a>
              <a
                href="#experience"
                className="text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
                style={{ fontWeight: 400 }}
              >
                Explore Experiences <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      </FadeSection>


      {/* ===== Looping Cinematic Video (replaces old static picture after Explore Experiences) ===== */}
      {hotel.id === "evara" && (
        <FadeSection>
          <section className="section-padding" style={{ background: "hsl(var(--background))" }}>
            <div className="max-w-6xl mx-auto">
              <SectionHeader eyebrow="A Glimpse Inside" title="Step Into" accent="Evara" className="mb-8" />
              <div className="relative">
                <LoopVideo src={galleryLoopVideo} className="rounded-2xl shadow-2xl" aspectRatio="16 / 9" />
                <span className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: "hsl(var(--gold))" }} />
                <span className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: "hsl(var(--gold))" }} />
              </div>
            </div>
          </section>
        </FadeSection>
      )}




      {/* Highlights */}
      <section id="experience" className="bg-secondary">
        {hotel.highlights.map((highlight, i) => (
          <FadeSection key={i} delay={0.1}>
            <div className="section-padding">
              <div className={`max-w-6xl mx-auto flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-14 items-center`}>
                <div className="flex-1 w-full relative group">
                  <ParallaxImage src={highlight.image} alt={highlight.title} className="rounded-xl md:rounded-2xl aspect-[4/3]" />
                  {/* Hover overlay with number */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-xs font-display" style={{ background: "hsl(var(--background) / 0.9)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                    <span style={{ color: "hsl(var(--gold))" }}>0{i + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body" style={{ fontWeight: 300 }}>Experience</span>
                  <h3 className="text-lg sm:text-xl md:text-3xl font-display mt-1 text-foreground tracking-wide" style={{ fontWeight: 500 }}>{highlight.title}</h3>
                  <div className="w-10 h-px mt-2 mb-3" style={{ background: "hsl(var(--gold) / 0.4)" }} />
                  <p className="text-muted-foreground font-body leading-relaxed text-sm" style={{ fontWeight: 300 }}>{highlight.description}</p>
                  <button
                    onClick={() => navigateTo(`/hotel/${id}/${toSlug(highlight.title)}`)}
                    className="mt-5 group inline-flex items-center gap-2 text-[9px] tracking-[0.25em] uppercase text-primary font-body hover:gap-3 transition-all"
                    style={{ fontWeight: 400 }}
                  >
                    Explore <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </FadeSection>
        ))}
      </section>

      {/* Plan Your Stay Section — inspired by reference pic 4 */}
      <FadeSection>
        <section className="section-padding" style={{ background: "hsl(var(--background))" }}>
          <div className="max-w-6xl mx-auto">
            <SectionHeader eyebrow="The Journey" title="Plan Your" accent="Stay" className="mb-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Images stack */}
              <div className="relative h-[300px] sm:h-[380px] md:h-[420px]">
                <motion.div
                  className="absolute top-0 left-0 w-[65%] h-[85%] rounded-2xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <img src={hotel.gallery[1] || hotel.heroImage} alt="Hotel interior" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
                <motion.div
                  className="absolute bottom-0 right-0 w-[55%] h-[65%] rounded-2xl overflow-hidden shadow-2xl"
                  style={{ border: "4px solid hsl(var(--background))" }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <img src={hotel.gallery[2] || hotel.heroImage} alt="Hotel room" className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
                {/* Arrow accent */}
                <div className="absolute top-[10%] right-[38%] w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center z-10">
                  <ArrowUpRight className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {[
                  { title: "Explore Our Spaces", desc: "Discover our restaurants, banquet halls, and luxury rooms." },
                  { title: "Choose Your Room", desc: "Select from Twin Deluxe, Deluxe, or Suite rooms for the perfect stay." },
                  { title: "Book Securely", desc: "Reserve instantly via phone or in-person. Best rates guaranteed." },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4 items-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                  >
                    <div className="w-px h-full min-h-[60px] relative">
                      <div className="w-px h-full" style={{ background: "hsl(var(--gold) / 0.3)" }} />
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-display text-foreground tracking-wide" style={{ fontWeight: 400 }}>{step.title}</h4>
                      <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed" style={{ fontWeight: 300 }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Mosaic Gallery — inspired by Atlantis Royal reference pic 5 */}
      <FadeSection>
        <section id="gallery" className="section-padding bg-secondary">
          <SectionHeader eyebrow="Gallery" title="Moments &" accent="Spaces" className="mb-10" />

          <div className="max-w-6xl mx-auto">
            {/* Atlantis-style scattered mosaic gallery */}
            <div className="relative w-full" style={{ minHeight: "clamp(400px, 60vw, 700px)" }}>
              {hotel.gallery.map((img, i) => {
                // Atlantis-style scattered layout positions
                const positions = [
                  { top: "0%", left: "5%", width: "28%", height: "45%", rotate: -2 },
                  { top: "0%", left: "36%", width: "22%", height: "35%", rotate: 1 },
                  { top: "0%", right: "5%", width: "32%", height: "55%", rotate: 2 },
                  { top: "50%", left: "0%", width: "30%", height: "48%", rotate: 1 },
                  { top: "40%", left: "33%", width: "26%", height: "38%", rotate: -1 },
                  { top: "58%", right: "8%", width: "24%", height: "40%", rotate: -2 },
                ];
                const pos = positions[i % positions.length];
                return (
                  <motion.div
                    key={i}
                    className="absolute overflow-hidden rounded-xl md:rounded-2xl group cursor-pointer shadow-lg"
                    style={{
                      top: pos.top,
                      left: (pos as any).left,
                      right: (pos as any).right,
                      width: pos.width,
                      height: pos.height,
                    }}
                    initial={{ opacity: 0, scale: 0.85, rotate: pos.rotate }}
                    whileInView={{ opacity: 1, scale: 1, rotate: pos.rotate }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                    onClick={() => setLightboxImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${hotel.name} gallery ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-background text-[9px] tracking-[0.2em] uppercase font-body bg-foreground/50 backdrop-blur-sm px-4 py-2 rounded-full">View</span>
                    </div>
                  </motion.div>
                );
              })}
              {/* Brand card in center */}
              <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-background rounded-xl px-6 py-5 flex flex-col items-center justify-center shadow-lg z-10" style={{ border: "1px solid hsl(var(--border) / 0.3)" }}>
                <span className="text-sm sm:text-base md:text-xl tracking-[0.15em] uppercase font-display text-foreground" style={{ fontWeight: 400 }}>{hotel.name}</span>
                <span className="text-[8px] tracking-[0.3em] uppercase mt-1" style={{ color: "hsl(var(--gold) / 0.6)" }}>{hotel.city}</span>
              </div>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Rooms & Suites */}
      <FadeSection>
        <section id="rooms" className="section-padding">
          <SectionHeader
            eyebrow="Accommodations"
            title="Rooms &"
            accent="Suites"
            subtitle="Each residence is thoughtfully composed — natural light, hand-finished textiles, and quiet luxury at every turn."
            className="mb-10 md:mb-14"
          />


          <div className="space-y-20 md:space-y-28 max-w-6xl mx-auto">
            {hotel.rooms.map((room, i) => (
              <RoomSection key={room.key} hotelId={hotel.id} room={room} index={i} />
            ))}
          </div>
        </section>
      </FadeSection>


      {/* Amenities */}
      <FadeSection>
        <section id="amenities" className="section-padding bg-secondary">
          <SectionHeader eyebrow="Curated Experience" title="Hotel" accent="Amenities" className="mb-10" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3 max-w-4xl mx-auto">
            {hotel.amenities.map((amenity, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1.5 p-3 md:p-4 glass-card rounded-lg hover-gold-border luxe-fog text-center transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                whileHover={{ y: -3 }}
              >
                <div className="text-primary/60 transition-transform duration-300 group-hover:scale-110">
                  {amenityIcons[amenity] || <Wifi className="w-4 h-4" />}
                </div>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-body" style={{ fontWeight: 300 }}>{amenity}</span>
              </motion.div>

            ))}
          </div>
        </section>
      </FadeSection>

      {/* Stats Section */}
      <FadeSection>
        <section className="section-padding">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: hotel.rooms.length + "+", label: "Room Types" },
              { value: hotel.amenities.length + "+", label: "Amenities" },
              { value: hotel.highlights.length, label: "Experiences" },
              { value: "5.0", label: "Rating" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <span className="text-3xl md:text-4xl font-display text-foreground" style={{ fontWeight: 300 }}>{stat.value}</span>
                <span className="block text-[9px] tracking-[0.2em] uppercase text-muted-foreground/60 mt-1 font-body">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* Reserve Flow */}
      <FadeSection>
        <section id="booking" className="section-padding">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              eyebrow="Reservations"
              title="Reserve Your"
              accent="Stay"
              subtitle="Three quiet steps. Personally confirmed by our concierge within 24 hours."
              className="mb-10"
            />
            <ReserveFlow hotelName={hotel.name} rooms={hotel.rooms} />
          </div>
        </section>
      </FadeSection>

      <section className="section-padding text-center" style={{ background: "hsl(var(--foreground))" }}>
        <FadeSection>
          <SectionHeader
            eyebrow="Ready to Experience"
            title={hotel.name}
            tone="light"
            className="mb-2"
          />
          <p className="text-background/40 font-body max-w-sm mx-auto text-sm mt-3" style={{ fontWeight: 300 }}>
            Reserve your stay and discover unparalleled luxury.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-7">
            <a
              href="#booking"
              className="luxe-shimmer px-8 py-3 text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2 transition-all duration-300"
              style={{ background: "hsl(var(--gold))", color: "hsl(var(--foreground))", fontWeight: 500 }}
            >
              Reserve Now <ArrowRight className="w-3 h-3" />
            </a>
            <a href="tel:+919031027961" className="px-7 py-3 text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2 text-background/70 hover:text-background transition-colors" style={{ border: "1px solid hsl(var(--background) / 0.25)", fontWeight: 400 }}>
              <Phone className="w-3 h-3" /> +91 9031027961
            </a>
          </div>
        </FadeSection>

      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/90 backdrop-blur-md cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightboxImage(null)}
          >
            <motion.img
              src={lightboxImage}
              alt="Gallery fullscreen"
              className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Footer */}
      <footer className="relative overflow-hidden" style={{ background: "hsl(var(--foreground))" }}>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }} />
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 pt-12 pb-8 md:pt-16 md:pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-1">
              <span className="text-lg tracking-[0.25em] uppercase font-display text-background" style={{ fontWeight: 300 }}>EVARA</span>
              <span className="text-lg tracking-[0.06em] font-display" style={{ fontWeight: 300, color: "hsl(var(--gold))" }}>Co.</span>
            </div>
            <div className="flex gap-3">
              {[
                { href: "https://instagram.com", icon: Instagram },
                { href: "mailto:info@hotelevara.in", icon: Mail },
                { href: "tel:+919031027961", icon: Phone },
              ].map((link, i) => (
                <a key={i} href={link.href} className="w-9 h-9 rounded-full flex items-center justify-center text-background/30 hover:text-background/70 transition-all duration-300" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}>
                  <link.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-5 text-center" style={{ borderTop: "1px solid hsl(var(--gold) / 0.08)" }}>
            <p className="text-[9px] text-background/20 font-body" style={{ fontWeight: 300 }}>© 2025 EVARA Co. All rights reserved.</p>
          </div>
        </div>
        <div className="absolute top-6 left-6 w-10 h-10 border-l border-t opacity-[0.06]" style={{ borderColor: "hsl(var(--gold))" }} />
        <div className="absolute top-6 right-6 w-10 h-10 border-r border-t opacity-[0.06]" style={{ borderColor: "hsl(var(--gold))" }} />
      </footer>
    </motion.div>
  );
};

export default HotelPage;
