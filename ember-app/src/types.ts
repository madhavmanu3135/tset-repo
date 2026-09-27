// ─── EMBER Data Model ───
// Structured for easy swap to Supabase/Firebase later

export type SizeTier = 'small' | 'medium' | 'large';
export type QuestStatus = 'todo' | 'done';
export type VitalityTier = 'zone' | 'steady' | 'low' | 'empty';

export interface Quest {
  id: string;
  title: string;
  questlineId: string | null;
  dueDate: string; // ISO date string
  sizeTier: SizeTier;
  momentumValue: number;
  estimatedMinutes: number; // time estimate for focus sessions
  status: QuestStatus;
  createdAt: string;
  completedAt?: string; // ISO timestamp when completed
  focusTimeSpent?: number; // actual seconds spent in focus sessions
}

export interface Questline {
  id: string;
  title: string;
  dueDate: string;
  sizeTier: SizeTier;
  questIds: string[];
  hpMax: number;
  hpCurrent: number;
  completed: boolean;
}

export interface VitalityLog {
  date: string; // YYYY-MM-DD
  slept: boolean;
  moved: boolean;
  ateWell: boolean;
  socialized: boolean;
}

export interface DenItem {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic';
  unlockedAt: string;
  questlineTitle: string;
}

export interface Player {
  momentumTotal: number;
  level: number;
  denItems: DenItem[];
  name: string;
  email: string;
  isAuthenticated: boolean;
  integrity: number;
}

export interface FocusSession {
  questId: string;
  questTitle: string;
  startedAt: number; // timestamp
  estimatedSeconds: number;
  isPaused: boolean;
  pausedAt?: number; // timestamp when paused
  totalPausedMs: number; // total ms spent paused
}

export interface EmberState {
  player: Player;
  quests: Quest[];
  questlines: Questline[];
  vitalityLogs: VitalityLog[];
}

// ─── Constants ───

export const SIZE_TIER_MOMENTUM: Record<SizeTier, number> = {
  small: 20,
  medium: 35,
  large: 50,
};

// Each template quest now has { title, estimatedMinutes }
export interface QuestTemplate {
  title: string;
  estimatedMinutes: number;
}

export const QUEST_TEMPLATES: Record<SizeTier, QuestTemplate[]> = {
  small: [
    { title: 'Research & gather materials', estimatedMinutes: 20 },
    { title: 'Complete & submit', estimatedMinutes: 25 },
  ],
  medium: [
    { title: 'Skim source material', estimatedMinutes: 25 },
    { title: 'Draft outline', estimatedMinutes: 20 },
    { title: 'Write first draft', estimatedMinutes: 40 },
    { title: 'Review & submit', estimatedMinutes: 30 },
  ],
  large: [
    { title: 'Skim source material', estimatedMinutes: 30 },
    { title: 'Draft outline', estimatedMinutes: 25 },
    { title: 'First pass — rough draft', estimatedMinutes: 45 },
    { title: 'Second pass — refine', estimatedMinutes: 40 },
    { title: 'Final review & submit', estimatedMinutes: 30 },
  ],
};

export const VITALITY_CONFIG: Record<VitalityTier, { label: string; multiplier: number; color: string }> = {
  zone: { label: 'In the Zone', multiplier: 2.0, color: 'text-ember-500' },
  steady: { label: 'Steady', multiplier: 1.5, color: 'text-yellow-400' },
  low: { label: 'Running Low', multiplier: 1.0, color: 'text-surface-400' },
  empty: { label: 'Running on Empty', multiplier: 0.5, color: 'text-red-400' },
};

export const MOMENTUM_PER_LEVEL = 200;

export const DEN_ITEM_POOL: Omit<DenItem, 'id' | 'unlockedAt' | 'questlineTitle'>[] = [
  { name: 'Cozy Lamp', emoji: '💡', rarity: 'common' },
  { name: 'Stack of Books', emoji: '📚', rarity: 'common' },
  { name: 'Potted Plant', emoji: '🌿', rarity: 'common' },
  { name: 'Coffee Mug', emoji: '☕', rarity: 'common' },
  { name: 'Cat Plushie', emoji: '🐱', rarity: 'common' },
  { name: 'Scented Candle', emoji: '🕯️', rarity: 'common' },
  { name: 'Vinyl Player', emoji: '🎵', rarity: 'rare' },
  { name: 'Telescope', emoji: '🔭', rarity: 'rare' },
  { name: 'Globe', emoji: '🌍', rarity: 'rare' },
  { name: 'Crystal Ball', emoji: '🔮', rarity: 'rare' },
  { name: 'Gaming Console', emoji: '🎮', rarity: 'rare' },
  { name: 'Golden Trophy', emoji: '🏆', rarity: 'epic' },
  { name: 'Dragon Figurine', emoji: '🐉', rarity: 'epic' },
  { name: 'Enchanted Scroll', emoji: '📜', rarity: 'epic' },
  { name: 'Phoenix Feather', emoji: '🪶', rarity: 'epic' },
];

// ─── Time Formatting Helpers ───

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
