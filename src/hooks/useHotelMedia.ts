import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  sort_order: number;
}

// Cache to avoid re-fetching
const cache = new Map<string, MediaItem[]>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export const invalidateMedia = (hotelId?: string) => {
  if (hotelId) {
    Array.from(cache.keys()).forEach((k) => k.startsWith(hotelId + ":") && cache.delete(k));
  } else {
    cache.clear();
  }
  notify();
};

export function useHotelMedia(hotelId: string, sectionKey: string, fallback: MediaItem[] = []) {
  const cacheKey = `${hotelId}:${sectionKey}`;
  const [items, setItems] = useState<MediaItem[]>(() => cache.get(cacheKey) || fallback);
  const [loading, setLoading] = useState(!cache.has(cacheKey));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cache.has(cacheKey)) {
        setItems(cache.get(cacheKey)!);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("hotel_media")
        .select("id, media_type, url, sort_order")
        .eq("hotel_id", hotelId)
        .eq("section_key", sectionKey)
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error || !data || data.length === 0) {
        cache.set(cacheKey, fallback);
        setItems(fallback);
      } else {
        const mapped: MediaItem[] = data.map((r) => ({
          id: r.id,
          type: r.media_type as "image" | "video",
          url: r.url,
          sort_order: r.sort_order,
        }));
        cache.set(cacheKey, mapped);
        setItems(mapped);
      }
      setLoading(false);
    };
    load();
    const listener = () => {
      if (!cache.has(cacheKey)) load();
      else setItems(cache.get(cacheKey)!);
    };
    listeners.add(listener);
    return () => {
      cancelled = true;
      listeners.delete(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, sectionKey]);

  return { items, loading };
}

export function useRoomPrice(hotelId: string, roomKey: string, fallback: { single?: string; double?: string; display?: string }) {
  const [price, setPrice] = useState(fallback);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("room_pricing")
        .select("single_price, double_price, display_price")
        .eq("hotel_id", hotelId)
        .eq("room_key", roomKey)
        .maybeSingle();
      if (cancelled || !data) return;
      setPrice({
        single: data.single_price ?? fallback.single,
        double: data.double_price ?? fallback.double,
        display: data.display_price ?? fallback.display,
      });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, roomKey]);
  return price;
}

/** Returns first media URL for a section, or fallback. */
export function useMediaUrl(hotelId: string, sectionKey: string, fallback: string): string {
  const { items } = useHotelMedia(hotelId, sectionKey);
  return items[0]?.url || fallback;
}

/** Returns a MediaItem[] (videos first, then by sort), or builds from fallback images. */
export function useGallery(hotelId: string, sectionKey: string, fallbackImages: string[] = [], fallbackVideo?: string): MediaItem[] {
  const { items } = useHotelMedia(hotelId, sectionKey);
  if (items.length > 0) return items;
  const out: MediaItem[] = [];
  if (fallbackVideo) {
    out.push({ id: "fb-video", type: "video", url: fallbackVideo, sort_order: -1 });
  }
  fallbackImages.forEach((url, i) => {
    out.push({ id: `fb-${i}`, type: "image", url, sort_order: i });
  });
  return out;
}

