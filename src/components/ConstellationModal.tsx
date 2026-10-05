import React, { useState, useEffect } from 'react';
import { ConstellationStar } from '../types';
import { Sparkles, X, Star, Edit3, Check } from 'lucide-react';

interface ConstellationModalProps {
  star: ConstellationStar | null;
  onClose: () => void;
  onUpdateStar?: (star: ConstellationStar) => void;
  herName: string;
  isCreatorMode?: boolean;
}

export const ConstellationModal: React.FC<ConstellationModalProps> = ({
  star,
  onClose,
  onUpdateStar,
  herName,
  isCreatorMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedMemory, setEditedMemory] = useState('');

  useEffect(() => {
    if (star) {
      setEditedName(star.name);
      setEditedMemory(star.secretMemory);
      setIsEditing(false);
    }
  }, [star]);

  if (!star) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim() || !editedMemory.trim()) return;

    if (onUpdateStar) {
      onUpdateStar({
        ...star,
        name: editedName.trim(),
        secretMemory: editedMemory.trim(),
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090e]/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d121c] border border-[#e5be7a]/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#9b9487] hover:text-[#f6f0e4] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Creator Edit Trigger */}
        {isCreatorMode && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141b29] border border-[#222d42] text-[#e5be7a] hover:text-white text-xs font-serif cursor-pointer transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Star</span>
          </button>
        )}

        {/* Star Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-[#e5be7a]/15 border border-[#e5be7a] text-[#e5be7a] flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(229,190,122,0.3)] animate-pulse">
          <Star className="w-8 h-8 fill-[#e5be7a]" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest text-[#e5be7a] uppercase mb-1">
          <Sparkles className="w-3 h-3" />
          <span>CELESTIAL MEMORY DISCOVERED</span>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-left my-4">
            <div>
              <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                Star Name
              </label>
              <input
                type="text"
                required
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-[#141b29] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1">
                Secret Memory / Whisper
              </label>
              <textarea
                required
                rows={4}
                value={editedMemory}
                onChange={(e) => setEditedMemory(e.target.value)}
                className="w-full bg-[#141b29] border border-[#222d42] rounded-xl p-3 text-sm text-[#f6f0e4] font-serif focus:outline-none focus:border-[#e5be7a] resize-none leading-relaxed whitespace-pre-wrap"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-serif text-[#9b9487] hover:text-[#f6f0e4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#e5be7a] text-[#07090e] font-serif font-bold text-xs hover:bg-[#f9e2b2] cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Star Memory</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="text-2xl font-serif text-[#f6f0e4] mb-3">
              {star.name}
            </h3>
            <div className="bg-[#141b29] border border-[#222d42] rounded-2xl p-5 my-4">
              <p className="text-sm sm:text-base font-serif italic text-[#f6f0e4] leading-relaxed whitespace-pre-wrap break-words">
                "{star.secretMemory}"
              </p>
            </div>
            <p className="text-xs text-[#9b9487] font-sans">
              Pinned forever in our shared night sky for {herName}.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 rounded-full bg-[#e5be7a] text-[#07090e] font-serif font-bold text-xs hover:bg-[#f9e2b2] transition-colors cursor-pointer"
            >
              Keep Stargazing
            </button>
          </>
        )}
      </div>
    </div>
  );
};
