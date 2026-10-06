import React, { useState, useEffect } from 'react';
import { Lock, Key, Heart, Sparkles, Clock, ArrowRight, Download, ExternalLink, HelpCircle, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnniversaryTimeLockScreenProps {
  unlockDateTime: string; // e.g. "2026-10-05T23:00:00"
  herName: string;
  hisName: string;
  secretPasscode?: string;
  creatorPasscode?: string;
  onUnlockEarly: (asCreator?: boolean) => void;
}

export const AnniversaryTimeLockScreen: React.FC<AnniversaryTimeLockScreenProps> = ({
  unlockDateTime,
  herName,
  hisName,
  secretPasscode = 'september29',
  creatorPasscode = 'jazz29',
  onUnlockEarly,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeployGuide, setShowDeployGuide] = useState(false);

  // Time calculations
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(unlockDateTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [unlockDateTime]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passcode.trim().toLowerCase();
    const expected = (secretPasscode || 'september29').trim().toLowerCase();

    // Check if Aline entered early access passcode
    const validMatches = [
      expected,
      'september29',
      'september 29',
      'sep29',
      '29',
      'love',
      'forever',
      'jazz',
    ];

    const isCreatorAttempt = 
      cleanInput === (creatorPasscode || 'jazz29').toLowerCase() ||
      cleanInput === 'jazz' ||
      cleanInput === 'creator' ||
      cleanInput === 'workshop';

    if (isCreatorAttempt) {
      setErrorMsg(null);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e5be7a', '#fbbf24', '#ffffff', '#e11d48'],
      });
      setTimeout(() => {
        onUnlockEarly(true);
      }, 400);
      return;
    }

    if (validMatches.includes(cleanInput)) {
      setErrorMsg(null);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fda4af', '#fbbf24', '#ffffff'],
      });
      setTimeout(() => {
        onUnlockEarly(false);
      }, 500);
    } else {
      setErrorMsg("That's not the secret whisper yet, my love. Ask me for our key, or we count down together until tonight at 10:00 PM.");
    }
  };

  let formattedTargetDate = "October 5 at 10:00 PM";
  try {
    const targetDateObj = new Date(unlockDateTime);
    if (!isNaN(targetDateObj.getTime())) {
      formattedTargetDate = targetDateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      }) + ' at ' + targetDateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[#070205] text-[#fdf2f4] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#e11d48]/30">
      {/* Background starlight & warm crimson glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#e11d48]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[450px] h-[450px] bg-[#fbbf24]/08 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-12 left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <div className="absolute top-28 right-[20%] w-2 h-2 bg-[#fda4af] rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-24 left-[10%] w-1 h-1 bg-[#fbbf24] rounded-full animate-pulse delay-700" />
        <div className="absolute top-1/2 right-[12%] w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-500" />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        {/* Ornate Wax Seal Medallion */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#e11d48] via-[#9f1239] to-[#4c0519] border-4 border-[#fda4af]/60 shadow-[0_0_50px_rgba(225,29,72,0.45)] flex flex-col items-center justify-center p-2 relative">
            <div className="w-full h-full rounded-full border border-dashed border-[#fda4af]/40 flex flex-col items-center justify-center">
              <span className="font-serif italic text-white font-bold text-xl sm:text-2xl tracking-wider drop-shadow-md">
                A & J
              </span>
              <span className="text-[9px] font-mono text-[#fda4af] tracking-widest uppercase mt-0.5 px-1 truncate max-w-[90px]">
                {formattedTargetDate}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-[#1c0812] border border-[#e11d48] flex items-center justify-center shadow-lg">
              <Lock className="w-4 h-4 text-[#fda4af]" />
            </div>
          </div>
        </div>

        {/* Header Badges */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#200b14] border border-[#e11d48]/40 text-xs font-mono text-[#fda4af] uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
          <span>DEDICATED TO {herName.toUpperCase()} | ENGINEERED WITH DEVOTION BY {hisName.toUpperCase()}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-wide mb-3 leading-tight">
          Everything I Wanted to Tell You
        </h1>

        <p className="text-sm sm:text-base font-serif italic text-[#d1a3ac] max-w-md mx-auto mb-8 leading-relaxed">
          "Hey my love. I made this whole little corner of the world just for you. Every word, every letter, and every dream in here belongs to you. It unlocks on {formattedTargetDate}, but if you can't wait... you know I could never truly keep a secret from you."
        </p>

        {/* Live Countdown Grid to Sept 29 at 11:00 AM OR Gift Unwrap */}
        <div className="bg-[#16080e]/85 backdrop-blur-md border border-[#3b131c] rounded-3xl p-6 sm:p-7 shadow-2xl mb-8">
          {timeLeft.isPast ? (
            <div className="text-center py-2">
              <span className="text-xs font-mono text-[#fbbf24] uppercase tracking-wider block mb-2">
                ANNIVERSARY SANCTUARY READY FOR ALINE
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white font-bold mb-3">
                Your Sanctuary is Ready, My Love
              </h3>
              <p className="text-sm font-serif italic text-[#fda4af] max-w-md mx-auto mb-6">
                "Even if the calendar says October, every day since September 29th is our anniversary. Every letter, every poem, and every memory inside is devoted to you."
              </p>
              <button
                type="button"
                onClick={() => {
                  confetti({
                    particleCount: 110,
                    spread: 85,
                    origin: { y: 0.6 },
                    colors: ['#e11d48', '#fda4af', '#fbbf24', '#ffffff'],
                  });
                  onUnlockEarly();
                }}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#be123c] text-white font-serif font-bold text-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(225,29,72,0.4)] cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Unwrap Your Sanctuary, Aline</span>
                <Sparkles className="w-4 h-4 text-[#fbbf24]" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#fda4af] uppercase tracking-wider mb-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Unlocks On {formattedTargetDate}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
                <div className="bg-[#200b14] border border-[#3b131c] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-white mb-0.5">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-[#8a6870] uppercase">Days</span>
                </div>
                <div className="bg-[#200b14] border border-[#3b131c] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-white mb-0.5">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-[#8a6870] uppercase">Hours</span>
                </div>
                <div className="bg-[#200b14] border border-[#3b131c] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-white mb-0.5">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-[#8a6870] uppercase">Mins</span>
                </div>
                <div className="bg-[#200b14] border border-[#3b131c] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#e11d48] mb-0.5">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono text-[#8a6870] uppercase">Secs</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Early Access Passcode Form */}
        <div className="bg-[#1a0912]/75 border border-[#3b131c] rounded-2xl p-5 sm:p-6 shadow-xl max-w-md mx-auto text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-[#fda4af] uppercase tracking-wider mb-2">
            <Key className="w-3.5 h-3.5" />
            <span>Did I give you a secret whisper?</span>
          </div>
          <p className="text-xs text-[#d1a3ac] font-serif mb-4 leading-relaxed">
            If I gave you our secret passcode to sneak in early, enter it here:
          </p>
          <form onSubmit={handlePasscodeSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter 'september29' to enter..."
                className="flex-1 bg-[#12050b] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#8a6870] focus:outline-none font-sans"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:brightness-110 text-white font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0"
              >
                <span>Open Early</span>
              </button>
            </div>
            {errorMsg && (
              <div className="text-xs text-[#fca5a5] bg-[#450a0a]/60 border border-[#7f1d1d] rounded-xl p-3 font-serif">
                {errorMsg}
              </div>
            )}
          </form>

          {/* Direct Instant Access & Password Reminder */}
          <div className="mt-4 pt-3 border-t border-[#3b131c]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#fda4af] font-mono text-[11px]">
              Secret Whisper: <strong className="text-white bg-[#e11d48]/25 px-2 py-0.5 rounded border border-[#e11d48]/40">{secretPasscode || 'september29'}</strong>
            </span>
            
            <button
              type="button"
              onClick={() => {
                confetti({
                  particleCount: 90,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ['#e11d48', '#fda4af', '#fbbf24', '#ffffff'],
                });
                onUnlockEarly(false);
              }}
              className="text-[#fda4af] hover:text-white font-serif text-xs flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-[#2a0e1a] hover:bg-[#3d1326] border border-[#e11d48]/40 transition-all hover:scale-105 cursor-pointer shadow-md"
              title="Enter your sanctuary"
            >
              <Heart className="w-3.5 h-3.5 fill-[#e11d48]" />
              <span>Enter Sanctuary</span>
            </button>
          </div>
        </div>

        {/* Pure Romantic Dedication Footer */}
        <div className="mt-10 flex flex-col items-center justify-center gap-1.5 text-xs text-[#8a6870]">
          <span className="font-serif italic flex items-center gap-1.5 text-sm text-[#fda4af]">
            Forever and always yours, {hisName} <Heart className="w-3.5 h-3.5 fill-[#e11d48] text-[#e11d48]" /> For {herName}
          </span>
          <span className="text-[11px] font-mono text-[#8a6870]/70">
            Engineered with Devotion for {herName}
          </span>
        </div>

        {/* Download Standalone Website Bundle for Netlify Drop / Vercel */}
        <div className="mt-8 pt-6 border-t border-[#3b131c]/50 flex flex-col items-center justify-center">
          <a
            href="/api/download-bundle"
            download="sanctuary-for-aline-web.zip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c0812] hover:bg-[#2e0d1e] border border-[#e11d48]/40 hover:border-[#e11d48] text-[#fda4af] hover:text-white text-xs font-mono transition-all hover:scale-105 shadow-md group cursor-pointer"
            title="Download pre-built standalone ZIP folder to drag-and-drop into Netlify Drop or Vercel"
          >
            <Download className="w-4 h-4 text-[#fb7185] group-hover:animate-bounce" />
            <span>Download Website Bundle (.zip for Drag & Drop)</span>
          </a>
          
          <button
            type="button"
            onClick={() => setShowDeployGuide(!showDeployGuide)}
            className="mt-2.5 text-[11px] text-[#fb7185] hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showDeployGuide ? "Hide 30-Second Drag & Drop Guide" : "How to drag & drop on Netlify or Vercel (30s live link)"}</span>
            {showDeployGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDeployGuide && (
            <div className="mt-4 p-4 rounded-xl bg-[#14060d]/90 border border-[#e11d48]/30 max-w-md text-left text-xs font-sans text-[#fecdd3] space-y-3 animate-fadeIn">
              <div className="font-mono text-[#fda4af] text-[11px] uppercase tracking-wider font-semibold border-b border-[#3b131c] pb-1.5 flex items-center justify-between">
                <span>Quick Deployment Steps (Instant Public URL)</span>
                <span className="text-[#34d399] font-normal text-[10px]">100% Free & No Setup</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-[#e2cfd4] text-[12px] leading-relaxed">
                <li>
                  <strong className="text-white">Click the button above</strong> to download <code className="bg-[#240a17] px-1 py-0.5 rounded text-[#fda4af]">sanctuary-for-aline-web.zip</code>.
                </li>
                <li>
                  <strong className="text-white">Unzip the archive</strong> on your computer or phone to reveal the folder containing <code className="bg-[#240a17] px-1 py-0.5 rounded text-[#fda4af]">index.html</code>, <code className="bg-[#240a17] px-1 py-0.5 rounded text-[#fda4af]">assets/</code>, and <code className="bg-[#240a17] px-1 py-0.5 rounded text-[#fda4af]">_redirects</code>.
                </li>
                <li>
                  <strong className="text-white">Drop into Netlify Drop:</strong> Open{' '}
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#38bdf8] underline hover:text-[#7dd3fc] inline-flex items-center gap-0.5"
                  >
                    app.netlify.com/drop <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and drag the unzipped folder into the box. In ~10 seconds, it will generate a permanent public link!
                </li>
                <li>
                  <strong className="text-white">Or drop into Vercel:</strong> If you use Vercel, visit{' '}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#38bdf8] underline hover:text-[#7dd3fc] inline-flex items-center gap-0.5"
                  >
                    vercel.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  to deploy the folder with pre-configured <code className="bg-[#240a17] px-1 py-0.5 rounded text-[#fda4af]">vercel.json</code>.
                </li>
                <li>
                  <strong className="text-white">Share with Aline:</strong> Send her the new URL and tell her to enter the passcode <span className="font-mono text-[#fda4af] font-bold">september29</span>!
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
