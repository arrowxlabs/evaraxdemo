import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { hotels } from "@/data/hotels";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut, Image as ImageIcon, ShieldCheck, Film, Upload, Loader2, RotateCcw, Trash2, CheckCircle2 } from "lucide-react";
import LuxuryOrnament from "@/components/LuxuryOrnament";
import { supabase } from "@/integrations/supabase/client";
import {
  useTransitionVideo,
  invalidateTransitionVideo,
  fetchTransitionVideo,
} from "@/hooks/useTransitionVideo";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_gate") !== "1") {
      navigate("/admin/login");
      return;
    }
    setReady(true);
  }, [navigate]);

  const signOut = () => {
    sessionStorage.removeItem("admin_gate");
    navigate("/admin/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.3)" }}>
              <ShieldCheck className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
            </div>
            <div>
              <h1 className="font-display text-base leading-none" style={{ fontWeight: 500 }}>EVARA Admin</h1>
              <span className="text-[10px] text-muted-foreground tracking-wider">Content Manager</span>
            </div>
          </div>
          <Button onClick={signOut} variant="ghost" size="sm"><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="text-center mb-14">
          <LuxuryOrnament width={140} className="mx-auto mb-4" />
          <span className="text-[10px] tracking-[0.45em] uppercase text-muted-foreground font-body">Properties</span>
          <h2 className="text-3xl md:text-4xl font-display mt-3" style={{ fontWeight: 300 }}>
            Manage your <span className="italic" style={{ color: "hsl(var(--gold))" }}>hotels</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
            Choose a property to update photos, videos, and pricing. Changes appear on the live site instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {hotels.map((h) => (
            <Link
              key={h.id}
              to={`/admin/hotel/${h.id}`}
              className="block group rounded-2xl overflow-hidden bg-card luxe-lift"
              style={{ border: "1px solid hsl(var(--border))" }}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img src={h.cardImage} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur text-[9px] tracking-[0.3em] uppercase font-body" style={{ color: "hsl(var(--gold))" }}>
                  Manage
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-display text-lg truncate" style={{ fontWeight: 500 }}>{h.name}</h3>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1.5 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> {h.highlights.length + h.rooms.length + 3} sections
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Site-wide settings */}
        <div className="mb-6">
          <span className="text-[10px] tracking-[0.45em] uppercase text-muted-foreground font-body">Site Settings</span>
          <h3 className="text-2xl font-display mt-2" style={{ fontWeight: 300 }}>Global media</h3>
        </div>

        <TransitionVideoManager />


        <div className="p-6 rounded-2xl flex items-start gap-4" style={{ background: "hsl(var(--gold) / 0.05)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
          <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "hsl(var(--gold))" }} />
          <div>
            <h4 className="font-display text-sm mb-1" style={{ fontWeight: 500 }}>How uploads work</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inside each property, every section has its own card — view current media, add new photos or videos, and
              remove anything you don't need. Videos always appear first in galleries on the live site.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ---------- Transition Video Manager ---------- */

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

const TransitionVideoManager = () => {
  const current = useTransitionVideo();
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUrl = previewUrl || current.mp4Url;

  const onPick = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);
    setPreviewName(file.name);
    (fileInputRef.current as any)._file = file;
  };

  const saveUpload = async () => {
    const file: File | undefined = (fileInputRef.current as any)?._file;
    if (!file) { toast.error("No file selected"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `__global__/transition-video/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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

      // Remove old custom transition rows so the newest wins & storage stays clean.
      const { data: oldRows } = await supabase
        .from("hotel_media")
        .select("id, url")
        .eq("hotel_id", "__global__")
        .eq("section_key", "transition-video");
      if (oldRows?.length) {
        for (const r of oldRows) {
          const m = r.url.match(/hotel-media\/(.+?)(\?|$)/);
          if (m) await supabase.storage.from("hotel-media").remove([m[1]]).catch(() => {});
        }
        await supabase.from("hotel_media").delete().eq("hotel_id", "__global__").eq("section_key", "transition-video");
      }

      const { error: insErr } = await supabase.from("hotel_media").insert({
        hotel_id: "__global__",
        section_key: "transition-video",
        media_type: "video",
        url,
        sort_order: 0,
      });
      if (insErr) throw insErr;

      invalidateTransitionVideo();
      await fetchTransitionVideo();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewName(null);
      (fileInputRef.current as any)._file = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Transition video replaced — live now");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewName(null);
    (fileInputRef.current as any)._file = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetToDefault = async () => {
    if (!confirm("Reset the transition video to the built-in default?")) return;
    setResetting(true);
    try {
      const { data: oldRows } = await supabase
        .from("hotel_media")
        .select("id, url")
        .eq("hotel_id", "__global__")
        .eq("section_key", "transition-video");
      if (oldRows?.length) {
        for (const r of oldRows) {
          const m = r.url.match(/hotel-media\/(.+?)(\?|$)/);
          if (m) await supabase.storage.from("hotel-media").remove([m[1]]).catch(() => {});
        }
        await supabase.from("hotel_media").delete().eq("hotel_id", "__global__").eq("section_key", "transition-video");
      }
      invalidateTransitionVideo();
      toast.success("Restored default transition video");
    } catch (e: any) {
      toast.error(e.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-card mb-8" style={{ border: "1px solid hsl(var(--border))" }}>
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-video bg-foreground/5">
          <video
            key={previewUrl || current.version}
            src={activeUrl}
            poster={current.posterUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full backdrop-blur-md text-[9px] tracking-[0.3em] uppercase font-body" style={{ background: "hsl(var(--background) / 0.85)", border: "1px solid hsl(var(--border))" }}>
            {previewUrl ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Preview</span>
              </>
            ) : current.isCustom ? (
              <>
                <CheckCircle2 className="w-3 h-3" style={{ color: "hsl(var(--gold))" }} />
                <span>Custom · Live</span>
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
            <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">Hotel Transition Video</span>
          </div>
          <h4 className="font-display text-xl mb-3" style={{ fontWeight: 400 }}>
            Cinematic gate approach
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Plays when a guest opens Hotel Evara from the homepage. Upload an MP4 or WebM
            (H.264/VP9, ~2–5&nbsp;seconds, under 8&nbsp;MB recommended). Live changes appear
            instantly on the site.
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
                {current.isCustom && (
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

export default Admin;
