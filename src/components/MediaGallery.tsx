import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import type { MediaItem } from "@/hooks/useHotelMedia";

interface Props {
  items: MediaItem[];
  title?: string;
  className?: string;
}

/**
 * Professional, responsive media gallery.
 * - Video first, then images
 * - Mobile: swipe-snap horizontal scroller with paged dots
 * - Desktop: featured tile + 4-up grid
 * - Click any media to open lightbox
 */
const MediaGallery = ({ items, title, className = "" }: Props) => {
  // Sort: videos first, then by sort_order
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "video" ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Track active scroll index on mobile
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActive(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (sorted.length === 0) return null;

  const scrollTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={className}>
      {title && (
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-sm md:text-base font-display tracking-[0.15em] uppercase text-foreground" style={{ fontWeight: 500 }}>
            {title}
          </h4>
          <span className="text-[9px] tracking-[0.3em] uppercase font-body text-muted-foreground/60">
            {sorted.length} {sorted.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      )}

      {/* ===== MOBILE: swipeable horizontal scroller ===== */}
      <div className="md:hidden -mx-5">
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {sorted.map((item, i) => (
            <div key={item.id || i} className="min-w-full snap-center px-5">
              <div
                className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-muted cursor-pointer"
                onClick={() => setLightbox(item)}
              >
                {item.type === "video" ? (
                  <>
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute top-3 left-3 bg-foreground/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Play className="w-3 h-3 fill-current" style={{ color: "hsl(var(--gold))" }} />
                      <span className="text-[8px] tracking-[0.3em] uppercase text-background">Video</span>
                    </div>
                  </>
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                )}
                {/* Gold corner */}
                <span className="absolute top-2 right-2 w-5 h-5 border-t border-r" style={{ borderColor: "hsl(var(--gold) / 0.6)" }} />
                <span className="absolute bottom-2 left-2 w-5 h-5 border-b border-l" style={{ borderColor: "hsl(var(--gold) / 0.6)" }} />
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {sorted.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 20 : 6,
                background: i === active ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.25)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <p className="text-center text-[9px] tracking-[0.3em] uppercase text-muted-foreground/50 font-body mt-3">
          Swipe to view more
        </p>
      </div>

      {/* ===== DESKTOP: editorial mosaic — large featured + 4 thumbs ===== */}
      <div className="hidden md:grid grid-cols-12 gap-3 lg:gap-4">
        {/* Featured (first item, usually video) */}
        <div
          className="col-span-8 row-span-2 relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted cursor-pointer group"
          onClick={() => setLightbox(sorted[0])}
        >
          {sorted[0].type === "video" ? (
            <video
              src={sorted[0].url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          ) : (
            <img
              src={sorted[0].url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          )}
          {sorted[0].type === "video" && (
            <div className="absolute top-4 left-4 bg-foreground/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full flex items-center gap-2">
              <Play className="w-3 h-3 fill-current" style={{ color: "hsl(var(--gold))" }} />
              <span className="text-[9px] tracking-[0.3em] uppercase text-background font-body">Featured Video</span>
            </div>
          )}
          {/* Gold frame */}
          <span className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: "hsl(var(--gold) / 0.7)" }} />
          <span className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: "hsl(var(--gold) / 0.7)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Thumbnails (next 4) */}
        {sorted.slice(1, 5).map((item, i) => (
          <motion.div
            key={item.id || i}
            className="col-span-2 aspect-square relative overflow-hidden rounded-xl bg-muted cursor-pointer group"
            onClick={() => setLightbox(item)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            {item.type === "video" ? (
              <video src={item.url} className="w-full h-full object-cover" muted loop playsInline preload="metadata" />
            ) : (
              <img src={item.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            )}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors" />
          </motion.div>
        ))}

        {/* "View all" tile if more */}
        {sorted.length > 5 && (
          <div
            className="col-span-2 aspect-square relative overflow-hidden rounded-xl cursor-pointer flex items-center justify-center group"
            style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.3)" }}
            onClick={() => setLightbox(sorted[5])}
          >
            <div className="text-center">
              <span className="block text-2xl font-display" style={{ color: "hsl(var(--gold))", fontWeight: 300 }}>
                +{sorted.length - 5}
              </span>
              <span className="text-[8px] tracking-[0.3em] uppercase text-muted-foreground font-body">More</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/95 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/20"
              onClick={() => setLightbox(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/20"
              onClick={(e) => {
                e.stopPropagation();
                const idx = sorted.findIndex((s) => s.id === lightbox.id);
                setLightbox(sorted[(idx - 1 + sorted.length) % sorted.length]);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center text-background hover:bg-background/20"
              onClick={(e) => {
                e.stopPropagation();
                const idx = sorted.findIndex((s) => s.id === lightbox.id);
                setLightbox(sorted[(idx + 1) % sorted.length]);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <motion.div
              key={lightbox.id}
              className="max-w-[92vw] max-h-[88vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.type === "video" ? (
                <video src={lightbox.url} controls autoPlay className="max-w-[92vw] max-h-[88vh] rounded-lg shadow-2xl" />
              ) : (
                <img src={lightbox.url} alt="" className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
