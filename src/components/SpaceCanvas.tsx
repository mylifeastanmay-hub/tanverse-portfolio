import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  color: string;
  glowColor: string;
  alpha: number;
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

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = window.innerWidth < 768 ? 60 : 120;

    // Colors matched with Tanverse theme
    const colors = [
      { r: 0, g: 242, b: 254 }, // Cyan
      { r: 182, g: 0, b: 168 }, // Magenta
      { r: 215, g: 226, b: 234 } // Silver-Blue
    ];

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const colorConfig = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 2 + 1;
        const vx = (Math.random() - 0.5) * 0.4;
        const vy = (Math.random() - 0.5) * 0.4;

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          size,
          color: `rgba(${colorConfig.r}, ${colorConfig.g}, ${colorConfig.b},`,
          glowColor: `rgba(${colorConfig.r}, ${colorConfig.g}, ${colorConfig.b}, 0.25)`,
          alpha: Math.random() * 0.5 + 0.3
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

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;
      scrollSpeed.current = diff * 0.15; // scroll speed scale
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', initCanvas);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decelerate scroll speed impact smoothly
      scrollSpeed.current *= 0.92;

      const mouse = mouseRef.current;
      const connDist = 95;
      const mouseConnDist = 130;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply scroll warp impact (temporary velocity shift)
        p.vy = p.baseVy - scrollSpeed.current * 0.2;

        // Mouse gravity pull & distance calculation
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseConnDist) {
          // Attract particles slightly to the mouse cursor
          const force = (mouseConnDist - dist) / mouseConnDist;
          p.x += (dx / dist) * force * 0.6;
          p.y += (dy / dist) * force * 0.6;

          // Draw connection to mouse
          ctx.strokeStyle = `rgba(0, 242, 254, ${(mouseConnDist - dist) / mouseConnDist * 0.25})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Standard drift movement
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Render particle
        ctx.fillStyle = `${p.color} ${p.alpha})`;
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
            const alpha2 = ((connDist - dist2) / connDist) * 0.12;
            ctx.strokeStyle = `rgba(215, 226, 234, ${alpha2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', initCanvas);
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
