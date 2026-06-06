import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin");
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        // Try to claim admin (works only if no admin exists yet)
        await supabase.rpc("claim_admin");
        toast.success("Account created. Signing in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // Attempt claim on every login too (idempotent)
      await supabase.rpc("claim_admin");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-foreground" style={{ fontWeight: 300 }}>EVARA <span style={{ color: "hsl(var(--gold))" }}>Admin</span></h1>
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mt-2 font-body">Owner access only</p>
        </div>
        <form onSubmit={submit} className="space-y-4 bg-card p-6 rounded-2xl" style={{ border: "1px solid hsl(var(--border))" }}>
          <div>
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full" style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))" }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="w-full text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            {mode === "login" ? "First time? Create owner account" : "Already have an account? Sign in"}
          </button>
        </form>
        <p className="text-[9px] text-muted-foreground/60 text-center mt-5 font-body leading-relaxed">
          The first account created becomes the sole owner. Subsequent signups will not gain admin access.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
