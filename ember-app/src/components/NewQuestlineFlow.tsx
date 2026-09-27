// ─── New Questline Flow ───
// Multi-step: title → due date → size tier → editable quest cards with time estimates → confirm

import { useState } from 'react';
import { useEmberStore } from '../store';
import type { SizeTier } from '../types';
import { QUEST_TEMPLATES, SIZE_TIER_MOMENTUM, formatMinutes } from '../types';

interface NewQuestlineFlowProps {
  onComplete: (questlineId: string) => void;
  onCancel: () => void;
}

type Step = 'title' | 'quests';

interface EditableQuest {
  title: string;
  estimatedMinutes: number;
}

export default function NewQuestlineFlow({ onComplete, onCancel }: NewQuestlineFlowProps) {
  const { createQuestline } = useEmberStore();

  const [step, setStep] = useState<Step>('title');
  const [title, setTitle] = useState('');
  
  // Default due date to 3 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const [dueDate, setDueDate] = useState(defaultDate.toISOString().split('T')[0]);
  
  const [editableQuests, setEditableQuests] = useState<EditableQuest[]>([]);

  const handleTitleNext = () => {
    if (!title.trim()) return;
    // Default to medium templates
    setEditableQuests(
      QUEST_TEMPLATES['medium'].map((t) => ({
        title: t.title,
        estimatedMinutes: t.estimatedMinutes,
      }))
    );
    setStep('quests');
  };

  const handleQuestTitleEdit = (index: number, value: string) => {
    const updated = [...editableQuests];
    updated[index] = { ...updated[index], title: value };
    setEditableQuests(updated);
  };

  const handleQuestTimeEdit = (index: number, value: number) => {
    const updated = [...editableQuests];
    updated[index] = { ...updated[index], estimatedMinutes: Math.max(5, value) };
    setEditableQuests(updated);
  };

  const handleQuestDelete = (index: number) => {
    if (editableQuests.length <= 1) return;
    setEditableQuests(editableQuests.filter((_, i) => i !== index));
  };

  const handleQuestAdd = () => {
    setEditableQuests([...editableQuests, { title: 'New quest', estimatedMinutes: 25 }]);
  };

  const handleMoveQuest = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= editableQuests.length) return;
    const updated = [...editableQuests];
    [updated[index], updated[newIdx]] = [updated[newIdx], updated[index]];
    setEditableQuests(updated);
  };

  const handleConfirm = () => {
    const validQuests = editableQuests.filter((t) => t.title.trim());
    if (validQuests.length === 0 || !dueDate) return;
    
    // Auto-determine size tier based on number of quests
    let determinedTier: SizeTier = 'medium';
    if (validQuests.length <= 2) determinedTier = 'small';
    else if (validQuests.length >= 5) determinedTier = 'large';

    const id = createQuestline(title.trim(), dueDate, determinedTier, validQuests);
    onComplete(id);
  };

  const handleBack = () => {
    if (step === 'quests') setStep('title');
  };

  const totalEstimated = editableQuests.reduce((s, q) => s + q.estimatedMinutes, 0);
  
  // Calculate dynamic size tier for display
  let currentTier: SizeTier = 'medium';
  if (editableQuests.length <= 2) currentTier = 'small';
  else if (editableQuests.length >= 5) currentTier = 'large';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {step !== 'title' && (
            <button
              onClick={handleBack}
              className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 transition-colors text-surface-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-surface-100">New Questline</h2>
            <p className="text-xs text-surface-500">
              {step === 'title' && 'What are you working on?'}
              {step === 'quests' && 'Customize your quest chain'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-xl hover:bg-surface-700 transition-colors text-surface-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Step: Title */}
      {step === 'title' && (
        <div className="space-y-4 animate-slide-up">
          <div className="card-glass p-4">
            <label className="text-xs text-surface-400 font-medium block mb-2">
              Questline Title
            </label>
            <input
              id="questline-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleNext()}
              placeholder="e.g. Psychology Research Paper"
              autoFocus
              className="w-full bg-surface-900/60 border border-surface-700/50 rounded-xl px-4 py-3 text-surface-100 placeholder:text-surface-600 focus:outline-none focus:border-ember-500/50 transition-colors"
            />
          </div>
          <button
            id="questline-title-next"
            onClick={handleTitleNext}
            disabled={!title.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-ember-600 hover:bg-ember-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step: Editable quests with time estimates */}
      {step === 'quests' && (
        <div className="space-y-4 animate-slide-up">
          <div className="card-glass p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-surface-200 mb-2">{title}</p>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Due:</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-surface-900/60 border border-surface-700/50 rounded-md px-2 py-1 text-xs text-surface-200 focus:outline-none focus:border-ember-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-mono text-surface-400">
                  {editableQuests.length} quests
                </span>
                <p className="text-[10px] font-mono text-surface-500 mt-1">
                  ⏱ {formatMinutes(totalEstimated)} total
                </p>
                <p className="text-[10px] font-mono text-ember-500/70 mt-1">
                  +{SIZE_TIER_MOMENTUM[currentTier]} MOM/quest
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {editableQuests.map((eq, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="text-xs text-surface-600 font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    value={eq.title}
                    onChange={(e) => handleQuestTitleEdit(i, e.target.value)}
                    className="flex-1 bg-surface-900/40 border border-surface-700/30 rounded-lg px-3 py-2 text-sm text-surface-200 focus:outline-none focus:border-ember-500/40 transition-colors min-w-0"
                  />
                  {/* Time estimate */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      value={eq.estimatedMinutes}
                      onChange={(e) => handleQuestTimeEdit(i, parseInt(e.target.value) || 5)}
                      min={5}
                      step={5}
                      className="w-14 bg-surface-900/40 border border-surface-700/30 rounded-lg px-2 py-2 text-xs text-surface-300 font-mono text-center focus:outline-none focus:border-ember-500/40 transition-colors"
                    />
                    <span className="text-[10px] text-surface-600">min</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleMoveQuest(i, 'up')}
                      disabled={i === 0}
                      className="p-1 rounded hover:bg-surface-700 text-surface-500 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveQuest(i, 'down')}
                      disabled={i === editableQuests.length - 1}
                      className="p-1 rounded hover:bg-surface-700 text-surface-500 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleQuestDelete(i)}
                      disabled={editableQuests.length <= 1}
                      className="p-1 rounded hover:bg-red-500/20 text-surface-500 hover:text-red-400 disabled:opacity-30"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleQuestAdd}
              className="mt-3 w-full py-2 rounded-lg border border-dashed border-surface-700/50 text-xs text-surface-500 hover:text-surface-300 hover:border-surface-600 transition-colors"
            >
              + Add Quest
            </button>
          </div>

          <button
            id="questline-confirm"
            onClick={handleConfirm}
            disabled={editableQuests.filter((t) => t.title.trim()).length === 0 || !dueDate}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-ember-600 hover:bg-ember-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          >
            ⚔️ Begin Questline
          </button>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {(['title', 'quests'] as Step[]).map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              s === step ? 'bg-ember-500 w-6' : 'bg-surface-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
