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

export default Admin;
