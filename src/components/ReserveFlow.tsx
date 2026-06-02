import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon, User, Mail, Phone, Send, ArrowRight, ArrowLeft,
  CheckCircle2, BedDouble, Users, Sparkles, MapPin,
} from "lucide-react";
import type { HotelRoom } from "@/data/hotels";

const stayDetailsSchema = z.object({
  roomType: z.string().min(1, "Please select a room type"),
  guests: z.coerce.number().min(1).max(8),
});

const guestDetailsSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15),
  message: z.string().trim().max(500).optional(),
});

type GuestValues = z.infer<typeof guestDetailsSchema>;

interface ReserveFlowProps {
  hotelName: string;
  rooms: HotelRoom[];
}

const STEPS = ["Stay", "Guest", "Confirm"] as const;

const ReserveFlow = ({ hotelName, rooms }: ReserveFlowProps) => {
  const [step, setStep] = useState(0);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [roomType, setRoomType] = useState<string>(rooms[0]?.name ?? "");
  const [guests, setGuests] = useState<number>(2);
  const [guest, setGuest] = useState<GuestValues | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<GuestValues>({
    resolver: zodResolver(guestDetailsSchema),
  });

  const selectedRoom = rooms.find((r) => r.name === roomType);
  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;

  // ---- Step handlers ----
  const goToGuest = () => {
    if (!checkIn) return toast.error("Select a check-in date");
    if (!checkOut) return toast.error("Select a check-out date");
    if (checkOut <= checkIn) return toast.error("Check-out must be after check-in");
    const r = stayDetailsSchema.safeParse({ roomType, guests });
    if (!r.success) return toast.error(r.error.issues[0].message);
    setStep(1);
  };

  const onGuestSubmit = (data: GuestValues) => {
    setGuest(data);
    setStep(2);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    toast.success(`Reservation request sent — we'll contact you shortly, ${guest?.name}.`);
  };

  const reset = () => {
    setStep(0);
    setCheckIn(undefined);
    setCheckOut(undefined);
    setRoomType(rooms[0]?.name ?? "");
    setGuests(2);
    setGuest(null);
    setConfirmed(false);
  };

  // ---- UI ----
  return (
    <motion.div
      className="rounded-2xl bg-card overflow-hidden luxe-fog"
      style={{ border: "1px solid hsl(var(--border) / 0.4)", boxShadow: "0 10px 50px -20px hsl(30 10% 12% / 0.12)" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      {/* Step indicator */}
      <div className="px-6 md:px-10 pt-6 md:pt-8 pb-4 border-b" style={{ borderColor: "hsl(var(--border) / 0.4)" }}>
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, i) => {
            const active = i === step;
            const done = i < step || confirmed;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <motion.div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-body shrink-0"
                  style={{
                    background: done ? "hsl(var(--gold))" : active ? "hsl(var(--foreground))" : "transparent",
                    color: done || active ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                    border: done || active ? "none" : "1px solid hsl(var(--border))",
                    fontWeight: 500,
                  }}
                  animate={active ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </motion.div>
                <span
                  className="text-[9px] tracking-[0.25em] uppercase font-body hidden sm:inline"
                  style={{
                    fontWeight: 400,
                    color: active || done ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground) / 0.6)",
                  }}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px ml-1" style={{ background: done ? "hsl(var(--gold) / 0.5)" : "hsl(var(--border))" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-10 relative">
        <AnimatePresence mode="wait">
          {/* ====== STEP 1 — STAY DETAILS ====== */}
          {step === 0 && (
            <motion.div
              key="stay"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField label="Check-in" value={checkIn} onChange={setCheckIn} minDate={new Date()} />
                <DateField label="Check-out" value={checkOut} onChange={setCheckOut} minDate={checkIn || new Date()} />
              </div>

              {/* Room type */}
              <div>
                <Label>Room Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  {rooms.map((r) => {
                    const active = roomType === r.name;
                    return (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => setRoomType(r.name)}
                        className="text-left p-3 rounded-lg transition-all duration-300 luxe-shimmer"
                        style={{
                          border: active ? "1px solid hsl(var(--gold))" : "1px solid hsl(var(--border) / 0.5)",
                          background: active ? "hsl(var(--gold) / 0.06)" : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-3.5 h-3.5" style={{ color: active ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }} />
                          <span className="text-[11px] font-body tracking-wide uppercase" style={{ fontWeight: 500, letterSpacing: "0.1em" }}>{r.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 font-body block mt-1.5" style={{ fontWeight: 300 }}>{r.price} <span className="opacity-60">/ night</span></span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guests */}
              <div>
                <Label>Guests</Label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-10 h-10 rounded-full border border-border/50 hover:border-foreground/30 transition-colors text-foreground"
                  >
                    −
                  </button>
                  <div className="flex items-center gap-2 px-5 h-10 rounded-full border border-border/50">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-body tabular-nums" style={{ fontWeight: 400 }}>{guests}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(8, g + 1))}
                    className="w-10 h-10 rounded-full border border-border/50 hover:border-foreground/30 transition-colors text-foreground"
                  >
                    +
                  </button>
                  {nights > 0 && (
                    <span className="ml-auto text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <motion.button
                  type="button"
                  onClick={goToGuest}
                  className="luxe-shimmer px-7 py-3 text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2"
                  style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 400 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ====== STEP 2 — GUEST DETAILS ====== */}
          {step === 1 && (
            <motion.form
              key="guest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit(onGuestSubmit)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" icon={<User className="w-3.5 h-3.5" />} error={errors.name?.message}>
                  <Input {...register("name")} placeholder="Your name" className="pl-10 h-11 text-sm" />
                </Field>
                <Field label="Email" icon={<Mail className="w-3.5 h-3.5" />} error={errors.email?.message}>
                  <Input {...register("email")} type="email" placeholder="you@email.com" className="pl-10 h-11 text-sm" />
                </Field>
                <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />} error={errors.phone?.message}>
                  <Input {...register("phone")} type="tel" placeholder="+91 9031027961" className="pl-10 h-11 text-sm" />
                </Field>
                <div className="md:col-span-1" />
              </div>
              <div>
                <Label>Special Requests</Label>
                <Textarea
                  {...register("message")}
                  placeholder="Anniversary, accessibility, dietary preferences…"
                  className="mt-2 min-h-[88px] text-sm resize-none border-border/40"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-[10px] tracking-[0.28em] uppercase font-body text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <motion.button
                  type="submit"
                  className="luxe-shimmer px-7 py-3 text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2"
                  style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontWeight: 400 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Review <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* ====== STEP 3 — CONFIRMATION ====== */}
          {step === 2 && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {!confirmed ? (
                <div className="space-y-6">
                  {/* Summary card */}
                  <div className="rounded-xl p-5 md:p-6" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--gold) / 0.15)" }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(var(--gold))" }} />
                      <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground font-body">Reservation Summary</span>
                    </div>

                    <h3 className="font-display text-xl md:text-2xl mb-1" style={{ fontWeight: 300 }}>{hotelName}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-body mb-5">
                      <MapPin className="w-3 h-3" /> {selectedRoom?.name}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                      <SummaryItem label="Check-in" value={checkIn ? format(checkIn, "MMM d, yyyy") : "—"} />
                      <SummaryItem label="Check-out" value={checkOut ? format(checkOut, "MMM d, yyyy") : "—"} />
                      <SummaryItem label="Nights" value={nights.toString()} />
                      <SummaryItem label="Guests" value={guests.toString()} />
                    </div>

                    <div className="h-px my-5" style={{ background: "hsl(var(--gold) / 0.2)" }} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                      <SummaryItem label="Guest" value={guest?.name ?? ""} />
                      <SummaryItem label="Email" value={guest?.email ?? ""} />
                      <SummaryItem label="Phone" value={guest?.phone ?? ""} />
                    </div>

                    {guest?.message && (
                      <>
                        <div className="h-px my-5" style={{ background: "hsl(var(--gold) / 0.2)" }} />
                        <SummaryItem label="Special Requests" value={guest.message} />
                      </>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground/70 font-body leading-relaxed text-center" style={{ fontWeight: 300 }}>
                    A concierge will personally confirm your reservation within 24 hours. No payment is taken at this step.
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[10px] tracking-[0.28em] uppercase font-body text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-3 h-3" /> Edit
                    </button>
                    <motion.button
                      type="button"
                      onClick={handleConfirm}
                      className="luxe-shimmer px-8 py-3 text-[10px] tracking-[0.28em] uppercase font-body inline-flex items-center gap-2"
                      style={{ background: "hsl(var(--gold))", color: "hsl(var(--background))", fontWeight: 500 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Confirm Reservation <Send className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Success state with fog reveal */
                <motion.div
                  className="text-center py-6 md:py-10 relative"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 50% 30%, hsl(var(--gold) / 0.18), transparent 60%)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.6] }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                  />
                  <motion.div
                    className="relative w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5"
                    style={{ background: "hsl(var(--gold) / 0.12)", border: "1px solid hsl(var(--gold) / 0.5)" }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CheckCircle2 className="w-7 h-7" style={{ color: "hsl(var(--gold))" }} />
                  </motion.div>

                  <span className="eyebrow block mb-3" style={{ color: "hsl(var(--gold))" }}>Reservation Received</span>
                  <h3 className="font-display text-2xl md:text-3xl mb-2" style={{ fontWeight: 300 }}>
                    Thank you, <span className="italic" style={{ color: "hsl(var(--gold))" }}>{guest?.name?.split(" ")[0]}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground font-body max-w-sm mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
                    A confirmation has been sent to <span className="text-foreground">{guest?.email}</span>. Our concierge will follow up shortly to finalize your stay at {hotelName}.
                  </p>

                  <button
                    type="button"
                    onClick={reset}
                    className="mt-7 text-[10px] tracking-[0.28em] uppercase font-body text-muted-foreground hover:text-foreground inline-flex items-center gap-2 luxe-underline"
                  >
                    Make another reservation
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ---- Small UI helpers ----

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-body" style={{ fontWeight: 400 }}>
    {children}
  </label>
);

const Field = ({
  label, icon, error, children,
}: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">{icon}</span>
      {children}
    </div>
    {error && <p className="text-[10px] text-destructive font-body">{error}</p>}
  </div>
);

const DateField = ({
  label, value, onChange, minDate,
}: { label: string; value?: Date; onChange: (d?: Date) => void; minDate: Date }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-11 justify-start text-left font-body text-sm border-border/40",
            !value && "text-muted-foreground",
          )}
          style={{ fontWeight: 300 }}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "EEE, MMM d") : "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(d) => d < minDate}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  </div>
);

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-[8px] tracking-[0.3em] uppercase text-muted-foreground/60 font-body block mb-1">{label}</span>
    <span className="text-xs md:text-sm font-body text-foreground" style={{ fontWeight: 400 }}>{value || "—"}</span>
  </div>
);

export default ReserveFlow;
