import React, { useState } from 'react';
import { Poem, InteractiveWord } from '../types';
import {
  Feather,
  Plus,
  Edit3,
  X,
  Heart,
  Trash2,
  Moon,
  FileText,
} from 'lucide-react';

interface InteractivePoetryParchmentProps {
  poems: Poem[];
  onAddPoem: (poem: Poem) => void;
  onUpdatePoem: (poem: Poem) => void;
  onDeletePoem?: (id: string) => void;
  herName: string;
  hisName: string;
  isCreatorMode?: boolean;
}

export const InteractivePoetryParchment: React.FC<InteractivePoetryParchmentProps> = ({
  poems,
  onAddPoem,
  onUpdatePoem,
  onDeletePoem,
  herName,
  hisName,
  isCreatorMode = false,
}) => {
  const [activePoemIndex, setActivePoemIndex] = useState(0);
  const [activeWhisper, setActiveWhisper] = useState<InteractiveWord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPoemId, setEditingPoemId] = useState<string | null>(null);

  // Paper style toggle: lined notebook paper vs dark starlight
  const [paperTheme, setPaperTheme] = useState<'lined-warm' | 'lined-dark'>('lined-warm');

  // New/Edit Poem Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDedication, setFormDedication] = useState('');
  const [formStanzas, setFormStanzas] = useState('');
  const [formKeywords, setFormKeywords] = useState('');

  const currentPoem = poems[activePoemIndex] || poems[0];

  const handleSelectPoem = (index: number) => {
    setActivePoemIndex(index);
    setActiveWhisper(null);
  };

  const handleWordClick = (wordObj: InteractiveWord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeWhisper?.word.toLowerCase() === wordObj.word.toLowerCase()) {
      setActiveWhisper(null);
    } else {
      setActiveWhisper(wordObj);
    }
  };

  const openNewPoemModal = () => {
    setEditingPoemId(null);
    setFormTitle('');
    setFormDedication(`For ${herName}, with all my love`);
    setFormStanzas('');
    setFormKeywords('');
    setIsEditModalOpen(true);
  };

  const openEditCurrentPoemModal = () => {
    if (!currentPoem) return;
    setEditingPoemId(currentPoem.id);
    setFormTitle(currentPoem.title);
    setFormDedication(currentPoem.dedication || `For ${herName}`);
    setFormStanzas(currentPoem.stanzas.join('\n'));
    const wordsStr = (currentPoem.interactiveWords || [])
      .map((w) => `${w.word}: ${w.whisper}`)
      .join('\n');
    setFormKeywords(wordsStr);
    setIsEditModalOpen(true);
  };

  const handleSavePoem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStanzas.trim()) return;

    const parsedStanzas = formStanzas.split('\n');
    const parsedWords: InteractiveWord[] = formKeywords
      .split('\n')
      .map((line) => {
        const [word, ...rest] = line.split(':');
        if (!word || rest.length === 0) return null;
        return {
          word: word.trim(),
          whisper: rest.join(':').trim(),
        };
      })
      .filter((w): w is InteractiveWord => w !== null);

    if (editingPoemId) {
      const updated: Poem = {
        ...currentPoem,
        title: formTitle.trim(),
        dedication: formDedication.trim() || `For ${herName}`,
        stanzas: parsedStanzas,
        interactiveWords: parsedWords,
      };
      onUpdatePoem(updated);
    } else {
      const newPoem: Poem = {
        id: `poem-${Date.now()}`,
        title: formTitle.trim(),
        dateWritten: 'Autumn 2026',
        dedication: formDedication.trim() || `For ${herName}`,
        stanzas: parsedStanzas,
        interactiveWords: parsedWords,
      };
      onAddPoem(newPoem);
      setActivePoemIndex(poems.length);
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteCurrentPoem = (poemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeletePoem) {
      onDeletePoem(poemId);
      setActivePoemIndex(0);
      setActiveWhisper(null);
    }
  };

  const renderStanzaLine = (line: string, lineIndex: number) => {
    const isWarm = paperTheme === 'lined-warm';
    const textColor = isWarm ? 'text-[#1e1719]' : 'text-[#fdf2f4]';
    const ruleLineColor = isWarm ? 'border-[#e4d7c5]' : 'border-[#2d121c]';

    if (!line.trim()) {
      return (
        <div
          key={lineIndex}
          className={`w-full min-h-[38px] border-b ${ruleLineColor} flex items-end pb-[7px] select-none`}
        >
          <span className="opacity-0">.</span>
          <span className="opacity-20 font-mono text-[9px] text-[#9b9487] select-none ml-auto pr-1">
            {String(lineIndex + 1).padStart(2, '0')}
          </span>
        </div>
      );
    }

    if (!currentPoem.interactiveWords || currentPoem.interactiveWords.length === 0) {
      return (
        <div
          key={lineIndex}
          className={`w-full min-h-[38px] border-b ${ruleLineColor} py-1.5 flex items-end`}
        >
          <div className="flex-1 flex items-baseline justify-between pr-1">
            <p className={`${textColor} font-serif text-[16px] sm:text-[18px] leading-relaxed tracking-wide whitespace-pre-wrap break-words`}>
              {line}
            </p>
            <span className="opacity-25 font-mono text-[9px] text-[#9b9487] select-none shrink-0 ml-3">
              {String(lineIndex + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      );
    }

    const words = line.split(/(\s+)/);
    return (
      <div
        key={lineIndex}
        className={`w-full min-h-[38px] border-b ${ruleLineColor} py-1.5 flex items-end transition-colors`}
      >
        <div className="flex-1 flex items-baseline justify-between pr-1">
          <p className={`${textColor} font-serif text-[16px] sm:text-[18px] leading-relaxed tracking-wide whitespace-pre-wrap break-words`}>
            {words.map((chunk, chunkIdx) => {
              const cleanChunk = chunk.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
              const matched = currentPoem.interactiveWords.find(
                (iw) => iw.word.toLowerCase() === cleanChunk
              );
              if (matched) {
                const isSelected = activeWhisper?.word.toLowerCase() === matched.word.toLowerCase();
                return (
                  <span
                    key={chunkIdx}
                    onClick={(e) => handleWordClick(matched, e)}
                    className={`inline relative cursor-pointer transition-all duration-200 border-b border-dotted pb-0.5 ${
                      isSelected
                        ? isWarm
                          ? 'border-[#be123c] text-[#be123c] font-semibold bg-[#ffe4e6]/50 px-1 rounded-sm'
                          : 'border-[#f43f5e] text-[#fff] font-semibold bg-[#e11d48]/25 px-1 rounded-sm'
                        : isWarm
                          ? 'border-[#e11d48]/40 hover:border-[#e11d48] text-[#8b1825] hover:text-[#e11d48]'
                          : 'border-[#fda4af]/40 hover:border-[#fda4af] text-[#fecdd3] hover:text-[#fff]'
                    }`}
                    title={`Read whisper on "${matched.word}"`}
                  >
                    {chunk}
                  </span>
                );
              }
              return <span key={chunkIdx}>{chunk}</span>;
            })}
          </p>
          <span className="opacity-25 font-mono text-[9px] text-[#9b9487] select-none shrink-0 ml-3">
            {String(lineIndex + 1).padStart(2, '0')}
          </span>
        </div>
      </div>
    );
  };

  const isWarm = paperTheme === 'lined-warm';

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 px-4">
      {/* Outer Shell with Soft Velvet Wine Accents */}
      <div className="relative bg-[#16080e]/90 backdrop-blur-xl border border-[#3b131c] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3b131c] pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#f87171] uppercase mb-1">
              <Feather className="w-3.5 h-3.5" />
              <span>NOTEBOOK FOR MY GIRL | FOR YOU, ALINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#fdf2f4] tracking-wide">
              Words I Wrote Thinking of You
            </h2>
            <p className="text-xs text-[#d1a3ac] font-serif italic mt-0.5">
              Written late at night thinking of you. Tap the underlined words to uncover the quiet secrets I hid inside them.
            </p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Paper Theme Toggle */}
            <button
              onClick={() => setPaperTheme(isWarm ? 'lined-dark' : 'lined-warm')}
              className="px-3 py-1.5 rounded-full text-xs font-serif bg-[#200b14] hover:bg-[#2e101d] text-[#fda4af] border border-[#3b131c] cursor-pointer flex items-center gap-1.5"
              title="Toggle Notebook Paper / Velvet Ink"
            >
              {isWarm ? <Moon className="w-3 h-3 text-[#fda4af]" /> : <FileText className="w-3 h-3 text-[#fda4af]" />}
              <span>{isWarm ? 'Velvet Midnight' : 'Ruled Paper'}</span>
            </button>
            {isCreatorMode && (
              <>
                <button
                  onClick={openEditCurrentPoemModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#200b14] text-[#fda4af] hover:text-white border border-[#3b131c] hover:border-[#e11d48] text-xs font-serif cursor-pointer transition-colors"
                  title="Edit current poem"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit This Poem</span>
                </button>
                <button
                  onClick={openNewPoemModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white hover:opacity-90 text-xs font-serif font-bold transition-opacity cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pen New Stanza</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Poem Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar border-b border-[#3b131c]/60">
          {poems.map((poem, idx) => (
            <div key={poem.id} className="flex items-center">
              <button
                onClick={() => handleSelectPoem(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-serif transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activePoemIndex === idx
                    ? 'bg-[#e11d48]/20 text-[#fda4af] border border-[#e11d48]/60 shadow-[0_0_12px_rgba(225,29,72,0.2)] font-bold'
                    : 'bg-[#200b14]/70 text-[#d1a3ac] hover:text-[#fdf2f4] border border-[#3b131c]'
                }`}
              >
                <Feather className="w-3 h-3 text-[#fda4af]" />
                <span>{poem.title}</span>
                {/* Allow delete if in creator mode and more than 1 poem */}
                {isCreatorMode && poems.length > 1 && (
                  <span
                    onClick={(e) => handleDeleteCurrentPoem(poem.id, e)}
                    className="ml-1 text-[#8a6870] hover:text-[#e11d48] p-0.5 rounded transition-colors"
                    title="Delete poem"
                  >
                    <Trash2 className="w-3 h-3" />
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* The Realistic Lined Notebook Paper with Red Margin */}
        {currentPoem && (
          <div
            className={`relative rounded-2xl p-6 sm:p-10 shadow-2xl transition-all duration-300 border cursor-default ${
              isWarm
                ? 'ruled-paper-warm border-[#dcd0bf] text-[#1e1719]'
                : 'ruled-paper-dark border-[#3b131c] text-[#fdf2f4]'
            }`}
          >
            {/* Lined Notebook Red Margin Line (Left Edge Marker) */}
            <div className="absolute top-0 bottom-0 left-9 sm:left-12 w-[1.5px] bg-[#e11d48]/35 pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-[34px] sm:left-[46px] w-[0.75px] bg-[#e11d48]/15 pointer-events-none hidden sm:block" />
            {/* Notebook Binder Holes on the far left */}
            <div className="absolute left-2.5 sm:left-3.5 top-12 w-3.5 h-3.5 rounded-full bg-[#12040a]/40 border border-[#9b9487]/30 pointer-events-none" />
            <div className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#12040a]/40 border border-[#9b9487]/30 pointer-events-none" />
            <div className="absolute left-2.5 sm:left-3.5 bottom-12 w-3.5 h-3.5 rounded-full bg-[#12040a]/40 border border-[#9b9487]/30 pointer-events-none" />

            {/* Paper Content: Shifted inside the red margin line */}
            <div className="pl-9 sm:pl-12 pr-2 sm:pr-4">
              {/* Paper Title & Dedication Header */}
              <div className="mb-6 pb-4 border-b border-[#e11d48]/20">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <h3
                    className={`text-2xl sm:text-3xl font-serif font-bold tracking-wide ${
                      isWarm ? 'text-[#851b27]' : 'text-[#fdf2f4]'
                    }`}
                  >
                    {currentPoem.title}
                  </h3>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#e11d48]">
                    {currentPoem.dateWritten}
                  </span>
                </div>
                <p
                  className={`text-xs sm:text-sm font-serif italic mt-1 ${
                    isWarm ? 'text-[#5a4e44]' : 'text-[#d1a3ac]'
                  }`}
                >
                  {currentPoem.dedication}
                </p>
              </div>

              {/* Exact Baseline-Aligned Stanzas on Ruled Lines */}
              <div className="space-y-0">
                {currentPoem.stanzas.map((line, idx) => renderStanzaLine(line, idx))}
                {/* Trailing blank ruled lines for genuine notebook paper feel */}
                <div
                  className={`w-full h-[38px] min-h-[38px] border-b ${
                    isWarm ? 'border-[#e4d7c5]' : 'border-[#2d121c]'
                  }`}
                />
                <div
                  className={`w-full h-[38px] min-h-[38px] border-b ${
                    isWarm ? 'border-[#e4d7c5]' : 'border-[#2d121c]'
                  }`}
                />
              </div>

              {/* Subtle Bottom Note */}
              <div className="mt-8 pt-4 border-t border-dashed border-[#9b9487]/30 flex items-center justify-end text-xs font-serif italic text-[#9b9487]">
                <span className="text-[#e11d48] flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-[#e11d48]" /> With all my love, {hisName}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Revealed Subtle Secret Whisper Note */}
        {activeWhisper && (
          <div
            className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all animate-fadeIn ${
              isWarm
                ? 'bg-[#fff5f6] border-[#fecdd3] text-[#711624] shadow-[0_4px_20px_rgba(225,29,72,0.08)]'
                : 'bg-[#1a070f] border-[#4c1d28] text-[#ffe4e6] shadow-[0_4px_25px_rgba(225,29,72,0.2)]'
            }`}
          >
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-current/15 mb-2.5">
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 fill-current text-[#e11d48]" />
                <span className="text-[11px] font-mono tracking-wider uppercase opacity-80">
                  Hidden Whisper | "{activeWhisper.word}"
                </span>
              </div>
              <button
                onClick={() => setActiveWhisper(null)}
                className="text-xs opacity-60 hover:opacity-100 cursor-pointer flex items-center gap-1 font-sans"
              >
                <span>Fold note</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-serif text-base sm:text-[17px] italic leading-relaxed pl-3 border-l-2 border-[#e11d48]/70">
              "{activeWhisper.whisper}"
            </p>
            <p className="text-[11px] font-serif italic text-right mt-2 opacity-70">
              For Aline, with all my love
            </p>
          </div>
        )}

        {/* Modal: Pen New Stanza */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080204]/85 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-xl bg-[#16080e] border border-[#e11d48]/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-5 right-5 text-[#d1a3ac] hover:text-[#fdf2f4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs font-mono text-[#f87171] tracking-widest uppercase mb-1">
                <Feather className="w-3.5 h-3.5" />
                <span>{editingPoemId ? 'EDIT PARCHMENT ENTRY' : 'NEW PARCHMENT ENTRY'}</span>
              </div>
              <h3 className="text-2xl font-serif text-[#fdf2f4] mb-4">
                {editingPoemId ? 'Refine Poem Verses' : `Pen a Stanza for ${herName}`}
              </h3>
              <form onSubmit={handleSavePoem} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#d1a3ac] uppercase mb-1">
                    Poem Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Midnight on 5th Avenue"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#200b14] border border-[#3b131c] rounded-xl px-3 py-2 text-sm text-[#fdf2f4] focus:outline-none focus:border-[#e11d48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#d1a3ac] uppercase mb-1">
                    Dedication Line
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g., For Aline, who owns my thoughts`}
                    value={formDedication}
                    onChange={(e) => setFormDedication(e.target.value)}
                    className="w-full bg-[#200b14] border border-[#3b131c] rounded-xl px-3 py-2 text-sm text-[#fdf2f4] focus:outline-none focus:border-[#e11d48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#d1a3ac] uppercase mb-1">
                    Stanzas (One line per row)
                  </label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Write lines here. Spaces, indents, and empty lines will create notebook line breaks..."
                    value={formStanzas}
                    onChange={(e) => setFormStanzas(e.target.value)}
                    className="w-full bg-[#200b14] border border-[#3b131c] rounded-xl p-3 text-sm text-[#fdf2f4] font-serif leading-relaxed whitespace-pre-wrap focus:outline-none focus:border-[#e11d48] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#d1a3ac] uppercase mb-1">
                    Interactive Whispers (Format: word: secret whisper message)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={`breath: The first thing I will do is hold you tight\nhour: Every hour without you is one closer`}
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    className="w-full bg-[#200b14] border border-[#3b131c] rounded-xl p-3 text-xs text-[#fdf2f4] font-mono focus:outline-none focus:border-[#e11d48] resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3b131c]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-serif text-[#d1a3ac] hover:text-[#fdf2f4] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-serif font-bold text-xs hover:opacity-90 cursor-pointer shadow-md"
                  >
                    {editingPoemId ? 'Save Poem Changes' : 'Add to Parchment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
