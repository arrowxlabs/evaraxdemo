import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MediaGallery from "@/components/MediaGallery";
import { useGallery, useRoomPrice } from "@/hooks/useHotelMedia";
import { galleryLoopVideo } from "@/data/hotels";

/**
 * Per-room editorial section: title, image, description, amenities, gallery, pricing, reserve.
 * Extracted from HotelPage so it can also be rendered on the Comfortable Rooms & Suites
 * highlight page.
 */
const RoomSection = ({
  hotelId,
  room,
  index,
  reserveHref = "#booking",
}: {
  hotelId: string;
  room: any;
  index: number;
  reserveHref?: string;
}) => {
  const gallery = useGallery(
    hotelId,
    `room-${room.key}-gallery`,
    room.gallery || [room.image],
    galleryLoopVideo,
  );
  const mainImageItems = useGallery(hotelId, `room-${room.key}-main`, [room.image]);
  const mainImage = mainImageItems[0]?.url || room.image;
  const price = useRoomPrice(hotelId, room.key, {
    single: room.singlePrice,
    double: room.doublePrice,
    display: room.price,
  });
  const reverse = index % 2 === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex items-baseline gap-4 mb-6">
        <span className="text-3xl md:text-4xl font-display" style={{ color: "hsl(var(--gold))", fontWeight: 300 }}>
          0{index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] tracking-[0.45em] uppercase font-body text-muted-foreground" style={{ fontWeight: 400 }}>
            Residence
          </span>
          <h3 className="text-2xl md:text-4xl font-display tracking-wide text-foreground" style={{ fontWeight: 400 }}>
            {room.name}
          </h3>
        </div>
        <div className="hidden sm:block h-px flex-1 max-w-[120px]" style={{ background: "hsl(var(--gold) / 0.4)" }} />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="lg:col-span-7 relative">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <img src={mainImage} alt={room.name} className="w-full aspect-[4/3] object-cover" loading="lazy" />
            <span className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: "hsl(var(--gold) / 0.7)" }} />
            <span className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: "hsl(var(--gold) / 0.7)" }} />
          </div>
        </div>
        <div className="lg:col-span-5">
          <p className="text-[15px] text-muted-foreground leading-[1.85] font-body" style={{ fontWeight: 300 }}>
            {room.description}
          </p>

          <div className="mt-6">
            <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground font-body">Amenities</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {(room.amenities || room.features).map((a: string) => (
                <span
                  key={a}
                  className="text-[10px] px-3 py-1.5 rounded-full font-body tracking-wide"
                  style={{
                    background: "hsl(var(--gold) / 0.08)",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--gold) / 0.18)",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
              <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-body block">Single</span>
              <span className="text-xl font-display text-foreground mt-1 block" style={{ fontWeight: 500 }}>
                {price.single || price.display}
              </span>
              <span className="text-[9px] text-muted-foreground/60 font-body">/night</span>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.3)" }}>
              <span className="text-[9px] tracking-[0.3em] uppercase font-body block" style={{ color: "hsl(var(--gold))" }}>Double</span>
              <span className="text-xl font-display mt-1 block" style={{ fontWeight: 500, color: "hsl(var(--gold))" }}>
                {price.double || price.display}
              </span>
              <span className="text-[9px] text-muted-foreground/60 font-body">/night</span>
            </div>
          </div>

          <a
            href={reserveHref}
            className="luxe-shimmer mt-6 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 text-[10px] tracking-[0.28em] uppercase font-body"
            style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))", fontWeight: 400 }}
          >
            Reserve {room.name} <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="mt-10">
        <MediaGallery items={gallery} title={`${room.name} Gallery`} />
      </div>
    </motion.div>
  );
};

export default RoomSection;
