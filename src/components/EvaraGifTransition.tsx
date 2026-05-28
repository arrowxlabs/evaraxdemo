import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface EvaraGifTransitionProps {
  isActive: boolean;
  onMidpoint: () => void;
  onComplete: () => void;
}

const MUTE_KEY = "evara-transition-muted";

/**
 * Cinematic parallax transition for Hotel Evara.
 * - Warm cream backdrop (no black flash on mount)
 * - Faster playback (1.3×) with parallax zoom + drift
 * - Gold-tinted glow that's stronger and longer
 * - Soft chime/whoosh audio cue with persistent mute toggle
 * - Navigates ~700ms before end so the hotel page is fully ready
 */
const EvaraGifTransition = ({ isActive, onMidpoint, onComplete }: EvaraGifTransitionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(MUTE_KEY) === "1";
  });
  const navigatedRef = useRef(false);
  const completedRef = useRef(false);

  // Persist mute preference + apply live
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    }
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (!isActive) {
      navigatedRef.current = false;
      completedRef.current = false;
      setShowFlash(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Slightly snappier than real-time but still smooth & cinematic
    video.playbackRate = 1.2;
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => {});

    // Audio cue (best effort — autoplay policy permits muted, and we already had a user click)
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.muted = muted;
      audio.volume = 0.6;
      audio.play().catch(() => {});
    }

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const remaining = (video.duration - video.currentTime) / (video.playbackRate || 1);

      // Navigate well before end so the hotel page is mounted behind the overlay
      if (!navigatedRef.current && remaining <= 0.9) {
        navigatedRef.current = true;
        onMidpoint();
      }

      // Trigger gold glow earlier for a longer, gentler fade
      if (!completedRef.current && remaining <= 0.55) {
        completedRef.current = true;
        setShowFlash(true);
        window.setTimeout(() => onComplete(), 1100);
      }
    };

    const handleEnded = () => {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        onMidpoint();
      }
      if (!completedRef.current) {
        completedRef.current = true;
        setShowFlash(true);
        window.setTimeout(() => onComplete(), 1000);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isActive, onMidpoint, onComplete, muted]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden"
          // Use the poster as immediate backdrop — zero black flash before first video frame
          style={{
            backgroundColor: "hsl(38 45% 94%)",
            backgroundImage: "url(/transitions/evara-transition-poster.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Parallax video layer */}
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={{ scale: 1.08, y: "-2%" }}
            animate={{ scale: 1.2, y: "2%" }}
            transition={{ duration: 6, ease: "linear" }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/transitions/evara-transition-poster.jpg"
              {...({ "webkit-playsinline": "true" } as Record<string, string>)}
              disableRemotePlayback
              style={{ backgroundColor: "hsl(38 45% 94%)" }}
            >
              <source src="/transitions/evara-transition-fast.webm" type="video/webm" />
              <source src="/transitions/evara-transition-fast.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Soft vignette for depth */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
            }}
          />

          {/* Gold-tinted glow flash + extended fade */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0.85, 0] }}
                transition={{ duration: 1.05, times: [0, 0.18, 0.5, 0.75, 1], ease: "easeOut" }}
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,253,248,0.95) 35%, rgba(255,250,240,0.7) 65%, rgba(255,255,255,0) 100%)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              />
            )}
          </AnimatePresence>

          {/* EVARA monogram + shimmer — appears inside the white fog right before reveal */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{ duration: 1.15, times: [0, 0.22, 0.42, 0.74, 1], ease: "easeOut" }}
              >
                <div className="relative flex flex-col items-center gap-3 md:gap-4">
                  {/* Top hairline with a small diamond at center */}
                  <motion.div
                    className="relative flex items-center justify-center"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
                  >
                    <div
                      className="h-px w-full"
                      style={{ background: "linear-gradient(90deg, transparent, hsl(40 70% 45% / 0.75), transparent)" }}
                    />
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
                      style={{ width: 7, height: 7, border: "1px solid hsl(40 70% 45% / 0.85)", background: "hsl(45 90% 88% / 0.5)" }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  </motion.div>

                  {/* Monogram letters — larger luxury mark */}
                  <div className="relative flex items-center gap-[0.18em] px-2">
                    {"EVARA".split("").map((letter, i) => (
                      <motion.span
                        key={i}
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "clamp(1.8rem, 6vw, 3rem)",
                          fontWeight: 300,
                          letterSpacing: "0.42em",
                          color: "hsl(40 65% 36%)",
                          textShadow: "0 0 24px hsl(45 90% 80% / 0.95)",
                        }}
                        initial={{ opacity: 0, y: 8, filter: "blur(5px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.5, delay: 0.32 + i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        {letter}
                      </motion.span>
                    ))}

                    {/* Shimmer sweep over the letters */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ x: "-110%", opacity: 0 }}
                      animate={{ x: "110%", opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                      style={{
                        background:
                          "linear-gradient(100deg, transparent 30%, hsl(45 100% 95% / 0.95) 50%, transparent 70%)",
                        mixBlendMode: "screen",
                      }}
                    />
                  </div>

                  {/* Bottom hairline with a small diamond at center */}
                  <motion.div
                    className="relative flex items-center justify-center"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
                  >
                    <div
                      className="h-px w-full"
                      style={{ background: "linear-gradient(90deg, transparent, hsl(40 70% 45% / 0.75), transparent)" }}
                    />
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
                      style={{ width: 7, height: 7, border: "1px solid hsl(40 70% 45% / 0.85)", background: "hsl(45 90% 88% / 0.5)" }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* Audio + mute toggle */}
          <audio ref={audioRef} preload="auto">
            <source src="/transitions/evara-chime.webm" type="audio/webm" />
            <source src="/transitions/evara-chime.m4a" type="audio/mp4" />
          </audio>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute transition sound" : "Mute transition sound"}
            className="absolute top-5 right-5 md:top-6 md:right-6 z-[10000] rounded-full p-2.5 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "hsl(0 0% 100% / 0.18)",
              border: "1px solid hsl(0 0% 100% / 0.35)",
              color: "hsl(45 90% 95%)",
            }}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EvaraGifTransition;
