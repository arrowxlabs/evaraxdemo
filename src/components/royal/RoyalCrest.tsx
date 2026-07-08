// Reusable royal SVG ornaments — baroque crest, fleur-de-lis, laurel, chandelier, wax seal.
// Kept as inline SVGs so they inherit currentColor and stay crisp at any breakpoint.

export const RoyalCrown = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 60" className={className} fill="none" stroke="currentColor" strokeWidth="1.1">
    <path d="M10 50 L20 15 L35 40 L60 8 L85 40 L100 15 L110 50 Z" />
    <path d="M10 50 H110" />
    <circle cx="20" cy="15" r="3" fill="currentColor" />
    <circle cx="60" cy="8" r="3.5" fill="currentColor" />
    <circle cx="100" cy="15" r="3" fill="currentColor" />
    <path d="M55 8 L60 0 L65 8" strokeWidth="1" />
  </svg>
);

export const FleurDeLis = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 40 60" className={className} fill="currentColor">
    <path d="M20 4 C18 14, 10 16, 10 26 C10 32, 14 34, 20 32 C26 34, 30 32, 30 26 C30 16, 22 14, 20 4 Z" opacity="0.9"/>
    <path d="M8 30 C4 34, 4 42, 10 44 C6 48, 8 54, 14 52 C18 50, 20 44, 20 40 C20 44, 22 50, 26 52 C32 54, 34 48, 30 44 C36 42, 36 34, 32 30 C28 32, 24 36, 20 36 C16 36, 12 32, 8 30 Z" opacity="0.9"/>
    <rect x="6" y="38" width="28" height="2" opacity="0.7"/>
  </svg>
);

export const LaurelDivider = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 300 40" className={className} fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M0 20 H120" opacity="0.5" />
    <path d="M180 20 H300" opacity="0.5" />
    <g transform="translate(150 20)">
      <path d="M-25 0 Q -18 -10, -8 -6 Q -14 4, -25 0 Z" fill="currentColor" opacity="0.9"/>
      <path d="M-18 -8 Q -12 -16, -2 -12 Q -8 -2, -18 -8 Z" fill="currentColor" opacity="0.9"/>
      <path d="M25 0 Q 18 -10, 8 -6 Q 14 4, 25 0 Z" fill="currentColor" opacity="0.9"/>
      <path d="M18 -8 Q 12 -16, 2 -12 Q 8 -2, 18 -8 Z" fill="currentColor" opacity="0.9"/>
      <circle cx="0" cy="0" r="4" fill="currentColor" />
      <circle cx="0" cy="0" r="7" stroke="currentColor" fill="none"/>
    </g>
  </svg>
);

export const Chandelier = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 220" className={className} fill="none" stroke="currentColor" strokeWidth="0.9">
    <path d="M100 0 V40" />
    <circle cx="100" cy="46" r="6" fill="currentColor" />
    <path d="M100 52 V80" />
    {/* tiers */}
    <ellipse cx="100" cy="90" rx="70" ry="10" />
    <ellipse cx="100" cy="130" rx="55" ry="8" />
    <ellipse cx="100" cy="165" rx="35" ry="6" />
    {/* candles */}
    {[30,60,100,140,170].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 90 V78`} />
        <ellipse cx={x} cy="74" rx="2" ry="4" fill="currentColor" opacity="0.85"/>
      </g>
    ))}
    {[50,80,120,150].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 130 V118`} />
        <ellipse cx={x} cy="114" rx="2" ry="4" fill="currentColor" opacity="0.85"/>
      </g>
    ))}
    {/* crystal drops */}
    {[35,60,85,115,140,165].map((x,i)=>(
      <path key={i} d={`M${x} 100 L${x} 118`} opacity="0.35"/>
    ))}
    <path d="M100 170 V200 M85 178 V196 M115 178 V196" opacity="0.5"/>
    <circle cx="100" cy="205" r="6" fill="currentColor"/>
  </svg>
);

export const OrnateFrame = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 400 500" className={className} fill="none" stroke="currentColor" strokeWidth="1" preserveAspectRatio="none">
    <rect x="6" y="6" width="388" height="488" />
    <rect x="14" y="14" width="372" height="472" opacity="0.6"/>
    {/* corner flourishes */}
    {[
      "M14 40 Q30 14, 60 14",
      "M340 14 Q370 14, 386 40",
      "M14 460 Q14 486, 60 486",
      "M340 486 Q386 486, 386 460",
    ].map((d,i)=>(
      <path key={i} d={d} strokeWidth="2" />
    ))}
    {[[30,30],[370,30],[30,470],[370,470]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="4" fill="currentColor"/>
    ))}
    {/* top & bottom crest */}
    <path d="M195 6 L200 -2 L205 6 Z" fill="currentColor" transform="translate(0 8)"/>
    <path d="M195 494 L200 502 L205 494 Z" fill="currentColor"/>
  </svg>
);

export const WaxSeal = ({ className = "", label = "E" }: { className?: string; label?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="wax" cx="35%" cy="30%">
        <stop offset="0%" stopColor="hsl(350 60% 50%)"/>
        <stop offset="60%" stopColor="hsl(350 65% 30%)"/>
        <stop offset="100%" stopColor="hsl(350 70% 18%)"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="42" fill="url(#wax)"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="hsl(42 60% 65%)" strokeWidth="0.8" opacity="0.7"/>
    <text x="50" y="62" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="34" fontWeight="600" fill="hsl(42 60% 70%)">{label}</text>
  </svg>
);

export const RoyalDivider = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-4 text-royal-gold ${className}`}>
    <div className="h-px w-24 sm:w-40 bg-gradient-to-r from-transparent via-current to-current opacity-70"/>
    <FleurDeLis className="w-4 h-6 opacity-90"/>
    <div className="h-px w-24 sm:w-40 bg-gradient-to-l from-transparent via-current to-current opacity-70"/>
  </div>
);
