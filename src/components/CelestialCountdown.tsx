import React, { useState, useEffect } from 'react';
import { AnniversaryConfig } from '../types';
import { Sparkles, Moon, Sun, Clock, Compass, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CelestialCountdownProps {
  config: AnniversaryConfig;
  onSendHeartbeat: () => void;
}

export const CelestialCountdown: React.FC<CelestialCountdownProps> = ({
  config,
  onSendHeartbeat,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isAnniversaryDay: false,
  });

  const [currentTimeHer, setCurrentTimeHer] = useState('');
  const [currentTimeHis, setCurrentTimeHis] = useState('');
  const [pulseSentToast, setPulseSentToast] = useState(false);

  const handlePulseClick = () => {
    onSendHeartbeat();
    setPulseSentToast(true);
    setTimeout(() => setPulseSentToast(false), 2500);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.35 },
      colors: ['#e11d48', '#fda4af', '#ffffff'],
    });
  };

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      // Dual Timezones
      const herDate = new Date(now.getTime() + config.herTimezoneOffsetHours * 3600 * 1000);
      const hisDate = new Date(now.getTime() + config.hisTimezoneOffsetHours * 3600 * 1000);

      const timeFormat: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };

      setCurrentTimeHer(herDate.toLocaleTimeString([], timeFormat));
      setCurrentTimeHis(hisDate.toLocaleTimeString([], timeFormat));

      // Countdown to September 29th
      const currentYear = now.getFullYear();
      let targetAnniversary = new Date(currentYear, 8, 29, 0, 0, 0); // Month is 0-indexed: 8 = September
      const diffFromTarget = targetAnniversary.getTime() - now.getTime();

      const isToday = now.getMonth() === 8 && now.getDate() === 29;

      if (isToday) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isAnniversaryDay: true,
        });
        return;
      }

      if (diffFromTarget < 0) {
        targetAnniversary = new Date(currentYear + 1, 8, 29, 0, 0, 0);
      }

      const totalDiff = targetAnniversary.getTime() - now.getTime();
      const days = Math.floor(totalDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((totalDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((totalDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((totalDiff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isAnniversaryDay: false,
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [config]);

  const triggerAnniversaryCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e5be7a', '#d95874', '#ffffff', '#adc4e2'],
    });
    onSendHeartbeat();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 px-4">
      {/* Golden Aura backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#e5be7a]/5 via-[#d95874]/5 to-[#adc4e2]/5 rounded-3xl blur-2xl pointer-events-none" />
      <div className="relative bg-[#0d121c]/80 backdrop-blur-xl border border-[#222d42] rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Top Header Dedicated to Her */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#222d42]/70 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#fda4af] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>FOR MY SWEET ALINE | SEPTEMBER 29TH</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#f6f0e4] tracking-wide flex items-center gap-3">
              <span>Always You, {config.herName}</span>
              <span className="text-[#fda4af] text-lg italic font-serif">
                ("{config.herPetName}")
              </span>
            </h1>
            <p className="text-xs text-[#d1a3ac] font-serif italic mt-1">
              Every word, second, and memory here is from my heart to yours.
            </p>
          </div>
          {/* Special date badge */}
          <div className="flex items-center gap-3 bg-[#141b29] border border-[#e5be7a]/30 rounded-full px-4 py-2 text-xs text-[#e5be7a]">
            <Compass className="w-4 h-4 text-[#e5be7a] animate-spin" style={{ animationDuration: '24s' }} />
            <span className="font-serif tracking-wider font-semibold">ANNIVERSARY: SEP 29</span>
          </div>
        </div>

        {/* Dual Horizon Bar */}
        <div className="bg-[#141b29]/80 rounded-2xl p-4 md:p-5 border border-[#222d42] mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Her Horizon */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#222d42]/60 border border-[#e5be7a]/30 flex items-center justify-center text-[#e5be7a] shadow-inner">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider text-[#fda4af] uppercase">
                  Your Sky ({config.herName})
                </p>
                <p className="text-xl md:text-2xl font-serif font-bold text-[#f6f0e4] tracking-wide">
                  {currentTimeHer || '--:--:--'}
                </p>
                <p className="text-[11px] text-[#e5be7a]/80 font-sans">{config.herCity}</p>
              </div>
            </div>

            {/* Pulsing Synchronous Bridge */}
            <div className="flex-1 flex flex-col items-center justify-center px-2 w-full sm:w-auto">
              <div className="flex items-center w-full max-w-[200px] justify-between relative">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#e5be7a]/20 via-[#e5243b]/60 to-[#adc4e2]/20" />
                <button
                  onClick={handlePulseClick}
                  className="mx-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#a81326] border border-[#ff667a] text-white hover:scale-110 active:scale-125 transition-transform duration-200 shadow-[0_0_15px_rgba(229,36,59,0.5)] flex items-center gap-1.5 cursor-pointer"
                  title="Send a warm heartbeat to Aline"
                >
                  <Heart className="w-3.5 h-3.5 fill-white animate-heart-throb" />
                  <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">Pulse</span>
                </button>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#adc4e2]/20 via-[#e5243b]/60 to-[#e5be7a]/20" />
              </div>
              <p className={`text-[11px] italic font-serif mt-1 tracking-wide transition-all ${pulseSentToast ? 'text-white font-bold animate-pulse' : 'text-[#ffb3bd]'}`}>
                {pulseSentToast ? "Pulse Sent to Aline across the miles!" : "I love you across the miles"}
              </p>
            </div>

            {/* His Horizon */}
            <div className="flex items-center gap-4 text-center sm:text-right flex-row-reverse sm:flex-row">
              <div>
                <p className="text-xs font-mono tracking-wider text-[#adc4e2] uppercase">
                  My Sky ({config.hisName})
                </p>
                <p className="text-xl md:text-2xl font-serif font-bold text-[#f6f0e4] tracking-wide">
                  {currentTimeHis || '--:--:--'}
                </p>
                <p className="text-[11px] text-[#adc4e2]/80 font-sans">{config.hisCity}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#222d42]/60 border border-[#adc4e2]/30 flex items-center justify-center text-[#adc4e2] shadow-inner">
                <Sun className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Countdown Grid to September 29 */}
        <div className="text-center">
          {timeLeft.isAnniversaryDay ? (
            <div className="py-6 px-4 bg-gradient-to-r from-[#e5be7a]/20 via-[#d95874]/20 to-[#e5be7a]/20 rounded-2xl border border-[#e5be7a] animate-pulse">
              <span className="text-3xl md:text-4xl font-serif text-[#f6f0e4] font-bold block mb-2">
                HAPPY ANNIVERSARY, ALINE
              </span>
              <p className="text-sm md:text-base text-[#e5be7a] font-serif italic max-w-xl mx-auto mb-4">
                Today the countdown stops and our love is celebrated. Another year of choosing each other across every ocean.
              </p>
              <button
                onClick={triggerAnniversaryCelebration}
                className="px-6 py-2.5 rounded-full bg-[#e5be7a] text-[#07090e] font-serif font-bold hover:bg-[#f9e2b2] transition-colors shadow-lg cursor-pointer"
              >
                Trigger Confetti & Heartbeats
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#9b9487] uppercase tracking-widest mb-4">
                <Clock className="w-3.5 h-3.5 text-[#e5be7a]" />
                <span>TIME REMAINING UNTIL SEPTEMBER 29TH</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
                <div className="bg-[#141b29] border border-[#222d42] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-4xl font-serif font-bold text-[#e5be7a]">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-[#9b9487] uppercase tracking-wider">
                    Days
                  </span>
                </div>
                <div className="bg-[#141b29] border border-[#222d42] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-4xl font-serif font-bold text-[#f6f0e4]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-[#9b9487] uppercase tracking-wider">
                    Hours
                  </span>
                </div>
                <div className="bg-[#141b29] border border-[#222d42] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-4xl font-serif font-bold text-[#f6f0e4]">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-[#9b9487] uppercase tracking-wider">
                    Mins
                  </span>
                </div>
                <div className="bg-[#141b29] border border-[#222d42] rounded-2xl p-3 sm:p-4 text-center">
                  <span className="block text-2xl sm:text-4xl font-serif font-bold text-[#d95874]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-[#9b9487] uppercase tracking-wider">
                    Secs
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#9b9487] italic font-serif mt-5 max-w-md mx-auto">
                "{config.sharedSongOrQuote}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
