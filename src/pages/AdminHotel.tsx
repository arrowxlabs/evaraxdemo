import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hotels } from "@/data/hotels";
import { invalidateMedia } from "@/hooks/useHotelMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Trash2, Loader2, Save, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";

interface MediaRow {
  id: string;
  hotel_id: string;
  section_key: string;
  media_type: "image" | "video";
  url: string;
  sort_order: number;
}

interface SectionDef {
  key: string;
  label: string;
  hint?: string;
}

const AdminHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hotel = hotels.find((h) => h.id === id);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [pricing, setPricing] = useState<Record<string, { single: string; double: string; display: string }>>({});
  const [savingPrice, setSavingPrice] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  // Verify admin
  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/admin/login");
        return;
      }
      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", sessionData.session.user.id)
        .maybeSingle();
      setIsAdmin(!!adminRow);
      setChecking(false);
    })();
  }, [navigate]);

  // Load all media for this hotel
  const loadMedia = async () => {
    if (!hotel) return;
    const { data } = await supabase
      .from("hotel_media")
      .select("*")
      .eq("hotel_id", hotel.id)
      .order("sort_order", { ascending: true });
    setMedia((data as MediaRow[]) || []);
  };

  const loadPricing = async () => {
    if (!hotel) return;
    const { data } = await supabase
      .from("room_pricing")
      .select("*")
      .eq("hotel_id", hotel.id);
    const map: Record<string, { single: string; double: string; display: string }> = {};
    hotel.rooms.forEach((r) => {
      const row = data?.find((d: any) => d.room_key === r.key);
      map[r.key] = {
        single: row?.single_price || r.singlePrice || "",
        double: row?.double_price || r.doublePrice || "",
        display: row?.display_price || r.price || "",
      };
    });
    setPricing(map);
  };

  useEffect(() => {
    if (isAdmin) {
      loadMedia();
      loadPricing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, id]);

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-center px-5"><div><p className="text-sm">Access denied</p><Link to="/admin/login" className="text-xs underline text-primary mt-2 block">Sign in</Link></div></div>;
  if (!hotel) return <div className="min-h-screen flex items-center justify-center">Hotel not found</div>;

  const heroSections: SectionDef[] = [
    { key: "hero", label: "Hero Image", hint: "First image visible when the hotel page opens" },
    { key: "main-gallery", label: "Main Gallery (Moments & Spaces mosaic)", hint: "Used on the Hotel Evara page mosaic" },
    { key: "evara-loop-video", label: "Step Into Evara — Looping Video", hint: "Cinematic 9:16 video tile after Explore Experiences" },
  ];
  const highlightGroups = hotel.highlights.map((h) => ({
    title: h.title,
    sections: [
      { key: `highlight-${h.key}-main`, label: `${h.title} — Main Picture`, hint: "Shown on the Hotel Evara page" },
      { key: `highlight-${h.key}-gallery`, label: `${h.title} — Gallery`, hint: "Videos + photos for the dedicated experience page" },
    ] as SectionDef[],
  }));
  const roomGroups = hotel.rooms.map((r) => ({
    title: r.name,
    sections: [
      { key: `room-${r.key}-main`, label: `${r.name} — Main Image` },
      { key: `room-${r.key}-gallery`, label: `${r.name} — Gallery (video + photos)` },
    ] as SectionDef[],
  }));

  const uploadFile = async (sectionKey: string, file: File, type: "image" | "video") => {
    setUploading(sectionKey);
    try {
      const ext = file.name.split(".").pop() || (type === "video" ? "mp4" : "jpg");
      const path = `${hotel.id}/${sectionKey}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("hotel-media").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || (type === "video" ? "video/mp4" : "image/jpeg"),
      });
      if (upErr) throw upErr;
      // Bucket is private — generate a long-lived signed URL (10 years) so the public site can display it.
      const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
      const { data: signed, error: signErr } = await supabase.storage
        .from("hotel-media")
        .createSignedUrl(path, TEN_YEARS);
      if (signErr || !signed?.signedUrl) throw signErr || new Error("Could not create URL");
      const url = signed.signedUrl;
      const maxOrder = Math.max(0, ...media.filter((m) => m.section_key === sectionKey).map((m) => m.sort_order));
      const { error: insErr } = await supabase.from("hotel_media").insert({
        hotel_id: hotel.id,
        section_key: sectionKey,
        media_type: type,
        url,
        sort_order: maxOrder + 1,
      });
      if (insErr) throw insErr;
      toast.success("Uploaded");
      invalidateMedia(hotel.id);
      loadMedia();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const deleteMedia = async (m: MediaRow) => {
    if (!confirm("Delete this media?")) return;
    // Try to remove from storage too (best effort)
    const pathMatch = m.url.match(/hotel-media\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from("hotel-media").remove([pathMatch[1]]).catch(() => {});
    }
    await supabase.from("hotel_media").delete().eq("id", m.id);
    toast.success("Deleted");
    invalidateMedia(hotel.id);
    loadMedia();
  };

  const savePricing = async (roomKey: string) => {
    setSavingPrice(roomKey);
    try {
      const p = pricing[roomKey];
      const { error } = await supabase.from("room_pricing").upsert({
        hotel_id: hotel.id,
        room_key: roomKey,
        single_price: p.single || null,
        double_price: p.double || null,
        display_price: p.display || null,
      });
      if (error) throw error;
      toast.success("Pricing saved");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSavingPrice(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to hotels
          </Link>
          <span className="text-xs tracking-[0.2em] uppercase font-display">{hotel.name}</span>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-16">
        {/* GROUP 01 — HOTEL PAGE ESSENTIALS */}
        <GroupHeader eyebrow="Group 01" title="Hotel Page Essentials" description="Hero image, main gallery and the looping intro video." />
        <div className="grid gap-5">
          {heroSections.map((s) => (
            <SectionEditor key={s.key} section={s} items={media.filter((m) => m.section_key === s.key)} uploading={uploading === s.key} onUpload={(f, t) => uploadFile(s.key, f, t)} onDelete={deleteMedia} />
          ))}
        </div>

        {/* GROUP 02 — HIGHLIGHTS (Restaurant, Banquet, Rooms-overview) */}
        {highlightGroups.length > 0 && (
          <div className="space-y-10">
            <GroupHeader eyebrow="Group 02" title="Experiences & Highlights" description="Each experience has a main picture (Hotel Evara page) and its own gallery (dedicated page)." />
            {highlightGroups.map((g) => (
              <div key={g.title}>
                <h3 className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: "hsl(var(--gold))" }}>{g.title}</h3>
                <div className="grid gap-5">
                  {g.sections.map((s) => (
                    <SectionEditor key={s.key} section={s} items={media.filter((m) => m.section_key === s.key)} uploading={uploading === s.key} onUpload={(f, t) => uploadFile(s.key, f, t)} onDelete={deleteMedia} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GROUP 03 — ROOMS */}
        {roomGroups.length > 0 && (
          <div className="space-y-10">
            <GroupHeader eyebrow="Group 03" title="Rooms & Suites Media" description="Update the main picture and gallery shown for each room." />
            {roomGroups.map((g) => (
              <div key={g.title}>
                <h3 className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: "hsl(var(--gold))" }}>{g.title}</h3>
                <div className="grid gap-5">
                  {g.sections.map((s) => (
                    <SectionEditor key={s.key} section={s} items={media.filter((m) => m.section_key === s.key)} uploading={uploading === s.key} onUpload={(f, t) => uploadFile(s.key, f, t)} onDelete={deleteMedia} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GROUP 04 — PRICING */}
        {hotel.rooms.length > 0 && (
          <div>
            <GroupHeader eyebrow="Group 04" title="Room Pricing" description="Update the prices shown on the website." />
            <div className="space-y-4 mt-8">
              {hotel.rooms.map((r) => (
                <div key={r.key} className="bg-card p-6 rounded-2xl" style={{ border: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg" style={{ fontWeight: 500 }}>{r.name}</h3>
                    <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">{r.key}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Display Price</Label>
                      <Input value={pricing[r.key]?.display || ""} onChange={(e) => setPricing({ ...pricing, [r.key]: { ...pricing[r.key], display: e.target.value } })} placeholder="₹3,999" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Single Occupancy</Label>
                      <Input value={pricing[r.key]?.single || ""} onChange={(e) => setPricing({ ...pricing, [r.key]: { ...pricing[r.key], single: e.target.value } })} placeholder="₹3,999" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Double Occupancy</Label>
                      <Input value={pricing[r.key]?.double || ""} onChange={(e) => setPricing({ ...pricing, [r.key]: { ...pricing[r.key], double: e.target.value } })} placeholder="₹4,499" />
                    </div>
                  </div>
                  <Button onClick={() => savePricing(r.key)} disabled={savingPrice === r.key} className="mt-5" size="sm">
                    {savingPrice === r.key ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                    Save Pricing
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const GroupHeader = ({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) => (
  <div className="border-b border-border/50 pb-5">
    <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-body">{eyebrow}</span>
    <h2 className="text-2xl md:text-3xl font-display mt-2" style={{ fontWeight: 300 }}>{title}</h2>
    <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{description}</p>
  </div>
);

const SectionEditor = ({
  section,
  items,
  uploading,
  onUpload,
  onDelete,
}: {
  section: SectionDef;
  items: MediaRow[];
  uploading: boolean;
  onUpload: (f: File, t: "image" | "video") => void;
  onDelete: (m: MediaRow) => void;
}) => {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-card p-5 rounded-xl" style={{ border: "1px solid hsl(var(--border))" }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base" style={{ fontWeight: 500 }}>{section.label}</h3>
          {section.hint && <p className="text-xs text-muted-foreground mt-1">{section.hint}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "image")} />
          <input ref={vidRef} type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "video")} />
          <Button size="sm" variant="outline" disabled={uploading} onClick={() => imgRef.current?.click()}>
            {uploading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <ImageIcon className="w-3 h-3 mr-2" />}Image
          </Button>
          <Button size="sm" variant="outline" disabled={uploading} onClick={() => vidRef.current?.click()}>
            <VideoIcon className="w-3 h-3 mr-2" />Video
          </Button>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {items.map((m) => (
            <div key={m.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              {m.media_type === "video" ? (
                <video src={m.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => onDelete(m)}
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              {m.media_type === "video" && (
                <span className="absolute bottom-1 left-1 text-[8px] px-1.5 py-0.5 rounded bg-foreground/70 text-background">VIDEO</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No custom media yet — site uses default images.</p>
      )}
    </div>
  );
};

export default AdminHotel;
