import React, { useState } from 'react';
import { AnniversaryConfig } from '../types';
import { Settings, X, RotateCcw, Lock } from 'lucide-react';

interface AnniversarySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AnniversaryConfig;
  onSaveConfig: (newConfig: AnniversaryConfig) => void;
  onResetDefaults: () => void;
}

export const AnniversarySettingsModal: React.FC<AnniversarySettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<AnniversaryConfig>(config);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleSetSep29_11AM = () => {
    setFormData((prev) => ({
      ...prev,
      unlockDateTime: '2026-09-29T11:00:00',
      anniversaryDate: '2026-09-29T11:00:00',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090e]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d121c] border border-[#222d42] rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9b9487] hover:text-[#f6f0e4] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-[#e5be7a] tracking-widest uppercase mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>SANCTUARY PREFERENCES & AUTHOR CONTROLS</span>
        </div>
        <h3 className="text-2xl font-serif text-[#f6f0e4] mb-4">
          Personalize Our Sky
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names Section */}
          <div className="bg-[#141b29] border border-[#222d42] rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-mono text-[#e5be7a] uppercase tracking-wider block">
              Names & Identity
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                  Her Real Name
                </label>
                <input
                  type="text"
                  value={formData.herName}
                  onChange={(e) => setFormData({ ...formData, herName: e.target.value })}
                  className="w-full bg-[#0d121c] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                  Her Pet Name / Nickname
                </label>
                <input
                  type="text"
                  value={formData.herPetName}
                  onChange={(e) => setFormData({ ...formData, herPetName: e.target.value })}
                  className="w-full bg-[#0d121c] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                His Name
              </label>
              <input
                type="text"
                value={formData.hisName}
                onChange={(e) => setFormData({ ...formData, hisName: e.target.value })}
                className="w-full bg-[#0d121c] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
              />
            </div>
          </div>

          {/* Time Lock & Anniversary Schedule */}
          <div className="bg-[#180a13] border border-[#4c1d28] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#fda4af] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#e11d48]" />
                <span>Sanctuary Time Lock & Date</span>
              </span>
              <button
                type="button"
                onClick={handleSetSep29_11AM}
                className="text-[11px] font-mono text-[#fda4af] bg-[#e11d48]/20 hover:bg-[#e11d48]/30 px-2.5 py-1 rounded-lg border border-[#e11d48]/40 cursor-pointer transition-colors"
              >
                Set to Sep 29, 11:00 AM
              </button>
            </div>
            <div>
              <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                App Lock Target Date & Time (ISO format)
              </label>
              <input
                type="text"
                value={formData.unlockDateTime || '2026-09-29T11:00:00'}
                onChange={(e) => setFormData({ ...formData, unlockDateTime: e.target.value })}
                placeholder="2026-09-29T11:00:00"
                className="w-full bg-[#0d121c] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e11d48] font-mono"
              />
              <p className="text-[11px] text-[#8a6870] font-sans mt-1">
                The countdown on the lock screen will count down exactly to this moment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#fda4af] uppercase mb-1">
                  Aline's Early Passcode
                </label>
                <input
                  type="text"
                  value={formData.secretPasscode || 'september29'}
                  onChange={(e) => setFormData({ ...formData, secretPasscode: e.target.value })}
                  placeholder="e.g., september29"
                  className="w-full bg-[#0d121c] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e11d48]"
                />
                <span className="text-[10px] text-[#8a6870] block mt-0.5">
                  Unlocks early access for Aline.
                </span>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#fbbf24] uppercase mb-1">
                  Jazz's Creator Passcode
                </label>
                <input
                  type="text"
                  value={formData.creatorPasscode || 'jazz29'}
                  onChange={(e) => setFormData({ ...formData, creatorPasscode: e.target.value })}
                  placeholder="e.g., jazz29"
                  className="w-full bg-[#0d121c] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#fbbf24]"
                />
                <span className="text-[10px] text-[#8a6870] block mt-0.5">
                  Allows you to edit anytime.
                </span>
              </div>
            </div>
          </div>

          {/* Horizons & Distance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                Her Horizon / City
              </label>
              <input
                type="text"
                value={formData.herCity}
                onChange={(e) => setFormData({ ...formData, herCity: e.target.value })}
                className="w-full bg-[#141b29] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                His Horizon / City
              </label>
              <input
                type="text"
                value={formData.hisCity}
                onChange={(e) => setFormData({ ...formData, hisCity: e.target.value })}
                className="w-full bg-[#141b29] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
              Shared Motto / Dedication Quote
            </label>
            <textarea
              rows={2}
              value={formData.sharedSongOrQuote}
              onChange={(e) => setFormData({ ...formData, sharedSongOrQuote: e.target.value })}
              className="w-full bg-[#141b29] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a] resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#222d42]">
            <button
              type="button"
              onClick={() => {
                onResetDefaults();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-[#9b9487] hover:text-[#d95874] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-serif text-[#9b9487] hover:text-[#f6f0e4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#e5be7a] text-[#07090e] font-serif font-bold text-xs hover:bg-[#f9e2b2] cursor-pointer shadow-md"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
