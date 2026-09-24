import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { hotels } from "@/data/hotels";
import { useMediaUrl } from "@/hooks/useHotelMedia";
import { Button } from "@/components/ui/button";

type Hotel = (typeof hotels)[number];

const presentation = [
  { name: "The Evara", tagline: "A refined urban escape" },
  { name: "The Dalaan Resort", tagline: "Nature meets luxury" },
  { name: "Evara Exotica", tagline: "Where elegance lives" },
];

function HotelEditorialRow({
  hotel,
  index,
  onClickHotel,
}: {
  hotel: Hotel;
  index: number;
  onClickHotel: (hotel: Hotel) => void;
}) {
  const rowRef = useRef<HTMLElement>(null);
  const inView = useInView(rowRef, { once: true, margin: "-12% 0px" });
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [18, -18]);
  const mediaUrl = useMediaUrl(hotel.id, "homepage-card", hotel.cardImage);
  const [imageFailed, setImageFailed] = useState(false);
  const copy = presentation[index] ?? { name: hotel.name, tagline: hotel.tagline };
  const reverse = index % 2 === 1;

  return (
    <motion.article
      ref={rowRef}
      className={`hotel-editorial-row ${reverse ? "hotel-editorial-row--reverse" : ""}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 54 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="hotel-editorial-copy"
        initial={{ opacity: 0, x: reducedMotion ? 0 : reverse ? 26 : -26 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.12 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hotel-editorial-number">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <i aria-hidden />
        </div>
        <h3>{copy.name}</h3>
        <p className="hotel-editorial-tagline">{copy.tagline}</p>
        <p className="hotel-editorial-location"><MapPin aria-hidden /> Darbhanga, Bihar</p>
        <div className="hotel-editorial-action">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hotel-editorial-arrow"
            onClick={() => onClickHotel(hotel)}
            aria-label={`Explore ${copy.name}`}
          >
            <ArrowRight aria-hidden />
          </Button>
          <Button className="hotel-editorial-link" type="button" variant="link" onClick={() => onClickHotel(hotel)}>
            {hotel.id === "evara-exotica" ? "Coming soon" : "Explore hotel"}
          </Button>
          <i aria-hidden />
        </div>
      </motion.div>

      <motion.div
        role="button"
        tabIndex={0}
        className="hotel-editorial-media"
        onClick={() => onClickHotel(hotel)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onClickHotel(hotel);
        }}
        aria-label={`Open ${copy.name}`}
        initial={{ clipPath: reverse ? "polygon(0 0, 0 0, 0 100%, 0 100%)" : "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
        animate={inView ? {
          clipPath: reverse
            ? "polygon(0 0, 86% 0, 100% 100%, 0 100%)"
            : "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
        } : {}}
        transition={{ duration: 1.05, delay: 0.08 + index * 0.08, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.img
          src={imageFailed ? hotel.cardImage : mediaUrl}
          alt={copy.name}
          onError={() => setImageFailed(true)}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          style={{ y: imageY }}
        />
        <span className="hotel-editorial-sheen" aria-hidden />
      </motion.div>
    </motion.article>
  );
}

export default function HotelShowcase({ onClickHotel }: { onClickHotel: (hotel: Hotel) => void }) {
  return (
    <section id="properties" className="hotel-editorial-section">
      <div className="hotel-editorial-intro">
        <span>Our destinations</span>
        <h2>Three expressions of Evara</h2>
        <p>City refinement, restorative nature, and a new chapter of modern hospitality.</p>
      </div>
      <div className="hotel-editorial-list">
        {hotels.map((hotel, index) => (
          <HotelEditorialRow key={hotel.id} hotel={hotel} index={index} onClickHotel={onClickHotel} />
        ))}
      </div>
      <div className="hotel-editorial-signature" aria-label="The Evara Group">
        <span className="hotel-editorial-monogram" aria-hidden>Є</span>
        <span><strong>The Evara Group</strong><small>Hotels · Resorts · Experiences</small></span>
        <i aria-hidden />
        <small>A brighter tomorrow</small>
      </div>
    </section>
  );
}