// ─── EMBER Game Store (Zustand) ───
// Production-ready state management with all CRUD operations.

import { create } from 'zustand';
import type {
  Quest,
  Questline,
  VitalityLog,
  VitalityTier,
  SizeTier,
  DenItem,
  EmberState,
  FocusSession,
} from './types';
import {
  SIZE_TIER_MOMENTUM,
  QUEST_TEMPLATES,
  VITALITY_CONFIG,
  MOMENTUM_PER_LEVEL,
  DEN_ITEM_POOL,
} from './types';
import { localStorageAdapter } from './persistence';

// ─── Helpers ───

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// Compute vitality from the last 3 days (more forgiving than 2)
function computeVitalityTier(logs: VitalityLog[]): VitalityTier {
  const today = new Date();
  const recentDates: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    recentDates.push(d.toISOString().split('T')[0]);
  }

  const relevantLogs = logs.filter((l) => recentDates.includes(l.date));

  if (relevantLogs.length === 0) return 'empty';

  const totalActions = relevantLogs.reduce((sum, log) => {
    return (
      sum +
      (log.slept ? 1 : 0) +
      (log.moved ? 1 : 0) +
      (log.ateWell ? 1 : 0) +
      (log.socialized ? 1 : 0)
    );
  }, 0);

  const avg = totalActions / relevantLogs.length;

  if (avg >= 4) return 'zone';
  if (avg >= 3) return 'steady';
  if (avg >= 1) return 'low';
  return 'empty';
}

function getRandomDenItem(questlineTitle: string): DenItem {
  // Weighted random: common 60%, rare 30%, epic 10%
  const roll = Math.random();
  let pool: typeof DEN_ITEM_POOL;
  if (roll < 0.1) {
    pool = DEN_ITEM_POOL.filter((i) => i.rarity === 'epic');
  } else if (roll < 0.4) {
    pool = DEN_ITEM_POOL.filter((i) => i.rarity === 'rare');
  } else {
    pool = DEN_ITEM_POOL.filter((i) => i.rarity === 'common');
  }
  const item = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...item,
    id: generateId(),
    unlockedAt: new Date().toISOString(),
    questlineTitle,
  };
}

// Clean up vitality logs older than 30 days to prevent localStorage bloat
function pruneVitalityLogs(logs: VitalityLog[]): VitalityLog[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return logs.filter((l) => l.date >= cutoffStr);
}

// ─── Store Interface ───

interface EmberStore extends EmberState {
  // Computed
  vitalityTier: VitalityTier;
  vitalityMultiplier: number;
  vitalityLabel: string;
  todayLog: VitalityLog;

  // Quest actions
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt'>) => void;
  addStandaloneQuest: (title: string, dueDate: string, estimatedMinutes: number) => void;
  completeQuest: (questId: string, focusTimeSpent?: number) => { momentum: number; multiplier: number } | null;
  deleteQuest: (questId: string) => void;
  editQuest: (questId: string, updates: Partial<Pick<Quest, 'title' | 'dueDate' | 'estimatedMinutes'>>) => void;

  // Questline actions
  createQuestline: (title: string, dueDate: string, sizeTier: SizeTier, customQuests?: { title: string; estimatedMinutes: number }[]) => string;
  getQuestline: (id: string) => Questline | undefined;
  getQuestlineQuests: (questlineId: string) => Quest[];
  deleteQuestline: (id: string) => void;
  editQuestline: (id: string, updates: Partial<Pick<Questline, 'title' | 'dueDate'>>) => void;

  // Vitality actions
  toggleRecovery: (action: 'slept' | 'moved' | 'ateWell' | 'socialized') => void;

  // Focus Session
  focusSession: FocusSession | null;
  startFocusSession: (questId: string) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  completeFocusSession: () => { momentum: number; multiplier: number } | null;
  cancelFocusSession: () => void;

  // Celebration state
  celebrationItem: DenItem | null;
  setCelebrationItem: (item: DenItem | null) => void;

  // Momentum popup
  lastMomentumGain: { amount: number; multiplier: number; questTitle: string } | null;
  clearMomentumGain: () => void;

  // Player name & Auth
  setPlayerName: (name: string) => void;
  login: (name: string, email: string) => void;
  logout: () => void;

  // Data management
  importGameData: (state: EmberState) => void;

  // Reset
  resetGame: () => void;
}

const DEFAULT_STATE: EmberState = {
  player: {
    momentumTotal: 0,
    level: 1,
    denItems: [],
    name: '',
    email: '',
    isAuthenticated: false,
    integrity: 100,
  },
  quests: [],
  questlines: [],
  vitalityLogs: [],
};

function getInitialState(): EmberState {
  const saved = localStorageAdapter.load();
  if (saved) {
    // Migrate old saves that lack newer fields
    if (typeof saved.player.name !== 'string') saved.player.name = '';
    if (typeof saved.player.email !== 'string') saved.player.email = '';
    if (typeof saved.player.isAuthenticated !== 'boolean') saved.player.isAuthenticated = false;
    if (typeof saved.player.integrity !== 'number') saved.player.integrity = 100;
    // Migrate old quests that lack estimatedMinutes
    saved.quests = saved.quests.map((q) => ({
      ...q,
      estimatedMinutes: q.estimatedMinutes || 25,
    }));
    // Prune old vitality logs
    saved.vitalityLogs = pruneVitalityLogs(saved.vitalityLogs || []);
    return saved;
  }
  return { ...DEFAULT_STATE };
}

function persist(state: EmberState) {
  localStorageAdapter.save({
    player: state.player,
    quests: state.quests,
    questlines: state.questlines,
    vitalityLogs: state.vitalityLogs,
  });
}

export const useEmberStore = create<EmberStore>((set, get) => {
  const initial = getInitialState();
  const initialTier = computeVitalityTier(initial.vitalityLogs);
  const today = todayStr();
  const existingTodayLog = initial.vitalityLogs.find((l) => l.date === today);

  return {
    ...initial,

    // Computed vitality
    vitalityTier: initialTier,
    vitalityMultiplier: VITALITY_CONFIG[initialTier].multiplier,
    vitalityLabel: VITALITY_CONFIG[initialTier].label,
    todayLog: existingTodayLog || { date: today, slept: false, moved: false, ateWell: false, socialized: false },

    // Focus Session
    focusSession: null,

    // Celebration
    celebrationItem: null,
    setCelebrationItem: (item) => set({ celebrationItem: item }),

    // Momentum popup
    lastMomentumGain: null,
    clearMomentumGain: () => set({ lastMomentumGain: null }),

    // ─── Quest Actions ───

    addQuest: (questData) => {
      const quest: Quest = {
        ...questData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const newState = { ...state, quests: [...state.quests, quest] };
        persist(newState);
        return newState;
      });
    },

    addStandaloneQuest: (title, dueDate, estimatedMinutes) => {
      const quest: Quest = {
        id: generateId(),
        title: title.trim(),
        questlineId: null,
        dueDate,
        sizeTier: 'small',
        momentumValue: SIZE_TIER_MOMENTUM['small'],
        estimatedMinutes: Math.max(5, estimatedMinutes),
        status: 'todo',
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const newState = { ...state, quests: [...state.quests, quest] };
        persist(newState);
        return newState;
      });
    },

    completeQuest: (questId, focusTimeSpent) => {
      const state = get();
      const quest = state.quests.find((q) => q.id === questId);
      if (!quest || quest.status === 'done') return null;

      const multiplier = state.vitalityMultiplier;
      const momentum = Math.round(quest.momentumValue * multiplier);
      const newMomentumTotal = state.player.momentumTotal + momentum;
      const newLevel = Math.floor(newMomentumTotal / MOMENTUM_PER_LEVEL) + 1;

      const updatedQuests = state.quests.map((q) =>
        q.id === questId
          ? {
              ...q,
              status: 'done' as const,
              completedAt: new Date().toISOString(),
              focusTimeSpent: focusTimeSpent ?? q.focusTimeSpent,
            }
          : q
      );

      // Update questline HP if this quest belongs to one
      let updatedQuestlines = state.questlines;
      let newCelebrationItem: DenItem | null = null;
      let updatedDenItems = state.player.denItems;

      if (quest.questlineId) {
        updatedQuestlines = state.questlines.map((ql) => {
          if (ql.id !== quest.questlineId) return ql;
          const newHp = Math.max(0, ql.hpCurrent - quest.momentumValue);
          const allQuestsDone = updatedQuests
            .filter((q) => q.questlineId === ql.id)
            .every((q) => q.status === 'done');

          if (allQuestsDone && !ql.completed) {
            // Boss defeated! Generate loot
            newCelebrationItem = getRandomDenItem(ql.title);
            updatedDenItems = [...state.player.denItems, newCelebrationItem];
          }

          return {
            ...ql,
            hpCurrent: newHp,
            completed: allQuestsDone,
          };
        });
      }

      const newState = {
        quests: updatedQuests,
        questlines: updatedQuestlines,
        player: {
          ...state.player,
          momentumTotal: newMomentumTotal,
          level: newLevel,
          denItems: updatedDenItems,
        },
        celebrationItem: newCelebrationItem,
        lastMomentumGain: {
          amount: momentum,
          multiplier,
          questTitle: quest.title,
        },
      };

      set(newState);
      persist({ ...state, ...newState });

      return { momentum, multiplier };
    },

    deleteQuest: (questId) => {
      set((state) => {
        const quest = state.quests.find((q) => q.id === questId);
        const newQuests = state.quests.filter((q) => q.id !== questId);

        let updatedQuestlines = state.questlines;
        if (quest?.questlineId) {
          updatedQuestlines = state.questlines.map((ql) => {
            if (ql.id !== quest.questlineId) return ql;
            const remainingIds = ql.questIds.filter((id) => id !== questId);
            const remainingQuests = newQuests.filter((q) => remainingIds.includes(q.id));
            const newHpMax = remainingQuests.reduce((s, q) => s + q.momentumValue, 0);
            const newHpCurrent = remainingQuests
              .filter((q) => q.status === 'todo')
              .reduce((s, q) => s + q.momentumValue, 0);
            return { ...ql, questIds: remainingIds, hpMax: newHpMax, hpCurrent: newHpCurrent };
          });
        }

        const newState = { ...state, quests: newQuests, questlines: updatedQuestlines };
        persist(newState);
        return newState;
      });
    },

    editQuest: (questId, updates) => {
      set((state) => {
        const newQuests = state.quests.map((q) => {
          if (q.id !== questId) return q;
          return {
            ...q,
            ...(updates.title !== undefined && { title: updates.title.trim() }),
            ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
            ...(updates.estimatedMinutes !== undefined && { estimatedMinutes: Math.max(5, updates.estimatedMinutes) }),
          };
        });

        // If due date changed and quest belongs to a questline, update questline due date too
        const quest = state.quests.find((q) => q.id === questId);
        let newQuestlines = state.questlines;
        if (quest?.questlineId && updates.dueDate) {
          newQuestlines = state.questlines.map((ql) =>
            ql.id === quest.questlineId ? { ...ql, dueDate: updates.dueDate! } : ql
          );
        }

        const newState = { ...state, quests: newQuests, questlines: newQuestlines };
        persist(newState);
        return newState;
      });
    },

    // ─── Questline Actions ───

    createQuestline: (title, dueDate, sizeTier, customQuests) => {
      const questlineId = generateId();
      const templates = customQuests || QUEST_TEMPLATES[sizeTier].map((t) => ({ title: t.title, estimatedMinutes: t.estimatedMinutes }));
      const momentumPerQuest = SIZE_TIER_MOMENTUM[sizeTier];

      const quests: Quest[] = templates.map((template) => ({
        id: generateId(),
        title: template.title,
        questlineId,
        dueDate,
        sizeTier,
        momentumValue: momentumPerQuest,
        estimatedMinutes: template.estimatedMinutes,
        status: 'todo' as const,
        createdAt: new Date().toISOString(),
      }));

      const totalHp = quests.reduce((s, q) => s + q.momentumValue, 0);

      const questline: Questline = {
        id: questlineId,
        title,
        dueDate,
        sizeTier,
        questIds: quests.map((q) => q.id),
        hpMax: totalHp,
        hpCurrent: totalHp,
        completed: false,
      };

      set((state) => {
        const newState = {
          ...state,
          quests: [...state.quests, ...quests],
          questlines: [...state.questlines, questline],
        };
        persist(newState);
        return newState;
      });

      return questlineId;
    },

    getQuestline: (id) => get().questlines.find((ql) => ql.id === id),

    getQuestlineQuests: (questlineId) =>
      get().quests.filter((q) => q.questlineId === questlineId),

    deleteQuestline: (id) => {
      set((state) => {
        const ql = state.questlines.find((q) => q.id === id);
        if (!ql) return state;
        const newQuests = state.quests.filter((q) => q.questlineId !== id);
        const newQuestlines = state.questlines.filter((q) => q.id !== id);
        const newState = { ...state, quests: newQuests, questlines: newQuestlines };
        persist(newState);
        return newState;
      });
    },

    editQuestline: (id, updates) => {
      set((state) => {
        const newQuestlines = state.questlines.map((ql) => {
          if (ql.id !== id) return ql;
          return {
            ...ql,
            ...(updates.title !== undefined && { title: updates.title.trim() }),
            ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
          };
        });

        // If due date changed, update all quests in this questline too
        let newQuests = state.quests;
        if (updates.dueDate) {
          newQuests = state.quests.map((q) =>
            q.questlineId === id ? { ...q, dueDate: updates.dueDate! } : q
          );
        }

        const newState = { ...state, questlines: newQuestlines, quests: newQuests };
        persist(newState);
        return newState;
      });
    },

    // ─── Focus Session Actions ───

    startFocusSession: (questId) => {
      const state = get();
      const quest = state.quests.find((q) => q.id === questId);
      if (!quest || quest.status === 'done') return;

      const session: FocusSession = {
        questId,
        questTitle: quest.title,
        startedAt: Date.now(),
        estimatedSeconds: quest.estimatedMinutes * 60,
        isPaused: false,
        totalPausedMs: 0,
      };

      set({ focusSession: session });
    },

    pauseFocusSession: () => {
      set((state) => {
        if (!state.focusSession || state.focusSession.isPaused) return state;
        return {
          focusSession: {
            ...state.focusSession,
            isPaused: true,
            pausedAt: Date.now(),
          },
        };
      });
    },

    resumeFocusSession: () => {
      set((state) => {
        if (!state.focusSession || !state.focusSession.isPaused || !state.focusSession.pausedAt) return state;
        const pausedDuration = Date.now() - state.focusSession.pausedAt;
        return {
          focusSession: {
            ...state.focusSession,
            isPaused: false,
            pausedAt: undefined,
            totalPausedMs: state.focusSession.totalPausedMs + pausedDuration,
          },
        };
      });
    },

    completeFocusSession: () => {
      const state = get();
      if (!state.focusSession) return null;

      const { questId, startedAt, totalPausedMs, isPaused, pausedAt } = state.focusSession;
      let finalPausedMs = totalPausedMs;
      if (isPaused && pausedAt) {
        finalPausedMs += Date.now() - pausedAt;
      }
      const activeMs = Date.now() - startedAt - finalPausedMs;
      const focusTimeSpent = Math.round(activeMs / 1000);

      const result = get().completeQuest(questId, focusTimeSpent);
      set({ focusSession: null });
      return result;
    },

    cancelFocusSession: () => {
      set({ focusSession: null });
    },

    // ─── Vitality Actions ───

    toggleRecovery: (action) => {
      const today = todayStr();
      set((state) => {
        const existingIdx = state.vitalityLogs.findIndex((l) => l.date === today);
        let updatedLogs: VitalityLog[];
        let newIntegrity = state.player.integrity;

        if (existingIdx >= 0) {
          const isCurrentlyActive = state.vitalityLogs[existingIdx][action];
          
          // "Honest Reset" mechanic: if turning OFF, boost integrity by 2
          if (isCurrentlyActive) {
            newIntegrity = Math.min(100, newIntegrity + 2);
          }

          updatedLogs = state.vitalityLogs.map((l, i) =>
            i === existingIdx ? { ...l, [action]: !isCurrentlyActive } : l
          );
        } else {
          const newLog: VitalityLog = {
            date: today,
            slept: false,
            moved: false,
            ateWell: false,
            socialized: false,
            [action]: true,
          };
          updatedLogs = [...state.vitalityLogs, newLog];
        }

        const newTier = computeVitalityTier(updatedLogs);
        const todayLog = updatedLogs.find((l) => l.date === today)!;

        const newState = {
          ...state,
          player: {
            ...state.player,
            integrity: newIntegrity,
          },
          vitalityLogs: updatedLogs,
          vitalityTier: newTier,
          vitalityMultiplier: VITALITY_CONFIG[newTier].multiplier,
          vitalityLabel: VITALITY_CONFIG[newTier].label,
          todayLog,
        };
        persist(newState);
        return newState;
      });
    },

    // ─── Player Name & Auth ───

    setPlayerName: (name) => {
      set((state) => {
        const newState = { ...state, player: { ...state.player, name } };
        persist(newState);
        return newState;
      });
    },

    login: (name, email) => {
      set((state) => {
        const newState = { ...state, player: { ...state.player, name, email, isAuthenticated: true } };
        persist(newState);
        return newState;
      });
    },

    logout: () => {
      set((state) => {
        const newState = { ...state, player: { ...state.player, isAuthenticated: false } };
        persist(newState);
        return newState;
      });
    },

    // ─── Data Management ───

    importGameData: (importedState) => {
      // Validate and migrate imported data
      const migrated: EmberState = {
        player: {
          ...importedState.player,
          name: importedState.player.name || '',
          email: importedState.player.email || '',
          isAuthenticated: true,
          integrity: importedState.player.integrity ?? 100,
        },
        quests: (importedState.quests || []).map((q) => ({
          ...q,
          estimatedMinutes: q.estimatedMinutes || 25,
        })),
        questlines: importedState.questlines || [],
        vitalityLogs: pruneVitalityLogs(importedState.vitalityLogs || []),
      };

      const tier = computeVitalityTier(migrated.vitalityLogs);
      const today = todayStr();
      const todayLog = migrated.vitalityLogs.find((l) => l.date === today) || {
        date: today, slept: false, moved: false, ateWell: false, socialized: false,
      };

      persist(migrated);
      set({
        ...migrated,
        vitalityTier: tier,
        vitalityMultiplier: VITALITY_CONFIG[tier].multiplier,
        vitalityLabel: VITALITY_CONFIG[tier].label,
        todayLog,
        focusSession: null,
        celebrationItem: null,
        lastMomentumGain: null,
      });
    },

    // ─── Reset ───

    resetGame: () => {
      localStorageAdapter.clear();
      const tier = computeVitalityTier([]);
      set({
        ...DEFAULT_STATE,
        vitalityTier: tier,
        vitalityMultiplier: VITALITY_CONFIG[tier].multiplier,
        vitalityLabel: VITALITY_CONFIG[tier].label,
        todayLog: { date: todayStr(), slept: false, moved: false, ateWell: false, socialized: false },
        celebrationItem: null,
        lastMomentumGain: null,
        focusSession: null,
      });
    },
  };
});
