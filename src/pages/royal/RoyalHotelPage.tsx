import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { hotels } from "@/data/hotels";
import { ArrowLeft, MapPin, Phone, Mail, ArrowUpRight, Star } from "lucide-react";
import { useMediaUrl } from "@/hooks/useHotelMedia";
import {
  RoyalCrown,
  FleurDeLis,
  OrnateFrame,
  WaxSeal,
  RoyalDivider,
  Chandelier,
} from "@/components/royal/RoyalCrest";

const roman = (n: number) => ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n] || String(n+1);

// ————————————————————————————————————————————————————————————
// Hero: parchment scroll with parallax portrait
// ————————————————————————————————————————————————————————————
const RoyalHero = ({ hotel }: { hotel: typeof hotels[0] }) => {
  const heroImg = useMediaUrl(hotel.id, "hero", hotel.heroImage);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[hsl(350_55%_10%)]">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={heroImg} alt={hotel.name} className="w-full h-full object-cover opacity-50 sepia-[.15]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(350_60%_10%)]/70 via-transparent to-[hsl(350_60%_10%)]"/>
      </motion.div>
      {/* Gilded arch frame */}
      <svg viewBox="0 0 800 900" className="absolute inset-0 w-full h-full text-gold/40 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        <path d="M80 900 V300 Q400 40, 720 300 V900" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M120 900 V320 Q400 100, 680 320 V900" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-10 text-center px-6 text-gold max-w-3xl"
      >
        <RoyalCrown className="w-24 h-12 mx-auto mb-8" />
        <div className="text-[10px] tracking-[0.6em] uppercase opacity-80 mb-6 font-display">Palais · {roman(hotels.findIndex(h=>h.id===hotel.id))}</div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-gold">
          {hotel.name.split(" ").map((w, i) => (
            <span key={i} className={i === 0 ? "italic font-light" : "block mt-2"}>{w} </span>
          ))}
        </h1>
        <RoyalDivider className="mt-8" />
        <p className="mt-8 italic text-base sm:text-lg opacity-90 leading-relaxed max-w-xl mx-auto">
          « {hotel.tagline} »
        </p>
        <div className="mt-2 flex items-center justify-center gap-1 text-gold/70">
          {Array.from({length: hotel.rating}).map((_,i)=><Star key={i} className="w-3 h-3 fill-current"/>)}
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/70 text-[10px] tracking-[0.5em] uppercase font-display">
        Entrez ↓
      </div>
    </section>
  );
};

// ————————————————————————————————————————————————————————————
// Chapter heading
// ————————————————————————————————————————————————————————————
const Chapter = ({ n, title, subtitle }: { n: number; title: string; subtitle?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1 }}
    className="text-center mb-16"
  >
    <div className="text-gold-dark font-display text-xs tracking-[0.5em] uppercase mb-4">Chapitre {roman(n)}</div>
    <h2 className="font-display text-3xl md:text-5xl text-[hsl(350_55%_18%)] leading-tight">
      <span className="italic font-light">{title.split(" ")[0]}</span> {title.split(" ").slice(1).join(" ")}
    </h2>
    <RoyalDivider className="mt-6" />
    {subtitle && <p className="mt-4 max-w-xl mx-auto text-sm italic text-muted-foreground">{subtitle}</p>}
  </motion.div>
);

// ————————————————————————————————————————————————————————————
// Room card — ornate portrait style
// ————————————————————————————————————————————————————————————
const RoomCard = ({ room, hotelId, index }: { room: typeof hotels[0]["rooms"][0]; hotelId: string; index: number }) => {
  const img = useMediaUrl(hotelId, `room-${room.key}`, room.image);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reverse = index % 2 === 1;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? "md:[direction:rtl]" : ""}`}
    >
      <div className="relative aspect-[4/5] max-w-md w-full mx-auto [direction:ltr]">
        <OrnateFrame className="absolute inset-0 w-full h-full text-gold/70 z-10 pointer-events-none" />
        <div className="absolute inset-6 bg-[hsl(350_55%_16%)]">
          <img src={img} alt={room.name} className="absolute inset-0 w-full h-full object-cover sepia-[.1]" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[hsl(40_45%_94%)] border border-gold/60 px-4 py-1 font-display text-[10px] tracking-[0.4em] uppercase text-gold-dark">
          {roman(index)} · Chambre
        </div>
      </div>
      <div className="[direction:ltr]">
        <div className="text-gold-dark font-display text-[10px] tracking-[0.5em] uppercase mb-3">Suite {roman(index)}</div>
        <h3 className="font-display text-3xl md:text-4xl text-[hsl(350_55%_18%)] leading-tight">
          <span className="italic font-light">{room.name.split(" ")[0]}</span> {room.name.split(" ").slice(1).join(" ")}
        </h3>
        <RoyalDivider className="!justify-start !mx-0 mt-4 [&_div]:!w-16" />
        <p className="mt-6 italic text-muted-foreground leading-loose">{room.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {room.features.slice(0, 4).map(f => (
            <span key={f} className="text-[10px] font-display tracking-[0.25em] uppercase text-gold-dark border border-gold/40 px-3 py-1">{f}</span>
          ))}
        </div>

        <div className="mt-8 flex items-end gap-6 border-t border-gold/30 pt-6">
          <div>
            <div className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground font-display">Par nuit</div>
            <div className="font-display text-3xl text-[hsl(350_55%_18%)] mt-1">{room.price}</div>
          </div>
          <button className="btn-lux-forest ml-auto">Réserver</button>
        </div>
      </div>
    </motion.div>
  );
};

// ————————————————————————————————————————————————————————————
// Highlight — baroque card
// ————————————————————————————————————————————————————————————
const HighlightRoyal = ({ h, hotelId, index, onOpen }: { h: typeof hotels[0]["highlights"][0]; hotelId: string; index: number; onOpen: () => void }) => {
  const img = useMediaUrl(hotelId, `highlight-${h.key}-main`, h.image);
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.9, delay: index * 0.1 }}
      onClick={onOpen}
      className="group relative cursor-pointer overflow-hidden"
    >
      <div className="relative aspect-[4/5]">
        <img src={img} alt={h.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105 sepia-[.1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(350_60%_10%)]/95 via-[hsl(350_60%_10%)]/30 to-transparent" />
        {/* Ornate corner brackets */}
        <div className="absolute inset-3 border border-gold/60 pointer-events-none" />
        <div className="absolute top-4 left-4 text-gold font-display text-[10px] tracking-[0.4em] uppercase">
          Nº {String(index+1).padStart(2, "0")}
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-gold">
          <FleurDeLis className="w-4 h-6 mb-3 opacity-80" />
          <h3 className="font-display text-xl md:text-2xl leading-tight">{h.title}</h3>
          <div className="mt-3 h-px w-10 bg-gold/60 group-hover:w-20 transition-all duration-500"/>
          <p className="mt-3 text-xs italic opacity-80 line-clamp-2">{h.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-display opacity-90 group-hover:gap-3 transition-all">
            Découvrir <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

// ————————————————————————————————————————————————————————————
// Main
// ————————————————————————————————————————————————————————————
const RoyalHotelPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hotel = hotels.find(h => h.id === id);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const on = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [id]);

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate("/")} className="btn-lux-forest">← Retour</button>
      </div>
    );
  }

  return (
    <div className="relative text-foreground">
      {/* Top ribbon */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-gold/30" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <button onClick={() => navigate("/")} className={`flex items-center gap-2 font-display text-[11px] tracking-[0.4em] uppercase ${scrolled ? "text-foreground" : "text-gold"}`}>
            <ArrowLeft className="w-4 h-4" /> Maison
          </button>
          <RoyalCrown className={`w-12 h-6 ${scrolled ? "text-gold-dark" : "text-gold"}`} />
          <div className={`hidden sm:block font-display text-[11px] tracking-[0.4em] uppercase ${scrolled ? "text-foreground" : "text-gold"}`}>{hotel.name}</div>
        </div>
      </header>

      <RoyalHero hotel={hotel} />

      {/* ————— CHAPTER I : PROLOGUE ————— */}
      <section className="relative py-32 px-6 bg-[hsl(40_40%_94%)]">
        <Chapter n={0} title="The Prologue" subtitle="A letter from the master of the house." />
        <div className="max-w-3xl mx-auto text-center">
          <WaxSeal className="w-14 h-14 mx-auto mb-8" />
          <p className="font-display italic text-xl md:text-2xl leading-[1.7] text-[hsl(350_55%_18%)]">
            « {hotel.description} »
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 text-gold-dark text-[10px] tracking-[0.4em] uppercase font-display">
            <MapPin className="w-3 h-3" /> {hotel.address}
          </div>
        </div>
      </section>

      {/* ————— CHAPTER II : CHAMBERS ————— */}
      <section className="relative py-32 px-6 bg-[hsl(40_35%_90%)] overflow-hidden">
        <Chapter n={1} title="The Chambers" subtitle="Suites shaped by centuries of grace." />
        <div className="max-w-6xl mx-auto space-y-32">
          {hotel.rooms.map((r, i) => (
            <RoomCard key={r.key} room={r} hotelId={hotel.id} index={i} />
          ))}
        </div>
      </section>

      {/* ————— CHAPTER III : COURTLY LIFE (highlights) ————— */}
      {hotel.highlights.length > 0 && (
        <section className="relative py-32 px-6 bg-[hsl(350_50%_14%)] text-gold overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-30 hidden md:block">
            <Chandelier className="w-32 h-40" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 30px 30px, hsl(42 60% 60%) 1.5px, transparent 2px)",
              backgroundSize: "80px 80px",
            }}
          />
          <div className="relative">
            <div className="text-center mb-16">
              <div className="font-display text-xs tracking-[0.5em] uppercase mb-4 opacity-80">Chapitre {roman(2)}</div>
              <h2 className="font-display text-3xl md:text-5xl">
                <span className="italic font-light">Courtly</span> Pleasures
              </h2>
              <RoyalDivider className="mt-6 [&_div]:!bg-gold" />
            </div>
            <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotel.highlights.map((h, i) => (
                <HighlightRoyal
                  key={h.key} h={h} hotelId={hotel.id} index={i}
                  onOpen={() => navigate(`/hotel/${hotel.id}/highlight/${h.key}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ————— CHAPTER IV : COURT AMENITIES ————— */}
      <section className="relative py-32 px-6 bg-[hsl(40_45%_94%)]">
        <Chapter n={3} title="The Amenities" subtitle="Services rendered as of old." />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {hotel.amenities.slice(0, 12).map((a, i) => (
            <motion.div
              key={a}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="text-center border border-gold/40 py-6 px-3 bg-[hsl(40_45%_96%)] hover:border-gold transition-colors"
            >
              <FleurDeLis className="w-4 h-6 mx-auto mb-3 text-gold-dark" />
              <div className="font-display text-xs tracking-[0.2em] uppercase text-[hsl(350_55%_18%)]">{a}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ————— CHAPTER V : CORRESPONDENCE ————— */}
      <section className="relative py-32 px-6 bg-[hsl(350_50%_14%)] text-gold overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-display text-xs tracking-[0.5em] uppercase mb-4 opacity-80">Chapitre {roman(4)}</div>
          <h2 className="font-display text-3xl md:text-5xl">
            <span className="italic font-light">By Royal</span> Invitation
          </h2>
          <RoyalDivider className="mt-6 [&_div]:!bg-gold" />
          <p className="mt-6 italic opacity-80 max-w-lg mx-auto">
            "The gates await your arrival. Send word — the courier stands ready."
          </p>

          <div className="mt-12 grid sm:grid-cols-2 gap-6 text-left">
            <div className="border border-gold/40 p-6 bg-[hsl(350_55%_10%)]/50">
              <Phone className="w-4 h-4 mb-3" />
              <div className="text-[10px] tracking-[0.4em] uppercase font-display opacity-70 mb-1">Téléphone</div>
              <div className="font-display text-lg">+91 · Bihar</div>
            </div>
            <div className="border border-gold/40 p-6 bg-[hsl(350_55%_10%)]/50">
              <Mail className="w-4 h-4 mb-3" />
              <div className="text-[10px] tracking-[0.4em] uppercase font-display opacity-70 mb-1">Courrier</div>
              <div className="font-display text-lg">concierge@evara</div>
            </div>
          </div>

          <div className="mt-10">
            <button onClick={() => navigate("/")} className="btn-lux-forest">← Retour à la Maison</button>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-[hsl(350_60%_10%)] text-gold text-center">
        <RoyalCrown className="w-16 h-8 mx-auto opacity-80" />
        <div className="mt-3 font-display tracking-[0.5em] uppercase text-xs">Maison Evara · {hotel.name}</div>
        <div className="mt-2 italic text-[10px] opacity-60">© MMXXIV · Tous droits réservés</div>
      </footer>
    </div>
  );
};

export default RoyalHotelPage;
