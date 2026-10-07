import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface LmenLogoProps {
  variant?: 'desktop' | 'mobile' | 'compact' | 'symbol';
  className?: string;
  themeMode?: 'auto' | 'dark' | 'light';
}

export const LmenLogo: React.FC<LmenLogoProps> = ({
  variant = 'desktop',
  className = '',
  themeMode = 'auto',
}) => {
  const { theme } = useTheme();
  const effectiveTheme = themeMode === 'auto' ? theme : themeMode;
  const isDark = effectiveTheme === 'dark';

  // EXACT vector art replica of the attached logo image:
  // - 1:1 aspect ratio square
  // - Solid jet-black background (#000000)
  // - Athletic soccer player silhouette in dark grey (#4A5059) in dynamic kicking pose
  // - Soccer ball (#4A5059) suspended under the player's kick
  // - White rectangular bounding frame box
  // - Exact text "LMEN - SPORTS" in solid white bold sans-serif centered inside the box
  const EmblemLogo = ({ sizeClass = 'h-11 w-11' }: { sizeClass?: string }) => (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl bg-black flex items-center justify-center border border-white/20 shadow-md transition-transform duration-200 group-hover:scale-105 ${sizeClass}`}
      title="LMEN - SPORTS"
    >
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Solid Black Background */}
        <rect width="1000" height="1000" fill="#000000" />

        {/* Soccer Player Silhouette in grey (#4A5059) */}
        <g fill="#4A5059">
          {/* Head */}
          <path d="M 538 164 C 555 164, 571 176, 573 197 C 574 212, 570 231, 563 247 C 554 254, 545 256, 535 256 C 522 256, 514 250, 509 238 C 504 220, 507 197, 513 182 C 520 169, 528 164, 538 164 Z" />
          
          {/* Left arm raised backward */}
          <path d="M 498 274 C 452 296, 384 330, 328 352 C 314 358, 301 372, 303 388 C 305 401, 318 406, 331 401 C 342 396, 355 385, 372 371 C 418 344, 460 318, 499 292 Z" />

          {/* Right arm extended outward */}
          <path d="M 574 278 C 636 303, 712 318, 743 290 C 762 272, 750 258, 718 270 C 665 288, 606 280, 568 266 Z" />

          {/* Torso, kicking leg and planted leg */}
          <path d="M 505 262 C 472 284, 456 304, 467 328 C 484 372, 510 416, 532 460 L 498 518 C 442 590, 374 650, 316 678 C 296 688, 304 716, 324 714 C 366 710, 430 662, 486 604 C 516 572, 546 536, 564 504 L 578 562 C 582 642, 572 730, 554 812 C 548 838, 540 864, 542 892 C 544 914, 576 928, 594 914 C 612 894, 608 862, 610 832 C 622 744, 626 658, 610 570 L 608 464 C 616 396, 606 332, 578 280 C 560 250, 528 240, 505 262 Z" />
        </g>

        {/* Soccer ball under left foot */}
        <circle cx="426" cy="578" r="46" fill="#4A5059" />

        {/* Rectangular boundary frame */}
        <rect
          x="96"
          y="428"
          width="820"
          height="138"
          stroke="#FFFFFF"
          strokeWidth="16"
          fill="none"
        />

        {/* LMEN - SPORTS brand text */}
        <text
          x="506"
          y="528"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', Arial, sans-serif"
          fontWeight="900"
          fontSize="94"
          letterSpacing="4"
          textAnchor="middle"
        >
          LMEN - SPORTS
        </text>
      </svg>
    </div>
  );

  if (variant === 'symbol') {
    return (
      <div className={`cursor-pointer ${className}`}>
        <EmblemLogo sizeClass="w-10 h-10" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 select-none group cursor-pointer ${className}`}>
        <EmblemLogo sizeClass="w-9 h-9" />
        <span className={`text-base font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-950'}`}>
          LMEN<span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}> SPORTS</span>
        </span>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
        <EmblemLogo sizeClass="w-10 h-10" />
        <div className="flex flex-col">
          <span className={`text-base font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            LMEN<span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}> SPORTS</span>
          </span>
          <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase mt-0.5">
            Seu Estilo. Seu Esporte.
          </span>
        </div>
      </div>
    );
  }

  // Desktop default full badge
  return (
    <div className={`flex items-center gap-3.5 select-none group cursor-pointer ${className}`}>
      {/* Official emblem badge strictly preserving the attached logo's 1:1 ratio and elements */}
      <EmblemLogo sizeClass="w-12 h-12" />

      {/* Brand title and slogan */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`text-xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            LMEN<span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}> SPORTS</span>
          </span>
          <span className={`inline-block w-2 h-2 rounded-full ${isDark ? 'bg-white' : 'bg-zinc-900'} transition-transform group-hover:scale-125`} />
        </div>
        <span className="text-[10.5px] font-bold tracking-widest text-zinc-400 uppercase leading-tight mt-0.5">
          Seu Estilo. Seu Esporte.
        </span>
      </div>
    </div>
  );
};
