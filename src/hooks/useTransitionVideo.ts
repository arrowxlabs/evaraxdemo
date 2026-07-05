import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hotel transition video. Supports a global default (hotel_id = "__global__")
 * plus per-hotel overrides. Videos live in the `hotel_media` table under
 * section_key "transition-video". Returns cache-busted URLs so a fresh upload
 * replaces the video everywhere instantly.
 */
const DEFAULT_MP4 = "/transitions/evara-transition-fast.mp4";
const DEFAULT_WEBM = "/transitions/evara-transition-fast.webm";
const DEFAULT_POSTER = "/transitions/evara-transition-poster.jpg";

export const GLOBAL_TRANSITION_ID = "__global__";

export interface TransitionVideo {
  mp4Url: string;
  webmUrl?: string;
  posterUrl: string;
  isCustom: boolean;
  version: string;
  id?: string;
  scope: string; // "__global__" or hotel id
}

const caches: Record<string, TransitionVideo | null> = {};
const listeners: Record<string, Set<() => void>> = {};

const getListeners = (scope: string) => {
  if (!listeners[scope]) listeners[scope] = new Set();
  return listeners[scope];
};

export const invalidateTransitionVideo = (scope: string = GLOBAL_TRANSITION_ID) => {
  caches[scope] = null;
  getListeners(scope).forEach((l) => l());
};

const buildDefault = (scope: string): TransitionVideo => ({
  mp4Url: DEFAULT_MP4,
  webmUrl: DEFAULT_WEBM,
  posterUrl: DEFAULT_POSTER,
  isCustom: false,
  version: "default",
  scope,
});

export const fetchTransitionVideo = async (
  scope: string = GLOBAL_TRANSITION_ID,
): Promise<TransitionVideo> => {
  const { data } = await supabase
    .from("hotel_media")
    .select("id, url, created_at, media_type")
    .eq("hotel_id", scope)
    .eq("section_key", "transition-video")
    .order("created_at", { ascending: false })
    .limit(1);
  const row = data?.[0];
  if (!row || row.media_type !== "video") {
    // Per-hotel scopes fall back to the global custom video when set,
    // then finally to the built-in default.
    if (scope !== GLOBAL_TRANSITION_ID) {
      return fetchTransitionVideo(GLOBAL_TRANSITION_ID);
    }
    return buildDefault(scope);
  }
  const version = String(new Date(row.created_at).getTime());
  const sep = row.url.includes("?") ? "&" : "?";
  return {
    mp4Url: `${row.url}${sep}v=${version}`,
    posterUrl: DEFAULT_POSTER,
    isCustom: true,
    version,
    id: row.id,
    scope,
  };
};

export function useTransitionVideo(scope: string = GLOBAL_TRANSITION_ID): TransitionVideo {
  const [value, setValue] = useState<TransitionVideo>(caches[scope] ?? buildDefault(scope));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const v = await fetchTransitionVideo(scope);
      if (cancelled) return;
      caches[scope] = v;
      setValue(v);
    };
    if (!caches[scope]) load();
    else setValue(caches[scope]!);

    const listener = () => {
      if (!caches[scope]) load();
      else setValue(caches[scope]!);
    };
    getListeners(scope).add(listener);
    return () => {
      cancelled = true;
      getListeners(scope).delete(listener);
    };
  }, [scope]);

  return value;
}
