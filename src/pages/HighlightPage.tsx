import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { hotels } from "@/data/hotels";
import { galleryLoopVideo } from "@/data/hotels";
import { useGallery } from "@/hooks/useHotelMedia";
import MediaGallery from "@/components/MediaGallery";
import { ArrowLeft, Phone, Mail, Clock, Users, Star } from "lucide-react";


const highlightDetails: Record<string, {
  hours?: string;
  capacity?: string;
  features?: string[];
  sections?: { title: string; content: string }[];
}> = {
  "CHAUKAA Restaurant": {
    hours: "Breakfast 7:00 AM – 10:30 AM | Lunch 12:00 PM – 3:30 PM | Dinner 7:00 PM – 11:00 PM",
    capacity: "50 guests",
    features: ["Multi-cuisine menu", "Live cooking stations on weekends", "Private dining arrangements", "Seasonal menu rotations", "Complimentary welcome drinks for hotel guests", "Vegetarian & non-vegetarian options"],
    sections: [
      { title: "Dining Experience", content: "CHAUKAA Restaurant is a multi-cuisine dining destination that seats up to 50 guests in a warm, contemporary setting. Our carefully curated menu features a blend of traditional Indian flavors and international cuisine, prepared by experienced chefs using fresh, locally sourced ingredients." },
      { title: "Menu Highlights", content: "From hearty North Indian thalis and aromatic biryanis to flavorful Chinese dishes and Continental classics — our kitchen delivers excellence with every plate. We also feature seasonal menu rotations highlighting regional specialties from across India." },
      { title: "Special Services", content: "We offer live cooking stations during weekend brunches, private dining arrangements for intimate celebrations, and customizable group dining packages for families and corporate teams. All hotel guests receive complimentary welcome drinks." },
    ],
  },
  "Mandap Banquet Hall": {
    capacity: "Up to 200 guests (seated) | 350 guests (cocktail style)",
    features: ["Professional sound system", "LED projector & screen", "Customizable lighting", "Air-conditioned", "Valet parking", "Dedicated event coordinator", "In-house catering"],
    sections: [
      { title: "Grand Event Space", content: "The Mandap Banquet Hall is a versatile event space designed to host everything from intimate gatherings to large-scale celebrations. With elegant interiors, modern lighting systems, and premium sound equipment, every event becomes a memorable experience." },
      { title: "Ideal For", content: "Weddings & Receptions — Transform the hall into your dream wedding venue with customizable décor themes, floral arrangements, and stage setups. Engagement Ceremonies, Birthday Celebrations, Corporate Events including conferences, seminars, and product launches. Social Gatherings like kitty parties, reunion dinners, and festival celebrations." },
      { title: "Catering & Services", content: "Our dedicated events team works closely with you to plan and execute flawless occasions — from décor and catering to entertainment and guest management. In-house multi-cuisine catering with vegetarian and non-vegetarian options, fully customizable menus to suit your preferences and dietary requirements." },
    ],
  },
  "Open Rooftop Dining": {
    hours: "Open evenings from 6:00 PM onwards (weather permitting)",
    capacity: "Up to 40 guests",
    features: ["Panoramic city views", "Ambient string lighting", "Private event bookings", "DJ setup available on request", "Couple's table with personalized service", "Acoustic live music on select nights"],
    sections: [
      { title: "Dining Under the Stars", content: "Experience the magic of dining under the open sky at Hotel Evara's rooftop space. Perched atop the hotel, this enchanting space offers panoramic views of the cityscape, creating an unforgettable ambiance for every occasion." },
      { title: "The Setting", content: "The rooftop is designed with contemporary outdoor furniture, ambient string lights, and lush green accents that create a perfect blend of sophistication and natural beauty. Whether for a romantic dinner or a casual evening with friends, the atmosphere is always extraordinary." },
      { title: "Perfect For", content: "Romantic dinners with a view — special couple's table with personalized service. Private celebrations including birthday parties, anniversaries, and proposal setups. Corporate socials and relaxed networking events. Weekend brunches under sunny skies. Select nights feature live acoustic performances for an enhanced dining experience." },
    ],
  },
};

const HighlightPage = () => {
  const { id, highlightSlug } = useParams();
  const navigateTo = useNavigate();
  const hotel = hotels.find((h) => h.id === id);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [highlightSlug]);

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-display text-foreground" style={{ fontWeight: 300 }}>Not found</h1>
          <button onClick={() => navigateTo("/")} className="mt-4 text-primary underline font-body">Return home</button>
        </div>
      </div>
    );
  }

  const highlight = hotel.highlights.find(
    (h) => h.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "") === highlightSlug
  );

  if (!highlight) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-display text-foreground" style={{ fontWeight: 300 }}>Page not found</h1>
          <button onClick={() => navigateTo(`/hotel/${id}`)} className="mt-4 text-primary underline font-body">Back to {hotel.name}</button>
        </div>
      </div>
    );
  }

  const details = highlightDetails[highlight.title];
  const gallery = useGallery(id || "", `highlight-${highlight.key || highlightSlug}-gallery`, highlight.gallery || [highlight.image], galleryLoopVideo);


  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex items-center justify-between h-12 md:h-14">
          <button onClick={() => navigateTo(`/hotel/${id}`)} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[9px] tracking-wider uppercase font-body hidden sm:inline" style={{ fontWeight: 300 }}>Back</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-xs tracking-[0.15em] uppercase font-display" style={{ fontWeight: 300 }}>{hotel.name}</span>
          </div>
          <div className="w-10" />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[45vh] sm:h-[50vh] md:h-[65vh] overflow-hidden">
        <img src={highlight.image} alt={highlight.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-14">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: hotel.rating }).map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 text-primary fill-primary" />
            ))}
          </div>
          <span className="text-[9px] tracking-[0.3em] uppercase text-primary-foreground/40 font-body" style={{ fontWeight: 300 }}>{hotel.name}</span>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-display text-primary-foreground mt-1 tracking-wide" style={{ fontWeight: 300 }}>
            {highlight.title}
          </h1>
        </div>
      </section>

      {/* Quick Info Bar */}
      {details && (
        <section className="bg-secondary border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-4 flex flex-wrap gap-4 md:gap-6 justify-center text-center">
            {details.hours && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary/50" />
                <span className="text-[9px] sm:text-[10px] font-body" style={{ fontWeight: 300 }}>{details.hours}</span>
              </div>
            )}
            {details.capacity && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-primary/50" />
                <span className="text-[9px] sm:text-[10px] font-body" style={{ fontWeight: 300 }}>{details.capacity}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Content Sections */}
      <section className="section-padding max-w-4xl mx-auto">
        {details?.sections?.map((section, i) => (
          <motion.div
            key={i}
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <span className="text-[9px] tracking-[0.3em] uppercase text-primary/40 font-body" style={{ fontWeight: 300 }}>0{i + 1}</span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-display text-foreground tracking-wide mt-1" style={{ fontWeight: 300 }}>{section.title}</h2>
            <div className="gold-divider-left mt-2 mb-4" />
            <p className="text-sm text-muted-foreground font-body leading-relaxed" style={{ fontWeight: 300 }}>{section.content}</p>
          </motion.div>
        ))}

        {details?.features && details.features.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-display text-foreground tracking-wide mb-4" style={{ fontWeight: 300 }}>Features & Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {details.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/50 border border-border/20">
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  <span className="text-sm text-muted-foreground font-body" style={{ fontWeight: 300 }}>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!details && (
          <div className="mb-10">
            <p className="text-sm text-muted-foreground font-body leading-relaxed" style={{ fontWeight: 300 }}>{highlight.description}</p>
          </div>
        )}

        {/* Professional Media Gallery — video first, then photos */}
        <motion.div
          className="mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <MediaGallery items={gallery} title="Gallery" />
        </motion.div>
      </section>


      {/* CTA */}
      <section className="section-padding text-center" style={{ background: "hsl(var(--foreground))" }}>
        <span className="text-[9px] tracking-[0.3em] uppercase text-primary/60 font-body" style={{ fontWeight: 300 }}>Interested?</span>
        <h2 className="text-lg sm:text-xl md:text-2xl font-display mt-2 text-background tracking-wide" style={{ fontWeight: 300 }}>Make a Reservation</h2>
        <div className="gold-divider mt-3 mb-5" />
        <p className="text-background/30 font-body max-w-sm mx-auto text-sm" style={{ fontWeight: 300 }}>
          Contact us to book or learn more about {highlight.title}.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <a href="tel:+919031027961" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-[9px] tracking-[0.25em] uppercase font-body rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300" style={{ fontWeight: 400 }}>
            <Phone className="w-3 h-3" /> Call Now
          </a>
          <a href="mailto:info@hotelevara.in" className="inline-flex items-center gap-2 px-6 py-2.5 border border-background/15 text-background text-[9px] tracking-[0.25em] uppercase font-body rounded-full hover:bg-background/10 transition-all duration-300" style={{ fontWeight: 400 }}>
            <Mail className="w-3 h-3" /> Email
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "hsl(var(--foreground))" }} className="border-t border-background/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 py-8 text-center">
          <span className="text-base tracking-[0.25em] uppercase font-display text-background" style={{ fontWeight: 300 }}>EVARA Co.</span>
          <p className="text-[9px] text-background/20 font-body mt-3" style={{ fontWeight: 300 }}>© 2025 EVARA Co. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HighlightPage;
