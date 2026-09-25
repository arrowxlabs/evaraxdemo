import { useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Compass, IndianRupee, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { hotels } from "@/data/hotels";
import { supabase } from "@/integrations/supabase/client";

type Match = { id: string; why: string; room: string | null; priceNote: string | null };
type Recommendation = { intro: string; matches: Match[]; note: string };

export default function StayMatcher() {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [budget, setBudget] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Recommendation | null>(null);
  const today = new Date().toLocaleDateString("en-CA");
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stay-match`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(""); setResult(null); setLoading(true);
    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ destination, checkIn, checkOut, budget: Number(budget), preferences }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Recommendations are unavailable right now.");
      }
      if (!response.body) throw new Error("Recommendations are unavailable right now.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let received = false;
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line);
          if (event.type === "error") throw new Error(event.message);
          if (event.type === "result") { setResult(event.data); received = true; }
        }
        if (done) break;
      }
      if (!received) throw new Error("No recommendation was returned. Please try again.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Recommendations are unavailable right now.");
    } finally { setLoading(false); }
  }

  return (
    <section id="stay-match" className="stay-match-section" aria-labelledby="stay-match-title">
      <div className="stay-match-inner">
        <div className="stay-match-heading">
          <div className="stay-match-eyebrow"><Compass size={16} aria-hidden="true" /> The stay edit</div>
          <h2 id="stay-match-title">Find your <em>kind of stay.</em></h2>
          <p>Tell us what matters to you. We'll look across the Evara collection for your closest match.</p>
        </div>
        <form className="stay-match-form" onSubmit={handleSubmit}>
          <label className="stay-match-field stay-match-destination"><span><MapPin size={15} aria-hidden="true" /> Destination</span><Input required maxLength={100} placeholder="City or region" value={destination} onChange={(e) => setDestination(e.target.value)} /></label>
          <label className="stay-match-field"><span><CalendarDays size={15} aria-hidden="true" /> Check-in</span><Input required type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></label>
          <label className="stay-match-field"><span><CalendarDays size={15} aria-hidden="true" /> Check-out</span><Input required type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></label>
          <label className="stay-match-field"><span><IndianRupee size={15} aria-hidden="true" /> Nightly budget · INR</span><Input required type="number" min="1" max="1000000" step="1" placeholder="e.g. 5000" value={budget} onChange={(e) => setBudget(e.target.value)} /></label>
          <label className="stay-match-field stay-match-preferences"><span><Sparkles size={15} aria-hidden="true" /> What would make your stay special?</span><Textarea required maxLength={400} placeholder="A quiet work space, twin beds, great dining, a celebration…" value={preferences} onChange={(e) => setPreferences(e.target.value)} /></label>
          <div className="stay-match-submit"><Button type="submit" disabled={loading}>{loading ? "Finding your match…" : "Find my stay"}<ArrowRight size={16} aria-hidden="true" /></Button><small>Suggestions are not a live availability check.</small></div>
        </form>
        {error && <p className="stay-match-error" role="alert">{error}</p>}
        {result && <div className="stay-match-results" aria-live="polite">
          <div className="stay-match-result-intro"><span>Your stay edit</span><p>{result.intro}</p></div>
          {result.matches.map((match) => {
            const hotel = hotels.find((h) => h.id === match.id);
            if (!hotel) return null;
            return <article key={hotel.id} className="stay-match-result">
              <div><span className="stay-match-result-kicker">{hotel.rooms.length ? "The collection" : "Opening soon · Not bookable"}</span><h3>{hotel.name}</h3>{match.room && <strong>{match.room}</strong>}</div>
              <div><p>{match.why}</p>{match.priceNote && <small>{match.priceNote}</small>}</div>
              <Button asChild variant="outline" size="icon" aria-label={`View ${hotel.name}`}><Link to={`/hotel/${hotel.id}`}><ArrowRight aria-hidden="true" /></Link></Button>
            </article>;
          })}
          {result.note && <p className="stay-match-note">{result.note}</p>}
        </div>}
      </div>
    </section>
  );
}
