// ─── Momentum Popup ───
// Brief animated popup showing momentum gained on quest completion

import { useEffect, useState } from 'react';
import { useEmberStore } from '../store';

export default function MomentumPopup() {
  const { lastMomentumGain, clearMomentumGain } = useEmberStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastMomentumGain) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(clearMomentumGain, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastMomentumGain, clearMomentumGain]);

  if (!lastMomentumGain) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="card-glass px-5 py-3 border-ember-500/30 bg-ember-500/10 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
        <div className="text-center">
          <p className="text-xs text-surface-400 mb-0.5">{lastMomentumGain.questTitle}</p>
          <p className="text-lg font-bold font-mono text-ember-400 momentum-pop">
            +{lastMomentumGain.amount} MOM
          </p>
          <p className="text-[10px] text-surface-500">
            ×{lastMomentumGain.multiplier.toFixed(1)} Vitality
          </p>
        </div>
      </div>
    </div>
  );
}
