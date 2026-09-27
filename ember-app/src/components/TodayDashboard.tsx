// ─── Today Dashboard ───
// The primary screen students see. Key fixes:
// 1. "Today's Queue" now shows overdue + due today + due tomorrow (not ALL quests)
// 2. Workload metrics are meaningful (today-scoped, not all-time)
// 3. Level progress bar added
// 4. Quick task creation inline
// 5. Better onboarding for new users

import { useState } from 'react';
import { useEmberStore } from '../store';
import { formatMinutes, MOMENTUM_PER_LEVEL } from '../types';
import type { VitalityTier } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface TodayDashboardProps {
  onStartFocus: (questId: string) => void;
  onNavigateToQuestline: (id: string) => void;
  onNavigateToNewQuestline: () => void;
}

const TIER_COLORS: Record<VitalityTier, string> = {
  zone: 'text-ember-500',
  steady: 'text-yellow-400',
  low: 'text-surface-400',
  empty: 'text-red-400',
};

export default function TodayDashboard({ onStartFocus, onNavigateToQuestline, onNavigateToNewQuestline }: TodayDashboardProps) {
  const { player, quests, questlines, vitalityTier, vitalityLabel, vitalityMultiplier, todayLog, toggleRecovery, logout, addStandaloneQuest } = useEmberStore();
  
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickMinutes, setQuickMinutes] = useState(25);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Get time of day for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Properly scoped "Today" quests ──
  // Show: overdue + due today + due tomorrow (actionable now)
  const now = Date.now();
  const todayDateStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDateStr = tomorrowDate.toISOString().split('T')[0];

  const todayRelevantQuests = quests
    .filter((q) => {
      if (q.status !== 'todo') return false;
      const dueStr = q.dueDate.split('T')[0];
      // Overdue, due today, or due tomorrow
      return dueStr <= tomorrowDateStr;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Future quests (due after tomorrow)
  const futureQuestCount = quests.filter((q) => {
    if (q.status !== 'todo') return false;
    const dueStr = q.dueDate.split('T')[0];
    return dueStr > tomorrowDateStr;
  }).length;

  const completedToday = quests.filter(
    (q) => q.status === 'done' && q.completedAt && q.completedAt.startsWith(todayDateStr)
  );

  // Workload calculations — scoped to today-relevant quests only
  const todayPlannedMin = todayRelevantQuests.reduce((s, q) => s + q.estimatedMinutes, 0);
  const completedTodayMin = completedToday.reduce((s, q) => s + q.estimatedMinutes, 0);

  // Next quest to focus on
  const nextQuest = todayRelevantQuests[0] || null;

  // Urgency flags
  const overdueQuests = todayRelevantQuests.filter((q) => {
    const due = new Date(q.dueDate).getTime();
    return due < now;
  });

  const urgentQuests = todayRelevantQuests.filter((q) => {
    const due = new Date(q.dueDate).getTime();
    const hoursLeft = (due - now) / (1000 * 60 * 60);
    return hoursLeft <= 48 && hoursLeft > 0;
  });

  // Recovery count for today
  const recoveryCount = (todayLog.slept ? 1 : 0) + (todayLog.moved ? 1 : 0) + (todayLog.ateWell ? 1 : 0) + (todayLog.socialized ? 1 : 0);

  // Level progress
  const currentLevelMomentum = player.momentumTotal % MOMENTUM_PER_LEVEL;
  const levelProgress = (currentLevelMomentum / MOMENTUM_PER_LEVEL) * 100;

  const RECOVERY_ACTIONS = [
    { key: 'slept' as const, emoji: '😴', label: 'Sleep' },
    { key: 'moved' as const, emoji: '🏃', label: 'Move' },
    { key: 'ateWell' as const, emoji: '🥗', label: 'Eat' },
    { key: 'socialized' as const, emoji: '💬', label: 'Talk' },
  ];

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;
    // Default due date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    addStandaloneQuest(quickTitle, tomorrow.toISOString().split('T')[0], quickMinutes);
    setQuickTitle('');
    setQuickMinutes(25);
    setShowQuickAdd(false);
  };

  return (
    <div className="space-y-4 pt-2 animate-fade-in">
      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign out?"
          message="Your data will remain saved on this device. You can sign back in anytime."
          confirmLabel="Sign Out"
          cancelLabel="Stay"
          variant="warning"
          onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {/* Greeting + Vitality + Level */}
      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-surface-100">
              {greeting}{player.name ? `, ${player.name}` : ''}
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div className="text-right">
              <p className={`text-xs font-semibold uppercase tracking-wider ${TIER_COLORS[vitalityTier]}`}>
                {vitalityLabel}
              </p>
              <p className={`text-sm font-bold font-mono ${TIER_COLORS[vitalityTier]}`}>
                ×{vitalityMultiplier.toFixed(1)}
              </p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="ml-2 p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-surface-800 transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-surface-400">Level {player.level}</span>
            <span className="text-[10px] font-mono text-surface-500">{currentLevelMomentum} / {MOMENTUM_PER_LEVEL} MOM</span>
          </div>
          <div className="h-1.5 bg-surface-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-ember-500/80 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Recovery Check-in */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {RECOVERY_ACTIONS.map((action) => {
            const isActive = todayLog[action.key];
            
            if (isActive) {
              return (
                <div key={action.key} className="p-2.5 rounded-lg bg-ember-500/10 border border-ember-500/20 text-xs flex flex-col gap-1.5 transition-all">
                  <div className="flex items-center gap-1.5 text-ember-400 font-medium">
                    <span>{action.emoji}</span> <span>{action.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-surface-400">
                    <svg className="w-3 h-3 text-ember-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Self-reported
                  </div>
                  <button 
                    onClick={() => toggleRecovery(action.key)}
                    className="text-[10px] text-surface-500 hover:text-surface-300 text-left underline decoration-surface-700 underline-offset-2 w-fit mt-0.5 transition-colors"
                  >
                    Actually, I didn't
                  </button>
                </div>
              );
            }
            
            return (
              <button
                key={action.key}
                onClick={() => toggleRecovery(action.key)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs bg-surface-800/40 border border-surface-700/20 text-surface-500 hover:border-surface-600/50 transition-all duration-300 active:scale-95"
              >
                <span className="text-sm">{action.emoji}</span>
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workload Summary — now properly scoped to today */}
      <div className="card-glass p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-3">
          Today's Workload
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-bold font-mono text-surface-100">{todayRelevantQuests.length}</p>
            <p className="text-[10px] text-surface-500 mt-0.5">To Do</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-mono text-hp-green">{completedToday.length}</p>
            <p className="text-[10px] text-surface-500 mt-0.5">Done Today</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold font-mono ${todayPlannedMin > 0 ? 'text-surface-100' : 'text-hp-green'}`}>
              {formatMinutes(todayPlannedMin)}
            </p>
            <p className="text-[10px] text-surface-500 mt-0.5">Remaining</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-surface-900 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-ember-500 transition-all duration-500"
            style={{ width: `${todayPlannedMin + completedTodayMin > 0 ? (completedTodayMin / (todayPlannedMin + completedTodayMin)) * 100 : 0}%` }}
          />
        </div>

        {futureQuestCount > 0 && (
          <p className="text-[10px] text-surface-600 mt-2 text-center">
            +{futureQuestCount} quest{futureQuestCount !== 1 ? 's' : ''} scheduled for later
          </p>
        )}
      </div>

      {/* Urgency flags */}
      {(urgentQuests.length > 0 || overdueQuests.length > 0) && (
        <div className="space-y-2">
          {overdueQuests.length > 0 && (
            <div className="card-glass p-3 border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2">
                <span className="text-sm">🚨</span>
                <span className="text-xs font-semibold text-red-400">
                  {overdueQuests.length} overdue quest{overdueQuests.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {overdueQuests.slice(0, 3).map((q) => (
                  <p key={q.id} className="text-xs text-red-300/80 pl-6">• {q.title}</p>
                ))}
              </div>
            </div>
          )}
          {urgentQuests.length > 0 && (
            <div className="card-glass p-3 border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚡</span>
                <span className="text-xs font-semibold text-yellow-400">
                  {urgentQuests.length} quest{urgentQuests.length !== 1 ? 's' : ''} due within 48 hours
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {urgentQuests.slice(0, 3).map((q) => (
                  <p key={q.id} className="text-xs text-yellow-300/80 pl-6">• {q.title}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Task */}
      {showQuickAdd ? (
        <div className="card-glass p-4 animate-slide-up">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-3">
            Quick Task
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              placeholder="What do you need to do?"
              autoFocus
              className="w-full bg-surface-900/60 border border-surface-700/50 rounded-xl px-4 py-3 text-sm text-surface-100 placeholder:text-surface-600 focus:outline-none focus:border-ember-500/50 transition-colors"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-surface-500">⏱</span>
                <input
                  type="number"
                  value={quickMinutes}
                  onChange={(e) => setQuickMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                  min={5}
                  step={5}
                  className="w-16 bg-surface-900/60 border border-surface-700/50 rounded-lg px-2 py-1.5 text-xs text-surface-200 font-mono text-center focus:outline-none focus:border-ember-500/50"
                />
                <span className="text-[10px] text-surface-500">min</span>
              </div>
              <button
                onClick={() => { setShowQuickAdd(false); setQuickTitle(''); }}
                className="px-3 py-1.5 rounded-lg text-xs text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={!quickTitle.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-ember-600 hover:bg-ember-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/30 text-surface-400 hover:text-surface-200 transition-all duration-300 active:scale-[0.98]"
          >
            + Quick Task
          </button>
          <button
            onClick={onNavigateToNewQuestline}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-ember-600 hover:bg-ember-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.25)] active:scale-[0.98]"
          >
            + New Questline
          </button>
        </div>
      )}

      {/* Start Next Quest */}
      {nextQuest ? (
        <div className="card-glass p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-3">
            Next Up
          </h3>
          <div className="mb-3">
            <p className="text-sm font-medium text-surface-100">
              {nextQuest.questlineId && (() => {
                const ql = questlines.find((q) => q.id === nextQuest.questlineId);
                return ql ? <span className="text-ember-500/70 mr-1.5">{ql.title}:</span> : null;
              })()}
              {nextQuest.title}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-700/50 text-surface-400 font-mono">
                ⏱ {formatMinutes(nextQuest.estimatedMinutes)}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-700/50 text-surface-400 font-mono">
                +{nextQuest.momentumValue} MOM
              </span>
              <span className="text-[10px] text-surface-500">
                Due {new Date(nextQuest.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          <button
            id="start-next-quest-btn"
            onClick={() => onStartFocus(nextQuest.id)}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-ember-600 hover:bg-ember-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-[0.98]"
          >
            ▶ Start Quest
          </button>
        </div>
      ) : (
        <div className="card-glass p-8 text-center">
          {quests.length === 0 ? (
            <>
              <div className="text-4xl mb-3">🔥</div>
              <p className="text-sm text-surface-300 font-medium">Welcome to EMBER!</p>
              <p className="text-xs text-surface-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Turn your assignments into quests. Create a questline for your next assignment, or add a quick task to get started.
              </p>
              <button
                onClick={onNavigateToNewQuestline}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold bg-ember-600 hover:bg-ember-500 text-white transition-all shadow-[0_0_20px_rgba(249,115,22,0.15)]"
              >
                Create Your First Questline
              </button>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm text-surface-300 font-medium">All caught up!</p>
              <p className="text-xs text-surface-500 mt-1">No quests due soon. Enjoy the break!</p>
            </>
          )}
        </div>
      )}

      {/* Today's quest list */}
      {todayRelevantQuests.length > 1 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
            Up Next ({todayRelevantQuests.length - 1} more)
          </h3>
          {todayRelevantQuests.slice(1).map((quest) => {
            const dueDate = new Date(quest.dueDate);
            const daysLeft = Math.ceil((dueDate.getTime() - now) / (1000 * 60 * 60 * 24));
            const isUrgent = daysLeft <= 2 && daysLeft >= 0;
            const isOverdue = daysLeft < 0;
            const ql = quest.questlineId ? questlines.find((q) => q.id === quest.questlineId) : null;

            return (
              <div
                key={quest.id}
                className="card-glass p-3 flex items-center gap-3 transition-all duration-300"
              >
                <button
                  onClick={() => onStartFocus(quest.id)}
                  className="w-8 h-8 rounded-lg bg-surface-800 hover:bg-ember-600 border border-surface-700/50 hover:border-ember-500/50 flex items-center justify-center transition-all duration-300 text-surface-500 hover:text-white flex-shrink-0 active:scale-95"
                  title="Start focus session"
                  aria-label={`Start focus session for ${quest.title}`}
                >
                  <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-200 truncate">
                    {ql ? <span className="text-ember-500/70 mr-1.5 font-medium">{ql.title}:</span> : null}
                    {quest.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-surface-500">
                      ⏱ {formatMinutes(quest.estimatedMinutes)}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        isOverdue ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-surface-500'
                      }`}
                    >
                      {isOverdue
                        ? `${Math.abs(daysLeft)}d overdue`
                        : daysLeft === 0
                        ? 'Due today'
                        : daysLeft === 1
                        ? 'Tomorrow'
                        : `${daysLeft}d`}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-surface-600 flex-shrink-0">
                  +{quest.momentumValue}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed today */}
      {completedToday.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-500">
            Completed Today ({completedToday.length})
          </h3>
          {completedToday.map((quest) => (
            <div key={quest.id} className="card-glass p-3 opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-ember-500/20 border border-ember-500/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-ember-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-surface-500 line-through flex-1 truncate">
                  {(() => {
                    const ql = quest.questlineId ? questlines.find((q) => q.id === quest.questlineId) : null;
                    return ql ? <span className="mr-1.5">{ql.title}:</span> : null;
                  })()}
                  {quest.title}
                </span>
                <span className="text-[10px] font-mono text-surface-600 flex-shrink-0">
                  {quest.focusTimeSpent ? formatMinutes(Math.round(quest.focusTimeSpent / 60)) : formatMinutes(quest.estimatedMinutes)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats footer */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="text-center">
          <p className="text-xs font-mono text-surface-500">Level {player.level}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-mono text-surface-500">{player.momentumTotal} MOM</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-mono text-surface-500">{player.denItems.length} items</p>
        </div>
      </div>
    </div>
  );
}
