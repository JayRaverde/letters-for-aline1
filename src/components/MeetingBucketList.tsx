import React, { useState } from 'react';
import { BucketListItem, BucketCategory } from '../types';
import {
  Film,
  Heart,
  Sparkles,
  Plus,
  Check,
  Star,
  Utensils,
  Compass,
  X,
  MessageCircleHeart,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MeetingBucketListProps {
  items: BucketListItem[];
  onToggleComplete: (id: string) => void;
  onTogglePriority: (id: string) => void;
  onAddItem: (item: Omit<BucketListItem, 'id' | 'dateAdded'>) => void;
  onDeleteItem: (id: string) => void;
  herName: string;
  hisName: string;
  isCreatorMode?: boolean;
}

export const MeetingBucketList: React.FC<MeetingBucketListProps> = ({
  items,
  onToggleComplete,
  onTogglePriority,
  onAddItem,
  onDeleteItem,
  herName,
  hisName,
  isCreatorMode = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BucketCategory | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formAddedBy, setFormAddedBy] = useState<'Jazz' | 'Aline'>('Aline');

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BucketCategory>('aline');
  const [newNote, setNewNote] = useState('');

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const completedCount = items.filter((i) => i.completed).length;

  const handleCheck = (id: string, currentState: boolean) => {
    onToggleComplete(id);
    if (!currentState) {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#e5be7a', '#d95874', '#adc4e2', '#ffffff'],
      });
    }
  };

  const handleOpenAddForAline = () => {
    setFormAddedBy('Aline');
    setNewCategory('aline');
    setNewTitle('');
    setNewNote('');
    setIsAddModalOpen(true);
  };

  const handleOpenAddGeneral = () => {
    setFormAddedBy(isCreatorMode ? 'Jazz' : 'Aline');
    setNewCategory('firsts');
    setNewTitle('');
    setNewNote('');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddItem({
      title: newTitle.trim(),
      category: newCategory,
      note: newNote.trim(),
      completed: false,
      isPriority: formAddedBy === 'Aline',
      addedBy: formAddedBy,
    });

    setNewTitle('');
    setNewNote('');
    setIsAddModalOpen(false);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fda4af', '#e11d48', '#fbbf24'],
    });
  };

  const getCategoryBadge = (cat: BucketCategory) => {
    switch (cat) {
      case 'firsts':
        return { label: 'Our First Day', icon: Sparkles, color: 'text-[#fb7185] bg-[#e11d48]/15 border-[#e11d48]/35' };
      case 'movies':
        return { label: "Things We're Doing", icon: Film, color: 'text-[#e5be7a] bg-[#e5be7a]/10 border-[#e5be7a]/30' };
      case 'food':
        return { label: 'Food (Important!)', icon: Utensils, color: 'text-[#85e3b3] bg-[#85e3b3]/10 border-[#85e3b3]/30' };
      case 'adventures':
        return { label: 'The Stupid Little Things', icon: Compass, color: 'text-[#e0a96d] bg-[#e0a96d]/10 border-[#e0a96d]/30' };
      case 'cozy':
        return { label: 'The Quiet Ones', icon: Moon, color: 'text-[#adc4e2] bg-[#adc4e2]/10 border-[#adc4e2]/30' };
      case 'aline':
        return { label: `${herName}'s Idea`, icon: Heart, color: 'text-[#fda4af] bg-[#fda4af]/15 border-[#fda4af]/40' };
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-10 px-4">
      {/* Container with parchment/starlight feel */}
      <div className="bg-[#0d121c]/85 backdrop-blur-xl border border-[#222d42] rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#222d42] pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#e5243b] uppercase mb-1.5">
              <Heart className="w-3.5 h-3.5 fill-[#e5243b]" />
              <span>WHEN WE MEET | OUR SHARED FUTURE</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#f6f0e4] tracking-wide">
              When We Meet
            </h2>
            <p className="text-xs sm:text-sm text-[#d1a3ac] font-serif italic mt-1.5 leading-relaxed max-w-2xl">
              "Some are romantic, some ridiculous, some completely mundane. That is exactly what makes the future feel real."
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono text-[#9b9487] bg-[#141b29] px-3 py-1.5 rounded-full border border-[#222d42]">
              {completedCount}/{items.length} Fulfilled
            </span>
            {/* Dedicated button for Aline to add her dreams anytime */}
            <button
              onClick={handleOpenAddForAline}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white text-xs font-serif font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg"
              title={`Add your own dream or activity for when we meet, {herName}`}
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Add Your Idea, {herName}</span>
            </button>
            {isCreatorMode && (
              <button
                onClick={handleOpenAddGeneral}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#141b29] border border-[#222d42] text-[#9b9487] hover:text-[#f6f0e4] text-xs font-serif transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {[
            { id: 'all', label: 'All Plans' },
            { id: 'firsts', label: 'Our First Day' },
            { id: 'movies', label: "Things We're Doing" },
            { id: 'food', label: 'Food (Important!)' },
            { id: 'adventures', label: 'The Stupid Little Things' },
            { id: 'cozy', label: 'The Quiet Ones' },
            { id: 'aline', label: `${herName}'s Additions` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as BucketCategory | 'all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#e5be7a] text-[#07090e] font-bold shadow-md'
                  : 'bg-[#141b29] text-[#9b9487] hover:text-[#f6f0e4] border border-[#222d42]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List of Bucket Items */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-[#9b9487] font-serif italic text-sm border border-dashed border-[#222d42] rounded-2xl">
              No plans added under this category yet. Click "+ Add Your Idea, {herName}" to write one!
            </div>
          ) : (
            filteredItems.map((item) => {
              const badge = getCategoryBadge(item.category);
              const BadgeIcon = badge.icon;
              const isAddedByAline = item.addedBy === herName || item.addedBy === 'Aline' || item.category === 'aline';

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
                    item.completed
                      ? 'bg-[#141b29]/40 border-[#222d42]/50 opacity-70'
                      : isAddedByAline
                        ? 'bg-[#1e0a16] border-[#e11d48]/50 shadow-[0_4px_20px_rgba(225,29,72,0.15)]'
                        : item.isPriority
                          ? 'bg-[#141b29] border-[#e5be7a]/60 shadow-[0_4px_20px_rgba(229,190,122,0.1)]'
                          : 'bg-[#141b29]/90 border-[#222d42] hover:border-[#384666]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleCheck(item.id, item.completed)}
                      className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 cursor-pointer shrink-0 ${
                        item.completed
                          ? 'bg-[#d95874] border-[#d95874] text-white shadow-[0_0_8px_#d95874]'
                          : 'border-[#3a4763] hover:border-[#e5be7a] bg-[#0d121c]'
                      }`}
                      aria-label="Toggle completed"
                    >
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${badge.color}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                        {item.isPriority && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-serif bg-[#e5be7a]/15 border border-[#e5be7a]/40 text-[#e5be7a]">
                            <Star className="w-3 h-3 fill-[#e5be7a]" />
                            <span>Top Priority</span>
                          </span>
                        )}
                        <span className="text-[11px] text-[#9b9487] font-sans">
                          {isAddedByAline ? `Added by ${herName}` : `From ${item.addedBy || hisName}`}
                        </span>
                      </div>
                      <h3
                        className={`text-base sm:text-lg font-serif tracking-wide ${
                          item.completed
                            ? 'line-through text-[#9b9487]'
                            : 'text-[#f6f0e4]'
                        }`}
                      >
                        {item.title}
                      </h3>
                      {item.note && (
                        <p className="text-xs sm:text-sm text-[#ab9e8d] font-serif italic mt-1.5 leading-relaxed bg-[#0d121c]/50 p-2.5 rounded-xl border border-[#222d42]/60 whitespace-pre-wrap break-words">
                          "{item.note}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons (Pin priority / Delete) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onTogglePriority(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          item.isPriority
                            ? 'text-[#e5be7a] border-[#e5be7a]/40 bg-[#e5be7a]/10'
                            : 'text-[#9b9487] border-transparent hover:border-[#222d42] hover:text-[#f6f0e4]'
                        }`}
                        title={item.isPriority ? 'Unpin priority' : 'Pin as top priority'}
                      >
                        <Star className={`w-4 h-4 ${item.isPriority ? 'fill-[#e5be7a]' : ''}`} />
                      </button>
                      {isCreatorMode && (
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 text-[#9b9487] hover:text-[#d95874] transition-colors cursor-pointer"
                          title="Remove plan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dedicated Callout Card for Aline at the Bottom */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#230915] via-[#16060f] to-[#0c0307] border border-[#e11d48]/40 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e11d48]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-12 h-12 rounded-full bg-[#e11d48]/20 border border-[#e11d48]/50 flex items-center justify-center mx-auto mb-4 text-[#fda4af]">
            <MessageCircleHeart className="w-6 h-6 text-[#fb7185]" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#fda4af] block mb-2">
            A NOTE FOR YOU, {herName.toUpperCase()}
          </span>
          <div className="max-w-xl mx-auto space-y-3 font-serif text-[#fdf2f4] leading-relaxed mb-6">
            <p className="text-base sm:text-lg italic font-medium">
              "This list isn't finished."
            </p>
            <p className="text-sm sm:text-base text-[#e2cbd1]">
              "I left some space because I'm sure you'll have things you want us to do too."
            </p>
            <p className="text-base sm:text-lg font-bold text-[#fda4af] tracking-wide">
              "Add them. I want some of our memories to be your idea."
            </p>
            <p className="text-xs text-[#9b9487] font-mono pt-1">
              Forever yours, {hisName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddForAline}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#be123c] text-white font-serif font-bold text-sm hover:scale-105 transition-all shadow-[0_0_25px_rgba(225,29,72,0.4)] cursor-pointer inline-flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Add Your Idea to Our Future, {herName}</span>
            <Sparkles className="w-4 h-4 text-[#fbbf24]" />
          </button>
        </div>
      </div>

      {/* Modal: Add New In-Person Dream or Aline's Idea */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0d121c] border border-[#e5be7a]/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-[#9b9487] hover:text-[#f6f0e4] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#fda4af] tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WHEN WE MEET | ADD TO OUR CHAPTER</span>
            </div>
            <h3 className="text-2xl font-serif text-[#f6f0e4] mb-2">
              {formAddedBy === 'Aline' ? `What Would You Love for Us to Do, ${herName}?` : 'Add an In-Person Milestone'}
            </h3>
            <p className="text-xs text-[#d1a3ac] font-serif italic mb-5">
              {formAddedBy === 'Aline'
                ? `"I want some of our memories to be your idea." Write whatever is in your heart.`
                : 'Add a new date, movie, meal, or adventure to your shared list.'}
            </p>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1.5">
                  Who is writing this idea?
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAddedBy('Aline')}
                    className={`flex-1 py-2 rounded-xl text-xs font-serif transition-colors border cursor-pointer ${
                      formAddedBy === 'Aline'
                        ? 'bg-[#e11d48]/20 border-[#e11d48] text-[#fda4af] font-bold'
                        : 'bg-[#141b29] border-[#222d42] text-[#9b9487]'
                    }`}
                  >
                    {herName}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAddedBy('Jazz')}
                    className={`flex-1 py-2 rounded-xl text-xs font-serif transition-colors border cursor-pointer ${
                      formAddedBy === 'Jazz'
                        ? 'bg-[#e5be7a]/20 border-[#e5be7a] text-[#e5be7a] font-bold'
                        : 'bg-[#141b29] border-[#222d42] text-[#9b9487]'
                    }`}
                  >
                    {hisName}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1.5">
                  Plan or Milestone Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`e.g. Taking a walk in the rain, midnight picnic, watching that movie...`}
                  className="w-full bg-[#141b29] border border-[#222d42] rounded-xl px-4 py-2.5 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as BucketCategory)}
                  className="w-full bg-[#141b29] border border-[#222d42] rounded-xl px-3 py-2 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a]"
                >
                  <option value="firsts">Our First Day</option>
                  <option value="movies">Things We're Doing (Movies / Games)</option>
                  <option value="food">Food (Because apparently this is important)</option>
                  <option value="adventures">The Stupid Little Things</option>
                  <option value="cozy">The Quiet Ones</option>
                  <option value="aline">{herName}'s Special Idea</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#9b9487] uppercase mb-1.5">
                  Why you want to do this / Your little note
                </label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Because I want to see you laugh, hold your hand, and never let go..."
                  className="w-full bg-[#141b29] border border-[#222d42] rounded-xl px-4 py-2.5 text-sm text-[#f6f0e4] focus:outline-none focus:border-[#e5be7a] resize-none leading-relaxed whitespace-pre-wrap"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#222d42]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-serif text-[#9b9487] hover:text-[#f6f0e4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white text-xs font-serif font-bold hover:brightness-110 transition-colors cursor-pointer shadow-md"
                >
                  Save to When We Meet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
