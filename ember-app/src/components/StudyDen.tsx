// ─── Study Den ───
// Cosmetic display of unlocked den items with sorting and stats.
// NavBar handles navigation, so no back button needed here.

import { useState } from 'react';
import { useEmberStore } from '../store';
import type { DenItem } from '../types';

const RARITY_STYLES: Record<DenItem['rarity'], { border: string; bg: string; label: string }> = {
  common: {
    border: 'border-surface-600/50',
    bg: 'bg-surface-800/60',
    label: 'text-surface-400',
  },
  rare: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    label: 'text-blue-400',
  },
  epic: {
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    label: 'text-purple-400',
  },
};

type SortMode = 'newest' | 'rarity' | 'name';

const RARITY_ORDER: Record<DenItem['rarity'], number> = {
  epic: 0,
  rare: 1,
  common: 2,
};

export default function StudyDen() {
  const { player } = useEmberStore();
  const { denItems } = player;
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  // Sort items
  const sortedItems = [...denItems].sort((a, b) => {
    switch (sortMode) {
      case 'rarity':
        return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
  });

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-surface-100">🏠 Study Den</h2>
          <p className="text-xs text-surface-500">
            {denItems.length} item{denItems.length !== 1 ? 's' : ''} collected
          </p>
        </div>
        {denItems.length > 1 && (
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="bg-surface-800 border border-surface-700/50 rounded-lg px-2 py-1.5 text-xs text-surface-300 focus:outline-none focus:border-ember-500/50 [color-scheme:dark]"
            aria-label="Sort items"
          >
            <option value="newest">Newest</option>
            <option value="rarity">Rarity</option>
            <option value="name">Name</option>
          </select>
        )}
      </div>

      {/* Den Grid */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {sortedItems.map((item) => {
            const style = RARITY_STYLES[item.rarity];
            return (
              <div
                key={item.id}
                className={`den-item card-glass flex flex-col items-center gap-2 p-4 border ${style.border} ${style.bg} cursor-default`}
                title={`From "${item.questlineTitle}" — ${new Date(item.unlockedAt).toLocaleDateString()}`}
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-xs font-medium text-surface-200 text-center leading-tight">
                  {item.name}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.label}`}>
                  {item.rarity}
                </span>
                <span className="text-[10px] text-surface-600 text-center leading-tight">
                  from "{item.questlineTitle}"
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-glass p-12 text-center">
          <div className="text-5xl mb-4">🏚️</div>
          <p className="text-surface-400 text-sm mb-1">Your den is empty</p>
          <p className="text-surface-600 text-xs leading-relaxed max-w-xs mx-auto">
            Complete Questlines to earn loot drops and decorate your study space! Each completed boss battle rewards a random item.
          </p>
        </div>
      )}

      {/* Legend */}
      {denItems.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          {(['common', 'rare', 'epic'] as const).map((rarity) => {
            const style = RARITY_STYLES[rarity];
            const count = denItems.filter((i) => i.rarity === rarity).length;
            return (
              <div key={rarity} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full border ${style.border} ${style.bg}`} />
                <span className={`text-[10px] font-medium ${style.label}`}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)} ({count})
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Collection stats */}
      {denItems.length > 0 && (
        <div className="card-glass p-4 text-center">
          <p className="text-xs text-surface-500">
            Collection: {denItems.length} / {15} possible items
          </p>
          <div className="h-1 bg-surface-900 rounded-full overflow-hidden mt-2 max-w-xs mx-auto">
            <div
              className="h-full rounded-full bg-ember-500/60 transition-all duration-500"
              style={{ width: `${Math.min(100, (denItems.length / 15) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
