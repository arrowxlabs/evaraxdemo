import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  poster?: string;
  className?: string;
  aspectRatio?: string;
}

/**
 * Optimized looping video — autoplay, muted, playsInline.
 * Default 9:16 portrait per project preference. Lazy-starts via
 * IntersectionObserver and pauses off-screen to save battery on mobile.
 */
const LoopVideo = ({ src, poster, className = "", aspectRatio = "9 / 16" }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`relative overflow-hidden bg-muted mx-auto ${className}`}
      style={{ aspectRatio, maxWidth: "min(100%, 420px)" }}
    >
      {!ready && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "linear-gradient(110deg, hsl(var(--muted)) 30%, hsl(var(--muted-foreground) / 0.08) 50%, hsl(var(--muted)) 70%)",
            backgroundSize: "200% 100%",
          }}
        />
      )}
      <video
        ref={ref}
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        {...({ "webkit-playsinline": "true" } as Record<string, string>)}
        disableRemotePlayback
      />
    </div>
  );
};

export default LoopVideo;
