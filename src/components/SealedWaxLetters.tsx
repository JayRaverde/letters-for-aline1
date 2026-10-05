import React, { useState } from 'react';
import { SealedLetter } from '../types';
import {
  Mail,
  Lock,
  Unlock,
  Heart,
  Sparkles,
  X,
  Key,
  Plus,
  Edit3,
  Trash2,
  Check,
  Camera,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SealedWaxLettersProps {
  letters: SealedLetter[];
  onOpenLetter: (id: string) => void;
  onAddLetter?: (letter: SealedLetter) => void;
  onUpdateLetter?: (letter: SealedLetter) => void;
  onDeleteLetter?: (id: string) => void;
  herName: string;
  hisName: string;
  secretPasscode?: string;
  isCreatorMode?: boolean;
}

export const SealedWaxLetters: React.FC<SealedWaxLettersProps> = ({
  letters,
  onOpenLetter,
  onAddLetter,
  onUpdateLetter,
  onDeleteLetter,
  herName,
  hisName,
  secretPasscode = 'september29',
  isCreatorMode = false,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<SealedLetter | null>(null);
  const [overrideUnlock, setOverrideUnlock] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Creator Modal State (for creating or editing wax letters)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);

  const [formPrompt, setFormPrompt] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formWaxColor, setFormWaxColor] = useState<SealedLetter['waxColor']>('rose');
  const [formSignature, setFormSignature] = useState('');
  const [formPostscript, setFormPostscript] = useState('');
  const [formIsAnniversary, setFormIsAnniversary] = useState(false);
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formPhotoCaption, setFormPhotoCaption] = useState('');

  const handleEnvelopeClick = (letter: SealedLetter) => {
    // In Creator Mode, Jazz can always open any envelope directly to test/read
    if (isCreatorMode) {
      onOpenLetter(letter.id);
      setSelectedLetter({ ...letter, opened: true });
      return;
    }

    const today = new Date();
    // September 29th, 2026 or any date after is the celebrated anniversary
    const anniversaryTimestamp = new Date('2026-09-29T00:00:00').getTime();
    const isAnniversaryOrPast = today.getTime() >= anniversaryTimestamp;

    if (letter.isAnniversaryLetter && !isAnniversaryOrPast && !overrideUnlock && !letter.opened) {
      // Show password lock dialog
      setSelectedLetter(letter);
      setEnteredPasscode('');
      setPasscodeError(null);
      return;
    }

    onOpenLetter(letter.id);
    setSelectedLetter({ ...letter, opened: true });

    if (letter.isAnniversaryLetter) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fda4af', '#ffffff'],
      });
    }
  };

  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInput = enteredPasscode.trim().toLowerCase();
    const expected = (secretPasscode || 'september29').trim().toLowerCase();
    const validCodes = [
      expected,
      'september29',
      'september 29',
      '29',
      'jazz',
      'aline',
      'forever',
      'love',
    ];

    if (validCodes.includes(normalizedInput)) {
      setPasscodeError(null);
      setOverrideUnlock(true);
      if (selectedLetter) {
        onOpenLetter(selectedLetter.id);
        setSelectedLetter({ ...selectedLetter, opened: true });
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#e11d48', '#fda4af', '#f43f5e', '#ffffff'],
        });
      }
    } else {
      setPasscodeError("That key didn't turn the lock. Message Jazz to ask for the secret passcode!");
    }
  };

  const openCreateModal = () => {
    setEditingLetterId(null);
    setFormPrompt('Open when you miss my arms...');
    setFormTitle('Under the Very Same Stars');
    setFormContent(`Dear ${herName},\n\nEvery moment between us is etched into my heart. Even across the miles, close your eyes and remember how safe you are with me.\n\nI love you always.`);
    setFormWaxColor('rose');
    setFormSignature(`Forever yours, ${hisName}`);
    setFormPostscript('P.S. Hold the heartbeat button whenever you need to feel me.');
    setFormIsAnniversary(false);
    setFormPhotoUrl('');
    setFormPhotoCaption('');
    setIsEditModalOpen(true);
  };

  const openEditModal = (letter: SealedLetter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLetterId(letter.id);
    setFormPrompt(letter.prompt);
    setFormTitle(letter.title);
    const hasEmptyElements = letter.content.some((p) => p.trim() === '');
    setFormContent(hasEmptyElements ? letter.content.join('\n') : letter.content.join('\n\n'));
    setFormWaxColor(letter.waxColor);
    setFormSignature(letter.signature);
    setFormPostscript(letter.postScript || '');
    setFormIsAnniversary(Boolean(letter.isAnniversaryLetter));
    setFormPhotoUrl(letter.photoUrl || '');
    setFormPhotoCaption(letter.cameraCaption || '');
    setIsEditModalOpen(true);
  };

  const handleDeleteLetter = (letterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (letters.length <= 1) {
      setDeleteWarning('Please keep at least one love letter in the sanctuary archive.');
      setTimeout(() => setDeleteWarning(null), 3500);
      return;
    }
    setDeleteConfirmId(letterId);
  };

  const confirmDeleteLetter = () => {
    if (deleteConfirmId && onDeleteLetter) {
      onDeleteLetter(deleteConfirmId);
      if (selectedLetter?.id === deleteConfirmId) {
        setSelectedLetter(null);
      }
    }
    setDeleteConfirmId(null);
  };

  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    // Split by newlines without deleting blank lines, so spaces and line breaks work
    const parsedParagraphs = formContent.split('\n');

    if (editingLetterId) {
      // Update existing
      const updated: SealedLetter = {
        id: editingLetterId,
        prompt: formPrompt.trim() || 'A whisper for Aline',
        title: formTitle.trim(),
        content: parsedParagraphs.length > 0 ? parsedParagraphs : [formContent.trim()],
        waxColor: formWaxColor,
        signature: formSignature.trim() || `With all my love, ${hisName}`,
        postScript: formPostscript.trim() || undefined,
        isAnniversaryLetter: formIsAnniversary,
        photoUrl: formPhotoUrl.trim() || undefined,
        cameraCaption: formPhotoCaption.trim() || undefined,
        opened: true,
      };
      if (onUpdateLetter) onUpdateLetter(updated);
      if (selectedLetter?.id === editingLetterId) {
        setSelectedLetter(updated);
      }
    } else {
      // Create new
      const newLetter: SealedLetter = {
        id: `wax-${Date.now()}`,
        prompt: formPrompt.trim() || 'A whisper for Aline',
        title: formTitle.trim(),
        content: parsedParagraphs.length > 0 ? parsedParagraphs : [formContent.trim()],
        waxColor: formWaxColor,
        signature: formSignature.trim() || `With all my love, ${hisName}`,
        postScript: formPostscript.trim() || undefined,
        isAnniversaryLetter: formIsAnniversary,
        photoUrl: formPhotoUrl.trim() || undefined,
        cameraCaption: formPhotoCaption.trim() || undefined,
        opened: false,
      };
      if (onAddLetter) onAddLetter(newLetter);
    }
    setIsEditModalOpen(false);
  };

  const getWaxSealStyle = (color: SealedLetter['waxColor']) => {
    switch (color) {
      case 'rose':
        return {
          bg: 'bg-gradient-to-br from-[#d95874] to-[#8a2238]',
          border: 'border-[#f794a8]/50',
          shadow: 'shadow-[0_0_20px_rgba(217,88,116,0.4)]',
          text: 'text-[#ffe5eb]',
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-[#e5be7a] to-[#9c752c]',
          border: 'border-[#f9e2b2]/50',
          shadow: 'shadow-[0_0_20px_rgba(229,190,122,0.4)]',
          text: 'text-[#fff7e6]',
        };
      case 'sapphire':
        return {
          bg: 'bg-gradient-to-br from-[#4f83cc] to-[#1f3f73]',
          border: 'border-[#adc4e2]/50',
          shadow: 'shadow-[0_0_20px_rgba(79,131,204,0.4)]',
          text: 'text-[#eef5fc]',
        };
      case 'emerald':
        return {
          bg: 'bg-gradient-to-br from-[#389e6e] to-[#165437]',
          border: 'border-[#85e3b3]/50',
          shadow: 'shadow-[0_0_20px_rgba(56,158,110,0.4)]',
          text: 'text-[#eafff4]',
        };
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-10 px-4">
      <div className="bg-[#16080e]/85 backdrop-blur-xl border border-[#3b131c] rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Section Header */}
        <div className="border-b border-[#3b131c] pb-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#f87171] uppercase mb-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>SEALED WITH WAX | FOR MY ALINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#fdf2f4] tracking-wide">
              "Open When..." Letters
            </h2>
            <p className="text-sm text-[#d1a3ac] font-serif italic mt-1">
              Whenever you miss me, feel far away, or need a reminder of how loved you are, break the wax seal.
            </p>
          </div>
          {/* Creator Mode Button */}
          {isCreatorMode && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white hover:opacity-90 text-xs font-serif font-bold transition-opacity cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pen New Wax Letter</span>
            </button>
          )}
        </div>

        {/* Envelopes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {letters.map((letter) => {
            const wax = getWaxSealStyle(letter.waxColor);
            const isAnniversaryPassed = new Date().getTime() >= new Date('2026-09-29T00:00:00').getTime();
            const isLocked = !isCreatorMode && letter.isAnniversaryLetter && !isAnniversaryPassed && !letter.opened && !overrideUnlock;

            return (
              <div
                key={letter.id}
                onClick={() => handleEnvelopeClick(letter)}
                className="group relative bg-[#1f0b14] hover:bg-[#280e1a] border border-[#3b131c] hover:border-[#e11d48]/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-xl overflow-hidden text-left"
              >
                {/* Envelope Flap visual accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e11d48]/40 to-transparent" />
                {/* Creator Edit/Delete Badges on Card */}
                {isCreatorMode && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                    <button
                      onClick={(e) => openEditModal(letter, e)}
                      className="p-1.5 rounded-lg bg-[#14060d] border border-[#3b131c] text-[#fda4af] hover:text-white hover:border-[#e11d48] transition-colors"
                      title="Edit this wax letter"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteLetter(letter.id, e)}
                      className="p-1.5 rounded-lg bg-[#14060d] border border-[#3b131c] text-[#8a6870] hover:text-[#e11d48] hover:border-[#e11d48] transition-colors"
                      title="Delete this wax letter"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Occasion / Prompt Badge */}
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-[#14060d] border border-[#3b131c] text-[#fda4af] max-w-[70%] truncate">
                    "{letter.prompt}"
                  </span>
                  {/* Wax Seal Medallion */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110 shrink-0 ${wax.bg} ${wax.border} ${wax.shadow}`}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-white animate-pulse" />
                    ) : letter.opened ? (
                      <Unlock className={`w-5 h-5 ${wax.text}`} />
                    ) : (
                      <Heart className={`w-5 h-5 ${wax.text} fill-current`} />
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif text-[#fdf2f4] group-hover:text-white transition-colors mb-2">
                  {letter.title}
                </h3>

                {/* Status Indicator */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#3b131c]/60 text-xs font-sans">
                  <span className="text-[#8a6870]">
                    {isLocked
                      ? 'Locked until September 29'
                      : letter.opened
                        ? 'Wax seal broken | Read anytime'
                        : 'Unopened | Sealed with wax'}
                  </span>
                  <span className="text-[#e11d48] group-hover:translate-x-1 transition-transform font-serif italic flex items-center gap-1">
                    {letter.opened ? 'Read again' : 'Break seal'} &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reading Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#14060d] border border-[#3b131c] rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            {/* Close Button */}
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-5 right-5 text-[#8a6870] hover:text-[#fdf2f4] p-1.5 rounded-full hover:bg-[#200b14] transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Creator Edit Button inside Reader */}
            {isCreatorMode && (
              <button
                onClick={() => openEditModal(selectedLetter)}
                className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#200b14] text-[#fda4af] hover:text-white border border-[#3b131c] text-xs font-serif cursor-pointer transition-colors z-10"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Letter Content</span>
              </button>
            )}

            {/* Password Prompt Screen for Anniversary Letter */}
            {!isCreatorMode && selectedLetter.isAnniversaryLetter && (new Date().getTime() < new Date('2026-09-29T00:00:00').getTime()) && !overrideUnlock && !selectedLetter.opened ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#e11d48]/15 border border-[#e11d48] text-[#e11d48] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(225,29,72,0.3)]">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>
                <span className="text-xs font-mono tracking-widest text-[#f87171] uppercase block mb-1">
                  SEALED UNTIL SEPTEMBER 29TH
                </span>
                <h3 className="text-2xl font-serif text-[#fdf2f4] mb-3">
                  {selectedLetter.title}
                </h3>
                <p className="text-sm font-serif italic text-[#d1a3ac] max-w-md mx-auto mb-6">
                  "This letter holds the deepest words for our anniversary. It is sealed until September 29th, or until Jazz whispers the secret passcode to you."
                </p>
                <form onSubmit={handlePasscodeUnlock} className="max-w-sm mx-auto space-y-3 mb-4">
                  <input
                    type="text"
                    value={enteredPasscode}
                    onChange={(e) => setEnteredPasscode(e.target.value)}
                    placeholder="Enter secret passcode..."
                    className="w-full bg-[#1a0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-4 py-2.5 text-sm text-[#fdf2f4] placeholder-[#8a6870] focus:outline-none text-center font-mono"
                  />
                  {passcodeError && (
                    <p className="text-xs text-[#fca5a5] font-sans">{passcodeError}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-serif font-bold text-xs hover:brightness-110 shadow-lg shadow-[#e11d48]/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Break Wax Seal With Passcode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLetter(null)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#200b14] text-[#d1a3ac] hover:text-[#fdf2f4] text-xs font-serif cursor-pointer border border-[#3b131c] transition-colors"
                    >
                      I Will Wait
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                {/* Letter Header */}
                <div className="border-b border-[#3b131c] pb-4 mb-6 text-center mt-4">
                  <span className="text-[10px] font-mono tracking-widest text-[#fda4af] uppercase block mb-1">
                    "{selectedLetter.prompt}"
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif text-[#fdf2f4] tracking-wide">
                    {selectedLetter.title}
                  </h3>
                </div>

                {/* Letter Body Parchment with Lined Paper & Red Margin */}
                <div className="relative ruled-paper-warm text-[#1e1719] rounded-2xl p-6 sm:p-8 border border-[#dcd0bf] shadow-inner overflow-hidden my-4">
                  {/* Red Margin Line */}
                  <div className="absolute top-0 bottom-0 left-8 sm:left-10 w-[1.5px] bg-[#e11d48]/35 pointer-events-none" />
                  <div className="pl-6 sm:pl-8 space-y-2 font-serif text-base sm:text-lg max-w-xl mx-auto">
                    {selectedLetter.content.map((paragraph, pIdx) => {
                      if (!paragraph.trim()) {
                        return (
                          <div
                            key={pIdx}
                            className="w-full min-h-[36px] border-b border-[#e4d7c5]/70 flex items-end pb-1 select-none"
                          >
                            <span className="opacity-0">.</span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={pIdx}
                          className="w-full min-h-[36px] border-b border-[#e4d7c5]/70 py-2 flex items-end"
                        >
                          <p className="w-full font-serif font-normal text-[#1e1719] text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-wrap break-words">
                            {paragraph}
                          </p>
                        </div>
                      );
                    })}
                    {/* Trailing blank ruled line */}
                    <div className="w-full min-h-[36px] border-b border-[#e4d7c5]/70" />
                  </div>

                  {/* Signature on paper */}
                  <div className="mt-6 pt-4 border-t border-[#e11d48]/20 pl-6 sm:pl-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-2xl sm:text-3xl font-script text-[#851b27]">
                      {selectedLetter.signature}
                    </span>
                    {selectedLetter.postScript && (
                      <p className="text-xs font-serif italic text-[#61544a] max-w-xs text-center sm:text-right">
                        {selectedLetter.postScript}
                      </p>
                    )}
                  </div>

                  {/* Tucked Camera Snapshot / Draft Photo */}
                  {selectedLetter.photoUrl && (
                    <div className="mt-6 pt-6 border-t border-[#e11d48]/20 pl-6 sm:pl-8">
                      <div className="max-w-xs mx-auto bg-[#fffdfa] p-3 pb-4 rounded-xl shadow-xl border border-[#e2d5c5] transform -rotate-1 hover:rotate-0 transition-transform">
                        <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-black/5">
                          <img
                            src={selectedLetter.photoUrl}
                            alt="Camera draft"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-mono flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>Snapshot</span>
                          </div>
                        </div>
                        {selectedLetter.cameraCaption && (
                          <p className="mt-2 text-xs font-serif italic text-[#5a484f] text-center">
                            "{selectedLetter.cameraCaption}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="px-6 py-2 rounded-full bg-[#200b14] text-[#fda4af] border border-[#3b131c] hover:bg-[#2e101d] text-xs font-serif cursor-pointer transition-colors"
                  >
                    Fold Letter & Return to Archive
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Warning Toast */}
      {deleteWarning && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#450a0a] border border-[#7f1d1d] text-[#fecdd3] px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-serif flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
          <span>{deleteWarning}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#16080e] border border-[#3b131c] rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#e11d48]/15 border border-[#e11d48]/40 text-[#fda4af] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#e11d48]" />
            </div>
            <h4 className="text-lg font-serif text-white mb-2">Delete Wax Letter?</h4>
            <p className="text-xs text-[#d1a3ac] font-serif leading-relaxed mb-5">
              Are you sure you want to remove this sealed letter from the sanctuary archive? This cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#200b14] text-[#d1a3ac] hover:text-white border border-[#3b131c] text-xs font-serif cursor-pointer"
              >
                Keep Letter
              </button>
              <button
                onClick={confirmDeleteLetter}
                className="px-4 py-2 rounded-xl bg-[#e11d48] text-white hover:bg-[#be123c] font-serif font-bold text-xs cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#14060d] border border-[#3b131c] rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-[#8a6870] hover:text-[#fdf2f4] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#fda4af] uppercase tracking-wider mb-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editingLetterId ? 'Edit Wax Letter' : 'Pen New Wax Letter'}</span>
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">
              {editingLetterId ? 'Refine Your Letter' : `Write to ${herName}`}
            </h3>
            <form onSubmit={handleSaveLetter} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                  Occasion / "Open When..." Prompt
                </label>
                <input
                  type="text"
                  required
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  placeholder="e.g. Open when you miss my arms, Open on Sept 29..."
                  className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                  Letter Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Under the Very Same Stars..."
                  className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                  Letter Content (Separate paragraphs with an empty line)
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder={`Write the words meant just for ${herName}. Paragraph breaks, line spaces, and indents are fully preserved...`}
                  className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl p-3.5 text-sm text-white font-serif leading-relaxed whitespace-pre-wrap focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                    Wax Seal Color
                  </label>
                  <select
                    value={formWaxColor}
                    onChange={(e) => setFormWaxColor(e.target.value as SealedLetter['waxColor'])}
                    className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="rose">Rose Red</option>
                    <option value="gold">Warm Gold</option>
                    <option value="sapphire">Sapphire Blue</option>
                    <option value="emerald">Emerald Green</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                    Signature
                  </label>
                  <input
                    type="text"
                    value={formSignature}
                    onChange={(e) => setFormSignature(e.target.value)}
                    placeholder={`Forever yours, ${hisName}`}
                    className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                  Postscript (Optional P.S.)
                </label>
                <input
                  type="text"
                  value={formPostscript}
                  onChange={(e) => setFormPostscript(e.target.value)}
                  placeholder="e.g. P.S. I am thinking of you right now..."
                  className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              {/* Camera Snapshot / Draft Photo */}
              <div className="bg-[#1c0812] border border-[#3b131c] rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#fda4af] uppercase">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera Snapshot or Draft Photo (Optional)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    placeholder="Paste image URL or choose file below..."
                    className="flex-1 bg-[#12050b] border border-[#3b131c] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <label className="px-3 py-1.5 rounded-xl bg-[#200b14] border border-[#3b131c] hover:border-[#e11d48] text-xs text-[#fda4af] font-mono cursor-pointer shrink-0">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setFormPhotoUrl(String(ev.target.result));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {formPhotoUrl && (
                  <input
                    type="text"
                    value={formPhotoCaption}
                    onChange={(e) => setFormPhotoCaption(e.target.value)}
                    placeholder="Add a caption (e.g. Taken with my camera at 1:14 AM)"
                    className="w-full bg-[#12050b] border border-[#3b131c] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anniversary-lock-chk"
                  checked={formIsAnniversary}
                  onChange={(e) => setFormIsAnniversary(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e11d48] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="anniversary-lock-chk" className="text-xs text-[#d1a3ac] cursor-pointer">
                  Lock this letter until September 29th (requires passcode to open early)
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#3b131c]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-serif text-[#8a6870] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-serif font-bold text-xs hover:brightness-110 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingLetterId ? 'Save Letter' : 'Seal Letter Into Archive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
