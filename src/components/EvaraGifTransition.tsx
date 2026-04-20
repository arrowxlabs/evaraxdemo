import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EvaraGifTransitionProps {
  isActive: boolean;
  onMidpoint: () => void; // navigate to hotel page (called early so page can mount)
  onComplete: () => void; // teardown after fade
}

/**
 * Cinematic parallax transition for Hotel Evara.
 * - Plays a high-quality MP4/WebM (converted from the source GIF for buttery playback)
 * - Subtle parallax: slow zoom + vertical drift while video plays
 * - Navigates to hotel page mid-playback so it's fully loaded before reveal
 * - Ends with a white glow flash that fades to reveal the new page
 */
const EvaraGifTransition = ({ isActive, onMidpoint, onComplete }: EvaraGifTransitionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFlash, setShowFlash] = useState(false);
  const navigatedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      navigatedRef.current = false;
      completedRef.current = false;
      setShowFlash(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Force play (autoplay can be blocked without muted+playsInline, both set below)
    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => {});

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const remaining = video.duration - video.currentTime;

      // ~600ms before end: navigate so the next page mounts behind the overlay
      if (!navigatedRef.current && remaining <= 0.7) {
        navigatedRef.current = true;
        onMidpoint();
      }

      // ~250ms before end: trigger the white-glow fade
      if (!completedRef.current && remaining <= 0.3) {
        completedRef.current = true;
        setShowFlash(true);
        // Allow flash + fade to play out, then tear down overlay
        window.setTimeout(() => onComplete(), 700);
      }
    };

    const handleEnded = () => {
      // Safety net in case timeupdate didn't fire late frames
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        onMidpoint();
      }
      if (!completedRef.current) {
        completedRef.current = true;
        setShowFlash(true);
        window.setTimeout(() => onComplete(), 600);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isActive, onMidpoint, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Parallax video layer: slow zoom + subtle drift */}
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={{ scale: 1.08, y: "-2%" }}
            animate={{ scale: 1.18, y: "2%" }}
            transition={{ duration: 8, ease: "linear" }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/transitions/evara-transition-poster.jpg"
              // @ts-expect-error - non-standard but improves iOS behavior
              webkit-playsinline="true"
              disableRemotePlayback
            >
              <source src="/transitions/evara-transition.webm" type="video/webm" />
              <source src="/transitions/evara-transition.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Vignette for depth */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
            }}
          />

          {/* White glow flash + fade-out reveal */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.65, times: [0, 0.25, 0.55, 1], ease: "easeOut" }}
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255,253,245,1) 0%, rgba(255,250,235,0.95) 35%, rgba(255,245,220,0.6) 70%, rgba(255,255,255,0) 100%)",
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EvaraGifTransition;
