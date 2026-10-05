export type BucketCategory = 'movies' | 'cozy' | 'firsts' | 'adventures' | 'food' | 'aline';

export interface BucketListItem {
  id: string;
  title: string;
  category: BucketCategory;
  note: string;
  completed: boolean;
  isPriority: boolean;
  addedBy: 'Jazz' | 'Aline';
  dateAdded: string;
}

export interface InteractiveWord {
  word: string;
  whisper: string;
}

export interface Poem {
  id: string;
  title: string;
  dateWritten: string;
  dedication: string;
  stanzas: string[];
  interactiveWords: InteractiveWord[];
  themeColor?: string;
}

export interface SealedLetter {
  id: string;
  prompt: string;
  isAnniversaryLetter?: boolean;
  lockedUntilDate?: string; // YYYY-MM-DD
  opened: boolean;
  waxColor: 'rose' | 'gold' | 'sapphire' | 'emerald';
  title: string;
  content: string[];
  signature: string;
  postScript?: string;
  photoUrl?: string; // Camera snapshot / draft photo
  cameraCaption?: string;
}

export interface ConstellationStar {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number;
  secretMemory: string;
  discovered: boolean;
}

export interface LiveLetter {
  id: string;
  title: string;
  content: string;
  author: 'Jazz' | 'Aline';
  timestamp: string; // e.g. "Sep 9, 2026   8:16 PM"
  isoDate: string;
  readByRecipient: boolean;
  readAt?: string; // e.g. "Seen by Aline on Sep 9 at 8:20 PM"
  reaction?: string;
  stationery?: 'lined-warm' | 'velvet-noir';
  photoUrl?: string; // Camera snapshot / draft photo
  cameraCaption?: string;
}

export interface AnniversaryConfig {
  herName: string;
  herPetName: string;
  hisName: string;
  anniversaryDate: string; // ISO date string e.g. "2026-09-29T11:00:00"
  unlockDateTime: string; // Time lock for Aline e.g. "2026-09-29T11:00:00"
  herCity: string;
  herTimezoneOffsetHours: number; // relative to UTC or difference
  hisCity: string;
  hisTimezoneOffsetHours: number;
  sharedSongOrQuote: string;
  totalHeartbeatsSent: number;
  themePalette?: 'soft-red' | 'midnight-sky';
  secretPasscode?: string; // Aline's early access passcode
  creatorPasscode?: string; // Jazz's master passcode to edit anytime
  isSealed: boolean; // Whether the sanctuary is locked for Aline
}
