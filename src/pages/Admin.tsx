import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hotels } from "@/data/hotels";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) navigate("/admin/login");
    });
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/admin/login");
        return;
      }
      setEmail(sessionData.session.user.email || "");
      // Try claim, then verify
      await supabase.rpc("claim_admin");
      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", sessionData.session.user.id)
        .maybeSingle();
      setIsAdmin(!!adminRow);
      setLoading(false);
    };
    check();
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground text-sm">Loading…</p></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-display text-foreground mb-3" style={{ fontWeight: 300 }}>Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Signed in as <strong>{email}</strong> — this account is not the owner. Only the original account holder can manage content.
          </p>
          <Button onClick={signOut} variant="outline">Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <h1 className="font-display text-lg" style={{ fontWeight: 400 }}>EVARA <span style={{ color: "hsl(var(--gold))" }}>Admin</span></h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
            <Button onClick={signOut} variant="ghost" size="sm"><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10">
        <div className="mb-8">
          <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground font-body">Step 1</span>
          <h2 className="text-2xl md:text-3xl font-display mt-1" style={{ fontWeight: 300 }}>Select a hotel to manage</h2>
          <p className="text-sm text-muted-foreground mt-2">Choose a property to update images, videos, and pricing.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotels.map((h) => (
            <Link
              key={h.id}
              to={`/admin/hotel/${h.id}`}
              className="block group rounded-2xl overflow-hidden bg-card hover:shadow-xl transition-all duration-300"
              style={{ border: "1px solid hsl(var(--border))" }}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={h.cardImage} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg" style={{ fontWeight: 500 }}>{h.name}</h3>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mt-1">{h.city}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;
