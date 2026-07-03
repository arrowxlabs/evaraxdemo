import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LuxuryOrnament from "@/components/LuxuryOrnament";

const PASSCODE = "0000";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (sessionStorage.getItem("admin_gate") === "1") navigate("/admin");
    inputs.current[0]?.focus();
  }, [navigate]);

  const handleChange = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError(false);
    if (val && i < 3) inputs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) tryUnlock(next.join(""));
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const tryUnlock = (code: string) => {
    if (code === PASSCODE) {
      sessionStorage.setItem("admin_gate", "1");
      toast.success("Welcome back");
      navigate("/admin");
    } else {
      setError(true);
      setDigits(["", "", "", ""]);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "hsl(var(--background))" }}>
      <div className="w-full max-w-sm text-center">
        <LuxuryOrnament width={140} className="mx-auto mb-6" />
        <h1 className="font-display text-3xl" style={{ fontWeight: 300, color: "hsl(var(--foreground))" }}>
          EVARA <span className="italic" style={{ color: "hsl(var(--gold))" }}>Admin</span>
        </h1>
        <p className="text-[10px] tracking-[0.45em] uppercase mt-3 mb-10" style={{ color: "hsl(var(--muted-foreground))" }}>
          Enter passcode
        </p>

        <div className={`flex justify-center gap-3 mb-6 ${error ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              className="w-14 h-16 text-center text-2xl font-display rounded-xl outline-none transition-all"
              style={{
                border: `1px solid ${error ? "hsl(var(--destructive) / 0.6)" : "hsl(var(--border))"}`,
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                boxShadow: d ? "0 0 0 3px hsl(var(--gold) / 0.15)" : "none",
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs" style={{ color: "hsl(var(--destructive))" }}>
            Incorrect passcode — please try again
          </p>
        )}

        <p className="text-[9px] mt-10 leading-relaxed" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>
          Owner access only. This gate protects the content manager for EVARA properties.
        </p>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
    </div>
  );
};

export default AdminLogin;
