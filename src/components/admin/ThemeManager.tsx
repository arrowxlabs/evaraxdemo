import { useTheme, ThemeName } from "@/hooks/useTheme";
import { Check, Trees, Crown } from "lucide-react";
import { toast } from "sonner";

const themes: {
  id: ThemeName;
  name: string;
  tagline: string;
  swatch: string[];
  icon: typeof Trees;
}[] = [
  {
    id: "forest",
    name: "Forest Luxury",
    tagline: "Warm ivory · deep forest · bronze accents",
    swatch: ["#f7f4ec", "#233d2a", "#a97a3a", "#0d1a12"],
    icon: Trees,
  },
  {
    id: "royal",
    name: "Royal Palace",
    tagline: "Aged parchment · burgundy · antique gold",
    swatch: ["#f4ecd8", "#5a1120", "#c9a355", "#2a0a12"],
    icon: Crown,
  },
];

const ThemeManager = () => {
  const [current, setTheme] = useTheme();

  const pick = async (t: ThemeName) => {
    if (t === current) return;
    await setTheme(t);
    toast.success(`${t === "royal" ? "Royal Palace" : "Forest Luxury"} theme applied site-wide`);
  };

  return (
    <div className="p-6 rounded-2xl bg-card mb-8" style={{ border: "1px solid hsl(var(--border))" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="font-display text-base" style={{ fontWeight: 500 }}>Site Theme</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Applies to every page instantly for all visitors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((t) => {
          const active = t.id === current;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pick(t.id)}
              className="text-left rounded-xl p-5 transition-all relative overflow-hidden"
              style={{
                border: active ? "2px solid hsl(var(--gold))" : "1px solid hsl(var(--border))",
                background: active ? "hsl(var(--gold) / 0.06)" : "hsl(var(--background))",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "hsl(var(--gold) / 0.12)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "hsl(var(--gold))" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-display text-lg leading-tight" style={{ fontWeight: 500 }}>
                      {t.name}
                    </h5>
                    {active && (
                      <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.25em] uppercase font-body px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))" }}>
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.tagline}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {t.swatch.map((c) => (
                  <div
                    key={c}
                    className="flex-1 h-8 rounded"
                    style={{ background: c, border: "1px solid hsl(var(--border))" }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeManager;
