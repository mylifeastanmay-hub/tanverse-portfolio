import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number; // Depth layer: 0.35 (far) to 1.25 (near)
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  color: string;
  glowColor: string;
  alpha: number;
  pulsePhase: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export default function SpaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const lastScrollY = useRef(0);
  const scrollSpeed = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let isTabHidden = document.hidden;
    let particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];
    const getParticleCount = () => (window.innerWidth < 768 ? 55 : 115);

    // Colors matched with Tanverse cyberpunk theme
    const colors = [
      { r: 0, g: 242, b: 254 },   // Cyber Cyan
      { r: 182, g: 0, b: 168 },   // Neon Magenta
      { r: 215, g: 226, b: 234 }, // Silver-Blue
      { r: 16, g: 185, b: 129 }   // Emerald Telemetry
    ];

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const count = getParticleCount();
      particles = [];
      for (let i = 0; i < count; i++) {
        const colorConfig = colors[Math.floor(Math.random() * colors.length)];
        const z = Math.random() * 0.9 + 0.35; // 0.35 to 1.25 depth factor
        const size = (Math.random() * 1.8 + 0.8) * z;
        const vx = (Math.random() - 0.5) * 0.38 * z;
        const vy = (Math.random() - 0.5) * 0.38 * z;

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          size,
          color: `rgba(${colorConfig.r}, ${colorConfig.g}, ${colorConfig.b},`,
          glowColor: `rgba(${colorConfig.r}, ${colorConfig.g}, ${colorConfig.b}, 0.25)`,
          alpha: (Math.random() * 0.45 + 0.25) * Math.min(1, z),
          pulsePhase: Math.random() * Math.PI * 2
        });
      }
    };

    initCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const handleClick = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 190,
        alpha: 0.55,
        color: shockwaves.length % 2 === 0 ? '0, 242, 254' : '182, 0, 168'
      });
      if (shockwaves.length > 5) {
        shockwaves.shift();
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;
      scrollSpeed.current = Math.max(-25, Math.min(25, diff * 0.15));
      lastScrollY.current = currentScrollY;
    };

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', initCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let tick = 0;

    // Animation Loop
    const draw = () => {
      if (isTabHidden) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      tick += 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decelerate scroll speed impact smoothly
      scrollSpeed.current *= 0.92;

      const mouse = mouseRef.current;
      const connDist = 98;
      const mouseConnDist = 140;

      // Update & draw expanding cyber shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 4.2;
        sw.alpha = Math.max(0, 0.55 * (1 - sw.radius / sw.maxRadius));

        ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Apply scroll warp impact scaled by 3D depth factor z
          p.vy = p.baseVy - scrollSpeed.current * 0.18 * p.z;

          // Mouse gravity pull & distance calculation
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseConnDist && dist > 0.1) {
            const force = (mouseConnDist - dist) / mouseConnDist;
            p.x += (dx / dist) * force * 0.55 * p.z;
            p.y += (dy / dist) * force * 0.55 * p.z;

            // Draw connection to mouse
            ctx.strokeStyle = `rgba(0, 242, 254, ${force * 0.28})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }

          // Shockwave radial push
          for (let s = 0; s < shockwaves.length; s++) {
            const sw = shockwaves[s];
            const sdx = p.x - sw.x;
            const sdy = p.y - sw.y;
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            if (Math.abs(sdist - sw.radius) < 24 && sdist > 0.1) {
              p.x += (sdx / sdist) * 1.4 * p.z;
              p.y += (sdy / sdist) * 1.4 * p.z;
            }
          }

          // Standard drift movement
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around bounds
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        // Subtle twinkle modulation
        const twinkle = Math.sin(tick + p.pulsePhase) * 0.12;
        const currentAlpha = Math.max(0.12, Math.min(0.95, p.alpha + twinkle));

        // Render particle
        ctx.fillStyle = `${p.color} ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections between neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < connDist) {
            const alpha2 = ((connDist - dist2) / connDist) * 0.13;
            ctx.strokeStyle = `rgba(215, 226, 234, ${alpha2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Occasional data packet pulse traveling along active link
            if (!prefersReducedMotion && (i + j) % 19 === 0) {
              const t = (tick * 0.45 + (i % 7) * 0.15) % 1;
              const px = p.x + (p2.x - p.x) * t;
              const py = p.y + (p2.y - p.y) * t;
              ctx.fillStyle = `rgba(0, 242, 254, ${alpha2 * 3.2})`;
              ctx.beginPath();
              ctx.arc(px, py, 1.3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', initCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#0C0C0C]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
