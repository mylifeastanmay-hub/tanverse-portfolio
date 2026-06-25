import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, MotionValue, AnimatePresence, useMotionValue } from 'framer-motion';

// Local Asset Imports
import tanverseAvatar from './assets/tanverse-avatar-cutout.png';
import foundlyHero from './assets/foundly-hero.png';
import foundlyStudent from './assets/foundly-student-desktop.png';
import portfolioHeroMockup from './assets/portfolio-hero-mockup.png';
import portfolioSkillsMockup from './assets/portfolio-skills-mockup.png';
import portfolioExperienceMockup from './assets/portfolio-experience-mockup.png';

// 3D Glassmorphic Charm Imports
import charmDodecahedron from './assets/charms/charm-dodecahedron.png';
import charmInfinity from './assets/charms/charm-infinity.png';
import charmLightbulb from './assets/charms/charm-lightbulb.png';
import charmGear from './assets/charms/charm-gear.png';
import SpaceCanvas from './components/SpaceCanvas';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';



// ==========================================
// 1. REUSABLE COMPONENTS & UTILITIES
// ==========================================

// Reusable FadeIn Component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 50,
  className = '',
  as = 'div',
}: FadeInProps) {
  const Component = useMemo(() => {
    // Dynamic element mapping for Framer Motion
    // @ts-ignore
    return motion[as] || motion.div;
  }, [as]);

  return (
    <Component
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 45,
        damping: 16,
        mass: 0.8,
        delay
      }}
    >
      {children}
    </Component>
  );
}

// Reusable Section Divider for smooth page blending
export function SectionDivider() {
  return (
    <div className="relative w-full max-w-5xl mx-auto h-px my-0 opacity-40 z-20 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
    </div>
  );
}

// Web Audio API Programmatic Cybernetic Sound Synthesizer
export const playCyberSound = (type: 'click' | 'hover' | 'popup' | 'glide') => {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      // Telemetry select beep-blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hover') {
      // Subtle focus transient tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.setValueAtTime(1600, now + 0.008);
      
      gainNode.gain.setValueAtTime(0.015, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'popup') {
      // Rising diagnostic sweep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
      
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'glide') {
      // Gliding frequency sweep (cyber slide)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.35);
      
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    // Fail silently
  }
};

// ==========================================
// PROGRESSIVE IMAGE COMPONENT (Refinement 3)
// ==========================================
interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function ProgressiveImage({ src, alt, className = '', loading = 'lazy' }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Shimmer placeholder */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`${className} transition-all duration-700 ease-out ${
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-[1.02]'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); setError(true); }}
      />
    </div>
  );
}

// Reusable ContactButton Component
export function ContactButton() {
  return (
    <a
      href="#contact"
      onMouseEnter={() => playCyberSound('hover')}
      onClick={() => playCyberSound('glide')}
      className="contact-button inline-flex justify-center items-center rounded-full text-white font-medium uppercase tracking-widest text-xs sm:text-sm md:text-base px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 transition-transform hover:scale-105 active:scale-95"
    >
      Contact Me
    </a>
  );
}

// Reusable ResumeButton Component (Refinement 5)
export function ResumeButton() {
  return (
    <a
      href="https://drive.google.com/file/d/1i0MHk-3KpGRxJGlmMRWJnNOLuMV9mxK3/view?usp=sharing"
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => playCyberSound('hover')}
      onClick={() => playCyberSound('click')}
      className="inline-flex justify-center items-center gap-2 rounded-full border border-[#D7E2EA]/30 bg-white/[0.04] backdrop-blur-sm text-[#D7E2EA] font-medium uppercase tracking-widest text-xs sm:text-sm md:text-base px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 transition-all hover:bg-white/[0.08] hover:border-[#D7E2EA]/60 hover:scale-105 active:scale-95"
    >
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Resume
    </a>
  );
}

// Reusable LiveProjectButton Component
interface LiveProjectButtonProps {
  href: string;
}

export function LiveProjectButton({ href }: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => playCyberSound('hover')}
      onClick={() => playCyberSound('click')}
      className="inline-flex justify-center items-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest text-sm sm:text-base px-8 py-3 sm:px-10 sm:py-3.5 transition-colors hover:bg-[#D7E2EA]/10 active:scale-98"
    >
      Live Project
    </a>
  );
}

// Reusable Magnet Component
interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
}

export function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
}: MagnetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    const maxDistance = Math.max(rect.width, rect.height) / 2 + padding;

    if (distance < maxDistance) {
      setIsHovered(true);
      setPosition({
        x: distanceX / strength,
        y: distanceY / strength,
      });
    } else {
      setIsHovered(false);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={isHovered ? 'magnet-transition-active' : 'magnet-transition-inactive'}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

// Reusable AnimatedCharacter for character-by-character reveal
interface AnimatedCharacterProps {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function AnimatedCharacter({ char, index, total, progress }: AnimatedCharacterProps) {
  const start = index / total;
  const end = Math.min(1.0, start + 0.12);
  const opacity = useTransform(progress, [start, end], [0.2, 1.0]);

  return (
    <span className="relative inline-block">
      <span className="opacity-0">{char === ' ' ? '\u00A0' : char}</span>
      <motion.span style={{ opacity }} className="absolute inset-0">
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    </span>
  );
}

// Reusable AnimatedText Component
interface AnimatedTextProps {
  text: string;
  className?: string;
}

export function AnimatedText({ text, className = '' }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const characters = useMemo(() => text.split(''), [text]);

  return (
    <p ref={ref} className={className}>
      {characters.map((char, index) => (
        <AnimatedCharacter
          key={index}
          char={char}
          index={index}
          total={characters.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}

// ==========================================
// 2. 3D ASSEMBLING LOGO & INTRO OVERLAY
// ==========================================

const letterEntrances = [
  { x: -520, y: -180, rotateX: 35, rotateY: -125, rotateZ: -28 },
  { x: 280, y: -420, rotateX: -110, rotateY: 45, rotateZ: 24 },
  { x: -340, y: 360, rotateX: 95, rotateY: -65, rotateZ: 32 },
  { x: 40, y: -520, rotateX: -130, rotateY: 100, rotateZ: -18 },
  { x: 430, y: 260, rotateX: 75, rotateY: 120, rotateZ: 28 },
  { x: -500, y: 120, rotateX: -55, rotateY: -135, rotateZ: -34 },
  { x: 260, y: 430, rotateX: 120, rotateY: 55, rotateZ: 38 },
  { x: 520, y: -220, rotateX: -80, rotateY: 135, rotateZ: 30 },
];

interface AnimatedLogoProps {
  splash?: boolean;
}

function AnimatedLogo({ splash = false }: AnimatedLogoProps) {
  return (
    <div
      className={splash ? 'overflow-visible' : 'mt-2 overflow-visible sm:mt-0'}
      style={{ perspective: '1200px' }}
    >
      <h1
        aria-label="TANVERSE"
        className={`${
          splash
            ? 'intro-logo text-[16vw] sm:text-[13vw] lg:text-[10vw]'
            : 'text-[clamp(3rem,16vw,17vh)] sm:text-[clamp(6rem,20vw,21vh)]'
        } flex w-full justify-center whitespace-nowrap font-black uppercase leading-none tracking-tight`}
      >
        {"TANVERSE".split('').map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            aria-hidden="true"
            className="tanverse-letter inline-block font-sans"
            style={{
              '--start-x': `${splash ? letterEntrances[index].x * 1.45 : letterEntrances[index].x}px`,
              '--start-y': `${splash ? letterEntrances[index].y * 1.35 : letterEntrances[index].y}px`,
              '--start-z': splash ? '-1300px' : '-900px',
              '--rotate-x': `${letterEntrances[index].rotateX}deg`,
              '--rotate-y': `${letterEntrances[index].rotateY}deg`,
              '--rotate-z': `${letterEntrances[index].rotateZ}deg`,
              '--letter-delay': `${(splash ? 0.18 : 0.45) + index * (splash ? 0.13 : 0.1)}s`,
              '--letter-duration': splash ? '3.25s' : '3.6s',
            } as React.CSSProperties}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
}

function IntroOverlay() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowIntro(false), 4300);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0C0C0C]"
          initial={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{
            opacity: 0,
            scale: 1.08,
            filter: 'blur(10px)',
            clipPath: 'inset(0% 50% 0% 50%)',
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Radial Glows */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(215,226,234,0.12),transparent_36%),radial-gradient(circle_at_28%_36%,rgba(124,183,255,0.08),transparent_30%)]" />
          
          <motion.div
            initial={{ scale: 0.88 }}
            animate={{ scale: [1, 1.035, 1] }}
            transition={{ duration: 3.7, ease: 'easeInOut' }}
            className="relative z-10 w-full"
          >
            <AnimatedLogo splash />
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: ['0%', '42%', '0%'], opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.55, delay: 2.55, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-8 block h-px bg-gradient-to-r from-transparent via-[#D7E2EA]/75 to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 3. MAIN SECTIONS
// ==========================================

// Hero Section Component
function HeroSection({ avatarUrl }: { avatarUrl?: string }) {
  return (
    <section className="relative flex h-[100dvh] sm:min-h-[620px] flex-col overflow-hidden bg-transparent px-6 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(91,116,140,0.18),transparent_34%)]" />

      
      {/* Navbar */}
      <FadeIn y={-20} className="relative z-50">
        <nav className="flex justify-between items-center w-full pt-6 md:pt-8 text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-[#D7E2EA]">
          <a href="#about" onClick={() => playCyberSound('glide')} className="transition-opacity duration-200 hover:opacity-70">About</a>
          <a href="#skills" onClick={() => playCyberSound('glide')} className="transition-opacity duration-200 hover:opacity-70">Skills</a>
          <a href="#experience" onClick={() => playCyberSound('glide')} className="transition-opacity duration-200 hover:opacity-70">Experience</a>
          <a href="#projects" onClick={() => playCyberSound('glide')} className="transition-opacity duration-200 hover:opacity-70">Projects</a>
          <a href="#contact" onClick={() => playCyberSound('glide')} className="transition-opacity duration-200 hover:opacity-70">Contact</a>
        </nav>
      </FadeIn>

      {/* Hero Heading - Animated Assembling TANVERSE */}
      <div className="relative z-20 flex flex-col items-center justify-start mt-4 md:mt-6 overflow-visible">
        <AnimatedLogo />
      </div>

      {/* Hero Portrait */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[250px] sm:w-[320px] md:w-[390px] lg:w-[460px] bottom-24 sm:bottom-0">
        <FadeIn delay={0.6} y={30}>
          <Magnet padding={150} strength={3}>
            <div className="relative select-none w-full">
              <img
                src={avatarUrl || tanverseAvatar}
                alt="Tanverse - 3D Portrait"
                className="w-full drop-shadow-2xl object-contain"
                loading="eager"
              />
              <div className="alive-avatar-hair alive-avatar-hair-one" />
              <div className="alive-avatar-hair alive-avatar-hair-two" />
              <div className="alive-avatar-hair alive-avatar-hair-three" />
            </div>
          </Magnet>
        </FadeIn>
      </div>

      {/* Bottom Bar */}
      <div className="mt-auto flex justify-between items-end pb-7 sm:pb-8 md:pb-10 relative z-20">
        <FadeIn delay={0.35} y={20}>
          <p className="max-w-[160px] sm:max-w-[220px] md:max-w-[260px] text-slate-200 font-light uppercase tracking-wide leading-snug text-xs sm:text-sm md:text-base lg:text-lg">
            an ai/ml enthusiast combining creativity and technology to build what&apos;s next
          </p>
        </FadeIn>

        {/* CTA Group — Resume + Contact (Refinement 5) */}
        <FadeIn delay={0.5} y={20}>
          <div className="flex items-center gap-3">
            <ResumeButton />
            <ContactButton />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ==========================================
// SECTION TRANSITION — Animated Stat Counters
// ==========================================
interface StatItemProps {
  end: number;
  suffix: string;
  label: string;
  delay: number;
}

function StatItem({ end, suffix, label, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (!triggered) return;
    const timer = setTimeout(() => {
      let start = 0;
      const step = Math.ceil(end / 40);
      const interval = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(interval);
        } else {
          setCount(start);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [triggered, end, delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 group">
      <span
        className="text-[clamp(2.8rem,7vw,6rem)] font-black leading-none tabular-nums"
        style={{
          background: 'linear-gradient(160deg, #3D4652 10%, #7A8FA0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {count}{suffix}
      </span>
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#D7E2EA]/40 text-center">
        {label}
      </span>
    </div>
  );
}

function SectionTransition() {
  return (
    <div className="relative bg-[#0C0C0C] py-16 sm:py-20 overflow-hidden">
      {/* Top + bottom fades */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#0C0C0C] to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0C0C0C] to-transparent z-10" />

      {/* Very subtle centre glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(0,242,254,0.04),transparent_70%)]" />

      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        {/* Top hairline */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-14 sm:mb-16" />

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          <StatItem end={2}  suffix="+" label="Projects Built"  delay={0}   />
          <StatItem end={3}  suffix=""  label="Events Contributed" delay={120} />
          <StatItem end={10} suffix="+" label="Skills Mastered" delay={240} />
        </div>

        {/* Bottom hairline */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-14 sm:mt-16" />
      </div>
    </div>
  );
}

// About Section Component
function AboutSection() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / rect.width;
    const offsetY = (e.clientY - centerY) / rect.height;
    setMouseOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <section
      id="about"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-transparent px-5 sm:px-8 md:px-10 py-10 sm:py-20 text-[#D7E2EA] overflow-hidden"
    >
      {/* 3D Decorative Assets positioned absolutely with reactive mouse parallax */}
      {/* Top-left Moon */}
      <motion.div 
        animate={{
          x: mouseOffset.x * -25,
          y: mouseOffset.y * -25,
          rotate: mouseOffset.x * 10
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 60 }}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] w-[120px] sm:w-[160px] md:w-[210px] pointer-events-none select-none"
      >
        <FadeIn delay={0.1} x={-80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
            alt="3D Moon Decor"
            className="w-full object-contain"
          />
        </FadeIn>
      </motion.div>

      {/* Bottom-left Object */}
      <motion.div 
        animate={{
          x: mouseOffset.x * 45,
          y: mouseOffset.y * 45,
          rotateY: mouseOffset.x * 20
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 60 }}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] w-[100px] sm:w-[140px] md:w-[180px] pointer-events-none select-none"
      >
        <FadeIn delay={0.25} x={-80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
            alt="3D Mesh Object Decor"
            className="w-full object-contain"
          />
        </FadeIn>
      </motion.div>

      {/* Top-right Lego */}
      <motion.div 
        animate={{
          x: mouseOffset.x * -35,
          y: mouseOffset.y * 35,
          rotateX: mouseOffset.y * -20
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 60 }}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] w-[120px] sm:w-[160px] md:w-[210px] pointer-events-none select-none"
      >
        <FadeIn delay={0.15} x={80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
            alt="3D Lego Block Decor"
            className="w-full object-contain"
          />
        </FadeIn>
      </motion.div>

      {/* Bottom-right Group */}
      <motion.div 
        animate={{
          x: mouseOffset.x * 30,
          y: mouseOffset.y * -30,
          rotateZ: mouseOffset.x * -10
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 60 }}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] w-[130px] sm:w-[170px] md:w-[220px] pointer-events-none select-none"
      >
        <FadeIn delay={0.3} x={80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
            alt="3D Sphere Group Decor"
            className="w-full object-contain"
          />
        </FadeIn>
      </motion.div>

      {/* Content Layout */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
        {/* Heading */}
        <FadeIn delay={0} y={40} className="mb-10 sm:mb-14 md:mb-16">
          <h2 className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">
            About me
          </h2>
        </FadeIn>

        {/* Scroll Reveal Text Block */}
        <AnimatedText
          text="I'm Tanmay Dhoot, an AI/ML student driven by curiosity, creativity, and the desire to turn ideas into meaningful technology. I keep learning, building, and becoming better every day. Let's build something incredible together!"
          className="text-[#D7E2EA] font-medium leading-relaxed max-w-[560px] text-center text-[clamp(1rem,2vw,1.35rem)] mb-16 sm:mb-20 md:mb-24"
        />

        {/* Contact Button */}
        <FadeIn delay={0.1} y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}

// ==========================================
// 3D HOLOGRAM CHAMBER & SKILLS SECTION
// ==========================================

// Resolve dynamic image names from the database to locally imported bundler assets or direct URLs
const resolveProjectImage = (imgStr: string) => {
  if (!imgStr) return '';
  const imageMap: Record<string, string> = {
    foundlyHero,
    foundlyStudent,
    portfolioHeroMockup,
    portfolioSkillsMockup,
    portfolioExperienceMockup
  };
  return imageMap[imgStr] || imgStr;
};

// Resolve skill title names from the database to their corresponding high-fidelity SVG logos
const getSkillLogo = (title: string, glowColor?: string) => {
  const normalizedTitle = title.toLowerCase().trim();
  const color = glowColor || 'rgba(0, 242, 254, 0.45)';

  switch (normalizedTitle) {
    case 'python':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M55 2C33.5 2 30 5.4 30 16.5V29h25v3.5H23C9 32.5 9 41.5 9 55s0 22.5 14 22.5h8.2v-11.4c0-8.5 7-15.5 15.5-15.5H71V30C71 8.5 67.5 2 55 2zm-12 8.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z" fill="#3776AB" />
          <path d="M55 108c21.5 0 25-3.4 25-14.5V81H55v-3.5h32c14 0 14-9 14-22.5s0-22.5-14-22.5H78.8v11.4c0 8.5-7 15.5-15.5 15.5H39v21c0 21.5 3.5 28 16 28zm12-8.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z" fill="#FFD43B" />
        </svg>
      );
    case 'c++':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5L90 28v44L50 95L10 72V28L50 5Z" fill="#00599C" />
          <path d="M47 30c-11 0-18.5 7.5-18.5 19.5S36 69 47 69c8.5 0 14-5 16-10h-9c-1.5 2-3.5 3-7 3-5.5 0-9.5-4.5-9.5-12.5S41.5 37 47 37c3.5 0 5.5 1 7 3H63c-2-5-7.5-10-16-10z" fill="white" />
          <path d="M68 44h4v-4h3v4h4v3h-4v4h-3v-4h-4v-3zm11 0h4v-4h3v4h4v3h-4v4h-3v-4h-4v-3z" fill="white" />
        </svg>
      );
    case 'c':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5L90 28v44L50 95L10 72V28L50 5Z" fill="#3949AB" />
          <path d="M50 28c-12 0-21 9-21 22s9 22 21 22c10 0 16.5-6 19-12H58c-2 3-5 5-8 5-7 0-11.5-5.5-11.5-15s4.5-15 11.5-15c3 0 6 2 8 5h11c-2.5-6-9-12-19-12z" fill="white" />
        </svg>
      );
    case 'dsa':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="50" y1="20" x2="30" y2="45" stroke="#00F2FE" strokeWidth="3" />
          <line x1="50" y1="20" x2="70" y2="45" stroke="#00F2FE" strokeWidth="3" />
          <line x1="30" y1="45" x2="18" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <line x1="30" y1="45" x2="42" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <line x1="70" y1="45" x2="58" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <line x1="70" y1="45" x2="82" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <circle cx="50" cy="20" r="10" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="4" />
          <circle cx="30" cy="45" r="10" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="4" />
          <circle cx="70" cy="45" r="10" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="4" />
          <circle cx="18" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
          <circle cx="42" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
          <circle cx="58" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
          <circle cx="82" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
        </svg>
      );
    case 'dbms':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="25" rx="30" ry="12" fill="none" stroke="#B600A8" strokeWidth="3.5" />
          <path d="M20 25v15c0 6.6 13.4 12 30 12s30-5.4 30-12V25" fill="none" stroke="#B600A8" strokeWidth="3.5" />
          <path d="M20 40v15c0 6.6 13.4 12 30 12s30-5.4 30-12V40" fill="none" stroke="#B600A8" strokeWidth="3.5" />
          <path d="M20 55v15c0 6.6 13.4 12 30 12s30-5.4 30-12V55" fill="none" stroke="#B600A8" strokeWidth="3.5" />
          <line x1="50" y1="37" x2="50" y2="73" stroke="#B600A8" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case 'react js':
    case 'react':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16 animate-spin-slow" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="50" rx="8" ry="20" transform="rotate(30, 50, 50)" stroke="#00F2FE" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="8" ry="20" transform="rotate(90, 50, 50)" stroke="#00F2FE" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="8" ry="20" transform="rotate(150, 50, 50)" stroke="#00F2FE" strokeWidth="3" />
          <circle cx="50" cy="50" r="4" fill="#00F2FE" />
        </svg>
      );
    case 'vite':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 15L50 85L20 15h60z" fill="none" stroke="#B600A8" strokeWidth="4" />
          <path d="M45 10l30 5L30 90l5-45L15 40l30-30z" fill="#00F2FE" />
        </svg>
      );
    case 'typescript':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" rx="8" fill="#3178C6" />
          <text x="50" y="70" fill="white" fontSize="42" fontWeight="bold" fontFamily="monospace">TS</text>
        </svg>
      );
    case 'tailwind css':
    case 'tailwind':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 25c-8.5 0-14 4.25-17 12.75 4.25-4.25 8.5-5.6 12.75-4.25 2.5 1 4.25 2.7 6 4.7C54.8 41.5 59.2 46.5 67 46.5c8.5 0 14-4.25 17-12.75-4.25 4.25-8.5 5.6-12.75 4.25-2.5-1-4.25-2.7-6-4.7C52.2 30.5 47.8 25.5 50 25zm-17 21.5c-8.5 0-14 4.25-17 12.75 4.25-4.25 8.5-5.6 12.75-4.25 2.5 1 4.25 2.7 6 4.7 3.1 3.3 7.5 8.3 15.3 8.3 8.5 0 14-4.25 17-12.75-4.25 4.25-8.5 5.6-12.75 4.25-2.5-1-4.25-2.7-6-4.7-3.1-3.3-7.5-8.3-15.3-8.3z" fill="#38BDF8" />
        </svg>
      );
    case 'framer motion':
    case 'framer':
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 10h60L50 40L20 10zm0 30h60L50 70L20 40zm30 30l30 20H20l30-20z" fill="none" stroke="#B600A8" strokeWidth="4.5" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg className="w-12 h-12 sm:w-16 sm:h-16 animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke={color} strokeWidth="3" fill="none" />
          <path d="M35 40 L25 50 L35 60 M65 40 L75 50 L65 60" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="53" y1="36" x2="47" y2="64" stroke={color} strokeWidth="2.5" />
        </svg>
      );
  }
};

interface SkillData {
  num: string;
  title: string;
  desc: string;
  tools: string[];
  projects: string[];
  left: string;
  top: string;
  xVal: string;
  yVal: string;
  zVal: string;
  glowColor: string;
  toolsStats: { name: string; level: number }[];
  logo: React.ReactNode;
  logo_svg?: string;
}

function SkillsSection({ skills: apiSkills }: { skills?: SkillData[] }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activePopupSkill, setActivePopupSkill] = useState<SkillData | null>(null);
  const [memAddr, setMemAddr] = useState('0x7FFF5BAC');
  const [cpuLoad, setCpuLoad] = useState(12.4);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<number | null>(null);

  const handlePopupClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActivePopupSkill(null);
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.skill-node') || target.closest('.popup-box')) {
        return;
      }
      handlePopupClose();
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const hexChars = '0123456789ABCDEF';
      let addr = '0x';
      for (let i = 0; i < 8; i++) {
        addr += hexChars[Math.floor(Math.random() * 16)];
      }
      setMemAddr(addr);
      setCpuLoad(parseFloat((Math.random() * 35 + 10).toFixed(1)));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const hologramSkills: SkillData[] = [
    {
      num: '01',
      title: 'Python',
      desc: 'Creating artificial intelligence models, deep neural networks, and automated backend scripts.',
      tools: ['TensorFlow', 'Jupyter', 'Pandas', 'NumPy'],
      projects: ['AI/ML Analytics', 'Model Dev'],
      left: '12%',
      top: '22%',
      xVal: '-42.8',
      yVal: '22.4',
      zVal: '10.0',
      glowColor: 'rgba(55, 118, 171, 0.45)',
      toolsStats: [
        { name: 'TensorFlow', level: 95 },
        { name: 'Jupyter Notebooks', level: 90 },
        { name: 'Pandas / NumPy', level: 92 },
        { name: 'Scikit-Learn', level: 88 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M55 2C33.5 2 30 5.4 30 16.5V29h25v3.5H23C9 32.5 9 41.5 9 55s0 22.5 14 22.5h8.2v-11.4c0-8.5 7-15.5 15.5-15.5H71V30C71 8.5 67.5 2 55 2zm-12 8.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z" fill="#3776AB" />
          <path d="M55 108c21.5 0 25-3.4 25-14.5V81H55v-3.5h32c14 0 14-9 14-22.5s0-22.5-14-22.5H78.8v11.4c0 8.5-7 15.5-15.5 15.5H39v21c0 21.5 3.5 28 16 28zm12-8.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z" fill="#FFD43B" />
        </svg>
      )
    },
    {
      num: '02',
      title: 'C++',
      desc: 'Structuring algorithmic computations, solving competitive challenges, and running high-speed compute loops.',
      tools: ['GDB', 'GCC', 'CMake', 'DSA Foundations'],
      projects: ['Competitive Programming'],
      left: '28%',
      top: '16%',
      xVal: '-25.2',
      yVal: '60.1',
      zVal: '-40.0',
      glowColor: 'rgba(0, 89, 156, 0.45)',
      toolsStats: [
        { name: 'Memory Pointers', level: 90 },
        { name: 'STL Containers', level: 95 },
        { name: 'CMake Build Systems', level: 85 },
        { name: 'High-speed Math Loops', level: 92 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5L90 28v44L50 95L10 72V28L50 5Z" fill="#00599C" />
          <path d="M47 30c-11 0-18.5 7.5-18.5 19.5S36 69 47 69c8.5 0 14-5 16-10h-9c-1.5 2-3.5 3-7 3-5.5 0-9.5-4.5-9.5-12.5S41.5 37 47 37c3.5 0 5.5 1 7 3H63c-2-5-7.5-10-16-10z" fill="white" />
          <path d="M68 44h4v-4h3v4h4v3h-4v4h-3v-4h-4v-3zm11 0h4v-4h3v4h4v3h-4v4h-3v-4h-4v-3z" fill="white" />
        </svg>
      )
    },
    {
      num: '03',
      title: 'C',
      desc: 'Managing low-level memory layout, pointer variables, compile links, and basic hardware calls.',
      tools: ['Pointer Ops', 'Memory Allocation', 'Assembly Base'],
      projects: ['Architectural Systems'],
      left: '20%',
      top: '50%',
      xVal: '-38.0',
      yVal: '-12.4',
      zVal: '20.0',
      glowColor: 'rgba(57, 73, 171, 0.45)',
      toolsStats: [
        { name: 'Manual malloc/free', level: 96 },
        { name: 'Header Linkages', level: 88 },
        { name: 'Bitwise Operators', level: 92 },
        { name: 'Assembly Registers', level: 80 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5L90 28v44L50 95L10 72V28L50 5Z" fill="#3949AB" />
          <path d="M50 28c-12 0-21 9-21 22s9 22 21 22c10 0 16.5-6 19-12H58c-2 3-5 5-8 5-7 0-11.5-5.5-11.5-15s4.5-15 11.5-15c3 0 6 2 8 5h11c-2.5-6-9-12-19-12z" fill="white" />
        </svg>
      )
    },
    {
      num: '04',
      title: 'DSA',
      desc: 'Optimizing code execution runtime, building trees/graphs, and minimizing space requirements.',
      tools: ['Big-O Notation', 'Graph Traversal', 'Search Trees'],
      projects: ['Foundly Search Indexer'],
      left: '42%',
      top: '28%',
      xVal: '45.4',
      yVal: '58.2',
      zVal: '30.0',
      glowColor: 'rgba(0, 242, 254, 0.45)',
      toolsStats: [
        { name: 'Binary Trees', level: 94 },
        { name: 'Sorting / Search', level: 96 },
        { name: 'Graph Paths (BFS/DFS)', level: 90 },
        { name: 'Dynamic Programming', level: 85 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="50" y1="20" x2="30" y2="45" stroke="#00F2FE" strokeWidth="3" />
          <line x1="50" y1="20" x2="70" y2="45" stroke="#00F2FE" strokeWidth="3" />
          <line x1="30" y1="45" x2="18" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <line x1="30" y1="45" x2="42" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <line x1="70" y1="45" x2="58" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <line x1="70" y1="45" x2="82" y2="70" stroke="#00F2FE" strokeWidth="3" />
          <circle cx="50" cy="20" r="10" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="4" />
          <circle cx="30" cy="45" r="10" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="4" />
          <circle cx="70" cy="45" r="10" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="4" />
          <circle cx="18" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
          <circle cx="42" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
          <circle cx="58" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
          <circle cx="82" cy="70" r="9" fill="#0C0C0C" stroke="#B600A8" strokeWidth="3.5" />
        </svg>
      )
    },
    {
      num: '05',
      title: 'DBMS',
      desc: 'Designing relational database layouts, executing SQL queries, indexing entries, and linking API data stores.',
      tools: ['PostgreSQL', 'SQL Queries', 'DB Normalization'],
      projects: ['Foundly Database'],
      left: '60%',
      top: '16%',
      xVal: '62.1',
      yVal: '-20.8',
      zVal: '-30.0',
      glowColor: 'rgba(182, 0, 168, 0.45)',
      toolsStats: [
        { name: 'PostgreSQL Store', level: 93 },
        { name: 'Query Optimization', level: 91 },
        { name: 'Index Structures', level: 88 },
        { name: 'Schema Normalization', level: 95 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 30 C 20 20, 80 20, 80 30 C 80 40, 20 40, 20 30 Z" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="3.5" />
          <path d="M20 30 L 20 50 C 20 60, 80 60, 80 50 L 80 30" fill="none" stroke="#00F2FE" strokeWidth="3.5" />
          <path d="M20 50 L 20 70 C 20 80, 80 80, 80 70 L 80 50" fill="none" stroke="#00F2FE" strokeWidth="3.5" />
          <path d="M20 70 L 20 90 C 20 100, 80 100, 80 90 L 80 70" fill="none" stroke="#00F2FE" strokeWidth="3.5" />
          <line x1="32" y1="42" x2="38" y2="42" stroke="#B600A8" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="32" y1="62" x2="38" y2="62" stroke="#B600A8" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="32" y1="82" x2="38" y2="82" stroke="#B600A8" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="66" cy="42" r="3" fill="#00F2FE" />
          <circle cx="66" cy="62" r="3" fill="#00F2FE" />
          <circle cx="66" cy="82" r="3" fill="#00F2FE" />
        </svg>
      )
    },
    {
      num: '06',
      title: 'React JS',
      desc: 'Crafting beautiful frontends, setting up component modules, and executing smooth 3D interactions.',
      tools: ['Vite', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      projects: ['Tanverse Portfolio', 'Foundly Hub'],
      left: '52%',
      top: '50%',
      xVal: '12.0',
      yVal: '10.4',
      zVal: '40.0',
      glowColor: 'rgba(97, 218, 251, 0.45)',
      toolsStats: [
        { name: 'Vite Bundler', level: 96 },
        { name: 'TypeScript Syntax', level: 93 },
        { name: 'Tailwind Styles', level: 95 },
        { name: 'Framer Motion Physics', level: 90 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
          <g stroke="#61DAFB" strokeWidth="1.2" fill="none">
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      )
    },
    {
      num: '07',
      title: 'Vite',
      desc: 'Enabling lightning-fast module bundling, hot-reloading development, and highly optimized build outputs.',
      tools: ['Vite Config', 'ESBuild', 'Rollup', 'Dev Server'],
      projects: ['Tanverse Portfolio', 'Foundly Hub'],
      left: '74%',
      top: '26%',
      xVal: '58.2',
      yVal: '-15.4',
      zVal: '-20.0',
      glowColor: 'rgba(189, 52, 254, 0.45)',
      toolsStats: [
        { name: 'Bundling Speed', level: 98 },
        { name: 'Dev Server Boot', level: 99 },
        { name: 'Rollup Plugins', level: 85 },
        { name: 'HMR Config', level: 95 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="viteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#41D1FF" />
              <stop offset="100%" stopColor="#BD34FE" />
            </linearGradient>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFEF5C" />
              <stop offset="100%" stopColor="#F7961C" />
            </linearGradient>
          </defs>
          <path d="M50 8L85 24V76L50 92L15 76V24L50 8Z" fill="url(#viteGrad)" opacity="0.85" />
          <path d="M54 22L28 54H48L38 80L72 42H50L54 22Z" fill="url(#boltGrad)" />
        </svg>
      )
    },
    {
      num: '08',
      title: 'TypeScript',
      desc: 'Adding strict type safety, advanced interfaces, compile-time checks, and robust autocomplete to React frameworks.',
      tools: ['TSConfig', 'Type Guards', 'Generics', 'Linter Integration'],
      projects: ['Foundly Platform', 'Tanverse Engine'],
      left: '34%',
      top: '48%',
      xVal: '-22.5',
      yVal: '-10.8',
      zVal: '25.0',
      glowColor: 'rgba(49, 120, 198, 0.45)',
      toolsStats: [
        { name: 'Type Safety compiler', level: 94 },
        { name: 'TSConfig structures', level: 90 },
        { name: 'Generic Interfaces', level: 88 },
        { name: 'Linter rules', level: 92 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="12" fill="#3178C6" />
          <text x="45" y="80" fill="white" fontSize="38" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold">TS</text>
        </svg>
      )
    },
    {
      num: '09',
      title: 'Tailwind CSS',
      desc: 'Styling user interfaces rapidly with utility-first utility classes, fluid spacing, and custom grid architectures.',
      tools: ['PostCSS', 'Theme Config', 'Arbitrary Values', 'CSS Variables'],
      projects: ['Tanverse Portfolio', 'Foundly Platform'],
      left: '68%',
      top: '48%',
      xVal: '44.8',
      yVal: '-12.0',
      zVal: '-35.0',
      glowColor: 'rgba(6, 182, 212, 0.45)',
      toolsStats: [
        { name: 'Utility Classes speed', level: 96 },
        { name: 'Theme Customization', level: 92 },
        { name: 'Grid layouts structure', level: 95 },
        { name: 'Fluid typography styling', level: 90 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8 0.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19 12.001 19c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="#06B6D4" />
        </svg>
      )
    },
    {
      num: '10',
      title: 'Framer Motion',
      desc: 'Animating React nodes with physics-based transitions, spring mechanics, exit states, and 3D spatial drift.',
      tools: ['AnimatePresence', 'Spring Physics', 'Scroll Progress', '3D Transforms'],
      projects: ['Tanverse 3D Creator', 'Portfolio Effects'],
      left: '86%',
      top: '38%',
      xVal: '75.4',
      yVal: '18.2',
      zVal: '45.0',
      glowColor: 'rgba(255, 0, 122, 0.45)',
      toolsStats: [
        { name: 'Physics spring motion', level: 93 },
        { name: 'AnimatePresence loops', level: 95 },
        { name: 'Scroll coordinates', level: 90 },
        { name: '3D spatial translation', level: 92 }
      ],
      logo: (
        <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L24 0 L12 12 Z" fill="#FF007A" />
          <path d="M0 12 L12 12 L0 24 Z" fill="#7B00FF" />
          <path d="M12 12 L24 12 L24 24 Z" fill="#00F0FF" />
        </svg>
      )
    }
  ];

  const skillsToRender = apiSkills && apiSkills.length > 0
    ? apiSkills.map((s, idx) => {
        const presetCoords = [
          { left: '12%', top: '22%', xVal: '-42.8', yVal: '22.4', zVal: '10.0' },
          { left: '28%', top: '16%', xVal: '-25.2', yVal: '60.1', zVal: '-40.0' },
          { left: '20%', top: '50%', xVal: '-38.0', yVal: '-12.4', zVal: '20.0' },
          { left: '42%', top: '28%', xVal: '45.4', yVal: '58.2', zVal: '30.0' },
          { left: '60%', top: '16%', xVal: '18.4', yVal: '62.4', zVal: '-35.0' },
          { left: '78%', top: '22%', xVal: '40.2', yVal: '18.4', zVal: '15.0' },
          { left: '84%', top: '52%', xVal: '55.1', yVal: '-15.4', zVal: '-10.0' },
          { left: '68%', top: '48%', xVal: '25.0', yVal: '-8.1', zVal: '25.0' },
          { left: '50%', top: '72%', xVal: '0.0', yVal: '-45.0', zVal: '-15.0' },
          { left: '32%', top: '70%', xVal: '-20.4', yVal: '-38.2', zVal: '35.0' }
        ];

        const coords = presetCoords[idx] || {
          left: `${15 + (idx % 5) * 15}%`,
          top: `${20 + Math.floor(idx / 5) * 18}%`,
          xVal: (Math.sin(idx) * 40).toFixed(1),
          yVal: (Math.cos(idx) * 40).toFixed(1),
          zVal: (Math.sin(idx * 2) * 30).toFixed(1),
        };

        return {
          ...s,
          ...coords,
          logo: s.logo_svg
            ? typeof s.logo_svg === 'string'
              ? <div dangerouslySetInnerHTML={{ __html: s.logo_svg }} className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center" />
              : s.logo_svg
            : getSkillLogo(s.title, s.glowColor)
        };
      })
    : hologramSkills;

  const floatParams = [
    { x: [-55, 60, -40, 45, -55], y: [40, -50, 30, -35, 40], z: [-20, 55, -40, 25, -20], duration: 16 },
    { x: [50, -45, 40, -50, 50], y: [-35, 45, -30, 40, -35], z: [-50, 35, -30, 55, -50], duration: 22 },
    { x: [-40, 55, -45, 35, -40], y: [50, -30, 45, -50, 50], z: [35, -45, 50, -25, 35], duration: 19 },
    { x: [-50, 40, -60, 30, -50], y: [-30, 50, -35, 40, -30], z: [45, -30, 25, -55, 45], duration: 24 },
    { x: [45, -50, 55, -35, 45], y: [-50, 35, -40, 50, -50], z: [-30, 50, -45, 30, -30], duration: 18 },
    { x: [60, -55, 35, -45, 60], y: [30, -35, 50, -30, 30], z: [55, -25, -50, 40, 55], duration: 15 },
    { x: [-45, 40, -35, 50, -45], y: [45, -40, 35, -30, 45], z: [-25, 45, -35, 35, -25], duration: 20 },
    { x: [35, -50, 45, -35, 35], y: [-40, 30, -35, 45, -40], z: [40, -55, 35, -45, 40], duration: 23 },
    { x: [-35, 55, -50, 35, -35], y: [35, -30, 50, -35, 35], z: [-45, 35, -55, 30, -45], duration: 17 },
    { x: [55, -40, 30, -55, 55], y: [-30, 50, -45, 30, -30], z: [50, -40, -25, 45, 50], duration: 26 }
  ];
  return (
    <section
      id="skills"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => handlePopupClose()}
      className="relative bg-[#0C0C0C] min-h-[100dvh] w-full flex flex-col justify-between items-center py-8 sm:py-12 px-6 overflow-hidden preserve-3d cursor-default select-none"
      style={{ perspective: '1200px' }}
    >
      {/* Top and Bottom Fades to blend the grid into adjacent sections */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0C0C0C] to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0C0C0C] to-transparent z-10" />

      {/* Background ambient flows */}
      <div className="pointer-events-none absolute top-10 right-0 w-[45vw] h-[45vh] rounded-full bg-[radial-gradient(circle,rgba(0,242,254,0.015),transparent_65%)] filter blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-0 w-[45vw] h-[45vh] rounded-full bg-[radial-gradient(circle,rgba(182,0,168,0.03),transparent_65%)] filter blur-3xl" />


      {/* 3D Perspective Background Grid shifting with cursor (full screen - no radial mask) */}
      <motion.div
        animate={{
          rotateY: mousePos.x * 24,
          rotateX: -mousePos.y * 18,
          z: -180,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 70 }}
        className="absolute inset-x-[-100%] inset-y-[-100%] pointer-events-none opacity-20 preserve-3d"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0, 242, 254, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 242, 254, 0.15) 1px, transparent 1px)',
          backgroundSize: '45px 45px',
          transformStyle: 'preserve-3d',
        }}
      />
      


      {/* Projector light cone */}
      <div 
        className="absolute bottom-[210px] left-1/2 -translate-x-1/2 w-[90%] h-[550px] pointer-events-none bg-[radial-gradient(ellipse_at_bottom,rgba(0,242,254,0.02),transparent_70%)] blur-md"
        style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}
      />

      {/* Twinkling star particles floating up */}
      {Array.from({ length: 30 }).map((_, idx) => {
        const randomLeft = Math.random() * 90 + 5;
        const randomTop = Math.random() * 70 + 5;
        const randomDelay = Math.random() * 4;
        const randomDur = Math.random() * 6 + 4;
        const randomSize = Math.random() * 1.5 + 1.2;
        return (
          <motion.div
            key={`star-${idx}`}
            initial={{ opacity: 0.1, y: 15 }}
            animate={{ 
              opacity: [0.1, 0.7, 0.1], 
              y: [15, -25, 15] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: randomDur, 
              delay: randomDelay, 
              ease: 'easeInOut' 
            }}
            className="absolute bg-cyan-300/35 rounded-full pointer-events-none"
            style={{
              left: `${randomLeft}%`,
              top: `${randomTop}%`,
              width: randomSize,
              height: randomSize,
              boxShadow: '0 0 6px rgba(103, 232, 249, 0.25)',
            }}
          />
        );
      })}

      {/* Heading */}
      <FadeIn delay={0} y={40} className="relative z-20 text-center w-full mt-2 select-none pointer-events-none">
        <h2 className="hero-heading text-[clamp(2.5rem,8vw,100px)] font-black uppercase leading-none tracking-tight">
          Skills
        </h2>
        {/* Refinement 2: contrast raised from /60 to /90 */}
        <p className="text-slate-300 uppercase tracking-widest text-[10px] sm:text-xs font-semibold mt-4">
          Interactive 3D Holographic Projection Console
        </p>
      </FadeIn>

      {/* Interactive perspective 3D wrapper */}
      <motion.div
        animate={{
          rotateY: mousePos.x * 20,
          rotateX: -mousePos.y * 15,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 100 }}
        className="w-full h-full absolute inset-0 preserve-3d"
      >
        {/* Laser Guide Beams & Base Deck Lock-ons */}
        {skillsToRender.map((skill, index) => {
          const isPopupActive = activePopupSkill?.num === skill.num;
          const isHovered = hoveredIndex === index;
          const shouldShowBeam = isPopupActive || (activePopupSkill === null && isHovered);

          if (!shouldShowBeam) return null;

          return (
            <React.Fragment key={`beam-${skill.num}`}>
              {/* Target intersection indicator on the base grid deck */}
              <div 
                className="absolute pointer-events-none transition-all duration-300 flex flex-col items-center"
                style={{
                  left: skill.left,
                  bottom: '200px',
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Glowing lock ring */}
                <div className={`w-6 h-3 rounded-full border transition-transform duration-300 ${isHovered || isPopupActive ? 'scale-125 bg-white/[0.02] animate-ping' : 'scale-100'}`}
                     style={{ 
                       transform: 'rotateX(75deg)',
                       borderColor: skill.glowColor,
                       boxShadow: `0 0 12px ${skill.glowColor}40`
                     }} />
                
                {/* Mini coordinates tag */}
                <div className="mt-1 bg-black/90 border rounded px-1.5 py-0.5 text-[8px] font-mono tracking-widest uppercase"
                     style={{
                       color: skill.glowColor,
                       borderColor: `${skill.glowColor}60`
                     }}>
                  X:{skill.xVal} Z:{skill.zVal}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Holographic floating logo nodes (no rotation, no card border/background) */}
        {skillsToRender.map((skill, index) => {
          const isHovered = hoveredIndex === index;
          const isPopupActive = activePopupSkill?.num === skill.num;
          const isActive = activePopupSkill ? isPopupActive : activeIndex === index;

          return (
            <motion.div
              key={skill.num}
              onMouseEnter={() => {
                setHoveredIndex(index);
                setActiveIndex(index);
                playCyberSound('hover');
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                setActivePopupSkill(skill);
                playCyberSound('popup');
                timeoutRef.current = window.setTimeout(() => {
                  setActivePopupSkill(null);
                }, 3000);
              }}
              animate={isHovered || isPopupActive ? {
                x: 0,
                y: 0,
                z: 120,
                scale: 1.35,
              } : {
                x: floatParams[index].x,
                y: floatParams[index].y,
                z: floatParams[index].z,
                scale: 1,
              }}
              transition={isHovered || isPopupActive ? {
                type: 'spring',
                damping: 15,
                stiffness: 150,
              } : {
                x: { repeat: Infinity, duration: floatParams[index].duration, ease: 'easeInOut' },
                y: { repeat: Infinity, duration: floatParams[index].duration, ease: 'easeInOut' },
                z: { repeat: Infinity, duration: floatParams[index].duration, ease: 'easeInOut' },
              }}
              whileTap={{ scale: 0.88 }}
              className="skill-node absolute cursor-pointer flex flex-col items-center justify-center p-2 transition-transform duration-300 preserve-3d"
              style={{
                left: skill.left,
                top: `calc(${skill.top} + 3cm)`,
                transformStyle: 'preserve-3d',
                transform: 'translate(-50%, -50%)',
                opacity: (hoveredIndex !== null && !isHovered) || (activePopupSkill !== null && !isPopupActive) ? 0.25 : 1,
              }}
            >
              {/* Glowing background halo blur */}
              {isActive && (
                <div className="absolute w-24 h-24 rounded-full blur-2xl pointer-events-none -z-10"
                     style={{ backgroundColor: `${skill.glowColor}25` }} />
              )}
              
              {/* SVG logo with direct drop shadow glow */}
              <div 
                className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center"
                style={{
                  filter: isHovered || isPopupActive
                    ? `drop-shadow(0 0 16px ${skill.glowColor}) drop-shadow(0 0 32px ${skill.glowColor})` 
                    : `drop-shadow(0 0 6px ${skill.glowColor})`,
                  transition: 'filter 0.3s ease',
                }}
              >
                {skill.logo}
              </div>

              {/* Cyber text tag underneath logo */}
              <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-[9px] font-mono font-medium text-white/50 tracking-widest uppercase bg-black/40 border border-white/5 px-2 py-0.5 rounded whitespace-nowrap">
                {skill.title}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Holographic Diagnostic Pop-up Box */}
      <AnimatePresence>
        {activePopupSkill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(8px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            onClick={(e) => e.stopPropagation()}
            className="popup-box absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-2xl bg-black/90 border rounded-2xl px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white pointer-events-auto select-none"
            style={{
              borderColor: activePopupSkill.glowColor,
              boxShadow: `0 0 35px ${activePopupSkill.glowColor}25, 0 15px 40px rgba(0,0,0,0.85)`,
            }}
          >
            {/* Cyber corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l transition-colors duration-300" style={{ borderColor: activePopupSkill.glowColor }} />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r transition-colors duration-300" style={{ borderColor: activePopupSkill.glowColor }} />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l transition-colors duration-300" style={{ borderColor: activePopupSkill.glowColor }} />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r transition-colors duration-300" style={{ borderColor: activePopupSkill.glowColor }} />

            <div className="flex items-center gap-4 py-1 px-2">
              <div 
                className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{
                  filter: `drop-shadow(0 0 10px ${activePopupSkill.glowColor})`,
                }}
              >
                {activePopupSkill.logo}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white whitespace-nowrap">
                {activePopupSkill.title}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Projects Section Component
interface ProjectData {
  num: string;
  name: string;
  category: string;
  url: string;
  images: {
    col1Img1: string;
    col1Img2: string;
    col2Img: string;
  };
}

const PROJECTS: ProjectData[] = [
  {
    num: '01',
    name: 'Foundly Platform',
    category: 'Personal Product',
    url: 'https://foundly-theta.vercel.app/',
    images: {
      col1Img1: foundlyHero,
      col1Img2: foundlyStudent,
      col2Img: foundlyHero,
    },
  },
  {
    num: '02',
    name: 'Interactive 3D Portfolio',
    category: 'Personal Showcase',
    url: 'https://github.com/tanmay-dhoot/3d-portfolio',
    images: {
      col1Img1: '',
      col1Img2: '',
      col2Img: '',
    },
  },
];

interface CardWrapperProps {
  project: ProjectData;
  index: number;
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  hoverRotation: number;
  onOpenPopup: (project: ProjectData) => void;
}

function CardWrapper({ project, index, activeIndex, onChangeIndex, hoverRotation, onOpenPopup }: CardWrapperProps) {
  const offset = index - activeIndex;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  let x = '0%';
  let rotateY = 0;
  let z = 0;
  let opacity = 1;
  let zIndex = 30;
  let scale = 1;
  let pointerEvents: 'auto' | 'none' = 'auto';

  if (offset === 0) {
    x = '0%';
    rotateY = 0;
    z = 0;
    opacity = 1;
    scale = 1;
    zIndex = 30;
    pointerEvents = 'auto';
  } else if (offset === -1) {
    x = isMobile ? '-105%' : '-42%';
    rotateY = isMobile ? 0 : 38;
    z = isMobile ? -50 : -180;
    opacity = isMobile ? 0 : 0.35;
    scale = 0.82;
    zIndex = 10;
    pointerEvents = 'auto';
  } else if (offset === 1) {
    x = isMobile ? '105%' : '42%';
    rotateY = isMobile ? 0 : -38;
    z = isMobile ? -50 : -180;
    opacity = isMobile ? 0 : 0.35;
    scale = 0.82;
    zIndex = 10;
    pointerEvents = 'auto';
  } else {
    x = offset < 0 ? '-120%' : '120%';
    rotateY = offset < 0 ? 55 : -55;
    z = -250;
    opacity = 0;
    scale = 0.75;
    zIndex = 5;
    pointerEvents = 'none';
  }

  return (
    <motion.div
      animate={{
        x,
        rotateY: rotateY + (offset === 0 ? hoverRotation : hoverRotation * 0.5),
        z,
        opacity,
        scale,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 85 }}
      onClick={(e) => {
        e.stopPropagation();
        onChangeIndex(index);
        onOpenPopup(project);
        playCyberSound('popup');
      }}
      className="absolute w-full max-w-[580px]"
      style={{
        zIndex,
        pointerEvents,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.article
        className="w-full rounded-3xl sm:rounded-[36px] md:rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-5 md:p-6 shadow-2xl flex flex-col gap-4"
      >
        {/* Top Row */}
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl sm:text-2xl md:text-3xl leading-none text-[#D7E2EA]">
              {project.num}
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] opacity-60">
                {project.category}
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-bold uppercase leading-tight text-[#D7E2EA]">
                {project.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Bottom Row - Two-Column Image Grid or Cyber Blank State */}
        {project.images.col1Img1 ? (
          <div className="grid grid-cols-[40%_60%] gap-3 w-full h-[180px] sm:h-[220px] md:h-[260px] overflow-hidden">
            {/* Left Column (40%): 2 Stacked Images */}
            <div className="flex flex-col gap-3">
              <div className="w-full h-[calc(42%-6px)] overflow-hidden rounded-2xl sm:rounded-[20px] md:rounded-[24px]">
                <ProgressiveImage
                  src={project.images.col1Img1}
                  alt={`${project.name} Details 1`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="w-full h-[calc(58%-6px)] overflow-hidden rounded-2xl sm:rounded-[20px] md:rounded-[24px]">
                <ProgressiveImage
                  src={project.images.col1Img2}
                  alt={`${project.name} Details 2`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column (60%): 1 Tall Image */}
            <div className="w-full h-full overflow-hidden rounded-2xl sm:rounded-[20px] md:rounded-[24px]">
              <ProgressiveImage
                src={project.images.col2Img}
                alt={`${project.name} Feature`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] rounded-2xl sm:rounded-[20px] md:rounded-[24px] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center overflow-hidden group">
            {/* Holographic matrix background for blank state */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{
                   backgroundImage: 'radial-gradient(circle at center, #00F2FE 1px, transparent 1px)',
                   backgroundSize: '20px 20px'
                 }} />
            
            <div className="relative z-10 flex flex-col items-center p-4 max-w-sm">
              {/* Pulsing scanning radar or circle */}
              <div className="relative w-12 h-12 mb-3 flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full border border-dashed border-[#00F2FE]/30"
                  style={{ animation: 'spin 12s linear infinite' }}
                />
                <div className="absolute w-8 h-8 rounded-full border border-[#B600A8]/20 animate-pulse" />
                <svg className="w-5 h-5 text-[#00F2FE] opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.25em] text-white/90">
                Visual Telemetry Offline
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mt-2 leading-relaxed">
                Render sequence will initiate automatically upon live URL deployment. Compilation stream active.
              </p>
              
              {/* Fake loading/terminal diagnostic stats */}
              <div className="flex gap-3 mt-4 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                <span>BUFFER: EMPTY</span>
                <span>•</span>
                <span>STATUS: STABLE</span>
              </div>
            </div>
          </div>
        )}
      </motion.article>
    </motion.div>
  );
}

function ProjectsSection({ projects: apiProjects }: { projects?: ProjectData[] }) {
  const [activeProjIndex, setActiveProjIndex] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverZone, setHoverZone] = useState<'left' | 'right' | 'center' | 'none'>('none');
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePopupProject, setActivePopupProject] = useState<ProjectData | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const popupTouchStartY = useRef<number | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!activePopupProject) return;
    const initialScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diffY = Math.abs(currentScrollY - initialScrollY);
      if (diffY > 20) {
        setActivePopupProject(null);
        playCyberSound('click');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePopupProject]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Relative position inside the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Normalized offset for parallax/rotation (-0.5 to 0.5)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / rect.width;
    const offsetY = (e.clientY - centerY) / rect.height;
    setMouseOffset({ x: offsetX, y: offsetY });

    // Determine hover zone for cursor indicator & click actions
    const relativeX = x / rect.width;
    if (relativeX < 0.38) {
      setHoverZone('left');
    } else if (relativeX > 0.62) {
      setHoverZone('right');
    } else {
      setHoverZone('center');
    }
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setHoverZone('none');
  };

  const displayProjects = apiProjects && apiProjects.length > 0
    ? apiProjects.map(p => ({
        ...p,
        images: {
          col1Img1: resolveProjectImage(p.images.col1Img1),
          col1Img2: resolveProjectImage(p.images.col1Img2),
          col2Img: resolveProjectImage(p.images.col2Img)
        }
      }))
    : PROJECTS;

  const handlePrev = () => {
    setActiveProjIndex((prev) => (prev > 0 ? prev - 1 : displayProjects.length - 1));
    playCyberSound('click');
  };

  const handleNext = () => {
    setActiveProjIndex((prev) => (prev < displayProjects.length - 1 ? prev + 1 : 0));
    playCyberSound('click');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const handlePopupTouchStart = (e: React.TouchEvent) => {
    popupTouchStartY.current = e.targetTouches[0].clientY;
  };

  const handlePopupTouchMove = (e: React.TouchEvent) => {
    if (popupTouchStartY.current === null) return;
    const currentY = e.targetTouches[0].clientY;
    const diffY = currentY - popupTouchStartY.current;
    const dismissDistance = 25; // Close if swiped up or down by ~25px (~0.5cm)
    if (Math.abs(diffY) > dismissDistance) {
      setActivePopupProject(null);
      playCyberSound('click');
      popupTouchStartY.current = null;
    }
  };

  const handleSectionClick = (e: React.MouseEvent) => {
    // If they clicked on an 'a' link inside active card, let it pass through
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    
    if (hoverZone === 'left') {
      handlePrev();
    } else if (hoverZone === 'right') {
      handleNext();
    }
  };

  const hoverRotation = mouseOffset.x * 25; // -12.5 to +12.5 degrees

  return (
    <section
      id="projects"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative z-20 bg-[#0C0C0C] px-5 pb-12 pt-12 sm:pb-24 sm:pt-24 sm:px-8 md:px-10 overflow-hidden ${!isMobile && hoverZone !== 'none' ? 'cursor-none' : ''}`}
    >
      {/* Top and Bottom Fades to blend the section background with adjacent sections */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0C0C0C] to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0C0C0C] to-transparent z-10" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(124,183,255,0.07),transparent_38%)]" />

      {/* 3D Lightbulb Charm with reactive mouse parallax */}
      <motion.div 
        animate={{
          x: mouseOffset.x * 35,
          y: mouseOffset.y * -35,
          rotate: mouseOffset.x * 8
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 60 }}
        className="absolute top-[12%] right-[4%] sm:right-[8%] md:right-[12%] w-[110px] sm:w-[140px] md:w-[185px] pointer-events-none select-none z-10"
      >
        <FadeIn delay={0.2} x={50} y={0} duration={0.9}>
          <img
            src={charmLightbulb}
            alt="3D Lightbulb Decor"
            className="w-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(182, 0, 168, 0.45))'
            }}
          />
        </FadeIn>
      </motion.div>
      
      {/* Heading */}
      <FadeIn delay={0} y={40} className="mb-14 text-center relative z-20">
        <h2 className="hero-heading text-[clamp(2.8rem,9vw,120px)] font-black uppercase leading-none tracking-tight">
          Project
        </h2>
      </FadeIn>

      {/* 3D Rotating Deck Carousel Viewport */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center z-20">
        
        {/* Clickable 3D Rotating Deck Carousel Viewport */}
        <div 
          onClick={handleSectionClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            perspective: '1500px',
            transformStyle: 'preserve-3d'
          }}
          className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] flex items-center justify-center overflow-visible select-none"
        >
          {displayProjects.map((project, index) => (
            <CardWrapper
              key={project.num}
              project={project}
              index={index}
              activeIndex={activeProjIndex}
              onChangeIndex={setActiveProjIndex}
              hoverRotation={hoverRotation}
              onOpenPopup={setActivePopupProject}
            />
          ))}
        </div>

        {/* Monospace interaction indicator */}
        <div className="mt-8 text-[10px] font-mono tracking-[0.25em] text-[#D7E2EA]/30 uppercase flex items-center gap-2 select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-ping" />
          <span>Move cursor to tilt deck • Click sides to navigate • Click cards to view project details</span>
        </div>
      </div>

      {/* Sleek Custom Cursor Indicator */}
      {!isMobile && hoverZone !== 'none' && (
        <motion.div
          className="pointer-events-none absolute z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
          animate={{
            scale: hoverZone === 'center' ? 1 : 0.85,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        >
          {hoverZone === 'left' && (
            <div className="flex flex-col items-center gap-1 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]">
              <svg className="w-12 h-12 text-[#00F2FE] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[8px] font-mono tracking-[0.25em] text-[#00F2FE] uppercase font-bold">PREV</span>
            </div>
          )}
          {hoverZone === 'right' && (
            <div className="flex flex-col items-center gap-1 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]">
              <svg className="w-12 h-12 text-[#00F2FE] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[8px] font-mono tracking-[0.25em] text-[#00F2FE] uppercase font-bold">NEXT</span>
            </div>
          )}
          {hoverZone === 'center' && (
            <div className="w-14 h-14 rounded-full bg-[#B600A8]/20 border border-[#B600A8] flex flex-col items-center justify-center filter drop-shadow-[0_0_8px_rgba(182,0,168,0.8)]">
              <svg className="w-5 h-5 text-white mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="text-[8px] font-mono tracking-widest text-white uppercase font-black font-bold">VIEW</span>
            </div>
          )}
        </motion.div>
      )}

      {/* 3D Holographic Project Details Pop-up Modal */}
      <AnimatePresence>
        {activePopupProject && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onTouchStart={handlePopupTouchStart}
              onTouchMove={handlePopupTouchMove}
              onClick={() => {
                setActivePopupProject(null);
                playCyberSound('click');
              }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: '-50%', y: '-40%', filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.75, x: '-50%', y: '-60%', filter: 'blur(12px)' }}
              transition={{ type: 'spring', damping: 22, stiffness: 140 }}
              onTouchStart={handlePopupTouchStart}
              onTouchMove={handlePopupTouchMove}
              className="popup-box fixed z-50 left-1/2 backdrop-blur-2xl bg-black/95 border rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white w-[90%] max-w-[640px] pointer-events-auto select-text"
              style={{
                top: '50%',
                borderColor: '#00F2FE',
                boxShadow: `0 0 35px rgba(0, 242, 254, 0.25), 0 20px 50px rgba(0,0,0,0.9)`,
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopupProject(null);
                  playCyberSound('click');
                }}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg border bg-black/50 hover:bg-white/5 transition-all duration-300 z-50 cursor-pointer"
                style={{
                  borderColor: 'rgba(0, 242, 254, 0.4)',
                  color: '#00F2FE',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Cyber corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#00F2FE]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#00F2FE]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#00F2FE]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#00F2FE]" />

              <div className="flex flex-col gap-4 select-text">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4 pr-6">
                  <span className="font-black text-2xl md:text-3xl leading-none text-[#00F2FE]">
                    {activePopupProject.num}
                  </span>
                  
                  <div className="text-left">
                    <span className="text-[10px] font-mono tracking-[0.2em] opacity-50 uppercase block">
                      {activePopupProject.category}
                    </span>
                    <h3 className="text-lg font-black uppercase tracking-wide text-white leading-tight">
                      {activePopupProject.name}
                    </h3>
                  </div>
                </div>
                
                {/* Images Preview inside Popup */}
                {activePopupProject.images.col1Img1 ? (
                  <div className="grid grid-cols-[40%_60%] gap-3 w-full h-[180px] sm:h-[220px] md:h-[260px] overflow-hidden rounded-xl border border-white/10">
                    <div className="flex flex-col gap-3">
                      <div className="w-full h-[calc(42%-6px)] overflow-hidden rounded-lg">
                        <img
                          src={activePopupProject.images.col1Img1}
                          alt="Detail 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-full h-[calc(58%-6px)] overflow-hidden rounded-lg">
                        <img
                          src={activePopupProject.images.col1Img2}
                          alt="Detail 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="w-full h-full overflow-hidden rounded-lg">
                      <img
                        src={activePopupProject.images.col2Img}
                        alt="Feature"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-[180px] sm:h-[220px] rounded-xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center overflow-hidden">
                    <span className="text-xs font-mono text-slate-400">Visual Telemetry Offline</span>
                  </div>
                )}

                {activePopupProject.url && (
                  <a 
                    href={activePopupProject.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border font-semibold uppercase tracking-wider text-[10px] py-3.5 transition-all duration-300"
                    style={{
                      borderColor: 'rgba(0, 242, 254, 0.4)',
                      background: 'rgba(0, 242, 254, 0.08)',
                      color: '#fff',
                      boxShadow: `0 0 15px rgba(0, 242, 254, 0.05)`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 242, 254, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.8)';
                      e.currentTarget.style.boxShadow = `0 0 25px rgba(0, 242, 254, 0.25)`;
                      playCyberSound('hover');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 242, 254, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.4)';
                      e.currentTarget.style.boxShadow = `0 0 15px rgba(0, 242, 254, 0.05)`;
                    }}
                    onClick={() => playCyberSound('click')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Visit Live Project</span>
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

// ==========================================
// 4. EXPERIENCE SECTION
// ==========================================
interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  glowColor: string;
  certificate_url?: string;
}

interface CertificateData {
  course: string;
  issuer: string;
  platform: string;
  date: string;
  verifyUrl: string;
  glowColor: string;
  logo: React.ReactNode;
}

const CERTIFICATES: CertificateData[] = [
  {
    course: 'AI Fundamentals',
    issuer: 'Google',
    platform: 'Coursera',
    date: 'Jun 2026',
    verifyUrl: 'https://coursera.org/verify/NFAGLH20ZUAB',
    glowColor: '#4285F4',
    logo: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.2 29.5 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 14 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.2 37 46.5 31.2 46.5 24.5z"/>
        <path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.2 23.2 0 0 0 .8 24c0 3.8.9 7.4 2.5 10.6l7.4-6.1z"/>
        <path fill="#34A853" d="M24 47c5.5 0 10.1-1.8 13.5-4.9l-7.4-5.7c-1.8 1.2-4 1.9-6.1 1.9-6.3 0-11.6-4.5-13.3-10.5l-7.4 6.1C7.1 41.4 14.9 47 24 47z"/>
      </svg>
    ),
  },
];

function ExperienceSection({ experiences: apiExperiences, certificates: apiCertificates }: { experiences?: ExperienceItem[], certificates?: any[] }) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activePopupExperience, setActivePopupExperience] = useState<ExperienceItem | null>(null);
  const [hoveredCert, setHoveredCert] = useState<number | null>(null);

  const handleOpenPopup = (item: ExperienceItem) => {
    setActivePopupExperience(item);
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.experience-node') || target.closest('.popup-box')) {
        return;
      }
      setActivePopupExperience(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (!activePopupExperience) return;
    const initialScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diffY = Math.abs(currentScrollY - initialScrollY);
      if (diffY > 20) {
        setActivePopupExperience(null);
        playCyberSound('click');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePopupExperience]);

  const experienceData: ExperienceItem[] = [
    {
      role: 'Associate core',
      organization: 'AMBIORA TechFest',
      period: 'Mar 2026',
      description: "Core member of the marketing team for Ambiora'26, responsible for event promotion, participant outreach, social media engagement, and brand visibility. Collaborated with multiple teams to enhance the fest's reach and impact.",
      glowColor: '#00F2FE',
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circle border */}
          <circle cx="50" cy="50" r="45" stroke="#00F2FE" strokeWidth="2.5" />
          
          {/* Inner shadow/ring for a premium look */}
          <circle cx="50" cy="50" r="42" stroke="rgba(0, 242, 254, 0.1)" strokeWidth="1.5" />

          {/* Outer Pinwheel Lines */}
          <line x1="38" y1="12" x2="65" y2="58" stroke="#00F2FE" strokeWidth="3" strokeLinecap="round" />
          <line x1="22" y1="78" x2="49" y2="32" stroke="#00F2FE" strokeWidth="3" strokeLinecap="round" />
          <line x1="82" y1="62" x2="35" y2="62" stroke="#00F2FE" strokeWidth="3" strokeLinecap="round" />

          {/* Solder joints */}
          <circle cx="38" cy="12" r="3.5" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="2.5" />
          <circle cx="22" cy="78" r="3.5" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="2.5" />
          <circle cx="82" cy="62" r="3.5" fill="#0C0C0C" stroke="#00F2FE" strokeWidth="2.5" />

          {/* Inner nested triangle */}
          <path d="M 49 42 L 39 60 L 59 60 Z" stroke="#00F2FE" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
        </svg>
      )
    },
    {
      role: 'Marketing core',
      organization: 'Protsahan',
      period: 'Feb 2026',
      description: "Core member of the marketing team for Protsahan'26, responsible for event promotion, audience outreach, social media engagement, and enhancing the fest's visibility. Collaborated with multiple teams to ensure successful execution and greater participation.",
      glowColor: '#B600A8',
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="protsahanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6D00" />
              <stop offset="50%" stopColor="#FF4081" />
              <stop offset="100%" stopColor="#B600A8" />
            </linearGradient>
          </defs>

          {/* The stylized letter P shape from actual Protsahan logo */}
          <path 
            d="M 18 22 
               C 38 19, 72 19, 82 28 
               C 92 37, 90 53, 72 56 
               C 58 58, 44 48, 40 53 
               C 36 58, 36 73, 50 88 
               L 48 93 
               C 35 83, 28 68, 28 50 
               C 28 36, 34 30, 22 30 
               Z" 
            fill="url(#protsahanGrad)" 
            stroke="#FFFFFF" 
            strokeWidth="2"
          />

          {/* Creative doodle details inside the P */}
          <path d="M 38 27 C 52 27, 68 31, 75 39" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.75" strokeLinecap="round" />
          <path d="M 40 42 C 52 44, 62 49, 67 52" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
          <circle cx="41" cy="70" r="2.5" fill="#FFFFFF" opacity="0.8" />
          <line x1="43.5" y1="70" x2="43.5" y2="59" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
        </svg>
      )
    },
    {
      role: 'Marketing Specialist',
      organization: 'App Development Club, NMIMS Shirpur',
      period: '2025 - Present',
      description: "Part of the Marketing Team at the App Development Club, working on event promotions, audience engagement, and outreach activities to expand the club's reach and impact.",
      glowColor: '#D7E2EA',
      icon: (
        <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="adcRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A90E2" />
              <stop offset="50%" stopColor="#00E676" />
              <stop offset="100%" stopColor="#00FF88" />
            </linearGradient>
          </defs>

          {/* Android head peeking (top-left) */}
          <path d="M 12 28 A 12 12 0 0 1 34 22 L 32 30 Z" fill="#78C257" />
          <line x1="20" y1="21" x2="16" y2="13" stroke="#78C257" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="21" x2="32" y2="13" stroke="#78C257" strokeWidth="2" strokeLinecap="round" />
          <circle cx="21" cy="24" r="1" fill="#000000" />
          <circle cx="29" cy="24" r="1" fill="#000000" />

          {/* Apple logo peeking (top-right) */}
          <path d="M 68 18 C 72 15, 78 18, 80 22 C 77 24, 76 28, 79 31 C 76 35, 72 35, 70 33 C 68 35, 64 33, 64 30 C 64 25, 68 21, 68 18 Z" fill="#555555" />
          <path d="M 74 15 C 74 12, 77 10, 79 10 C 79 12, 77 15, 74 15 Z" fill="#555555" />

          {/* Kotlin logo peeking (bottom-right) */}
          <path d="M 62 68 L 78 52 L 78 68 Z" fill="#3F51B5" />
          <path d="M 62 68 L 78 68 L 78 84 Z" fill="#00BCD4" />

          {/* Circular gradient ring */}
          <circle cx="50" cy="50" r="34" stroke="url(#adcRingGrad)" strokeWidth="5" />
          <circle cx="50" cy="50" r="31" fill="#FFFFFF" />

          {/* Central AD Text */}
          <text x="31" y="59" fill="#00C853" fontSize="24" fontWeight="900" fontFamily="'Kanit', sans-serif">A</text>
          <text x="57" y="59" fill="#2979FF" fontSize="24" fontWeight="900" fontFamily="'Kanit', sans-serif">D</text>

          {/* Trapezoid separator in the middle */}
          <path d="M 48 38 L 54 38 L 51 60 Z" fill="#757575" />
          <path d="M 47 36 L 55 36 L 51 62 Z" stroke="#00C853" strokeWidth="1.2" fill="none" />
        </svg>
      )
    }
  ];

  const displayExperiences = apiExperiences && apiExperiences.length > 0
    ? apiExperiences.map(e => ({
        ...e,
        icon: typeof e.icon === 'string'
          ? <div dangerouslySetInnerHTML={{ __html: e.icon }} className="w-14 h-14" />
          : e.icon
      }))
    : experienceData;

  const displayCertificates = apiCertificates && apiCertificates.length > 0
    ? apiCertificates.map(c => ({
        ...c,
        verifyUrl: c.verify_url || c.verifyUrl || '',
        glowColor: c.glow_color || c.glowColor || '#4285F4',
        logo: typeof c.logo_svg === 'string'
          ? <div dangerouslySetInnerHTML={{ __html: c.logo_svg }} className="w-8 h-8 flex items-center justify-center" />
          : c.logo
      }))
    : CERTIFICATES;

  return (
    <section id="experience" className="relative z-20 bg-[#0C0C0C] py-12 sm:py-24 md:py-36 px-5 sm:px-8 md:px-10 overflow-hidden">
      {/* Dynamic Keyframe Animations for Circuit Pulses */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes circuitFlow {
          0% {
            stroke-dashoffset: 40;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .circuit-pulse {
          stroke-dasharray: 6 10;
          animation: circuitFlow 1.8s linear infinite;
        }
      `}} />

      {/* Top and Bottom Fades to blend the section background with adjacent sections */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0C0C0C] to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0C0C0C] to-transparent z-10" />

      {/* Glow Effects */}
      <div className="pointer-events-none absolute top-1/4 left-0 w-[40vw] h-[40vh] rounded-full bg-[radial-gradient(circle,rgba(0,242,254,0.04),transparent_60%)] filter blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 w-[40vw] h-[40vh] rounded-full bg-[radial-gradient(circle,rgba(182,0,168,0.04),transparent_60%)] filter blur-3xl" />

      <div className="max-w-5xl mx-auto flex flex-col items-center relative">
        <FadeIn delay={0} y={40} className="mb-24 text-center">
          <h2 className="hero-heading text-[clamp(2.5rem,8vw,100px)] font-black uppercase leading-none tracking-tight">
            Experience
          </h2>
        </FadeIn>

        {/* Desktop Layout - Career Tech Stack Architecture Diagram */}
        <div className="hidden md:block relative w-full h-[450px] max-w-5xl mx-auto z-10">
          
          {/* Cybernetic Circuit Board SVG Canvas */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 1000 450" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <defs>
                <filter id="glow-line-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-line-magenta" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-line-silver" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {(() => {
                const presetCoords = [
                  { left: '22%', top: '100px', path: 'M 220 100 L 220 220 L 450 220' },
                  { left: '50%', top: '60px', path: 'M 500 60 L 500 170' },
                  { left: '78%', top: '100px', path: 'M 780 100 L 780 220 L 550 220' },
                  { left: '22%', top: '320px', path: 'M 220 320 L 220 220 L 450 220' },
                  { left: '50%', top: '360px', path: 'M 500 360 L 500 270' },
                  { left: '78%', top: '320px', path: 'M 780 320 L 780 220 L 550 220' }
                ];

                return (
                  <>
                    {/* Background Connection Tracks */}
                    {displayExperiences.map((exp, index) => {
                      const coords = presetCoords[index] || presetCoords[index % presetCoords.length];
                      return (
                        <path 
                          key={`bg-${index}`}
                          d={coords.path} 
                          stroke="rgba(255, 255, 255, 0.08)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                        />
                      );
                    })}

                    {/* Glowing Active Circuit Pathways */}
                    {displayExperiences.map((exp, index) => {
                      const coords = presetCoords[index] || presetCoords[index % presetCoords.length];
                      let filterId = 'glow-line-silver';
                      if (exp.glowColor === '#00F2FE' || exp.glowColor?.toLowerCase() === 'cyan') {
                        filterId = 'glow-line-cyan';
                      } else if (exp.glowColor === '#B600A8' || exp.glowColor?.toLowerCase() === 'magenta') {
                        filterId = 'glow-line-magenta';
                      }
                      return (
                        <path 
                          key={`active-${index}`}
                          d={coords.path} 
                          stroke={exp.glowColor || '#D7E2EA'} 
                          strokeWidth="3.5" 
                          filter={`url(#${filterId})`}
                          className="circuit-pulse transition-opacity duration-300"
                          style={{ opacity: hoveredCard === index ? 1 : 0 }} 
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Pulsing Data Packets */}
                    {displayExperiences.map((exp, index) => {
                      const coords = presetCoords[index] || presetCoords[index % presetCoords.length];
                      return (
                        <circle 
                          key={`pulse-${index}`}
                          r="4.5" 
                          fill={exp.glowColor || '#D7E2EA'} 
                          opacity="0.85" 
                          style={{ filter: `drop-shadow(0 0 5px ${exp.glowColor || '#D7E2EA'})` }}
                        >
                          <animateMotion 
                            path={coords.path} 
                            dur={`${2.2 + (index % 3) * 0.4}s`} 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Central CPU Core Node */}
          <div 
            className="absolute left-[50%] top-[220px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-20 pointer-events-none"
          >
            {/* Silicon CPU package */}
            <div className="w-20 h-20 bg-[#0C0C0C] border border-[#00F2FE]/30 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(0,242,254,0.15)] relative">
              {/* CPU Pins */}
              <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
              </div>
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
                <div className="w-1.5 h-1 bg-[#00F2FE]/50" />
              </div>
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
              </div>
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
                <div className="w-1 h-1.5 bg-[#00F2FE]/50" />
              </div>

              {/* Silicon die core */}
              <div className="w-10 h-10 border border-[#00F2FE]/40 rounded-lg bg-[#00F2FE]/5 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00F2FE] animate-ping opacity-60 absolute" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#00F2FE] shadow-[0_0_10px_#00F2FE]" />
              </div>
            </div>
            
            <span className="text-[8px] font-mono tracking-[0.25em] text-[#00F2FE]/70 uppercase mt-1">
              TANVERSE CORE CPU
            </span>
          </div>

          {/* Dynamic Experience Nodes */}
          {(() => {
            const presetCoords = [
              { left: '22%', top: '100px' },
              { left: '50%', top: '60px' },
              { left: '78%', top: '100px' },
              { left: '22%', top: '320px' },
              { left: '50%', top: '360px' },
              { left: '78%', top: '320px' }
            ];

            return displayExperiences.map((exp, index) => {
              const coords = presetCoords[index] || presetCoords[index % presetCoords.length];
              return (
                <motion.div 
                  key={index}
                  onMouseEnter={() => {
                    setHoveredCard(index);
                    playCyberSound('hover');
                  }}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPopup(exp);
                    playCyberSound('popup');
                  }}
                  whileTap={{ scale: 0.88 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer z-10 experience-node group"
                  style={{ left: coords.left, top: coords.top }}
                >
                  <div 
                    className="w-16 h-16 flex items-center justify-center transition-all duration-300"
                    style={{
                      transform: hoveredCard === index ? 'scale(1.15)' : 'scale(1)',
                      filter: hoveredCard === index ? `drop-shadow(0 0 10px ${exp.glowColor})` : 'none'
                    }}
                  >
                    {exp.icon}
                  </div>
                  <h3 
                    className="font-black text-xs uppercase tracking-widest text-center mt-2 whitespace-nowrap transition-colors duration-300"
                    style={{ color: hoveredCard === index ? exp.glowColor : '#FFFFFF' }}
                  >
                    {exp.role}
                  </h3>
                  <span 
                    className="text-[9px] font-mono text-[#D7E2EA]/40 uppercase tracking-[0.1em] text-center mt-0.5 max-w-[180px] truncate group-hover:text-[#D7E2EA]/70 transition-colors duration-300"
                    title={exp.organization}
                  >
                    {exp.organization}
                  </span>
                </motion.div>
              );
            });
          })()}

        </div>

        {/* Mobile Layout - Vertical Timeline */}
        <div className="block md:hidden relative w-full max-w-md mx-auto py-8 z-10">
          {/* Mobile Vertical Timeline Line */}
          <div className="absolute left-[28px] top-0 bottom-0 w-[2px] bg-white/10 pointer-events-none" />
          
          <div className="flex flex-col gap-10">
            {displayExperiences.map((item, index) => (
              <div 
                key={index}
                onMouseEnter={() => playCyberSound('hover')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPopup(item);
                  playCyberSound('popup');
                }}
                className="flex items-center gap-6 cursor-pointer experience-node py-2 relative z-10 group"
              >
                {/* Mobile Icon Wrapper (No Circle Border, No Circle Background) */}
                <div className="w-14 h-14 flex items-center justify-center transition-all duration-300 relative z-10">
                  {item.icon}
                </div>

                {/* Timeline role text */}
                <div className="flex flex-col">
                  <h3 className="font-black text-sm uppercase tracking-widest text-white group-hover:text-cyan-400 transition-colors">
                    {item.role}
                  </h3>
                  <span className="text-[10px] font-mono text-[#D7E2EA]/50 uppercase tracking-[0.15em] mt-0.5">
                    {item.organization}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3D Holographic Experience Details Pop-up Modal */}
      <AnimatePresence>
        {activePopupExperience && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActivePopupExperience(null);
                playCyberSound('click');
              }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: '-50%', y: '-40%', filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.75, x: '-50%', y: '-60%', filter: 'blur(12px)' }}
              transition={{ type: 'spring', damping: 22, stiffness: 140 }}
              className="popup-box fixed z-50 left-1/2 backdrop-blur-2xl bg-black/95 border rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white w-[90%] max-w-[420px] pointer-events-auto select-text"
              style={{
                top: '50%',
                borderColor: activePopupExperience.glowColor,
                boxShadow: `0 0 35px ${activePopupExperience.glowColor}25, 0 20px 50px rgba(0,0,0,0.9)`,
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopupExperience(null);
                  playCyberSound('click');
                }}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg border bg-black/50 hover:bg-white/5 transition-all duration-300 z-50 cursor-pointer"
                style={{
                  borderColor: activePopupExperience.glowColor + '40',
                  color: activePopupExperience.glowColor,
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Cyber corners */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l transition-colors duration-300" style={{ borderColor: activePopupExperience.glowColor }} />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r transition-colors duration-300" style={{ borderColor: activePopupExperience.glowColor }} />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l transition-colors duration-300" style={{ borderColor: activePopupExperience.glowColor }} />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r transition-colors duration-300" style={{ borderColor: activePopupExperience.glowColor }} />

              <div className="flex flex-col gap-4 select-text">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4 pr-6">
                  <div 
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{
                      filter: `drop-shadow(0 0 8px ${activePopupExperience.glowColor})`,
                    }}
                  >
                    {activePopupExperience.icon}
                  </div>
                  
                  <div className="text-left">
                    <span className="text-[10px] font-mono tracking-[0.2em] opacity-50 uppercase block">
                      {activePopupExperience.organization}
                    </span>
                    <h3 className="text-lg font-black uppercase tracking-wide text-white leading-tight">
                      {activePopupExperience.role}
                    </h3>
                    <span className="inline-block mt-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-white/5 text-[#D7E2EA]/60">
                      {activePopupExperience.period}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-slate-300 leading-relaxed font-normal text-left">
                  {activePopupExperience.description}
                </div>

                {activePopupExperience.certificate_url && (
                  <a 
                    href={activePopupExperience.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border font-semibold uppercase tracking-wider text-[10px] py-3.5 transition-all duration-300"
                    style={{
                      borderColor: activePopupExperience.glowColor + '40',
                      background: activePopupExperience.glowColor + '08',
                      color: '#fff',
                      boxShadow: `0 0 15px ${activePopupExperience.glowColor}0b`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = activePopupExperience.glowColor + '15';
                      e.currentTarget.style.borderColor = activePopupExperience.glowColor + '80';
                      e.currentTarget.style.boxShadow = `0 0 25px ${activePopupExperience.glowColor}25`;
                      playCyberSound('hover');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = activePopupExperience.glowColor + '08';
                      e.currentTarget.style.borderColor = activePopupExperience.glowColor + '40';
                      e.currentTarget.style.boxShadow = `0 0 15px ${activePopupExperience.glowColor}0b`;
                    }}
                    onClick={() => playCyberSound('click')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Verify Certificate</span>
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Credentials Sub-Section ─── */}
      <div className="relative z-20 max-w-5xl mx-auto px-5 sm:px-8 md:px-10 mt-24 pb-8">
        {/* Divider with label */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent via-white/15 to-white/5" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-slate-400 uppercase whitespace-nowrap">
            Credentials & Certifications
          </span>
          <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent via-white/15 to-white/5" />
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Certificate Cards */}
          {displayCertificates.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onMouseEnter={() => setHoveredCert(index)}
              onMouseLeave={() => setHoveredCert(null)}
              className="relative p-6 rounded-2xl border bg-white/[0.02] backdrop-blur-xl group transition-all duration-300 overflow-hidden"
              style={{
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
                borderColor: hoveredCert === index ? cert.glowColor : 'rgba(255,255,255,0.1)'
              }}
            >
              {/* Corner Brackets */}
              <div 
                className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 transition-colors duration-300"
                style={{ borderColor: hoveredCert === index ? cert.glowColor : undefined }}
              />
              <div 
                className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20 transition-colors duration-300"
                style={{ borderColor: hoveredCert === index ? cert.glowColor : undefined }}
              />
              <div 
                className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20 transition-colors duration-300"
                style={{ borderColor: hoveredCert === index ? cert.glowColor : undefined }}
              />
              <div 
                className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 transition-colors duration-300"
                style={{ borderColor: hoveredCert === index ? cert.glowColor : undefined }}
              />

              {/* Hover Glow Background */}
              <div 
                className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, ${cert.glowColor}00 0%, ${cert.glowColor}0b 50%, ${cert.glowColor}00 100%)`
                }}
              />

              <div className="flex items-start gap-5 relative z-10">
                {/* Platform/Company Logo */}
                <div 
                  className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
                  style={{
                    borderColor: hoveredCert === index ? cert.glowColor + '40' : undefined,
                    filter: `drop-shadow(0 0 6px ${cert.glowColor}30)`,
                  }}
                >
                  {cert.logo}
                </div>

                <div className="flex flex-col flex-grow min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      className="text-[10px] font-mono tracking-widest uppercase font-bold transition-colors duration-300"
                      style={{ color: cert.glowColor }}
                    >
                      {cert.platform}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cert.date}
                    </span>
                  </div>

                  <h4 
                    className="text-lg font-black uppercase tracking-wide mt-1 truncate transition-colors duration-300"
                    style={{ color: hoveredCert === index ? cert.glowColor : '#FFFFFF' }}
                  >
                    {cert.course}
                  </h4>
                  
                  <span className="text-xs text-slate-400 font-medium mt-0.5">
                    Authorized by {cert.issuer}
                  </span>

                  <a 
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#00F2FE] hover:text-white mt-4 font-mono uppercase tracking-wider transition-colors duration-200 group/link w-fit"
                  >
                    <span>Verify Certificate</span>
                    <svg className="w-3.5 h-3.5 transform transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Placeholder: More in Progress */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] backdrop-blur-xl flex flex-col justify-center items-center text-center py-10 group"
          >
            <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4 text-slate-500 group-hover:text-slate-300 group-hover:border-slate-400 transition-colors duration-300">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              More Credentials in Progress
            </h4>
            <p className="text-[11px] font-mono text-slate-500 mt-2 max-w-[240px]">
              Currently mastering Advanced ML systems & Deep Learning frameworks.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 5. INTERACTIVE CONTACT SECTION
// ==========================================
function ContactSection({ contactInfo: apiContact }: { contactInfo?: any }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
      })
      .then(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        playCyberSound('click');
      })
      .catch(err => {
        console.error('Contact submission error:', err);
        setIsSubmitting(false);
        alert('Transmission failed. Direct sync offline.');
      });
  };

  const displayContact = apiContact || {
    email: 'tanmayverse776@gmail.com',
    phone: '+91 XXXXXXXXXX',
    location: 'Maharashtra, India',
    github_url: 'https://github.com/tanmay-dhoot',
    linkedin_url: 'https://www.linkedin.com/in/tanmay-dhoot-402949257'
  };

  return (
    <section id="contact" className="relative z-20 bg-transparent py-12 sm:py-24 md:py-32 px-5 sm:px-8 md:px-10 overflow-hidden">
      {/* Top Fade to blend the section background with adjacent sections */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0C0C0C] to-transparent z-10" />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] rounded-full bg-[radial-gradient(circle,rgba(118,33,176,0.12),transparent_70%)] filter blur-3xl" />

      
      {/* Floating 3D SVGs */}
      <div className="pointer-events-none absolute top-12 left-[10%] w-16 h-16 float-slow-animation opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#00F2FE]" strokeWidth="4">
          <circle cx="50" cy="50" r="30" />
        </svg>
      </div>
      <div className="pointer-events-none absolute bottom-24 right-[12%] w-20 h-20 float-medium-animation opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#B600A8]" strokeWidth="4">
          <rect x="25" y="25" width="50" height="50" rx="10" transform="rotate(45, 50, 50)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <FadeIn delay={0} y={40} className="mb-12 text-center">
          <h2 className="hero-heading text-[clamp(2.5rem,8vw,100px)] font-black uppercase leading-none tracking-tight">
            Get in Touch
          </h2>
          {/* Refinement 2: contrast raised */}
          <p className="text-slate-300 uppercase tracking-widest text-xs font-semibold mt-4">
            Let&apos;s build something great together
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 w-full mt-4 items-stretch">
          {/* Left panel: Info & Socials (2 cols) */}
          <div className="md:col-span-2 flex flex-col justify-between gap-10">
            <FadeIn delay={0.1} y={30} className="flex flex-col gap-6">
              <h3 className="text-2xl font-semibold uppercase text-white tracking-wider">
                Contact Info
              </h3>
              {/* Refinement 2: contrast raised from /75 to /90 */}
              <p className="text-slate-300 font-light leading-relaxed">
                Whether you have a question, a project idea, or just want to connect, feel free to drop a message.
              </p>
              
              <div className="flex flex-col gap-4 mt-4">
                <a href={`mailto:${displayContact.email}`} className="flex items-center gap-4 text-[#D7E2EA] hover:text-[#00F2FE] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium tracking-wide">{displayContact.email}</span>
                </a>
                
                <div className="flex items-center gap-4 text-[#D7E2EA]">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium tracking-wide">{displayContact.location}</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} y={30} className="flex flex-col gap-4">
              <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#D7E2EA]/40">
                Follow Me
              </h4>
              <div className="flex gap-4">
                <Magnet padding={50} strength={3}>
                  <a href={displayContact.github_url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white/10 hover:border-[#00F2FE] hover:text-[#00F2FE] transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                </Magnet>
                <Magnet padding={50} strength={3}>
                  <a href={displayContact.linkedin_url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white/10 hover:border-[#B600A8] hover:text-[#B600A8] transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </Magnet>
              </div>
            </FadeIn>
          </div>

          {/* Right panel: Glassmorphic form (3 cols) */}
          <div className="md:col-span-3">
            <FadeIn delay={0.25} y={40} className="h-full">
              <div className="relative h-full rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 shadow-xl flex flex-col justify-center overflow-hidden">
                
                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2 uppercase tracking-wide">
                      Message Sent!
                    </h3>
                     {/* Refinement 2: contrast raised */}
                     <p className="text-slate-300 font-light leading-relaxed max-w-sm">
                      Thank you for reaching out! I will review your message and get back to you shortly.
                     </p>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] border-b border-[#00F2FE] text-[#00F2FE] hover:text-white hover:border-white transition-colors pb-1"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2 relative">
                      {/* Refinement 2: form labels at slate-400 for readable contrast */}
                      <label htmlFor="name" className="text-xs uppercase tracking-widest font-semibold text-slate-400">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="flex flex-col gap-2 relative">
                      <label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold text-slate-400">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#B600A8] focus:ring-1 focus:ring-[#B600A8] transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="flex flex-col gap-2 relative">
                      <label htmlFor="message" className="text-xs uppercase tracking-widest font-semibold text-slate-400">
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] transition-all resize-none"
                        placeholder="Your message details..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="contact-button w-full inline-flex justify-center items-center rounded-xl text-white font-semibold uppercase tracking-widest text-sm py-4 mt-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-55 disabled:scale-100 disabled:pointer-events-none"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 6. MASTER APP CONTAINER
// ==========================================
export default function App() {
  const [skills, setSkills] = useState<SkillData[] | undefined>(undefined);
  const [experiences, setExperiences] = useState<ExperienceItem[] | undefined>(undefined);
  const [projects, setProjects] = useState<ProjectData[] | undefined>(undefined);
  const [contactInfo, setContactInfo] = useState<any>(undefined);
  const [certificates, setCertificates] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    document.title = 'Tanverse -- 3D Creator';
    
    // Fetch data from backend
    fetch(`${API_BASE}/portfolio`)
      .then(res => res.json())
      .then(data => {
        if (data.skills) setSkills(data.skills);
        if (data.experiences) setExperiences(data.experiences);
        if (data.projects) setProjects(data.projects);
        if (data.contact) setContactInfo(data.contact);
        if (data.certificates) setCertificates(data.certificates);
      })
      .catch(err => {
        console.warn('Backend server is offline or unreachable. Running in offline static fallback mode.', err);
      });

    // Telemetry tracking
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(geo => {
        return fetch(`${API_BASE}/visits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip: geo.ip,
            country: geo.country_name,
            city: geo.city,
            user_agent: navigator.userAgent
          })
        });
      })
      .catch(err => {
        console.warn('Geolocation telemetry failed. Logging generic visit.', err);
        fetch(`${API_BASE}/visits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip: 'Unknown',
            country: 'Unknown',
            city: 'Unknown',
            user_agent: navigator.userAgent
          })
        }).catch(err2 => console.error('Generic telemetry failed:', err2));
      });
  }, []);

  return (
    <main className="main-wrapper overflow-x-clip bg-[#0C0C0C]">
      {/* Space particle background */}
      <SpaceCanvas />

      {/* Intro Entrance Splash Overlay */}
      <IntroOverlay />

      {/* Hero Section */}
      <HeroSection avatarUrl={contactInfo?.avatar_url} />

      {/* Signal Pulse Transition Bridge */}
      <SectionTransition />

      {/* About Section */}
      <AboutSection />

      <SectionDivider />

      {/* Services Section */}
      <SkillsSection skills={skills} />

      <SectionDivider />

      {/* Experience + Credentials Section */}
      <ExperienceSection experiences={experiences} certificates={certificates} />

      <SectionDivider />

      {/* Projects Section */}
      <ProjectsSection projects={projects} />

      <SectionDivider />

      {/* Contact Section */}
      <ContactSection contactInfo={contactInfo} />

      {/* Simple Brand Footer */}
      <footer
        className="relative z-30 bg-[#0C0C0C] px-5 py-8 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D7E2EA]/40"
      >
        © 2026 Tanmay Dhoot. All rights reserved.
      </footer>
    </main>
  );
}
