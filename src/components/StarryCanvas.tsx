import React, { useEffect, useRef } from 'react';
import { ConstellationStar } from '../types';

interface StarryCanvasProps {
  constellations: ConstellationStar[];
  onSelectStar: (star: ConstellationStar) => void;
  heartbeatPulseActive: boolean;
  themePalette?: 'soft-red' | 'midnight-sky';
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  baseAlpha: number;
  twinkleSpeed: number;
  secondaryTwinkleSpeed: number;
  phase: number;
  twinkleDepth: number;
  colorType: 'white' | 'rose' | 'gold' | 'silver';
  hasGlint: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  dx: number;
  dy: number;
  opacity: number;
  trail: { x: number; y: number }[];
}

export const StarryCanvas: React.FC<StarryCanvasProps> = ({
  constellations,
  onSelectStar,
  heartbeatPulseActive,
  themePalette = 'soft-red',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pulseRingsRef = useRef<{ radius: number; maxRadius: number; alpha: number }[]>([]);

  useEffect(() => {
    if (heartbeatPulseActive) {
      const maxDist = Math.max(window.innerWidth, window.innerHeight) * 1.2;
      pulseRingsRef.current.push(
        { radius: 10, maxRadius: maxDist, alpha: 0.95 },
        { radius: -45, maxRadius: maxDist, alpha: 0.8 },
        { radius: -100, maxRadius: maxDist, alpha: 0.65 }
      );
    }
  }, [heartbeatPulseActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize rich randomized background stars with gentle twinkling properties
    const stars: Particle[] = Array.from({ length: 180 }, () => {
      const sizeRand = Math.random();
      // Most stars are tiny delicate pinpoints, a few are larger glowing beacons
      const size = sizeRand < 0.65 
        ? Math.random() * 0.8 + 0.5 
        : sizeRand < 0.9 
          ? Math.random() * 0.8 + 1.2 
          : Math.random() * 0.9 + 1.8;

      const colorRoll = Math.random();
      const colorType: 'white' | 'rose' | 'gold' | 'silver' =
        colorRoll < 0.45 ? 'white' : colorRoll < 0.72 ? 'rose' : colorRoll < 0.88 ? 'gold' : 'silver';

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        speed: Math.random() * 0.04 + 0.01,
        baseAlpha: Math.random() * 0.45 + 0.35,
        twinkleSpeed: Math.random() * 0.0025 + 0.0012,
        secondaryTwinkleSpeed: Math.random() * 0.004 + 0.002,
        phase: Math.random() * Math.PI * 2,
        twinkleDepth: Math.random() * 0.35 + 0.25,
        colorType,
        hasGlint: size > 1.35 && Math.random() > 0.35,
      };
    });

    let shootingStars: ShootingStar[] = [];
    let lastShootingStarTime = Date.now();

    const isRedTheme = themePalette === 'soft-red';

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep celestial gradient background
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        50,
        width * 0.5,
        height * 0.5,
        width * 0.8
      );

      if (isRedTheme) {
        grad.addColorStop(0, '#1c0810');     // Soft velvet wine
        grad.addColorStop(0.35, '#12040a');  // Dark rose noir
        grad.addColorStop(1, '#080205');     // Deepest garnet noir
      } else {
        grad.addColorStop(0, '#0d1322');
        grad.addColorStop(0.4, '#080c16');
        grad.addColorStop(1, '#05070c');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle warm nebula cloud in upper center
      const nebula = ctx.createRadialGradient(
        width * 0.5,
        height * 0.25,
        20,
        width * 0.5,
        height * 0.25,
        width * 0.55
      );

      if (isRedTheme) {
        nebula.addColorStop(0, 'rgba(244, 63, 94, 0.07)');
        nebula.addColorStop(0.5, 'rgba(225, 29, 72, 0.04)');
        nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        nebula.addColorStop(0, 'rgba(180, 140, 80, 0.04)');
        nebula.addColorStop(0.5, 'rgba(217, 88, 116, 0.03)');
        nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      const time = Date.now();

      // Draw background twinkling stars with gentle, natural atmospheric shimmering
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        // Multi-frequency harmonic twinkle for rich, organic atmospheric shimmering
        const primaryWave = Math.sin(time * star.twinkleSpeed + star.phase);
        const secondaryWave = Math.sin(time * star.secondaryTwinkleSpeed + star.phase * 1.618);
        const twinkleFactor = primaryWave * 0.72 + secondaryWave * 0.28;
        const currentAlpha = Math.max(0.12, Math.min(0.98, star.baseAlpha + twinkleFactor * star.twinkleDepth));

        // Determine starlight RGB
        let r = 255;
        let g = 255;
        let b = 255;
        if (isRedTheme) {
          if (star.colorType === 'rose') {
            r = 254; g = 205; b = 211;
          } else if (star.colorType === 'gold') {
            r = 253; g = 230; b = 138;
          } else if (star.colorType === 'silver') {
            r = 241; g = 245; b = 249;
          }
        } else {
          if (star.colorType === 'gold') {
            r = 229; g = 190; b = 122;
          } else if (star.colorType === 'rose') {
            r = 244; g = 114; b = 182;
          } else {
            r = 224; g = 231; b = 255;
          }
        }

        // Micro diffraction glint and soft radiant aura on peak twinkle
        if (star.hasGlint && currentAlpha > 0.65) {
          const glintPower = (currentAlpha - 0.65) / 0.35;
          const glintLen = star.size * (2.4 + primaryWave * 0.9);

          // Subtle diamond cross micro-glint
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${glintPower * 0.4})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(star.x - glintLen, star.y);
          ctx.lineTo(star.x + glintLen, star.y);
          ctx.moveTo(star.x, star.y - glintLen);
          ctx.lineTo(star.x, star.y + glintLen);
          ctx.stroke();

          // Soft ambient starlight glow aura
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${glintPower * 0.18})`;
          ctx.fill();
        }

        // Main star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        ctx.fill();
      });

      // Spawn periodic shooting star
      const now = Date.now();
      if (now - lastShootingStarTime > 14000 + Math.random() * 10000) {
        lastShootingStarTime = now;
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 80 + 90,
          speed: Math.random() * 6 + 12,
          dx: 1,
          dy: 0.65,
          opacity: 1,
          trail: [],
        });
      }

      // Render shooting stars
      shootingStars = shootingStars.filter((ss) => ss.opacity > 0.02);
      shootingStars.forEach((ss) => {
        ss.x += ss.speed * ss.dx;
        ss.y += ss.speed * ss.dy;
        ss.opacity -= 0.016;

        const tailX = ss.x - ss.length * ss.dx;
        const tailY = ss.y - ss.length * ss.dy;

        const ssGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        ssGrad.addColorStop(0, 'rgba(229, 190, 122, 0)');
        ssGrad.addColorStop(0.7, `rgba(244, 237, 226, ${ss.opacity * 0.5})`);
        ssGrad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = ssGrad;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Bright star head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
        ctx.fill();
      });

      // Draw constellation connections between adjacent stars
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(229, 190, 122, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);

      for (let i = 0; i < constellations.length; i++) {
        const p1 = constellations[i];
        const next = constellations[(i + 1) % constellations.length];
        const x1 = (p1.x / 100) * width;
        const y1 = (p1.y / 100) * height;
        const x2 = (next.x / 100) * width;
        const y2 = (next.y / 100) * height;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw heartbeat pulse concentric rings
      pulseRingsRef.current = pulseRingsRef.current.filter((r) => r.radius < r.maxRadius && r.alpha > 0.01);
      pulseRingsRef.current.forEach((ring) => {
        ring.radius += 10;
        ring.alpha = Math.max(0, (1 - ring.radius / ring.maxRadius) * 0.9);

        if (ring.radius > 5) {
          ctx.beginPath();
          ctx.arc(width * 0.5, height * 0.5, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = isRedTheme
            ? `rgba(244, 63, 94, ${ring.alpha})`
            : `rgba(225, 29, 72, ${ring.alpha})`;
          ctx.lineWidth = 3.5;
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#e11d48';
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Inner secondary harmonic ring
          if (ring.radius > 40) {
            ctx.beginPath();
            ctx.arc(width * 0.5, height * 0.5, ring.radius - 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(253, 164, 175, ${ring.alpha * 0.6})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [constellations, themePalette]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Clickable Constellation Nodes in HTML layer for accessibility and tap targets */}
      {constellations.map((star) => {
        return (
          <button
            key={star.id}
            onClick={() => onSelectStar(star)}
            style={{ left: `${star.x}%`, top: `${star.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer p-3 focus:outline-none"
            aria-label={`Constellation star: ${star.name}`}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing beacon ring */}
              <div className="absolute w-8 h-8 rounded-full border border-[#e5be7a]/30 group-hover:border-[#e5be7a] group-hover:scale-125 transition-all duration-500 animate-ping opacity-25" />
              {/* Glowing halo */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#e5be7a] shadow-[0_0_15px_#e5be7a] group-hover:shadow-[0_0_22px_#f9e2b2] group-hover:scale-150 transition-all duration-300" />
              {/* Name tooltip on hover */}
              <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-serif tracking-wider text-[#e5be7a] bg-[#0d121c]/90 px-2.5 py-1 rounded border border-[#222d42] pointer-events-none shadow-lg">
                {star.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
