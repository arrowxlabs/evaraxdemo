import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HotelZoomTransitionProps {
  isActive: boolean;
  targetImage?: string;
  cardRect?: DOMRect | null;
  onMidpoint: () => void;
  onComplete: () => void;
}

const HotelZoomTransition = ({ isActive, targetImage, cardRect, onMidpoint, onComplete }: HotelZoomTransitionProps) => {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!isActive || hasFired.current) return;
    hasFired.current = true;

    const midTimer = setTimeout(() => {
      onMidpoint();
    }, 450);

    const completeTimer = setTimeout(() => {
      hasFired.current = false;
      onComplete();
    }, 850);

    return () => {
      clearTimeout(midTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, onMidpoint, onComplete]);

  useEffect(() => {
    if (!isActive) hasFired.current = false;
  }, [isActive]);

  if (!isActive) return null;

  const originX = cardRect ? ((cardRect.left + cardRect.width / 2) / window.innerWidth) * 100 : 50;
  const originY = cardRect ? ((cardRect.top + cardRect.height / 2) / window.innerHeight) * 100 : 50;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {targetImage && (
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: `${originX}% ${originY}%` }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 2, 8],
                opacity: [0, 1, 1],
              }}
              transition={{
                duration: 0.55,
                times: [0, 0.3, 1],
                ease: [0.32, 0, 0.15, 1],
              }}
            >
              <img src={targetImage} alt="" className="w-full h-full object-cover" />
              <motion.div
                className="absolute inset-0"
                initial={{ backdropFilter: "blur(0px)" }}
                animate={{ backdropFilter: ["blur(0px)", "blur(0px)", "blur(16px)"] }}
                transition={{ duration: 0.55, times: [0, 0.5, 1] }}
              />
            </motion.div>
          )}

          {/* Vignette */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at ${originX}% ${originY}%, transparent 20%, rgba(0,0,0,0.5) 100%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.7] }}
            transition={{ duration: 0.45, times: [0, 0.3, 1] }}
          />

          {/* White flash — smoother */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "white" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0, 1, 0.6, 0] }}
            transition={{
              duration: 0.85,
              times: [0, 0.4, 0.5, 0.58, 0.75, 1],
              ease: "easeInOut",
            }}
          />

          {/* Golden particles — fewer, faster */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                background: `rgba(200, 170, 110, ${0.3 + Math.random() * 0.4})`,
                left: `${25 + Math.random() * 50}%`,
                top: `${25 + Math.random() * 50}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0, 1.2, 0],
                x: (Math.random() - 0.5) * 150,
                y: (Math.random() - 0.5) * 150,
              }}
              transition={{
                duration: 0.45,
                delay: 0.1 + i * 0.03,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotelZoomTransition;
