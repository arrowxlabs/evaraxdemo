import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Global hotel transition video. Stored in hotel_media with a reserved
 * hotel_id of "__global__" and section_key "transition-video".
 * Returns { mp4Url, posterUrl, version } — the version is appended as a
 * cache-busting query string so a fresh upload replaces the video everywhere
 * immediately.
 */
const DEFAULT_MP4 = "/transitions/evara-transition-fast.mp4";
const DEFAULT_WEBM = "/transitions/evara-transition-fast.webm";
const DEFAULT_POSTER = "/transitions/evara-transition-poster.jpg";

export interface TransitionVideo {
  mp4Url: string;
  webmUrl?: string;
  posterUrl: string;
  isCustom: boolean;
  version: string;
  id?: string;
}

const cache: { value: TransitionVideo | null } = { value: null };
const listeners = new Set<() => void>();

export const invalidateTransitionVideo = () => {
  cache.value = null;
  listeners.forEach((l) => l());
};

const buildDefault = (): TransitionVideo => ({
  mp4Url: DEFAULT_MP4,
  webmUrl: DEFAULT_WEBM,
  posterUrl: DEFAULT_POSTER,
  isCustom: false,
  version: "default",
});

export const fetchTransitionVideo = async (): Promise<TransitionVideo> => {
  const { data } = await supabase
    .from("hotel_media")
    .select("id, url, created_at, media_type")
    .eq("hotel_id", "__global__")
    .eq("section_key", "transition-video")
    .order("created_at", { ascending: false })
    .limit(1);
  const row = data?.[0];
  if (!row || row.media_type !== "video") return buildDefault();
  const version = String(new Date(row.created_at).getTime());
  const sep = row.url.includes("?") ? "&" : "?";
  return {
    mp4Url: `${row.url}${sep}v=${version}`,
    posterUrl: DEFAULT_POSTER,
    isCustom: true,
    version,
    id: row.id,
  };
};

export function useTransitionVideo(): TransitionVideo {
  const [value, setValue] = useState<TransitionVideo>(cache.value ?? buildDefault());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const v = await fetchTransitionVideo();
      if (cancelled) return;
      cache.value = v;
      setValue(v);
    };
    if (!cache.value) load();
    const listener = () => {
      if (!cache.value) load();
      else setValue(cache.value);
    };
    listeners.add(listener);
    return () => {
      cancelled = true;
      listeners.delete(listener);
    };
  }, []);

  return value;
}
