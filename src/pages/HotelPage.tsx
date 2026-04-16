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

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15),
  message: z.string().trim().max(500).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema> & { checkIn?: Date; checkOut?: Date };

const BookingForm = ({ hotelName }: { hotelName: string }) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = (data: BookingFormValues) => {
    if (!checkIn) { toast.error("Please select a check-in date"); return; }
    if (!checkOut) { toast.error("Please select a check-out date"); return; }
    if (checkOut <= checkIn) { toast.error("Check-out must be after check-in"); return; }
    toast.success(`Thank you, ${data.name}! We'll contact you shortly about your reservation at ${hotelName}.`);
    setSubmitted(true);
    reset();
    setCheckIn(undefined);
    setCheckOut(undefined);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-6 md:p-10 rounded-2xl bg-card"
      style={{ border: "1px solid hsl(var(--border) / 0.3)", boxShadow: "0 4px 30px rgba(0,0,0,0.04)" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body" style={{ fontWeight: 400 }}>Full Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input {...register("name")} placeholder="Your name" className="pl-10 h-11 text-sm font-body border-border/30 focus:border-primary/40" style={{ fontWeight: 300 }} />
        </div>
        {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body" style={{ fontWeight: 400 }}>Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input {...register("email")} type="email" placeholder="your@email.com" className="pl-10 h-11 text-sm font-body border-border/30 focus:border-primary/40" style={{ fontWeight: 300 }} />
        </div>
        {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body" style={{ fontWeight: 400 }}>Phone *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input {...register("phone")} type="tel" placeholder="+91 9031027961" className="pl-10 h-11 text-sm font-body border-border/30 focus:border-primary/40" style={{ fontWeight: 300 }} />
        </div>
        {errors.phone && <p className="text-[10px] text-destructive">{errors.phone.message}</p>}
      </div>

      {/* Dates row */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body" style={{ fontWeight: 400 }}>Check-in *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-body text-sm border-border/30", !checkIn && "text-muted-foreground")} style={{ fontWeight: 300 }}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "MMM dd") : "Select"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body" style={{ fontWeight: 400 }}>Check-out *</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full h-11 justify-start text-left font-body text-sm border-border/30", !checkOut && "text-muted-foreground")} style={{ fontWeight: 300 }}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "MMM dd") : "Select"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(d) => d < (checkIn || new Date())} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Message — full width */}
      <div className="md:col-span-2 space-y-1.5">
        <label className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body" style={{ fontWeight: 400 }}>Special Requests</label>
        <Textarea {...register("message")} placeholder="Any special requests or preferences..." className="min-h-[80px] text-sm font-body border-border/30 focus:border-primary/40 resize-none" style={{ fontWeight: 300 }} />
      </div>

      {/* Submit */}
      <div className="md:col-span-2">
        <motion.button
          type="submit"
          className="w-full py-3.5 rounded-lg text-[10px] tracking-[0.25em] uppercase font-body bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 flex items-center justify-center gap-2"
          style={{ fontWeight: 400 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitted ? (
            <><CheckCircle2 className="w-4 h-4" /> Request Sent</>
          ) : (
            <><Send className="w-3.5 h-3.5" /> Send Booking Request</>
          )}
        </motion.button>
      </div>
    </motion.form>
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

  const isComingSoon = hotel.id === "evara-exotica";

  if (isComingSoon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background section-padding text-center">
        <img src={constructionImg} alt="Under Construction" className="w-48 md:w-64 mb-6 opacity-70" />
        <h1 className="text-2xl md:text-4xl font-display text-foreground" style={{ fontWeight: 300 }}>{hotel.name}</h1>
        <p className="text-muted-foreground font-body mt-2 text-sm tracking-wider" style={{ fontWeight: 300 }}>Opening Soon</p>
        <button
          onClick={() => navigateWithTransition("/")}
          className="mt-8 group inline-flex items-center gap-2 border border-primary/30 text-primary px-7 py-2.5 text-[9px] tracking-[0.25em] uppercase font-body hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 rounded-full"
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
            {["About", "Experience", "Rooms", "Gallery", "Booking", "Amenities"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground hover:text-primary transition-colors font-body" style={{ fontWeight: 300 }}>{item}</a>
            ))}
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

      {/* Hero — no picture box, shown directly on background */}
      <section ref={heroRef} className="relative pt-12 md:pt-14">
        <motion.img src={hotel.heroImage} alt={hotel.name} className="w-full object-contain" style={{ y: heroY }} />
        <motion.div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-14 py-6 md:py-10" style={{ opacity: heroOpacity }}>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: hotel.rating }).map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 text-primary fill-primary" />
            ))}
          </div>
          <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60 font-body" style={{ fontWeight: 300 }}>{hotel.tagline}</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display text-foreground mt-1 tracking-wide" style={{ fontWeight: 300 }}>{hotel.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <MapPin className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50 font-body" style={{ fontWeight: 300 }}>{hotel.address}</span>
          </div>
        </motion.div>
      </section>

      {/* About with elegant layout */}
      <FadeSection>
        <section id="about" className="section-padding max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
            <div>
              <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body" style={{ fontWeight: 300 }}>Welcome to</span>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-display mt-2 text-foreground tracking-wide" style={{ fontWeight: 300 }}>{hotel.name}</h2>
              <div className="w-12 h-px mt-3 mb-5" style={{ background: "hsl(var(--gold) / 0.4)" }} />
              <p className="text-muted-foreground font-body leading-relaxed text-sm" style={{ fontWeight: 300 }}>{hotel.description}</p>
              <div className="flex flex-wrap gap-6 mt-6">
                {[
                  { icon: Wifi, label: "High-Speed WiFi", value: "Complimentary" },
                  { icon: Car, label: "Valet Parking", value: "Available" },
                  { icon: Phone, label: "Reservations", value: "24/7" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.15)" }}>
                      <item.icon className="w-3.5 h-3.5" style={{ color: "hsl(var(--gold))" }} />
                    </div>
                    <div>
                      <span className="text-[8px] tracking-wider uppercase text-muted-foreground/50 font-body block">{item.label}</span>
                      <span className="text-xs font-body text-foreground" style={{ fontWeight: 400 }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <ParallaxImage src={hotel.gallery[0] || hotel.heroImage} alt={hotel.name} className="rounded-2xl aspect-[3/4]" />
              {/* Floating accent card */}
              <div className="absolute -bottom-4 -left-4 md:-left-6 bg-background rounded-xl p-4 shadow-xl" style={{ border: "1px solid hsl(var(--border) / 0.3)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.15)" }}>
                    <Star className="w-4 h-4 fill-current" style={{ color: "hsl(var(--gold))" }} />
                  </div>
                  <div>
                    <span className="text-lg font-display text-foreground" style={{ fontWeight: 400 }}>{hotel.rating}.0</span>
                    <span className="text-[8px] text-muted-foreground block tracking-wider uppercase">Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeSection>

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
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-foreground tracking-wide" style={{ fontWeight: 300 }}>Plan Your Stay in Minutes</h2>
              <div className="w-12 h-px mx-auto mt-3" style={{ background: "hsl(var(--gold) / 0.4)" }} />
            </div>
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
          <div className="text-center mb-10">
            <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body" style={{ fontWeight: 300 }}>Gallery</span>
            <h3 className="text-xl md:text-3xl font-display mt-2 text-foreground tracking-wide" style={{ fontWeight: 500 }}>Moments & Spaces</h3>
            <div className="w-12 h-px mx-auto mt-3" style={{ background: "hsl(var(--gold) / 0.4)" }} />
          </div>
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
          <div className="text-center mb-10 md:mb-14">
            <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body" style={{ fontWeight: 300 }}>Accommodations</span>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-display mt-2 text-foreground tracking-wide" style={{ fontWeight: 500 }}>Rooms & Suites</h2>
            <div className="w-12 h-px mx-auto mt-4" style={{ background: "hsl(var(--gold) / 0.4)" }} />
            <p className="text-sm text-muted-foreground font-body mt-4 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Thoughtfully designed for comfort and elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {hotel.rooms.map((room, i) => (
              <motion.div
                key={i}
                className="group relative bg-background rounded-2xl overflow-hidden transition-all duration-500"
                style={{ border: "1px solid hsl(var(--border) / 0.2)" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
              >
                {/* Full-bleed image */}
                <div className="relative overflow-hidden">
                  <img src={room.image} alt={room.name} className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                  {/* Price badge */}
                  <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full backdrop-blur-md" style={{ background: "hsl(var(--background) / 0.85)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                    <span className="text-xs font-display text-foreground" style={{ fontWeight: 500 }}>{room.price}</span>
                    <span className="text-[7px] text-muted-foreground/60 ml-1">/night</span>
                  </div>
                  {/* Room name on image */}
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-lg sm:text-xl font-display text-background tracking-wide" style={{ fontWeight: 600 }}>{room.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 pt-4 pb-5">
                  <p className="text-xs text-muted-foreground/70 font-body leading-relaxed" style={{ fontWeight: 300 }}>{room.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {room.features.slice(0, 4).map((f) => (
                      <span key={f} className="text-[7px] px-3 py-1.5 rounded-full font-body tracking-wider uppercase" style={{ fontWeight: 400, background: "hsl(var(--gold) / 0.08)", color: "hsl(var(--gold-dark, var(--foreground)))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    className="w-full mt-4 py-3 rounded-xl text-[9px] tracking-[0.2em] uppercase font-body bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
                    style={{ fontWeight: 500 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Reserve Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* Amenities */}
      <FadeSection>
        <section id="amenities" className="section-padding bg-secondary">
          <div className="text-center mb-10">
            <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body" style={{ fontWeight: 300 }}>Experience</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display mt-2 text-foreground tracking-wide" style={{ fontWeight: 300 }}>Amenities</h2>
            <div className="w-12 h-px mx-auto mt-3" style={{ background: "hsl(var(--gold) / 0.4)" }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3 max-w-4xl mx-auto">
            {hotel.amenities.map((amenity, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1.5 p-3 md:p-4 glass-card rounded-lg hover-gold-border text-center transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
              >
                <div className="text-primary/60">
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

      {/* Booking / Contact Form */}
      <FadeSection>
        <section id="booking" className="section-padding">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body" style={{ fontWeight: 300 }}>Reservations</span>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-display mt-2 text-foreground tracking-wide" style={{ fontWeight: 300 }}>Book Your Stay</h2>
              <div className="w-12 h-px mx-auto mt-3" style={{ background: "hsl(var(--gold) / 0.4)" }} />
            </div>
            <BookingForm hotelName={hotel.name} />
          </div>
        </section>
      </FadeSection>

      <section className="section-padding text-center" style={{ background: "hsl(var(--foreground))" }}>
        <FadeSection>
          <span className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-body" style={{ fontWeight: 300 }}>Ready to Experience</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display mt-2 text-background tracking-wide" style={{ fontWeight: 300 }}>{hotel.name}</h2>
          <div className="w-12 h-px mx-auto mt-3 mb-5" style={{ background: "hsl(var(--gold) / 0.4)" }} />
          <p className="text-background/30 font-body max-w-sm mx-auto text-sm" style={{ fontWeight: 300 }}>
            Reserve your stay and discover unparalleled luxury.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <a href="tel:+919031027961" className="px-7 py-2.5 bg-primary text-primary-foreground text-[9px] tracking-[0.25em] uppercase font-body rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 inline-flex items-center gap-2" style={{ fontWeight: 400 }}>
              <Phone className="w-3 h-3" /> Reserve Now
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
