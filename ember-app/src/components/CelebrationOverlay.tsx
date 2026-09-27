// ─── Celebration Overlay ───
// Full-screen celebration when a Questline boss is defeated

import { useEffect, useState } from 'react';
import { useEmberStore } from '../store';
import type { DenItem } from '../types';

const RARITY_COLORS: Record<DenItem['rarity'], { text: string; glow: string; bg: string }> = {
  common: { text: 'text-surface-200', glow: 'rgba(200,200,220,0.3)', bg: 'from-surface-800/90' },
  rare: { text: 'text-blue-400', glow: 'rgba(59,130,246,0.4)', bg: 'from-blue-900/30' },
  epic: { text: 'text-purple-400', glow: 'rgba(168,85,247,0.5)', bg: 'from-purple-900/30' },
};

export default function CelebrationOverlay() {
  const { celebrationItem, setCelebrationItem } = useEmberStore();
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (celebrationItem) {
      setVisible(true);
      // Generate confetti particles
      const particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        delay: Math.random() * 2,
        color: ['#f97316', '#eab308', '#ef4444', '#fb923c', '#fbbf24'][
          Math.floor(Math.random() * 5)
        ],
      }));
      setConfetti(particles);
    }
  }, [celebrationItem]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setCelebrationItem(null), 300);
  };

  if (!celebrationItem) return null;

  const rarity = RARITY_COLORS[celebrationItem.rarity];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleDismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Confetti */}
      {confetti.map((particle, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: '-10px',
            backgroundColor: particle.color,
            animation: `confetti-fall 3s ease-in ${particle.delay}s forwards`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center animate-celebration px-6">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-2xl font-bold text-ember-400 mb-2">BOSS DEFEATED!</h2>
        <p className="text-surface-400 text-sm mb-6">
          You completed the questline and earned a reward!
        </p>

        {/* Loot card */}
        <div
          className={`inline-block card-glass p-6 bg-gradient-to-b ${rarity.bg} to-surface-800/90`}
          style={{
            boxShadow: `0 0 40px ${rarity.glow}, 0 0 80px ${rarity.glow}`,
          }}
        >
          <div className="text-5xl mb-3">{celebrationItem.emoji}</div>
          <p className={`text-lg font-bold ${rarity.text}`}>{celebrationItem.name}</p>
          <p
            className={`text-xs font-semibold uppercase tracking-widest mt-1 ${rarity.text} opacity-70`}
          >
            {celebrationItem.rarity}
          </p>
          <p className="text-[10px] text-surface-500 mt-2">Added to your Study Den</p>
        </div>

        <p className="text-surface-600 text-xs mt-6">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
