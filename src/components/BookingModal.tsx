import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const email = 'tanmaydhoot2005@gmail.com';
  const meetingSubject = encodeURIComponent('Introductory Tech Call with Tanmay Dhoot');
  const meetingBody = encodeURIComponent(
    'Hi Tanmay,\n\nI came across your 3D engineering portfolio and would love to schedule a quick 15-minute chat to discuss potential opportunities or project collaboration.\n\nBest regards,'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-2xl border border-[#00F2FE]/40 bg-[#0C0C0C]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,242,254,0.2)] text-white"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-[#00F2FE] uppercase px-2.5 py-0.5 rounded-full border border-[#00F2FE]/30 bg-[#00F2FE]/10 mb-2 inline-block">
                  DIRECT VIP ACCESS
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Schedule 15-Min Intro Call
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Have a high-scale architecture challenge, flagship AI project, or senior engineering opportunity?
              Connect directly with Tanmay Dhoot via your preferred channel:
            </p>

            {/* Action Cards */}
            <div className="mt-6 space-y-3">
              {/* Option 1: Direct Priority Email */}
              <a
                href={`mailto:${email}?subject=${meetingSubject}&body=${meetingBody}`}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-[#00F2FE]/10 hover:border-[#00F2FE]/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00F2FE]/15 border border-[#00F2FE]/30 flex items-center justify-center text-lg">
                    ✉️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00F2FE] transition-colors">
                      Send Priority Invitation Email
                    </h4>
                    <p className="text-[11px] font-mono text-white/50">{email}</p>
                  </div>
                </div>
                <span className="text-sm text-[#00F2FE] group-hover:translate-x-1 transition-transform">
                  Launch ↗
                </span>
              </a>

              {/* Option 2: LinkedIn Message */}
              <a
                href="https://linkedin.com/in/tanmay-dhoot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-blue-500/10 hover:border-blue-400/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-lg">
                    💼
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      Connect via LinkedIn InMail
                    </h4>
                    <p className="text-[11px] font-mono text-white/50">linkedin.com/in/tanmay-dhoot</p>
                  </div>
                </div>
                <span className="text-sm text-blue-400 group-hover:translate-x-1 transition-transform">
                  Connect ↗
                </span>
              </a>

              {/* Option 3: Instant Copy Email */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(email);
                  alert('Email address copied to clipboard: ' + email);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span>📋</span>
                <span>Copy Email Address</span>
              </button>
            </div>

            {/* Timezone Indicator Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Timezone: IST (UTC +5:30)</span>
              </div>
              <span>Typical response: &lt; 4 hours</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
