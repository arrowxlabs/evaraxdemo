import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageTransitionProps {
  isActive: boolean;
  onMidpoint: () => void;
  onComplete: () => void;
  targetImage?: string;
}

const PageTransition = ({ isActive, onMidpoint, onComplete, targetImage }: PageTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const doorFrameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isActive || hasRun.current) return;
    hasRun.current = true;

    const container = containerRef.current;
    const overlay = overlayRef.current;
    const doorFrame = doorFrameRef.current;
    const image = imageRef.current;
    const glow = glowRef.current;
    const text = textRef.current;
    if (!container || !overlay || !doorFrame || !image || !glow || !text) return;

    const tl = gsap.timeline({
      onComplete: () => {
        hasRun.current = false;
        onComplete();
      },
    });

    // Phase 1: Overlay fades in with zoom
    tl.set(container, { display: "flex", opacity: 1 })
      .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.inOut" })
      // Phase 2: Door frame appears and zooms towards viewer
      .fromTo(doorFrame, 
        { scale: 0.3, opacity: 0, borderRadius: "24px" }, 
        { scale: 1, opacity: 1, borderRadius: "0px", duration: 0.8, ease: "power3.inOut" },
        "-=0.1"
      )
      // Text appears on the door
      .fromTo(text,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        "-=0.3"
      )
      // Phase 3: Camera zooms INTO the door (scale up massively, image reveals)
      .to(text, { opacity: 0, duration: 0.2, ease: "power2.in" })
      .call(() => onMidpoint())
      .fromTo(image,
        { scale: 1.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.1"
      )
      .to(doorFrame, { 
        scale: 8, 
        duration: 1.0, 
        ease: "power3.in",
      }, "-=0.5")
      // Phase 4: Golden glow flash
      .fromTo(glow,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: "power2.in" }
      )
      .to(glow, { opacity: 0, duration: 0.3, ease: "power2.out" })
      // Phase 5: Everything fades revealing the new page
      .to(overlay, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "-=0.2")
      .to(container, { opacity: 0, duration: 0.3, ease: "power2.out" })
      .set(container, { display: "none" });
  }, [isActive, onMidpoint, onComplete]);

  useEffect(() => {
    if (!isActive) {
      hasRun.current = false;
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] items-center justify-center"
      style={{ display: "none", perspective: "1200px" }}
    >
      {/* Dark overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{ background: "hsl(30 10% 8% / 0.92)" }}
      />

      {/* Door frame - the hotel entrance */}
      <div
        ref={doorFrameRef}
        className="relative z-10 overflow-hidden"
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(180deg, hsl(38 16% 22%) 0%, hsl(30 14% 16%) 50%, hsl(28 12% 10%) 100%)",
          border: "3px solid hsl(34 30% 36% / 0.4)",
          transformOrigin: "center center",
        }}
      >
        {/* Door arch decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%]" style={{
          borderBottom: "2px solid hsl(34 30% 40% / 0.2)",
          borderRadius: "0 0 50% 50%",
        }} />
        
        {/* Side pillars */}
        <div className="absolute top-[10%] bottom-[5%] left-[3%] w-[2px]" style={{
          background: "linear-gradient(180deg, transparent, hsl(34 30% 40% / 0.3), transparent)",
        }} />
        <div className="absolute top-[10%] bottom-[5%] right-[3%] w-[2px]" style={{
          background: "linear-gradient(180deg, transparent, hsl(34 30% 40% / 0.3), transparent)",
        }} />

        {/* Hotel entrance text */}
        <div
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20"
        >
          <div className="w-12 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(34 38% 56%), transparent)" }} />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.5rem, 4vw, 3rem)",
              fontWeight: 300,
              letterSpacing: "0.3em",
              color: "hsl(34 30% 60%)",
            }}
          >
            EVARA
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "8px",
              letterSpacing: "0.5em",
              color: "hsl(34 20% 45%)",
              textTransform: "uppercase",
            }}
          >
            Welcome
          </span>
          <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(34 38% 56%), transparent)" }} />
        </div>

        {/* Target hotel image filling the door */}
        <div
          ref={imageRef}
          className="absolute inset-0 z-10"
          style={{ opacity: 0 }}
        >
          {targetImage && (
            <img src={targetImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(circle at center, transparent 30%, hsl(30 10% 8% / 0.3) 100%)",
          }} />
        </div>
      </div>

      {/* Golden glow flash */}
      <div
        ref={glowRef}
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          opacity: 0,
          background: "radial-gradient(circle at center, hsl(34 50% 60% / 0.4) 0%, transparent 60%)",
        }}
      />
    </div>
  );
};

export default PageTransition;
