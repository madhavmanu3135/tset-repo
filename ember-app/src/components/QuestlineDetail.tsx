// ─── Questline Detail ───
// Boss HP bar + quest checklist with edit and delete confirmation.
// Key changes: delete requires confirmation, title/due date editable.

import { useState } from 'react';
import { useEmberStore } from '../store';
import { formatMinutes } from '../types';
import QuestCard from './QuestCard';
import ConfirmDialog from './ConfirmDialog';

interface QuestlineDetailProps {
  questlineId: string;
  onBack: () => void;
  onStartFocus?: (questId: string) => void;
}

export default function QuestlineDetail({ questlineId, onBack, onStartFocus }: QuestlineDetailProps) {
  const { questlines, quests, deleteQuestline, editQuestline } = useEmberStore();
  const questline = questlines.find((ql) => ql.id === questlineId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  if (!questline) {
    return (
      <div className="card-glass p-8 text-center">
        <p className="text-surface-400">Questline not found.</p>
        <button onClick={onBack} className="mt-4 text-ember-500 text-sm hover:underline">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const qlQuests = quests
    .filter((q) => q.questlineId === questlineId)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
      return 0;
    });

  const hpPercent = questline.hpMax > 0 ? (questline.hpCurrent / questline.hpMax) * 100 : 0;
  const doneCount = qlQuests.filter((q) => q.status === 'done').length;
  const totalCount = qlQuests.length;
  const dueDate = new Date(questline.dueDate);
  const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Time stats
  const totalEstimated = qlQuests.reduce((s, q) => s + q.estimatedMinutes, 0);
  const remainingEstimated = qlQuests.filter((q) => q.status === 'todo').reduce((s, q) => s + q.estimatedMinutes, 0);

  // HP bar color
  let hpColor = 'bg-hp-green';
  if (hpPercent <= 25) hpColor = 'bg-hp-green';
  else if (hpPercent <= 50) hpColor = 'bg-hp-yellow';
  else hpColor = 'bg-hp-red';

  // If completed, override
  if (questline.completed) hpColor = 'bg-hp-green';

  const handleStartEdit = () => {
    setEditTitle(questline.title);
    setEditDueDate(questline.dueDate);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    editQuestline(questlineId, {
      title: editTitle.trim(),
      dueDate: editDueDate,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    deleteQuestline(questlineId);
    onBack();
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete questline?"
          message={`"${questline.title}" and all ${totalCount} quest${totalCount !== 1 ? 's' : ''} will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete All"
          cancelLabel="Keep"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 transition-colors text-surface-400"
          aria-label="Back to dashboard"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-surface-900/60 border border-surface-700/50 rounded-lg px-3 py-2 text-surface-100 text-sm font-semibold focus:outline-none focus:border-ember-500/50"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-surface-900/60 border border-surface-700/50 rounded-md px-2 py-1 text-xs text-surface-200 focus:outline-none focus:border-ember-500/50 [color-scheme:dark]"
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-ember-600 text-white hover:bg-ember-500 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg text-xs text-surface-500 hover:text-surface-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-surface-100">⚔️ {questline.title}</h2>
              <p className="text-xs text-surface-500">
                {questline.completed
                  ? '🎉 Boss Defeated!'
                  : daysLeft < 0
                  ? `${Math.abs(daysLeft)}d overdue`
                  : daysLeft === 0
                  ? 'Due today!'
                  : `${daysLeft} days remaining`}
              </p>
            </>
          )}
        </div>
        {!questline.completed && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleStartEdit}
              className="p-2 rounded-xl hover:bg-surface-700/50 transition-colors text-surface-500 hover:text-surface-300"
              title="Edit Questline"
              aria-label="Edit questline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-red-500/15 transition-colors text-surface-500 hover:text-red-400"
              title="Delete Questline"
              aria-label="Delete questline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Boss HP Bar */}
      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-surface-400">
            {questline.completed ? '💀 Boss Defeated' : '👹 Boss HP'}
          </span>
          <span className="text-xs font-mono text-surface-500">
            {questline.hpCurrent} / {questline.hpMax}
          </span>
        </div>

        <div className="relative h-6 bg-surface-900 rounded-full overflow-hidden border border-surface-700/50">
          <div
            className={`hp-bar-fill h-full rounded-full ${hpColor} ${
              questline.completed ? 'opacity-50' : ''
            }`}
            style={{ width: `${hpPercent}%` }}
          />
          {!questline.completed && hpPercent > 0 && (
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent ${hpPercent - 5}%, rgba(255,255,255,0.2) ${hpPercent}%)`,
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-surface-500">
            {doneCount}/{totalCount} quests completed
          </span>
          <span className="text-xs text-surface-500 font-mono">
            ⏱ {formatMinutes(remainingEstimated)} left of {formatMinutes(totalEstimated)}
          </span>
        </div>
      </div>

      {/* Quest Checklist */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
          Quest Chain
        </h3>
        {qlQuests.map((quest, i) => (
          <div key={quest.id} className="relative">
            {/* Connection line */}
            {i < qlQuests.length - 1 && (
              <div className="absolute left-[19px] top-[48px] bottom-[-8px] w-px bg-surface-700/30" />
            )}
            <QuestCard quest={quest} showQuestline={false} onStartFocus={onStartFocus} />
          </div>
        ))}
      </div>
    </div>
  );
}
