// ─── Ember Visual ───
// The flame icon whose size/glow scales with vitality tier

import { useEmberStore } from '../store';
import type { VitalityTier } from '../types';

const FLAME_SIZES: Record<VitalityTier, { scale: string; glowClass: string }> = {
  zone: { scale: 'text-7xl', glowClass: 'ember-glow-zone' },
  steady: { scale: 'text-6xl', glowClass: 'ember-glow-steady' },
  low: { scale: 'text-5xl', glowClass: 'ember-glow-low' },
  empty: { scale: 'text-4xl', glowClass: 'ember-glow-empty' },
};

const TIER_COLORS: Record<VitalityTier, string> = {
  zone: 'text-ember-500',
  steady: 'text-yellow-400',
  low: 'text-surface-400',
  empty: 'text-red-400',
};

export default function EmberVisual() {
  const { vitalityTier, vitalityLabel, vitalityMultiplier, player } = useEmberStore();
  const { scale, glowClass } = FLAME_SIZES[vitalityTier];
  const tierColor = TIER_COLORS[vitalityTier];

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Flame */}
      <div
        className={`${scale} ${glowClass} transition-all duration-700 ease-out ${
          vitalityTier === 'zone' ? 'animate-pulse-glow' : ''
        }`}
        role="img"
        aria-label={`Ember flame — ${vitalityLabel}`}
      >
        🔥
      </div>

      {/* Tier label & multiplier */}
      <div className="text-center">
        <p className={`text-sm font-semibold uppercase tracking-widest ${tierColor}`}>
          {vitalityLabel}
        </p>
        <p className={`text-2xl font-bold font-mono ${tierColor}`}>×{vitalityMultiplier.toFixed(1)}</p>
      </div>

      {/* Level & Momentum */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800 border border-surface-700/50">
          <span className="text-xs font-medium text-surface-400">LVL</span>
          <span className="text-sm font-bold text-ember-400">{player.level}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800 border border-surface-700/50">
          <span className="text-xs font-medium text-surface-400">MOM</span>
          <span className="text-sm font-bold text-surface-100">{player.momentumTotal}</span>
        </div>
      </div>
    </div>
  );
}
