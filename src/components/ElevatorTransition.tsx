import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ElevatorTransitionProps {
  isActive: boolean;
  onComplete: () => void;
  onDoorsFullyClosed?: () => void;
}

const playElevatorSound = (type: "close" | "travel" | "ding" | "open") => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (type === "close") {
      // Hydraulic door slide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(25, ctx.currentTime + 1.8);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.004, ctx.currentTime + 1.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);

      // Mechanical noise
      const bufferSize = ctx.sampleRate * 1.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.003;
      }
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      noise.buffer = buffer;
      noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
      noise.connect(noiseGain).connect(ctx.destination);
      noise.start();

      // Thud when doors meet
      setTimeout(() => {
        const thud = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thud.type = "sine";
        thud.frequency.setValueAtTime(45, ctx.currentTime);
        thudGain.gain.setValueAtTime(0.05, ctx.currentTime);
        thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        thud.connect(thudGain).connect(ctx.destination);
        thud.start();
        thud.stop(ctx.currentTime + 0.15);
      }, 1750);
    }

    if (type === "travel") {
      // Low rumble for elevator moving
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(28, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(35, ctx.currentTime + 1.5);
      osc.frequency.linearRampToValueAtTime(22, ctx.currentTime + 2.5);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.018, ctx.currentTime + 2.0);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.5);

      // Mechanical whir
      const whir = ctx.createOscillator();
      const whirGain = ctx.createGain();
      whir.type = "sawtooth";
      whir.frequency.setValueAtTime(120, ctx.currentTime);
      whir.frequency.linearRampToValueAtTime(180, ctx.currentTime + 1.2);
      whir.frequency.linearRampToValueAtTime(100, ctx.currentTime + 2.5);
      whirGain.gain.setValueAtTime(0, ctx.currentTime);
      whirGain.gain.linearRampToValueAtTime(0.003, ctx.currentTime + 0.4);
      whirGain.gain.setValueAtTime(0.003, ctx.currentTime + 2.0);
      whirGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
      whir.connect(whirGain).connect(ctx.destination);
      whir.start();
      whir.stop(ctx.currentTime + 2.5);
    }

    if (type === "ding") {
      // Classic elevator arrival ding
      [1318, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(i === 0 ? 0.07 : 0.04, ctx.currentTime + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 1.6);
      });
    }

    if (type === "open") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(25, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 2.0);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.002, ctx.currentTime + 2.0);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    }
  } catch (e) {}
};

const ElevatorDoor = ({ side, phase }: { side: "left" | "right"; phase: string }) => {
  const text = side === "left" ? "Evara" : "Co.";
  const isClosed = phase === "closed" || phase === "traveling" || phase === "arrived" || phase === "glow";

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #faf9f7 0%, #f5f3ef 20%, #f0ede8 40%, #ece9e3 60%, #e8e5df 80%, #e4e1db 100%)",
        willChange: "transform",
      }}
    >
      {/* Brushed metal texture */}
      <div className="absolute inset-0" style={{
        background: `repeating-linear-gradient(180deg, transparent, transparent 1px, rgba(0,0,0,0.005) 1px, rgba(0,0,0,0.005) 2px)`,
      }} />

      {/* Panel frame */}
      <div className="absolute inset-0" style={{
        boxShadow: side === "left"
          ? "inset -2px 0 8px rgba(0,0,0,0.06), inset 0 2px 4px rgba(0,0,0,0.02)"
          : "inset 2px 0 8px rgba(0,0,0,0.06), inset 0 2px 4px rgba(0,0,0,0.02)",
      }} />

      {/* Inner frame */}
      <div className="absolute" style={{
        top: "4%", bottom: "4%",
        left: side === "left" ? "6%" : "8%",
        right: side === "left" ? "8%" : "6%",
        border: "0.5px solid rgba(180,170,155,0.12)",
        borderRadius: "2px",
      }} />

      {/* Second inner frame */}
      <div className="absolute" style={{
        top: "8%", bottom: "8%",
        left: side === "left" ? "10%" : "12%",
        right: side === "left" ? "12%" : "10%",
        border: "0.5px solid rgba(180,170,155,0.08)",
        borderRadius: "1px",
      }} />

      {/* Decorative trims */}
      <div className="absolute left-[12%] right-[12%] h-px" style={{ top: "15%", background: "linear-gradient(90deg, transparent, rgba(190,175,150,0.15), transparent)" }} />
      <div className="absolute left-[12%] right-[12%] h-px" style={{ bottom: "15%", background: "linear-gradient(90deg, transparent, rgba(190,175,150,0.15), transparent)" }} />

      {/* Diamond accents */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 opacity-15" style={{ background: "rgba(180,160,130,0.4)", border: "0.5px solid rgba(180,160,130,0.3)" }} />
      <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 opacity-15" style={{ background: "rgba(180,160,130,0.4)", border: "0.5px solid rgba(180,160,130,0.3)" }} />

      {/* Reflection */}
      <div className="absolute top-0 bottom-0 w-[40%]" style={{
        left: "30%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
      }} />

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="select-none"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.4rem, 4vw, 2.8rem)",
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: "#a89880",
            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
          }}
          animate={isClosed ? {
            opacity: [0.5, 0.9, 0.5],
            textShadow: [
              "0 1px 2px rgba(255,255,255,0.8)",
              "0 0 25px rgba(180,160,130,0.3), 0 1px 2px rgba(255,255,255,0.8)",
              "0 1px 2px rgba(255,255,255,0.8)",
            ],
          } : { opacity: 0.7 }}
          transition={isClosed ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
        >
          {text}
        </motion.span>
      </div>

      {/* Edge highlight */}
      <div className="absolute top-0 bottom-0 w-px" style={{
        [side === "left" ? "right" : "left"]: 0,
        background: "linear-gradient(180deg, transparent 5%, rgba(200,190,170,0.15) 30%, rgba(200,190,170,0.25) 50%, rgba(200,190,170,0.15) 70%, transparent 95%)",
      }} />
    </div>
  );
};

type Phase = "idle" | "closing" | "closed" | "pullback" | "traveling" | "arrived" | "glow" | "opening" | "done";

const ElevatorTransition = ({ isActive, onComplete, onDoorsFullyClosed }: ElevatorTransitionProps) => {
  const [phase, setPhase] = useState<Phase>("idle");

  const runSequence = useCallback(() => {
    setPhase("closing");
    playElevatorSound("close");

    // 1. Doors close (1.8s)
    setTimeout(() => {
      setPhase("closed");
      onDoorsFullyClosed?.(); // Navigate now, page loads behind closed doors

      // 2. Camera pulls back (0.6s)
      setTimeout(() => {
        setPhase("pullback");

        // 3. Elevator travels upward (2.5s)
        setTimeout(() => {
          setPhase("traveling");
          playElevatorSound("travel");

          // 4. Arrive — decelerate (2.5s travel total, then arrived)
          setTimeout(() => {
            setPhase("arrived");

            // 5. Flash + ding (0.8s)
            setTimeout(() => {
              setPhase("glow");
              playElevatorSound("ding");

              // 6. Doors open (2.0s)
              setTimeout(() => {
                setPhase("opening");
                playElevatorSound("open");

                setTimeout(() => {
                  setPhase("done");
                  onComplete();
                }, 2000);
              }, 1000);
            }, 300);
          }, 2500);
        }, 600);
      }, 400);
    }, 1800);
  }, [onComplete, onDoorsFullyClosed]);

  useEffect(() => {
    if (isActive && phase === "idle") {
      runSequence();
    }
  }, [isActive, phase, runSequence]);

  useEffect(() => {
    if (!isActive) setPhase("idle");
  }, [isActive]);

  if (!isActive && phase === "idle") return null;

  const isClosing = phase === "closing";
  const doorsClosed = ["closed", "pullback", "traveling", "arrived", "glow"].includes(phase);
  const isOpening = phase === "opening";
  const isTraveling = phase === "traveling";
  const isPullback = phase === "pullback";
  const isArrived = phase === "arrived";
  const isGlowing = phase === "glow";

  // Door positions
  const getLeftX = () => {
    if (isClosing) return "0%";
    if (doorsClosed) return "0%";
    if (isOpening) return "-100%";
    return "-100%";
  };
  const getRightX = () => {
    if (isClosing) return "0%";
    if (doorsClosed) return "0%";
    if (isOpening) return "100%";
    return "100%";
  };

  const doorDuration = isClosing ? 1.8 : isOpening ? 2.0 : 0.3;

  // 3D camera transforms per phase
  const getScale = () => {
    if (isPullback) return 0.92;   // Camera pulls back
    if (isTraveling) return 0.92;
    if (isArrived) return 0.96;
    if (isGlowing) return 1.0;
    if (isOpening) return 1.12;    // Camera pushes forward through doors
    return 1;
  };

  const getY = () => {
    if (isTraveling) return "-8px";  // Subtle upward drift
    if (isArrived) return "0px";
    return "0px";
  };

  return (
    <AnimatePresence>
      {(isActive || phase !== "idle") && phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Dark elevator shaft background — visible during travel */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "#0a0908" }}
            animate={{
              opacity: doorsClosed || isOpening ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Traveling floor lines — moving vertical light streaks */}
          {isTraveling && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-full h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent 10%, rgba(180,160,120,0.08) 30%, rgba(200,180,140,0.15) 50%, rgba(180,160,120,0.08) 70%, transparent 90%)",
                    top: `${10 + i * 12}%`,
                  }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: [0, 400], opacity: [0, 0.8, 0] }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.25,
                    repeat: 2,
                    ease: "linear",
                  }}
                />
              ))}
              {/* Side shaft lights */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ background: "linear-gradient(180deg, transparent, rgba(180,160,120,0.06), transparent)" }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-[2px]"
                style={{ background: "linear-gradient(180deg, transparent, rgba(180,160,120,0.06), transparent)" }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          )}

          {/* 3D container with camera movement */}
          <motion.div
            className="absolute inset-0 z-[2]"
            style={{ transformStyle: "preserve-3d" }}
            animate={{
              scale: getScale(),
              y: getY(),
            }}
            transition={{
              duration: isPullback ? 0.6 : isTraveling ? 2.5 : isOpening ? 2.0 : isArrived ? 0.3 : isGlowing ? 0.5 : 0.3,
              ease: isTraveling ? [0.2, 0, 0.3, 1] : isOpening ? [0.25, 0.1, 0.25, 1] : "easeInOut",
            }}
          >
            {/* Left door */}
            <motion.div
              className="absolute top-0 left-0 w-1/2 h-full"
              style={{ willChange: "transform", backfaceVisibility: "hidden" }}
              initial={{ x: "-100%" }}
              animate={{ x: getLeftX() }}
              transition={{ duration: doorDuration, ease: [0.4, 0, 0.15, 1] }}
            >
              <ElevatorDoor side="left" phase={phase} />
            </motion.div>

            {/* Right door */}
            <motion.div
              className="absolute top-0 right-0 w-1/2 h-full"
              style={{ willChange: "transform", backfaceVisibility: "hidden" }}
              initial={{ x: "100%" }}
              animate={{ x: getRightX() }}
              transition={{ duration: doorDuration, ease: [0.4, 0, 0.15, 1] }}
            >
              <ElevatorDoor side="right" phase={phase} />
            </motion.div>

            {/* Center seam when closed */}
            {doorsClosed && (
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full z-10"
                style={{
                  background: "linear-gradient(180deg, transparent 3%, rgba(180,165,140,0.3) 25%, rgba(180,165,140,0.5) 50%, rgba(180,165,140,0.3) 75%, transparent 97%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Floor indicator arrow */}
            {doorsClosed && (
              <motion.div
                className="absolute top-[5%] left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(0.5rem, 1.2vw, 0.75rem)",
                    letterSpacing: "0.3em",
                    color: "#b4a58c",
                  }}
                  animate={isTraveling ? {
                    opacity: [0.3, 1, 0.3],
                    color: ["#b4a58c", "#d4c4a0", "#b4a58c"],
                  } : { opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: isTraveling ? 0.6 : 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  ▲
                </motion.span>
              </motion.div>
            )}

            {/* Arrival flash — bright horizontal light between doors */}
            {(isArrived || isGlowing) && (
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.6] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Horizontal light bar */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[3px]" style={{
                  background: "linear-gradient(90deg, transparent 10%, rgba(220,200,150,0.7) 35%, rgba(255,240,200,1) 50%, rgba(220,200,150,0.7) 65%, transparent 90%)",
                  boxShadow: "0 0 100px 40px rgba(220,200,150,0.15), 0 0 40px 15px rgba(255,240,200,0.2)",
                }} />
                {/* Radial pulse */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(220,200,150,0.25) 0%, transparent 70%)",
                  }}
                  animate={{ scale: [0.5, 2.5], opacity: [1, 0] }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </motion.div>
            )}

            {/* Subtle vibration during travel */}
            {isTraveling && (
              <motion.div
                className="absolute inset-0 z-[1] pointer-events-none"
                animate={{ x: [0, 0.5, -0.3, 0.2, 0], y: [0, -0.3, 0.5, -0.2, 0] }}
                transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ElevatorTransition;
