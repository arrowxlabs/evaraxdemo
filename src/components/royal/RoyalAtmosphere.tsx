import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RoyalCrown } from "@/components/royal/RoyalCrest";

gsap.registerPlugin(ScrollTrigger);

const particles = [
  [8, 14, 3], [18, 42, 2], [28, 72, 4], [39, 23, 2], [48, 58, 3],
  [58, 84, 2], [67, 34, 4], [76, 68, 2], [87, 18, 3], [93, 51, 2],
  [12, 88, 2], [34, 48, 3], [63, 8, 2], [82, 91, 3],
] as const;

export const RoyalAtmosphere = () => {
  const { scrollYProgress } = useScroll();
  const nearY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const farY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 18]);

  return (
    <div className="royal-atmosphere" aria-hidden="true">
      <motion.div className="royal-atmosphere__wash" style={{ y: farY }} />
      <motion.div className="royal-atmosphere__particles" style={{ y: nearY }}>
        {particles.map(([left, top, size], index) => (
          <i key={`${left}-${top}`} style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${index * -0.7}s` }} />
        ))}
      </motion.div>
      <motion.div className="royal-atmosphere__orbital" style={{ rotate }}>
        <RoyalCrown className="h-16 w-32" />
      </motion.div>
    </div>
  );
};

export const useRoyalSectionReveals = () => {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scope.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-royal-reveal]").forEach((section) => {
        const content = section.querySelector<HTMLElement>("[data-royal-content]") || section;
        gsap.fromTo(content, { y: 54, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 82%", once: true },
        });
      });
    }, node);

    return () => context.revert();
  }, []);

  return scope;
};