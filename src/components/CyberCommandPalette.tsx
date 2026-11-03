import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Social';
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: string;
  action: () => void;
}

interface CyberCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  isOverclocked: boolean;
  onToggleOverclock: () => void;
  onOpenBooking: () => void;
}

export default function CyberCommandPalette({
  isOpen,
  onClose,
  isAudioMuted,
  onToggleAudio,
  isOverclocked,
  onToggleOverclock,
  onOpenBooking,
}: CyberCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setToastMessage(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const scrollToSection = (id: string) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('tanmaydhoot2005@gmail.com');
    setToastMessage('✓ Copied: tanmaydhoot2005@gmail.com');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1000);
  };

  const items: CommandItem[] = [
    // Navigation
    {
      id: 'nav-about',
      category: 'Navigation',
      title: 'About Tanmay',
      subtitle: 'Bio, Philosophy & Core Vision',
      shortcut: 'G A',
      icon: '👤',
      action: () => scrollToSection('about'),
    },
    {
      id: 'nav-skills',
      category: 'Navigation',
      title: 'Holographic Skills',
      subtitle: '3D Interactive Diagnostic Console',
      shortcut: 'G S',
      icon: '⚡',
      action: () => scrollToSection('skills'),
    },
    {
      id: 'nav-experience',
      category: 'Navigation',
      title: 'Experience & Roles',
      subtitle: '3D Cylinder Deck of Roles & Verification',
      shortcut: 'G E',
      icon: '💼',
      action: () => scrollToSection('experience'),
    },
    {
      id: 'nav-projects',
      category: 'Navigation',
      title: 'Flagship Projects',
      subtitle: '3D Kinetic Ribbon & Live Deployments',
      shortcut: 'G P',
      icon: '🚀',
      action: () => scrollToSection('projects'),
    },
    {
      id: 'nav-contact',
      category: 'Navigation',
      title: 'Get in Touch',
      subtitle: 'Send Encrypted Message & Telemetry',
      shortcut: 'G C',
      icon: '📬',
      action: () => scrollToSection('contact'),
    },

    // Actions
    {
      id: 'act-booking',
      category: 'Actions',
      title: 'Book a 15-Minute Intro Call',
      subtitle: 'Schedule a quick architectural chat or interview',
      shortcut: 'B',
      icon: '📅',
      action: () => {
        onClose();
        onOpenBooking();
      },
    },
    {
      id: 'act-resume',
      category: 'Actions',
      title: 'Download Resume (PDF)',
      subtitle: 'Direct high-resolution engineering CV',
      shortcut: 'D',
      icon: '📄',
      action: () => {
        onClose();
        window.open('https://github.com/mylifeastanmay-hub/resume/raw/main/resume.pdf', '_blank');
      },
    },
    {
      id: 'act-email',
      category: 'Actions',
      title: 'Copy Email to Clipboard',
      subtitle: 'tanmaydhoot2005@gmail.com',
      shortcut: 'C',
      icon: '📋',
      action: copyEmail,
    },
    {
      id: 'act-audio',
      category: 'Actions',
      title: isAudioMuted ? 'Unmute Cyber Audio' : 'Mute Cyber Audio',
      subtitle: 'Toggle tactile Web Audio synthesizer feedback',
      shortcut: 'M',
      icon: isAudioMuted ? '🔇' : '🔊',
      action: () => {
        onToggleAudio();
        onClose();
      },
    },
    {
      id: 'act-overclock',
      category: 'Actions',
      title: isOverclocked ? 'Disable Overclocked Mode' : 'Activate Overclocked Mode ⚡',
      subtitle: 'Toggle CRT scanlines & electric neon cyber aura',
      shortcut: 'O',
      icon: '⚡',
      action: () => {
        onToggleOverclock();
        onClose();
      },
    },

    // Social
    {
      id: 'soc-github',
      category: 'Social',
      title: 'Open GitHub Profile',
      subtitle: 'github.com/mylifeastanmay-hub',
      shortcut: 'G H',
      icon: '🐙',
      action: () => {
        onClose();
        window.open('https://github.com/mylifeastanmay-hub', '_blank');
      },
    },
    {
      id: 'soc-linkedin',
      category: 'Social',
      title: 'Open LinkedIn Profile',
      subtitle: 'linkedin.com/in/tanmay-dhoot',
      shortcut: 'L I',
      icon: '💼',
      action: () => {
        onClose();
        window.open('https://linkedin.com/in/tanmay-dhoot', '_blank');
      },
    },
  ];

  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl rounded-2xl border border-white/20 bg-[#0C0C0C]/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(0,242,254,0.15)] overflow-hidden text-white"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <span className="text-[#00F2FE] text-base">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or jump to section..."
                className="w-full bg-transparent text-sm sm:text-base font-sans text-white placeholder-white/35 focus:outline-none"
              />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-2 py-0.5 rounded border border-white/10">
                ESC
              </span>
            </div>

            {/* Command List */}
            <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm font-mono text-white/40">
                  No commands found matching "{query}"
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#00F2FE]/15 border border-[#00F2FE]/40 text-white'
                          : 'border border-transparent text-white/80 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate text-white">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-[10px] sm:text-[11px] font-mono text-white/50 truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                          {item.category}
                        </span>
                        {item.shortcut && (
                          <span className="text-[9px] font-mono text-[#00F2FE] px-1.5 py-0.5 rounded bg-[#00F2FE]/10 border border-[#00F2FE]/30">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom HUD Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-t border-white/10 text-[10px] font-mono text-white/50">
              {toastMessage ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{toastMessage}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>↑↓ Navigate</span>
                  <span>•</span>
                  <span>↵ Select</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[#00F2FE]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
                <span>TANVERSE HUD v2.5</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
