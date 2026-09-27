// ─── Recovery Buttons ───
// 4 one-click buttons for daily self-care tracking

import { useEmberStore } from '../store';

const RECOVERY_ACTIONS = [
  { key: 'slept' as const, label: 'Slept', emoji: '😴', desc: '7+ hours' },
  { key: 'moved' as const, label: 'Moved', emoji: '🏃', desc: 'Exercise' },
  { key: 'ateWell' as const, label: 'Ate Well', emoji: '🥗', desc: 'Real meal' },
  { key: 'socialized' as const, label: 'Social', emoji: '💬', desc: 'Talked' },
];

export default function RecoveryButtons() {
  const { todayLog, toggleRecovery } = useEmberStore();

  return (
    <div className="card-glass p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-3">
        Today's Recovery
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {RECOVERY_ACTIONS.map((action) => {
          const isActive = todayLog[action.key];
          return (
            <button
              key={action.key}
              id={`recovery-${action.key}`}
              onClick={() => toggleRecovery(action.key)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 border ${
                isActive
                  ? 'bg-ember-500/15 border-ember-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                  : 'bg-surface-800/40 border-surface-700/30 hover:bg-surface-700/40 hover:border-surface-600/50'
              }`}
            >
              <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {action.emoji}
              </span>
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-ember-400' : 'text-surface-400'
                }`}
              >
                {action.label}
              </span>
              <span className="text-[10px] text-surface-500">{action.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
