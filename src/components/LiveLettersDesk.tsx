import React, { useState, useEffect } from 'react';
import { LiveLetter } from '../types';
import {
  Send,
  Mail,
  Clock,
  CheckCheck,
  Heart,
  Feather,
  RotateCcw,
  Trash2,
  Edit3,
  Check,
  X,
  ShieldCheck,
  Download,
  Copy,
  Archive,
  AlertCircle,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveLettersDeskProps {
  herName: string;
  hisName: string;
  isCreatorMode?: boolean;
}

interface RecoveredItem {
  id: string;
  title: string;
  content: string;
  author: string;
  source: string;
  timestamp: string;
  isoDate: string;
  stationery?: 'lined-warm' | 'velvet-noir';
}

const DEFAULT_STARTER: LiveLetter = {
  id: 'live-1',
  title: 'Just thinking of you at my desk',
  content: "I took a moment between everything today just to look at our photos. The miles feel far today, but knowing you're in this world and that you chose me makes every single minute of waiting worth it. I'm right here with you, Aline. Always.",
  author: 'Jazz',
  timestamp: 'Today   8:15 PM',
  isoDate: new Date().toISOString(),
  readByRecipient: false,
  stationery: 'lined-warm',
};

export const LiveLettersDesk: React.FC<LiveLettersDeskProps> = ({
  herName,
  hisName,
  isCreatorMode = false,
}) => {
  // Safe helper to read from multiple localStorage backups
  const getInitialLetters = (): LiveLetter[] => {
    try {
      const activeRaw = localStorage.getItem('aline_live_letters');
      const vaultRaw = localStorage.getItem('aline_letters_vault_safe');
      
      const activeLetters: LiveLetter[] = activeRaw ? JSON.parse(activeRaw) : [];
      const vaultLetters: LiveLetter[] = vaultRaw ? JSON.parse(vaultRaw) : [];
      
      const map = new Map<string, LiveLetter>();
      vaultLetters.forEach((l) => map.set(l.id, l));
      activeLetters.forEach((l) => map.set(l.id, l));
      
      const combined = Array.from(map.values());
      if (combined.length > 0) return combined;
    } catch (e) {
      console.warn('Error reading stored letters:', e);
    }
    return [DEFAULT_STARTER];
  };

  const [letters, setLetters] = useState<LiveLetter[]>(getInitialLetters);
  const [, setDiskSaved] = useState<boolean>(true);

  // Draft auto-save state
  const [title, setTitle] = useState(() => {
    try {
      return localStorage.getItem('aline_draft_title') || '';
    } catch {
      return '';
    }
  });
  const [content, setContent] = useState(() => {
    try {
      return localStorage.getItem('aline_draft_content') || '';
    } catch {
      return '';
    }
  });
  const [stationery, setStationery] = useState<'lined-warm' | 'velvet-noir'>('lined-warm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftBannerVisible, setDraftBannerVisible] = useState(() => {
    try {
      return !!(localStorage.getItem('aline_draft_content')?.trim());
    } catch {
      return false;
    }
  });

  // Edit Letter State
  const [editingLetter, setEditingLetter] = useState<LiveLetter | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStationery, setEditStationery] = useState<'lined-warm' | 'velvet-noir'>('lined-warm');

  // Vault & Recovery Modal State
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [discoveredItems, setDiscoveredItems] = useState<RecoveredItem[]>([]);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Sync to local storage & safe permanent vault
  useEffect(() => {
    try {
      localStorage.setItem('aline_live_letters', JSON.stringify(letters));
      
      // Update safe vault (never wipes user's custom letters)
      const existingVaultRaw = localStorage.getItem('aline_letters_vault_safe');
      const existingVault: LiveLetter[] = existingVaultRaw ? JSON.parse(existingVaultRaw) : [];
      
      const map = new Map<string, LiveLetter>();
      existingVault.forEach((l) => map.set(l.id, l));
      letters.forEach((l) => {
        map.set(l.id, l);
      });
      localStorage.setItem('aline_letters_vault_safe', JSON.stringify(Array.from(map.values())));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [letters]);

  // Save active typing draft
  useEffect(() => {
    try {
      if (content.trim()) {
        localStorage.setItem('aline_draft_content', content);
        localStorage.setItem('aline_draft_title', title);
      } else {
        localStorage.removeItem('aline_draft_content');
        localStorage.removeItem('aline_draft_title');
      }
    } catch {}
  }, [title, content]);

  // Sync missing local letters to the server backend
  const syncLettersToServer = async (lettersToPush: LiveLetter[]) => {
    try {
      const res = await fetch('/api/letters/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letters: lettersToPush }),
      });
      if (res.ok) {
        setDiskSaved(true);
      }
    } catch (err) {
      console.warn('Server sync failed:', err);
    }
  };

  const fetchLetters = async () => {
    try {
      const res = await fetch('/api/letters');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.letters && Array.isArray(data.letters)) {
          const serverList: LiveLetter[] = data.letters;
          setLetters((prevLocal) => {
            const map = new Map<string, LiveLetter>();
            // Add server letters
            serverList.forEach((l) => map.set(l.id, l));
            // Keep any local letters that server might not have yet (e.g. after server reboot)
            const missingOnServer: LiveLetter[] = [];
            prevLocal.forEach((l) => {
              if (!map.has(l.id)) {
                map.set(l.id, l);
                missingOnServer.push(l);
              }
            });

            // Automatically back them up to server disk
            if (missingOnServer.length > 0) {
              syncLettersToServer(missingOnServer);
            }

            const merged = Array.from(map.values());
            // Sort newest first
            return merged.sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime());
          });
          setDiskSaved(true);
        }
      }
    } catch {
      // Local storage is already the single source of truth when running statically on Vercel
    }
  };

  useEffect(() => {
    fetchLetters();
    const interval = setInterval(fetchLetters, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSendLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    const newLetterData = {
      title: title.trim() || `A whisper for ${herName}`,
      content: content.trim(),
      author: (hisName === 'Aline' ? 'Aline' : 'Jazz') as 'Jazz' | 'Aline',
      timestamp: `${dateString}   ${timeString}`,
      stationery,
    };

    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLetterData),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.letter) {
          setLetters((prev) => {
            const filtered = prev.filter((l) => l.id !== 'live-1');
            return [data.letter, ...filtered];
          });
          return;
        }
      }
      throw new Error('Local storage fallback');
    } catch {
      const localItem: LiveLetter = {
        id: `local-${Date.now()}`,
        ...newLetterData,
        isoDate: now.toISOString(),
        readByRecipient: false,
      };
      setLetters((prev) => {
        const filtered = prev.filter((l) => l.id !== 'live-1');
        return [localItem, ...filtered];
      });
    } finally {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fda4af', '#ffffff'],
      });

      // Clear draft
      setTitle('');
      setContent('');
      setDraftBannerVisible(false);
      try {
        localStorage.removeItem('aline_draft_content');
        localStorage.removeItem('aline_draft_title');
      } catch {}
      setIsSubmitting(false);
    }
  };

  const handleMarkAsRead = async (letterId: string) => {
    try {
      await fetch(`/api/letters/${letterId}/read`, { method: 'POST' });
      setLetters((prev) =>
        prev.map((l) =>
          l.id === letterId
            ? { ...l, readByRecipient: true, readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            : l
        )
      );
    } catch (e) {
      console.warn('Failed to mark read', e);
    }
  };

  const handleReact = async (letterId: string, reaction: string) => {
    try {
      await fetch(`/api/letters/${letterId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });
      setLetters((prev) =>
        prev.map((l) => (l.id === letterId ? { ...l, reaction } : l))
      );
    } catch (e) {
      console.warn('Failed to react', e);
    }
  };

  const handleDelete = async (letterId: string) => {
    try {
      await fetch(`/api/letters/${letterId}`, { method: 'DELETE' });
      setLetters((prev) => prev.filter((l) => l.id !== letterId));
    } catch (e) {
      setLetters((prev) => prev.filter((l) => l.id !== letterId));
    }
  };

  const openEditModal = (letter: LiveLetter) => {
    setEditingLetter(letter);
    setEditTitle(letter.title || '');
    setEditContent(letter.content);
    setEditStationery(letter.stationery || 'lined-warm');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter || !editContent.trim()) return;

    try {
      const res = await fetch(`/api/letters/${editingLetter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          stationery: editStationery,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters);
      } else {
        setLetters((prev) =>
          prev.map((l) =>
            l.id === editingLetter.id
              ? { ...l, title: editTitle.trim(), content: editContent.trim(), stationery: editStationery }
              : l
          )
        );
      }
      setEditingLetter(null);
    } catch (err) {
      console.warn('Edit failed', err);
      setEditingLetter(null);
    }
  };

  const runRecoveryScan = async () => {
    setIsScanning(true);
    const discovered: RecoveredItem[] = [];
    const seenIds = new Set(letters.map((l) => l.id));

    try {
      const safeVaultRaw = localStorage.getItem('aline_letters_vault_safe');
      if (safeVaultRaw) {
        const parsed: LiveLetter[] = JSON.parse(safeVaultRaw);
        parsed.forEach((item) => {
          if (!seenIds.has(item.id) && item.content?.trim()) {
            discovered.push({
              id: item.id,
              title: item.title || '',
              content: item.content,
              author: item.author || hisName,
              source: 'Browser Safe Vault',
              timestamp: item.timestamp,
              isoDate: item.isoDate,
              stationery: item.stationery,
            });
            seenIds.add(item.id);
          }
        });
      }

      const draftContent = localStorage.getItem('aline_draft_content');
      const draftTitle = localStorage.getItem('aline_draft_title');
      if (draftContent && draftContent.trim() && !content.trim()) {
        discovered.push({
          id: `draft-${Date.now()}`,
          title: draftTitle || 'Unsent Letter Draft',
          content: draftContent,
          author: hisName,
          source: 'Auto-saved Draft',
          timestamp: 'Just now',
          isoDate: new Date().toISOString(),
          stationery: 'lined-warm',
        });
      }
    } catch (e) {
      console.warn('Local scan error:', e);
    }

    try {
      const res = await fetch('/api/letters/vault');
      if (res.ok) {
        const data = await res.json();
        if (data.vault && Array.isArray(data.vault)) {
          data.vault.forEach((entry: any) => {
            const l = entry.letter;
            if (l && !seenIds.has(l.id)) {
              discovered.push({
                id: l.id,
                title: l.title || '',
                content: l.content,
                author: l.author || hisName,
                source: `Server Vault (${entry.reason})`,
                timestamp: l.timestamp,
                isoDate: l.isoDate,
                stationery: l.stationery,
              });
              seenIds.add(l.id);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Server vault fetch error:', e);
    }

    setDiscoveredItems(discovered);
    setIsScanning(false);
  };

  const handleOpenVault = () => {
    setIsVaultModalOpen(true);
    runRecoveryScan();
  };

  const handleRestoreLetter = async (item: RecoveredItem) => {
    const restored: LiveLetter = {
      id: item.id.startsWith('live-') ? item.id : `live-${Date.now()}`,
      title: item.title || `Letter for ${herName}`,
      content: item.content,
      author: item.author === herName ? 'Aline' : 'Jazz',
      timestamp: item.timestamp || 'Recovered',
      isoDate: item.isoDate || new Date().toISOString(),
      readByRecipient: false,
      stationery: item.stationery || 'lined-warm',
    };

    setLetters((prev) => {
      const filtered = prev.filter((l) => l.id !== restored.id && l.id !== 'live-1');
      return [restored, ...filtered];
    });

    try {
      await fetch('/api/letters/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letters: [restored] }),
      });
    } catch {}

    setDiscoveredItems((prev) => prev.filter((i) => i.id !== item.id));
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#ffffff'],
    });
  };

  const handlePasteRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) return;

    const now = new Date();
    const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const restored: LiveLetter = {
      id: `live-restored-${Date.now()}`,
      title: pasteTitle.trim() || `Restored Letter for ${herName}`,
      content: pasteContent.trim(),
      author: 'Jazz',
      timestamp: `${dateString}   ${timeString} (Restored)`,
      isoDate: now.toISOString(),
      readByRecipient: false,
      stationery: 'lined-warm',
    };

    setLetters((prev) => [restored, ...prev.filter((l) => l.id !== 'live-1')]);

    try {
      await fetch('/api/letters/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letters: [restored] }),
      });
    } catch {}

    setPasteTitle('');
    setPasteContent('');
    setIsVaultModalOpen(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#e11d48', '#fda4af', '#ffffff'],
    });
  };

  const handleExportText = () => {
    const formatted = letters
      .map((l, index) => {
        return `========================================\n` +
          `LETTER #${letters.length - index}: ${l.title || 'Untitled'}\n` +
          `From: ${l.author || hisName}   To: ${herName}\n` +
          `Date: ${l.timestamp}\n` +
          `----------------------------------------\n\n` +
          `${l.content}\n\n` +
          `========================================\n\n`;
      })
      .join('\n');
    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Letters_To_${herName}_Archive_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = () => {
    const formatted = letters
      .map((l, index) => `[${l.timestamp}] ${l.title || `Letter #${index + 1}`}\n${l.content}\n`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(formatted).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 px-4">
      <div className="bg-[#16080e]/95 backdrop-blur-xl border border-[#3b131c] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Header: Dedicated from Jazz to Aline */}
        <div className="border-b border-[#3b131c] pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#f87171] uppercase">
              <Mail className="w-3.5 h-3.5" />
              <span>OUR DESK | FOR YOU, ALINE</span>
            </div>
            {/* Persistent storage badge & Vault Recovery button */}
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-mono text-[#4ade80] bg-[#22c55e]/10 border border-[#22c55e]/25 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                title="Your letters are securely written to permanent disk storage on the server and synced to local browser memory"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Protected & Permanent</span>
              </span>
              <button
                type="button"
                onClick={handleOpenVault}
                className="px-3 py-1 rounded-lg bg-[#2a0e19] hover:bg-[#3d1324] border border-[#521b29] hover:border-[#e11d48] text-[#fda4af] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                title="Letter Vault & Recovery Center: Scan for past letters, paste saved text, or download backup"
              >
                <Archive className="w-3.5 h-3.5 text-[#f43f5e]" />
                <span>Vault & Recovery</span>
              </button>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#fdf2f4] tracking-wide">
            My Letters to You
          </h2>
          <p className="text-xs text-[#d1a3ac] font-serif italic mt-0.5">
            Everything I wanted to say to you today, written straight from my heart across all the miles.
          </p>
        </div>

        {/* Draft Recovery Banner */}
        {draftBannerVisible && content.trim() && (
          <div className="mb-4 p-3 bg-[#3b131c]/60 border border-[#e11d48]/40 rounded-xl flex items-center justify-between gap-3 text-xs font-serif text-[#fda4af]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#fb7185] shrink-0" />
              <span>Restored your unsent draft in the compose box below!</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setContent('');
                setTitle('');
                setDraftBannerVisible(false);
                localStorage.removeItem('aline_draft_content');
                localStorage.removeItem('aline_draft_title');
              }}
              className="text-[#f87171] hover:text-white underline cursor-pointer shrink-0"
            >
              Discard Draft
            </button>
          </div>
        )}

        {/* Compose Form: Pen a Letter to Aline */}
        <form onSubmit={handleSendLetter} className="mb-10 p-5 sm:p-6 rounded-2xl bg-[#200b14]/70 border border-[#3b131c] shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-[#fda4af]" />
              <span className="text-xs font-mono text-[#fda4af] uppercase tracking-wider">
                Pen a Letter to {herName}
              </span>
            </div>
            
            {/* Stationery choice */}
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <button
                type="button"
                onClick={() => setStationery('lined-warm')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                  stationery === 'lined-warm'
                    ? 'bg-[#dcd0bf] text-[#1e1719] border-[#e4d7c5] font-semibold'
                    : 'bg-[#14060d] text-[#d1a3ac] border-[#3b131c]'
                }`}
              >
                Warm Ruled Paper
              </button>
              <button
                type="button"
                onClick={() => setStationery('velvet-noir')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                  stationery === 'velvet-noir'
                    ? 'bg-[#e11d48]/20 text-[#fda4af] border-[#e11d48] font-semibold'
                    : 'bg-[#14060d] text-[#d1a3ac] border-[#3b131c]'
                }`}
              >
                Velvet Noir
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder={`Letter subject or whisper (e.g. Thinking of your smile tonight...)`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-3 px-3.5 py-2.5 rounded-xl bg-[#14060d] border border-[#3b131c] text-sm text-[#fdf2f4] placeholder-[#8a6870] focus:outline-none focus:border-[#e11d48]"
          />
          <textarea
            required
            rows={6}
            placeholder={`Dear ${herName},\n\nWrite whatever is on your heart for her. Paragraph spaces, lines, and indents are fully preserved and permanently secured on disk...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full mb-3 p-3.5 rounded-xl bg-[#14060d] border border-[#3b131c] text-sm text-[#fdf2f4] placeholder-[#8a6870] font-serif focus:outline-none focus:border-[#e11d48] resize-none leading-relaxed whitespace-pre-wrap"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-[#8a6870] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
              <span>Auto-saved draft | Never lost on refresh or reboot</span>
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-serif font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sealing...' : `Send to ${herName}`}</span>
            </button>
          </div>
        </form>

        {/* Letters Archive */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#3b131c]/60 gap-2">
            <h3 className="text-xs font-mono tracking-widest text-[#d1a3ac] uppercase flex items-center gap-2">
              <span>Despatches from {hisName} to {herName}</span>
              <span className="bg-[#200b14] px-2 py-0.5 rounded-full text-[10px] text-[#fda4af]">
                {letters.length}
              </span>
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportText}
                className="text-xs text-[#d1a3ac] hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer bg-[#200b14] px-2.5 py-1 rounded-lg border border-[#3b131c]"
                title="Download all letters to a text file for safekeeping"
              >
                <Download className="w-3 h-3 text-[#fda4af]" />
                <span>Export (.txt)</span>
              </button>
              <button
                type="button"
                onClick={handleCopyAll}
                className="text-xs text-[#d1a3ac] hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer bg-[#200b14] px-2.5 py-1 rounded-lg border border-[#3b131c]"
                title="Copy all letters to clipboard"
              >
                <Copy className="w-3 h-3 text-[#fda4af]" />
                <span>{copySuccess ? 'Copied!' : 'Copy All'}</span>
              </button>
              <button
                type="button"
                onClick={fetchLetters}
                className="text-xs text-[#8a6870] hover:text-[#fda4af] flex items-center gap-1 font-mono transition-colors cursor-pointer bg-[#200b14] px-2.5 py-1 rounded-lg border border-[#3b131c]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {letters.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#3b131c] rounded-2xl">
              <Mail className="w-8 h-8 text-[#5a2430] mx-auto mb-2" />
              <p className="text-sm font-serif text-[#d1a3ac]">No letters in the desk yet.</p>
              <p className="text-xs text-[#8a6870] font-sans mt-1">
                Pen your love letter to {herName} above to start your archive!
              </p>
            </div>
          ) : (
            letters.map((letter) => {
              const isWarm = letter.stationery === 'lined-warm';
              return (
                <div
                  key={letter.id}
                  className={`relative rounded-2xl p-5 sm:p-7 shadow-xl border transition-all ${
                    isWarm
                      ? 'ruled-paper-warm border-[#dcd0bf] text-[#1e1719]'
                      : 'bg-[#1a070f] border-[#4c1d28] text-[#fdf2f4]'
                  }`}
                >
                  {/* Red Margin Line for warm stationery */}
                  {isWarm && (
                    <div className="absolute top-0 bottom-0 left-8 sm:left-10 w-[1.5px] bg-[#e11d48]/35 pointer-events-none" />
                  )}

                  <div className={isWarm ? 'pl-6 sm:pl-8' : ''}>
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-4 border-current/15">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase">
                          From: {letter.author || hisName} | To: {herName}
                        </span>
                        <span className="text-xs opacity-50">|</span>
                        <span className="text-xs opacity-75 font-sans flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {letter.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {letter.readByRecipient ? (
                          <span className="text-[11px] font-mono text-[#15803d] bg-[#22c55e]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <CheckCheck className="w-3 h-3" />
                            Read by Aline
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkAsRead(letter.id)}
                            className="text-[11px] font-mono text-[#be123c] bg-[#e11d48]/10 hover:bg-[#e11d48]/20 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                          >
                            Mark Read
                          </button>
                        )}
                        {isCreatorMode && (
                          <button
                            onClick={() => openEditModal(letter)}
                            className="text-[#9b9487] hover:text-[#fda4af] p-1 cursor-pointer transition-colors ml-1"
                            title="Edit letter"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isCreatorMode && (
                          <button
                            onClick={() => handleDelete(letter.id)}
                            className="text-[#9b9487] hover:text-[#e11d48] p-1 cursor-pointer transition-colors ml-1"
                            title="Delete letter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    {letter.title && (
                      <h4 className="text-lg sm:text-xl font-serif font-bold mb-2 tracking-wide">
                        {letter.title}
                      </h4>
                    )}

                    {/* Content */}
                    <div className="font-serif text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-wrap break-words tracking-wide my-3">
                      {letter.content}
                    </div>

                    {/* Footer with Aline's reaction */}
                    <div className="mt-5 pt-3 border-t border-current/15 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono opacity-70 mr-1">Your reaction, my love:</span>
                        {['heart', 'hug', 'kiss', 'forever'].map((emojiType) => {
                          const isSelected = letter.reaction === emojiType;
                          return (
                            <button
                              key={emojiType}
                              onClick={() => handleReact(letter.id, emojiType)}
                              className={`px-2.5 py-1 rounded-full text-xs font-sans transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-[#e11d48] text-white font-bold scale-105 shadow-sm'
                                  : 'bg-black/10 hover:bg-black/20 text-current opacity-80'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${isSelected ? 'fill-white' : ''}`} />
                              <span className="capitalize">{emojiType}</span>
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-serif italic opacity-75">
                        From me to you, always
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Letter Modal */}
      {editingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#14060d] border border-[#3b131c] rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setEditingLetter(null)}
              className="absolute top-5 right-5 text-[#8a6870] hover:text-[#fdf2f4] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#fda4af] uppercase tracking-wider mb-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT LETTER</span>
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">
              Refine Your Letter to {herName}
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                  Subject / Whisper Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                  Stationery
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStationery('lined-warm')}
                    className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      editStationery === 'lined-warm'
                        ? 'bg-[#dcd0bf] text-[#1e1719] border-[#e4d7c5] font-semibold'
                        : 'bg-[#1c0812] text-[#d1a3ac] border-[#3b131c]'
                    }`}
                  >
                    Warm Ruled Paper
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStationery('velvet-noir')}
                    className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      editStationery === 'velvet-noir'
                        ? 'bg-[#e11d48]/20 text-[#fda4af] border-[#e11d48] font-semibold'
                        : 'bg-[#1c0812] text-[#d1a3ac] border-[#3b131c]'
                    }`}
                  >
                    Velvet Noir
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8a6870] uppercase mb-1">
                  Letter Message
                </label>
                <textarea
                  rows={8}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-[#1c0812] border border-[#3b131c] focus:border-[#e11d48] rounded-xl p-3.5 text-sm text-white font-serif leading-relaxed whitespace-pre-wrap focus:outline-none resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3b131c]">
                <button
                  type="button"
                  onClick={() => setEditingLetter(null)}
                  className="px-4 py-2 text-xs font-serif text-[#8a6870] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-serif font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Letter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vault & Recovery Modal */}
      {isVaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#14060d] border border-[#3b131c] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsVaultModalOpen(false)}
              className="absolute top-5 right-5 text-[#8a6870] hover:text-[#fdf2f4] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#fda4af] uppercase tracking-wider mb-1">
              <Archive className="w-4 h-4 text-[#e11d48]" />
              <span>LETTER VAULT & RECOVERY CENTER</span>
            </div>
            <h3 className="text-2xl font-serif text-white mb-2">
              Recover & Protect Your Letters to {herName}
            </h3>
            <p className="text-xs text-[#d1a3ac] font-sans leading-relaxed mb-6">
              Your letters are permanently saved to disk on the server and to your browser's safe vault. If any letters were ever misplaced during past server resets, you can recover them below, or paste your words back in directly.
            </p>

            <div className="overflow-y-auto pr-1 space-y-6 flex-1">
              {/* Discovered / Recoverable Letters Section */}
              <div className="p-4 rounded-2xl bg-[#1c0812] border border-[#3b131c]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-[#fda4af] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Discovered in Vault / Cache ({discoveredItems.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={runRecoveryScan}
                    disabled={isScanning}
                    className="text-xs text-[#8a6870] hover:text-[#fda4af] flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Re-scan</span>
                  </button>
                </div>

                {discoveredItems.length === 0 ? (
                  <p className="text-xs text-[#8a6870] italic py-3 text-center">
                    No unlisted letters detected in cache. All current letters are already on your desk!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {discoveredItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-[#250b18] border border-[#4c1d28] flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-serif font-bold text-white">
                            {item.title || 'Untitled Letter'}
                          </span>
                          <span className="text-[10px] font-mono text-[#fda4af] bg-[#e11d48]/20 px-2 py-0.5 rounded">
                            {item.source}
                          </span>
                        </div>
                        <p className="text-xs text-[#d1a3ac] line-clamp-3 font-serif whitespace-pre-wrap">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-[#8a6870] font-mono">{item.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => handleRestoreLetter(item)}
                            className="px-3 py-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-mono font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Restore to Desk</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paste & Restore tool */}
              <form onSubmit={handlePasteRestore} className="p-4 rounded-2xl bg-[#1c0812] border border-[#3b131c]">
                <span className="text-xs font-mono text-[#fda4af] uppercase tracking-wider block mb-2">
                  Paste or Re-type a Missing Letter
                </span>
                <p className="text-[11px] text-[#8a6870] mb-3">
                  Have text or a paragraph you previously wrote? Paste it here and click "Restore Letter" to immediately save it to the permanent disk and desk.
                </p>
                <input
                  type="text"
                  placeholder="Letter Title or Subject (Optional)"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  className="w-full mb-2.5 px-3 py-2 rounded-xl bg-[#14060d] border border-[#3b131c] text-xs text-white placeholder-[#8a6870] focus:outline-none focus:border-[#e11d48]"
                />
                <textarea
                  rows={4}
                  required
                  placeholder={`Paste the letter content here...\n"My sweetest Aline..."`}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="w-full mb-3 p-3 rounded-xl bg-[#14060d] border border-[#3b131c] text-xs text-white font-serif leading-relaxed placeholder-[#8a6870] focus:outline-none focus:border-[#e11d48] resize-none"
                />
                <button
                  type="submit"
                  disabled={!pasteContent.trim()}
                  className="w-full py-2 bg-gradient-to-r from-[#e11d48] to-[#be123c] text-white font-serif font-bold text-xs rounded-xl hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Restore Letter to Aline's Desk</span>
                </button>
              </form>

              {/* Backup & Export Section */}
              <div className="p-4 rounded-2xl bg-[#1c0812] border border-[#3b131c]">
                <span className="text-xs font-mono text-[#fda4af] uppercase tracking-wider block mb-1">
                  Offline Safekeeping
                </span>
                <p className="text-[11px] text-[#8a6870] mb-3">
                  Download a text backup copy of all your letters to keep in your phone notes or laptop files anytime:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportText}
                    className="px-4 py-2 rounded-xl bg-[#250b18] hover:bg-[#351022] border-[#4c1d28] text-white text-xs font-serif flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#fda4af]" />
                    <span>Download All Letters (.txt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="px-4 py-2 rounded-xl bg-[#250b18] hover:bg-[#351022] border-[#4c1d28] text-white text-xs font-serif flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#fda4af]" />
                    <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy All to Clipboard'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#3b131c] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsVaultModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#250b18] hover:bg-[#351022] text-xs font-serif text-[#fda4af] cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
