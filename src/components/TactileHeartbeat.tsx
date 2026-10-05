import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnniversaryConfig } from '../types';

interface TactileHeartbeatProps {
  totalHeartbeats?: number;
  onSendHeartbeat?: () => void;
  onSendPulse?: () => void;
  config?: AnniversaryConfig;
  herName?: string;
  hisName?: string;
}

const SWEET_PULSE_MESSAGES = [
  "Pulse received. I'm right here with you, Aline.",
  "Every beat of my heart belongs to you.",
  "Thinking of your smile across the ocean right now.",
  "Holding you tight in my thoughts, minha linda.",
  "Feliz 1 ano, meu amor.",
  "The miles disappear every time you touch this.",
  "You are my favourite thought today.",
  "My heart beats in time with yours, always.",
];

export const TactileHeartbeat: React.FC<TactileHeartbeatProps> = ({
  totalHeartbeats,
  onSendHeartbeat,
  onSendPulse,
  config,
  herName = 'Aline',
  hisName = 'Jazz',
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [recentlyPulsed, setRecentlyPulsed] = useState(false);
  const [pulseMessage, setPulseMessage] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const resolvedHerName = herName || config?.herName || 'Aline';
  const resolvedHisName = hisName || config?.hisName || 'Jazz';

  const [localBeats, setLocalBeats] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('meridian_sanctuary_heartbeats_count');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {}
    return totalHeartbeats ?? config?.totalHeartbeatsSent ?? 37843200;
  });

  // Save beats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('meridian_sanctuary_heartbeats_count', localBeats.toString());
    } catch {}
  }, [localBeats]);

  const triggerPulse = () => {
    if (onSendHeartbeat) onSendHeartbeat();
    if (onSendPulse) onSendPulse();
    setLocalBeats((prev) => prev + 1);
    setRecentlyPulsed(true);
    setTimeout(() => setRecentlyPulsed(false), 2600);

    // Spawn floating heart
    const newId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev.slice(-6), { id: newId, x: (Math.random() - 0.5) * 60, y: 0 }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newId));
    }, 1800);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 50, 40]);
      } catch {}
    }

    const randomMsg = SWEET_PULSE_MESSAGES[Math.floor(Math.random() * SWEET_PULSE_MESSAGES.length)];
    setPulseMessage(randomMsg);
    setTimeout(() => setPulseMessage(null), 4000);

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#e11d48', '#fda4af', '#fbbf24', '#ffffff'],
    });
  };

  const displayCount = localBeats.toLocaleString();

  return (
    <div className="relative w-full max-w-lg mx-auto my-6 px-4 text-center">
      {/* Warm Crimson Sanctuary Container */}
      <div className="relative bg-gradient-to-b from-[#18060a] via-[#10070e] to-[#07090e] border border-[#e11d48]/40 rounded-3xl p-6 sm:p-10 shadow-[0_10px_60px_rgba(225,29,72,0.22)] overflow-hidden">
        {/* Subtle background red warmth aura */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#e11d48]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-0 w-60 h-60 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e11d48]/15 border border-[#e11d48]/35 text-xs font-mono tracking-wider text-[#fda4af] uppercase mb-4 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-[#e11d48] text-[#e11d48]" />
            <span>REAL-TIME HEARTBEAT TOUCH</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide mb-2 drop-shadow-sm">
            I Love You
          </h2>

          <p className="text-sm font-serif text-[#fdf2f4]/85 max-w-sm mx-auto mb-8 leading-relaxed">
            Press and tap right here. Feel it beat with you, <span className="text-[#fda4af] font-semibold">{resolvedHerName}</span> every single pulse belongs to you.
          </p>

          {/* Interactive Crimson Heart Target */}
          <div className="relative flex items-center justify-center my-8">
            {/* Concentric red shockwaves when pulsing or recently pulsed */}
            {(isPressing || recentlyPulsed) && (
              <>
                <div className="absolute w-36 h-36 rounded-full border-2 border-[#e11d48] animate-ping opacity-75 pointer-events-none" />
                <div className="absolute w-52 h-52 rounded-full border border-[#fb7185] animate-ping opacity-45 delay-150 pointer-events-none" />
                <div className="absolute w-64 h-64 rounded-full border border-[#fda4af]/30 animate-ping opacity-25 delay-300 pointer-events-none" />
              </>
            )}

            {/* Floating hearts animation */}
            {floatingHearts.map((heart) => (
              <div
                key={heart.id}
                style={{ transform: `translate(${heart.x}px, -40px)` }}
                className="absolute pointer-events-none animate-float text-[#fda4af] flex items-center gap-1 font-serif text-xs"
              >
                <Heart className="w-5 h-5 fill-[#e11d48] text-[#fda4af] drop-shadow-md" />
                <span className="font-bold text-[#fecdd3] drop-shadow">+1</span>
              </div>
            ))}

            <button
              id="pulse-heart-button"
              onMouseDown={() => {
                setIsPressing(true);
                triggerPulse();
              }}
              onMouseUp={() => setIsPressing(false)}
              onMouseLeave={() => setIsPressing(false)}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsPressing(true);
                triggerPulse();
              }}
              onTouchEnd={() => setIsPressing(false)}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer select-none ${
                isPressing || recentlyPulsed
                  ? 'scale-120 bg-[#e11d48] shadow-[0_0_60px_#e11d48,0_0_90px_rgba(251,113,133,0.7)]'
                  : 'bg-gradient-to-br from-[#e11d48] via-[#be123c] to-[#4c0519] border-2 border-[#fda4af] hover:border-white shadow-[0_0_35px_rgba(225,29,72,0.5)] hover:scale-110 active:scale-125'
              }`}
              aria-label="Hold or tap to send heartbeat"
            >
              <Heart
                className={`w-16 h-16 transition-all duration-200 ${
                  isPressing || recentlyPulsed
                    ? 'fill-white text-white scale-110 drop-shadow-[0_0_20px_#fff]'
                    : 'fill-[#ffffff] text-[#ffeef0] animate-heart-throb drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]'
                }`}
              />
            </button>
          </div>

          {/* Tap Prompt */}
          <div className="text-xs font-mono text-[#fda4af]/90 uppercase tracking-widest mb-3">
            {recentlyPulsed ? "PULSE ECHOING ACROSS THE OCEAN..." : "TAP TO SEND YOUR HEARTBEAT"}
          </div>

          {/* Heartbeat Counter & Message Feedback */}
          <div className="min-h-14 flex flex-col items-center justify-center">
            <div className="text-sm font-mono text-[#fecdd3]">
              <span className="text-white font-bold text-lg sm:text-xl drop-shadow-sm">{displayCount}</span> heartbeats dedicated to you
            </div>
            {pulseMessage && (
              <div className="mt-3 text-xs sm:text-sm font-serif italic text-[#fff] bg-[#e11d48]/40 px-5 py-2 rounded-full border border-[#fda4af]/50 shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-fadeIn">
                {pulseMessage}
              </div>
            )}
          </div>

          {/* 1 Year Anniversary Note */}
          <div className="mt-6 px-5 py-4 rounded-2xl bg-[#e11d48]/15 border border-[#e11d48]/30 text-[#fda4af] font-serif text-sm sm:text-base italic leading-relaxed shadow-inner">
            "One year with you, and somehow my heart still forgets how to act whenever it's you. Feliz 1 ano, meu amor."
          </div>

          {/* Simple warm reassurance note */}
          <div className="mt-5 pt-4 border-t border-[#e11d48]/20 flex items-center justify-between text-xs text-[#d1a3ac] font-serif">
            <span className="italic">"Miles mean nothing when someone means everything."</span>
            <span className="font-sans font-semibold text-[#fda4af]">{resolvedHisName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
