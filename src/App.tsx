import { useState, useEffect } from 'react';
import {
  AnniversaryConfig,
  BucketListItem,
  Poem,
  SealedLetter,
  ConstellationStar,
} from './types';
import {
  initialConfig,
  initialBucketList,
  initialPoems,
  initialSealedLetters,
  initialConstellations,
} from './data/anniversaryData';
import { StarryCanvas } from './components/StarryCanvas';
import { CelestialCountdown } from './components/CelestialCountdown';
import { MeetingBucketList } from './components/MeetingBucketList';
import { InteractivePoetryParchment } from './components/InteractivePoetryParchment';
import { SealedWaxLetters } from './components/SealedWaxLetters';
import { LiveLettersDesk } from './components/LiveLettersDesk';
import { TactileHeartbeat } from './components/TactileHeartbeat';
import { ConstellationModal } from './components/ConstellationModal';
import { AnniversaryTimeLockScreen } from './components/AnniversaryTimeLockScreen';
import {
  Heart,
  Clock,
  Film,
  Feather,
  Mail,
  Send,
  Sparkles,
  Star,
} from 'lucide-react';

const STORAGE_KEY = 'meridian_sanctuary_v1';
const UNLOCK_TIME = '2026-10-05T22:00:00';

export default function App() {
  // Application State - Locked in permanently for Aline
  const [config] = useState<AnniversaryConfig>(() => ({
    ...initialConfig,
    unlockDateTime: UNLOCK_TIME,
    isSealed: true,
  }));

  const [bucketList, setBucketList] = useState<BucketListItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_bucket_v2`);
      if (saved) {
        return JSON.parse(saved);
      }
      return initialBucketList;
    } catch {
      return initialBucketList;
    }
  });

  const [poems, setPoems] = useState<Poem[]>(() => {
    try {
      const savedV4 = localStorage.getItem(`${STORAGE_KEY}_poems_v4`);
      if (savedV4) {
        const parsed = JSON.parse(savedV4);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed;
        }
      }
      return initialPoems;
    } catch {
      return initialPoems;
    }
  });

  const [letters, setLetters] = useState<SealedLetter[]>(() => {
    try {
      const savedV2 = localStorage.getItem(`${STORAGE_KEY}_letters_v2`);
      if (savedV2) {
        return JSON.parse(savedV2);
      }
      return initialSealedLetters;
    } catch {
      return initialSealedLetters;
    }
  });

  const [constellations, setConstellations] = useState<ConstellationStar[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_stars`);
      return saved ? JSON.parse(saved) : initialConstellations;
    } catch {
      return initialConstellations;
    }
  });

  // Permanently in recipient mode for Aline (no creator mode, no switching)
  const isCreatorMode = false;

  // Track if current session has bypassed/unlocked the lock screen
  const [sessionUnlocked, setSessionUnlocked] = useState<boolean>(() => {
    try {
      if (localStorage.getItem(`${STORAGE_KEY}_unlocked_10pm`) === 'true') {
        return true;
      }
    } catch {}
    const target = new Date(UNLOCK_TIME).getTime();
    return Date.now() >= target;
  });

  const [selectedStar, setSelectedStar] = useState<ConstellationStar | null>(null);
  const [activeTab, setActiveTab] = useState<'countdown' | 'bucket' | 'poetry' | 'letters' | 'live-letters' | 'pulse'>('countdown');
  const [heartbeatPulseActive, setHeartbeatPulseActive] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_bucket_v2`, JSON.stringify(bucketList));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [bucketList]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_poems_v4`, JSON.stringify(poems));
      localStorage.setItem(`${STORAGE_KEY}_poems`, JSON.stringify(poems));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [poems]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_letters_v2`, JSON.stringify(letters));
      localStorage.setItem(`${STORAGE_KEY}_letters`, JSON.stringify(letters));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [letters]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_stars`, JSON.stringify(constellations));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [constellations]);

  // Handlers
  const handleSendHeartbeat = () => {
    setHeartbeatPulseActive(true);
    setTimeout(() => setHeartbeatPulseActive(false), 2200);
  };

  const handleUnlockEarly = () => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_unlocked_10pm`, 'true');
    } catch {}
    setSessionUnlocked(true);
  };

  const handleSelectStar = (star: ConstellationStar) => {
    setConstellations((prev) =>
      prev.map((s) => (s.id === star.id ? { ...s, discovered: true } : s))
    );
    setSelectedStar(star);
  };

  const handleUpdateStar = (updatedStar: ConstellationStar) => {
    setConstellations((prev) =>
      prev.map((s) => (s.id === updatedStar.id ? updatedStar : s))
    );
    setSelectedStar(updatedStar);
  };

  const handleToggleBucketComplete = (id: string) => {
    setBucketList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleToggleBucketPriority = (id: string) => {
    setBucketList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPriority: !item.isPriority } : item
      )
    );
  };

  const handleAddBucketItem = (newItem: Omit<BucketListItem, 'id' | 'dateAdded'>) => {
    const item: BucketListItem = {
      ...newItem,
      id: `b-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setBucketList((prev) => [item, ...prev]);
  };

  const handleDeleteBucketItem = (id: string) => {
    setBucketList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenLetter = (id: string) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opened: true } : l))
    );
  };

  const handleAddWaxLetter = (newLetter: SealedLetter) => {
    setLetters((prev) => [newLetter, ...prev]);
  };

  const handleUpdateWaxLetter = (updatedLetter: SealedLetter) => {
    setLetters((prev) =>
      prev.map((l) => (l.id === updatedLetter.id ? updatedLetter : l))
    );
  };

  const handleDeleteWaxLetter = (id: string) => {
    setLetters((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAddPoem = (newPoem: Poem) => {
    setPoems((prev) => [...prev, newPoem]);
  };

  const handleUpdatePoem = (updated: Poem) => {
    setPoems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const discoveredStarsCount = constellations.filter((s) => s.discovered).length;

  // Check if Time Lock Screen should be displayed (locked until Oct 5 at 22:00 unless unlocked early with passcode)
  const targetUnlockTime = new Date(UNLOCK_TIME).getTime();
  const isAppLocked = !sessionUnlocked && Date.now() < targetUnlockTime;

  if (isAppLocked) {
    return (
      <div className="min-h-screen bg-[#07090e] text-[#f4ede2] relative overflow-hidden font-sans">
        <StarryCanvas
          constellations={constellations}
          onSelectStar={() => {}}
          heartbeatPulseActive={false}
          themePalette={config.themePalette || 'soft-red'}
        />
        <AnniversaryTimeLockScreen
          unlockDateTime={UNLOCK_TIME}
          herName={config.herName}
          hisName={config.hisName}
          secretPasscode={config.secretPasscode || 'september29'}
          onUnlockEarly={handleUnlockEarly}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0307] text-[#fdf2f4] font-sans relative overflow-x-hidden selection:bg-[#e11d48]/30 selection:text-[#fff]">
      {/* Dynamic Starry Sky Background with clickable constellations */}
      <StarryCanvas
        constellations={constellations}
        onSelectStar={handleSelectStar}
        heartbeatPulseActive={heartbeatPulseActive}
        themePalette={config.themePalette || 'soft-red'}
      />

      {/* Screen-wide Heartbeat Pulse Notification Overlay */}
      {heartbeatPulseActive && (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center p-4 animate-fadeIn">
          {/* Subtle warm crimson screen flash */}
          <div className="absolute inset-0 bg-[#e11d48]/15 animate-pulse-glow pointer-events-none" />
          
          {/* Luminous Heartbeat Card */}
          <div className="relative bg-[#1a0610]/95 backdrop-blur-xl border border-[#fda4af]/60 px-7 py-3.5 rounded-full shadow-[0_0_50px_rgba(225,29,72,0.7)] flex items-center gap-3 animate-float pointer-events-none">
            <Heart className="w-6 h-6 fill-[#e11d48] text-[#fda4af] animate-heart-throb drop-shadow-[0_0_10px_#e11d48]" />
            <div className="text-center">
              <span className="text-white font-serif font-bold text-sm tracking-wide block">
                Heartbeat Pulse Sent to Aline
              </span>
              <span className="text-[10px] font-mono text-[#fda4af] uppercase tracking-wider">
                I Love You Across Every Mile
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-[#fbbf24] animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>
      )}

      {/* Top Ambient Navigation & Dedication Bar */}
      <header className="relative z-20 border-b border-[#3b131c]/80 bg-[#12040a]/85 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand & Dedication */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e11d48]/15 border border-[#e11d48]/35 flex items-center justify-center text-[#fda4af]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-serif font-bold text-[#fdf2f4] tracking-wide">
                  Dedicated to Aline
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#e11d48]/15 border border-[#e11d48]/30 text-[#fda4af]">
                  SEPTEMBER 29TH
                </span>
              </div>
              <p className="text-[11px] text-[#d1a3ac] font-sans">
                Engineered with devotion by <span className="text-[#fecdd3] font-medium">{config.hisName}</span> For <span className="text-[#fda4af] font-medium">{config.herName}</span>
              </p>
            </div>
          </div>

          {/* Right Header Controls: Purely for Aline */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Constellation memories found indicator */}
            <div
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#200b14] border border-[#3b131c] text-xs font-mono text-[#fda4af]"
              title="Click glowing stars in the night sky to uncover secret memories"
            >
              <Star className="w-3.5 h-3.5 fill-[#e11d48] text-[#e11d48]" />
              <span>{discoveredStarsCount}/{constellations.length} Memories Found</span>
            </div>
            {/* Quick Pulse Heart icon */}
            <button
              onClick={handleSendHeartbeat}
              className="p-2 rounded-full bg-[#3b101c] border border-[#e11d48]/40 text-[#fda4af] hover:scale-110 transition-transform cursor-pointer"
              title="Send a quick heartbeat pulse across the sky"
            >
              <Heart className="w-4 h-4 fill-[#e11d48]" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2 no-scrollbar border-t border-[#3b131c]/40">
          {[
            { id: 'countdown', label: 'September 29', icon: Clock },
            { id: 'live-letters', label: 'Letters to Aline', icon: Send, badge: 'Desk' },
            { id: 'letters', label: `Wax Letters (${letters.length})`, icon: Mail },
            { id: 'poetry', label: 'Verses for Aline', icon: Feather },
            { id: 'bucket', label: 'When We Meet', icon: Film },
            { id: 'pulse', label: 'I Love You', icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-bold shadow-[0_0_14px_rgba(225,29,72,0.35)]'
                    : 'bg-[#1c0812]/70 text-[#d1a3ac] hover:text-[#fdf2f4] border border-[#3b131c]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Sanctuary Tab Views */}
      <main className="relative z-10 pb-20">
        {activeTab === 'countdown' && (
          <div className="animate-fadeIn">
            <CelestialCountdown
              config={config}
              onSendHeartbeat={handleSendHeartbeat}
            />
          </div>
        )}
        {activeTab === 'live-letters' && (
          <div className="animate-fadeIn">
            <LiveLettersDesk
              herName={config.herName}
              hisName={config.hisName}
              isCreatorMode={isCreatorMode}
            />
          </div>
        )}
        {activeTab === 'letters' && (
          <div className="animate-fadeIn">
            <div className="max-w-4xl mx-auto px-4 mt-8 mb-4 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-[#fda4af]">
                DEVOTION IN PARCHMENT & WAX
              </span>
              <h2 className="text-3xl font-serif text-white tracking-wide mt-1">
                Sealed Letters for You
              </h2>
              <p className="text-xs text-[#d1a3ac] font-serif italic mt-1">
                {letters.length} wax-sealed envelopes waiting for the moments you need them most.
              </p>
            </div>
            <SealedWaxLetters
              letters={letters}
              onOpenLetter={handleOpenLetter}
              onAddLetter={handleAddWaxLetter}
              onUpdateLetter={handleUpdateWaxLetter}
              onDeleteLetter={handleDeleteWaxLetter}
              herName={config.herName}
              hisName={config.hisName}
              secretPasscode={config.secretPasscode}
              isCreatorMode={isCreatorMode}
            />
          </div>
        )}
        {activeTab === 'poetry' && (
          <div className="animate-fadeIn">
            <InteractivePoetryParchment
              poems={poems}
              onAddPoem={handleAddPoem}
              onUpdatePoem={handleUpdatePoem}
              herName={config.herName}
              hisName={config.hisName}
              isCreatorMode={isCreatorMode}
            />
          </div>
        )}
        {activeTab === 'bucket' && (
          <div className="animate-fadeIn">
            <MeetingBucketList
              items={bucketList}
              onToggleComplete={handleToggleBucketComplete}
              onTogglePriority={handleToggleBucketPriority}
              onAddItem={handleAddBucketItem}
              onDeleteItem={handleDeleteBucketItem}
              herName={config.herName}
              hisName={config.hisName}
              isCreatorMode={isCreatorMode}
            />
          </div>
        )}
        {activeTab === 'pulse' && (
          <div className="animate-fadeIn">
            <TactileHeartbeat
              config={config}
              onSendPulse={handleSendHeartbeat}
            />
          </div>
        )}
      </main>

      {/* Constellation Secret Memory Viewer Modal */}
      <ConstellationModal
        star={selectedStar}
        onClose={() => setSelectedStar(null)}
        onUpdateStar={handleUpdateStar}
        herName={config.herName}
        isCreatorMode={isCreatorMode}
      />
    </div>
  );
}
