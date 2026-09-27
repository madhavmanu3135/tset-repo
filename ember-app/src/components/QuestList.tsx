// ─── Quest List ───
// Today's quests sorted by due date

import { useEmberStore } from '../store';
import QuestCard from './QuestCard';

interface QuestListProps {
  onNavigateToQuestline?: (id: string) => void;
  onStartFocus?: (questId: string) => void;
}

export default function QuestList({ onNavigateToQuestline, onStartFocus }: QuestListProps) {
  const { quests, questlines } = useEmberStore();

  // Sort: todo first (by due date asc), then done
  const sortedQuests = [...quests].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const todoCount = quests.filter((q) => q.status === 'todo').length;
  const doneCount = quests.filter((q) => q.status === 'done').length;

  // Group standalone quests and questline quests
  const standaloneQuests = sortedQuests.filter((q) => !q.questlineId);
  const questlineGroups = questlines
    .filter((ql) => !ql.completed)
    .map((ql) => ({
      questline: ql,
      quests: sortedQuests.filter((q) => q.questlineId === ql.id),
    }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-surface-100">Quest Board</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-surface-400">{todoCount} active</span>
          <span className="text-surface-600">•</span>
          <span className="text-surface-500">{doneCount} done</span>
        </div>
      </div>

      {/* Questline groups */}
      {questlineGroups.map(({ questline: ql, quests: qlQuests }) => (
        <div key={ql.id} className="space-y-2">
          <button
            onClick={() => onNavigateToQuestline?.(ql.id)}
            className="flex items-center gap-2 w-full text-left group"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-ember-500">
              ⚔️ {ql.title}
            </span>
            <div className="flex-1 h-px bg-surface-700/50" />
            <span className="text-[10px] text-surface-500 group-hover:text-ember-400 transition-colors">
              View Boss →
            </span>
          </button>
          {qlQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} showQuestline={false} onStartFocus={onStartFocus} />
          ))}
        </div>
      ))}

      {/* Standalone quests */}
      {standaloneQuests.length > 0 && (
        <div className="space-y-2">
          {questlineGroups.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                Solo Quests
              </span>
              <div className="flex-1 h-px bg-surface-700/50" />
            </div>
          )}
          {standaloneQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onStartFocus={onStartFocus} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {quests.length === 0 && (
        <div className="card-glass p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-surface-400 text-sm">No quests yet.</p>
          <p className="text-surface-500 text-xs mt-1">
            Create a Questline to start your adventure!
          </p>
        </div>
      )}
    </div>
  );
}
