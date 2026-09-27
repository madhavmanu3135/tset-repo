// ─── Quest Card ───
// Individual quest card with completion, focus session, and delete.
// Key fixes from prototype:
// 1. Action buttons are ALWAYS visible (not hover-only — mobile can't hover)
// 2. Delete requires confirmation
// 3. Better touch targets (min 44px)

import { useState } from 'react';
import { useEmberStore } from '../store';
import type { Quest } from '../types';
import { formatMinutes } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface QuestCardProps {
  quest: Quest;
  showQuestline?: boolean;
  onStartFocus?: (questId: string) => void;
}

export default function QuestCard({ quest, showQuestline = true, onStartFocus }: QuestCardProps) {
  const { completeQuest, deleteQuest, questlines } = useEmberStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [gainedMomentum, setGainedMomentum] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const questline = quest.questlineId
    ? questlines.find((ql) => ql.id === quest.questlineId)
    : null;

  const isDone = quest.status === 'done';
  const dueDate = new Date(quest.dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDue <= 2 && daysUntilDue >= 0;
  const isOverdue = daysUntilDue < 0;

  const handleComplete = () => {
    if (isDone || isCompleting) return;
    setIsCompleting(true);

    const result = completeQuest(quest.id);
    if (result) {
      setGainedMomentum(result.momentum);
      setShowParticles(true);

      setTimeout(() => {
        setShowParticles(false);
        setGainedMomentum(null);
        setIsCompleting(false);
      }, 1500);
    } else {
      setIsCompleting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    deleteQuest(quest.id);
  };

  return (
    <>
      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete quest?"
          message={`"${quest.title}" will be permanently removed${questline ? ` from ${questline.title}` : ''}.`}
          confirmLabel="Delete"
          cancelLabel="Keep"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <div
        className={`relative group card-glass p-4 transition-all duration-300 ${
          isDone
            ? 'opacity-50 border-surface-700/20'
            : isOverdue
            ? 'border-red-500/15 bg-red-500/[0.02]'
            : isUrgent
            ? 'border-yellow-500/15 bg-yellow-500/[0.02]'
            : 'hover:border-surface-600/60 hover:bg-surface-800/80'
        }`}
      >
        {/* Particle burst effect */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-ember-400"
                style={{
                  left: '50%',
                  top: '50%',
                  animation: `float-up 1s ease-out ${i * 0.05}s forwards`,
                  transform: `rotate(${i * 45}deg) translateX(${20 + Math.random() * 30}px)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Momentum gain popup */}
        {gainedMomentum !== null && (
          <div
            className="absolute -top-2 right-4 text-ember-400 font-bold font-mono text-sm animate-slide-up z-10"
            style={{ animation: 'float-up 1.2s ease-out forwards' }}
          >
            +{gainedMomentum} MOM
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            id={`quest-complete-${quest.id}`}
            onClick={handleComplete}
            disabled={isDone}
            aria-label={isDone ? 'Quest completed' : `Complete quest: ${quest.title}`}
            className={`mt-0.5 w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isDone
                ? 'bg-ember-500/20 border-ember-500/40 text-ember-400'
                : 'border-surface-600 hover:border-ember-500/60 hover:bg-ember-500/10 active:scale-95'
            }`}
          >
            {isDone && (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isDone ? 'line-through text-surface-500' : 'text-surface-100'}`}>
              {quest.title}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Questline badge */}
              {showQuestline && questline && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-700/50 text-surface-400 font-medium">
                  ⚔️ {questline.title}
                </span>
              )}

              {/* Estimated time */}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-700/50 text-surface-400 font-mono">
                ⏱ {formatMinutes(quest.estimatedMinutes)}
              </span>

              {/* Momentum value */}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-700/50 text-surface-400 font-mono">
                +{quest.momentumValue} MOM
              </span>

              {/* Due date */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isOverdue
                    ? 'bg-red-500/15 text-red-400'
                    : isUrgent
                    ? 'bg-yellow-500/15 text-yellow-400'
                    : 'bg-surface-700/50 text-surface-400'
                }`}
              >
                {isOverdue
                  ? `${Math.abs(daysUntilDue)}d overdue`
                  : daysUntilDue === 0
                  ? 'Due today'
                  : daysUntilDue === 1
                  ? 'Due tomorrow'
                  : `${daysUntilDue}d left`}
              </span>
            </div>
          </div>

          {/* Action buttons — ALWAYS VISIBLE (not hover-only) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Focus button */}
            {!isDone && onStartFocus && (
              <button
                onClick={() => onStartFocus(quest.id)}
                className="p-2 rounded-lg hover:bg-ember-500/15 text-surface-500 hover:text-ember-400 transition-all active:scale-95"
                title="Start focus session"
                aria-label={`Start focus session for ${quest.title}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}

            {/* Delete — with confirmation */}
            {!isDone && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-500/15 text-surface-600 hover:text-red-400 transition-all active:scale-95"
                title="Delete quest"
                aria-label={`Delete quest: ${quest.title}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
