import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Film, Upload, Loader2, RotateCcw, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  useTransitionVideo,
  invalidateTransitionVideo,
  fetchTransitionVideo,
  GLOBAL_TRANSITION_ID,
} from "@/hooks/useTransitionVideo";
import { toast } from "sonner";

interface TransitionVideoManagerProps {
  /** Scope: pass a hotel id for per-hotel, or omit for the global default. */
  scope?: string;
  title?: string;
  description?: string;
}

const verifyVideoLoads = (url: string) =>
  new Promise<boolean>((resolve) => {
    const timeout = window.setTimeout(() => resolve(false), 10000);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => { window.clearTimeout(timeout); resolve(true); };
    v.onerror = () => { window.clearTimeout(timeout); resolve(false); };
    v.src = url;
  });

const TransitionVideoManager = ({
  scope = GLOBAL_TRANSITION_ID,
  title,
  description,
}: TransitionVideoManagerProps) => {
  const current = useTransitionVideo(scope);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUrl = previewUrl || current.mp4Url;
  // A per-hotel scope with no custom row falls back to the global custom (if any)
  // or the built-in default. `current.scope` tells us which row actually resolved.
  const hasOwnCustom = current.isCustom && current.scope === scope;
  const inheritedGlobal = current.isCustom && current.scope !== scope;

  const heading = title ?? (scope === GLOBAL_TRANSITION_ID
    ? "Global Transition Video"
    : "Hotel Transition Video");

  const onPick = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);
    setPreviewName(file.name);
    (fileInputRef.current as unknown as { _file?: File })._file = file;
  };

  const saveUpload = async () => {
    const file = (fileInputRef.current as unknown as { _file?: File })?._file;
    if (!file) { toast.error("No file selected"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${scope}/transition-video/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("hotel-media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || "video/mp4",
      });
      if (upErr) throw upErr;
      const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
      const { data: signed, error: signErr } = await supabase.storage
        .from("hotel-media")
        .createSignedUrl(path, TEN_YEARS);
      if (signErr || !signed?.signedUrl) throw signErr || new Error("Could not create URL");
      const url = signed.signedUrl;

      const loads = await verifyVideoLoads(url);
      if (!loads) {
        await supabase.storage.from("hotel-media").remove([path]).catch(() => {});
        throw new Error("Uploaded video could not be verified — try a different file.");
      }

      // Remove old rows for THIS scope so the newest wins & storage stays clean.
      const { data: oldRows } = await supabase
        .from("hotel_media")
        .select("id, url")
        .eq("hotel_id", scope)
        .eq("section_key", "transition-video");
      if (oldRows?.length) {
        for (const r of oldRows) {
          const m = r.url.match(/hotel-media\/(.+?)(\?|$)/);
          if (m) await supabase.storage.from("hotel-media").remove([m[1]]).catch(() => {});
        }
        await supabase.from("hotel_media").delete().eq("hotel_id", scope).eq("section_key", "transition-video");
      }

      const { error: insErr } = await supabase.from("hotel_media").insert({
        hotel_id: scope,
        section_key: "transition-video",
        media_type: "video",
        url,
        sort_order: 0,
      });
      if (insErr) throw insErr;

      invalidateTransitionVideo(scope);
      await fetchTransitionVideo(scope);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewName(null);
      (fileInputRef.current as unknown as { _file?: File })._file = undefined;
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Transition video replaced — live now");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewName(null);
    (fileInputRef.current as unknown as { _file?: File })._file = undefined;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetToDefault = async () => {
    if (!confirm("Reset this transition video to the default?")) return;
    setResetting(true);
    try {
      const { data: oldRows } = await supabase
        .from("hotel_media")
        .select("id, url")
        .eq("hotel_id", scope)
        .eq("section_key", "transition-video");
      if (oldRows?.length) {
        for (const r of oldRows) {
          const m = r.url.match(/hotel-media\/(.+?)(\?|$)/);
          if (m) await supabase.storage.from("hotel-media").remove([m[1]]).catch(() => {});
        }
        await supabase.from("hotel_media").delete().eq("hotel_id", scope).eq("section_key", "transition-video");
      }
      invalidateTransitionVideo(scope);
      toast.success("Restored default transition video");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Reset failed";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-video bg-foreground/5">
          <video
            key={previewUrl || `${current.scope}-${current.version}`}
            src={activeUrl}
            poster={current.posterUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div
            className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full backdrop-blur-md text-[9px] tracking-[0.3em] uppercase font-body"
            style={{ background: "hsl(var(--background) / 0.85)", border: "1px solid hsl(var(--border))" }}
          >
            {previewUrl ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Preview</span>
              </>
            ) : hasOwnCustom ? (
              <>
                <CheckCircle2 className="w-3 h-3" style={{ color: "hsl(var(--gold))" }} />
                <span>Custom · Live</span>
              </>
            ) : inheritedGlobal ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--gold))" }} />
                <span>Inherits Global</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--muted-foreground))" }} />
                <span>Default</span>
              </>
            )}
          </div>
        </div>

        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Film className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
            <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">{heading}</span>
          </div>
          <h4 className="font-display text-xl mb-3" style={{ fontWeight: 400 }}>
            Cinematic gate approach
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {description ?? (scope === GLOBAL_TRANSITION_ID
              ? "Default transition used across the site when a guest opens a hotel."
              : "Custom transition used when a guest opens this hotel. Falls back to the global video if none is set.")} Upload
            an MP4 or WebM (H.264/VP9, HD, 2–5&nbsp;seconds, under ~5&nbsp;MB recommended). Live changes appear instantly.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
          />

          {previewName && (
            <p className="text-[11px] text-muted-foreground/80 mb-3 truncate">
              Selected: <span className="text-foreground/80">{previewName}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {!previewUrl ? (
              <>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-3.5 h-3.5 mr-2" />
                  Choose new video
                </Button>
                {hasOwnCustom && (
                  <Button size="sm" variant="outline" onClick={resetToDefault} disabled={resetting}>
                    {resetting ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-2" />}
                    Restore default
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="sm" onClick={saveUpload} disabled={uploading}>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-2" />}
                  {uploading ? "Uploading…" : "Save & publish"}
                </Button>
                <Button size="sm" variant="outline" onClick={clearPreview} disabled={uploading}>
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Discard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitionVideoManager;
