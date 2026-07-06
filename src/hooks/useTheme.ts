import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ThemeName = "forest" | "royal";

const STORAGE_KEY = "evara-theme";
const SITE_SCOPE = "__site__";
const SECTION_KEY = "theme";

const listeners = new Set<(t: ThemeName) => void>();
let current: ThemeName =
  (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY) as ThemeName)) || "forest";

const apply = (t: ThemeName) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = t;
};

apply(current);

const setLocal = (t: ThemeName) => {
  current = t;
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, t);
  apply(t);
  listeners.forEach((l) => l(t));
};

/** Fetch the site-wide theme from the backend (falls back to local). */
export const syncThemeFromServer = async () => {
  try {
    const { data } = await supabase
      .from("hotel_media")
      .select("url,created_at")
      .eq("hotel_id", SITE_SCOPE)
      .eq("section_key", SECTION_KEY)
      .order("created_at", { ascending: false })
      .limit(1);
    const remote = data?.[0]?.url as ThemeName | undefined;
    if (remote && (remote === "forest" || remote === "royal") && remote !== current) {
      setLocal(remote);
    }
  } catch {
    /* ignore */
  }
};

export const setTheme = async (t: ThemeName) => {
  setLocal(t); // instant local apply
  try {
    // wipe previous rows for this scope, then insert
    await supabase
      .from("hotel_media")
      .delete()
      .eq("hotel_id", SITE_SCOPE)
      .eq("section_key", SECTION_KEY);
    await supabase.from("hotel_media").insert({
      hotel_id: SITE_SCOPE,
      section_key: SECTION_KEY,
      media_type: "theme",
      url: t,
    });
  } catch {
    /* ignore — local still applied */
  }
};

export function useTheme(): [ThemeName, (t: ThemeName) => Promise<void>] {
  const [value, setValue] = useState<ThemeName>(current);
  useEffect(() => {
    const l = (t: ThemeName) => setValue(t);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [value, setTheme];
}
