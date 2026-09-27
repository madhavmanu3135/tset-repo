// ─── Focus Session ───
// Full-screen focus timer. Key changes from prototype:
// 1. Students can complete early (timer is a guide, not a prison)
// 2. Keyboard shortcuts: Space=pause/resume, Enter/Escape=close
// 3. Minimum focus time: 60 seconds before completion allowed

import { useState, useEffect, useRef, useCallback } from 'react';
import { useEmberStore } from '../store';
import { formatSeconds } from '../types';
import ConfirmDialog from './ConfirmDialog';

const MIN_FOCUS_SECONDS = 60; // minimum focus before allowing completion
const EARLY_COMPLETION_THRESHOLD = 0.4; // show warning if under 40% of estimated

export default function FocusSession() {
  const { focusSession, pauseFocusSession, resumeFocusSession, completeFocusSession, cancelFocusSession, vitalityMultiplier, vitalityLabel, vitalityTier } = useEmberStore();
  const [elapsed, setElapsed] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionResult, setCompletionResult] = useState<{ momentum: number; multiplier: number } | null>(null);
  const [showEarlyConfirm, setShowEarlyConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const frameRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  // Tick logic using requestAnimationFrame for smooth counting
  const tick = useCallback(() => {
    if (!focusSession) return;

    const now = Date.now();
    if (!focusSession.isPaused) {
      const totalPaused = focusSession.totalPausedMs;
      const activeMs = now - focusSession.startedAt - totalPaused;
      setElapsed(Math.floor(activeMs / 1000));
    }

    lastTickRef.current = now;
    frameRef.current = requestAnimationFrame(tick);
  }, [focusSession]);

  useEffect(() => {
    if (focusSession && !focusSession.isPaused) {
      lastTickRef.current = Date.now();
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [focusSession, focusSession?.isPaused, tick]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!focusSession || showCompletion || showEarlyConfirm || showCancelConfirm) return;

    const handleKey = (e: KeyboardEvent) => {
      // Space: toggle pause/resume
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (focusSession.isPaused) {
          resumeFocusSession();
        } else {
          pauseFocusSession();
        }
      }
      // Escape: cancel with confirmation
      if (e.key === 'Escape') {
        e.preventDefault();
        if (elapsed >= MIN_FOCUS_SECONDS) {
          setShowCancelConfirm(true);
        } else {
          cancelFocusSession();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [focusSession, showCompletion, showEarlyConfirm, showCancelConfirm, elapsed, pauseFocusSession, resumeFocusSession, cancelFocusSession]);

  if (!focusSession) return null;

  const { questTitle, estimatedSeconds, isPaused } = focusSession;
  const remaining = Math.max(0, estimatedSeconds - elapsed);
  const progress = Math.min(1, elapsed / estimatedSeconds);
  const isOvertime = elapsed > estimatedSeconds;
  const canComplete = elapsed >= MIN_FOCUS_SECONDS;
  const isEarlyCompletion = elapsed < estimatedSeconds * EARLY_COMPLETION_THRESHOLD;

  // Circle progress
  const circleRadius = 120;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference * (1 - progress);

  const handleComplete = () => {
    if (!canComplete) return;
    
    // If completing very early, show confirmation
    if (isEarlyCompletion) {
      setShowEarlyConfirm(true);
      return;
    }
    
    doComplete();
  };

  const doComplete = () => {
    setShowEarlyConfirm(false);
    const result = completeFocusSession();
    if (result) {
      setCompletionResult(result);
      setShowCompletion(true);
    }
  };

  const handleDismissCompletion = () => {
    setShowCompletion(false);
    setCompletionResult(null);
    setElapsed(0);
  };

  const handleCancelSession = () => {
    if (elapsed >= MIN_FOCUS_SECONDS) {
      setShowCancelConfirm(true);
    } else {
      cancelFocusSession();
    }
  };

  // Vitality tier color
  const tierColors: Record<string, string> = {
    zone: 'text-ember-500',
    steady: 'text-yellow-400',
    low: 'text-surface-400',
    empty: 'text-red-400',
  };

  const tierGlows: Record<string, string> = {
    zone: 'rgba(249, 115, 22, 0.5)',
    steady: 'rgba(234, 179, 8, 0.4)',
    low: 'rgba(107, 114, 128, 0.3)',
    empty: 'rgba(239, 68, 68, 0.3)',
  };

  // Get encouraging status message
  const getStatusMessage = () => {
    if (isPaused) return 'Take a breather';
    if (isOvertime) return 'You\'re in the zone!';
    if (progress > 0.75) return 'Almost there!';
    if (progress > 0.5) return 'Halfway done';
    if (progress > 0.25) return 'Building momentum...';
    return 'Stay focused';
  };

  // Completion overlay
  if (showCompletion && completionResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/95 backdrop-blur-md">
        <div className="text-center animate-celebration px-6 max-w-md">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-surface-100 mb-1">QUEST COMPLETE</h2>
          <p className="text-surface-400 text-sm mb-6">{questTitle}</p>

          <div className="card-glass p-6 inline-block">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-8">
                <span className="text-sm text-surface-400">Base Momentum</span>
                <span className="text-sm font-mono text-surface-200">
                  +{Math.round(completionResult.momentum / completionResult.multiplier)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-sm text-surface-400">Vitality Multiplier</span>
                <span className={`text-sm font-mono font-semibold ${tierColors[vitalityTier]}`}>
                  ×{completionResult.multiplier.toFixed(1)}
                </span>
              </div>
              <div className="border-t border-surface-700/50 pt-2 mt-2">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-sm font-semibold text-surface-200">Total Earned</span>
                  <span className="text-lg font-bold font-mono text-ember-400">
                    +{completionResult.momentum} MOM
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-8 pt-1">
                <span className="text-xs text-surface-500">Focus Time</span>
                <span className="text-xs font-mono text-surface-400">
                  {formatSeconds(elapsed)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismissCompletion}
            className="mt-6 w-full max-w-xs py-3 rounded-xl font-semibold text-sm bg-ember-600 hover:bg-ember-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-950/98 backdrop-blur-md">
      {/* Early completion confirmation */}
      {showEarlyConfirm && (
        <ConfirmDialog
          title="Complete early?"
          message={`You've focused for ${formatSeconds(elapsed)} of an estimated ${Math.round(estimatedSeconds / 60)}m task. Are you sure you're done?`}
          confirmLabel="Yes, I'm done"
          cancelLabel="Keep going"
          variant="warning"
          onConfirm={doComplete}
          onCancel={() => setShowEarlyConfirm(false)}
        />
      )}

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <ConfirmDialog
          title="Abandon session?"
          message={`You've been focusing for ${formatSeconds(elapsed)}. Your progress on this quest won't be saved.`}
          confirmLabel="Abandon"
          cancelLabel="Keep going"
          variant="danger"
          onConfirm={() => { setShowCancelConfirm(false); cancelFocusSession(); }}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      {/* Close / Cancel */}
      <button
        onClick={handleCancelSession}
        className="absolute top-6 right-6 p-2 rounded-xl hover:bg-surface-800 transition-colors text-surface-500 hover:text-surface-300"
        title="Cancel focus session"
        aria-label="Cancel focus session"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Session label */}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-500 mb-8">
        Focus Session
      </p>

      {/* Timer Circle */}
      <div className="relative mb-6">
        <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
          {/* Background ring */}
          <circle
            cx="140"
            cy="140"
            r={circleRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-surface-800"
          />
          {/* Progress ring */}
          <circle
            cx="140"
            cy="140"
            r={circleRadius}
            fill="none"
            stroke={isOvertime ? '#ef4444' : '#f97316'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isOvertime ? 0 : strokeOffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out',
              filter: `drop-shadow(0 0 8px ${isOvertime ? 'rgba(239,68,68,0.4)' : tierGlows[vitalityTier]})`,
            }}
          />
        </svg>

        {/* Time display centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-5xl font-mono font-bold tracking-tight ${
              isPaused ? 'text-surface-500 animate-pulse' : isOvertime ? 'text-red-400' : 'text-surface-100'
            }`}
          >
            {isOvertime ? '+' : ''}{formatSeconds(isOvertime ? elapsed - estimatedSeconds : remaining)}
          </span>
          <span className={`text-xs mt-1 ${
            isOvertime ? 'text-red-400/70' : isPaused ? 'text-surface-500' : 'text-surface-400'
          }`}>
            {getStatusMessage()}
          </span>
        </div>
      </div>

      {/* Quest title */}
      <h3 className="text-lg font-semibold text-surface-200 mb-1 text-center px-8">
        {questTitle}
      </h3>

      {/* Vitality indicator */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-sm">🔥</span>
        <span className={`text-xs font-medium ${tierColors[vitalityTier]}`}>
          {vitalityLabel}
        </span>
        <span className={`text-xs font-mono font-semibold ${tierColors[vitalityTier]}`}>
          ×{vitalityMultiplier.toFixed(1)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Pause / Resume */}
        <button
          onClick={isPaused ? resumeFocusSession : pauseFocusSession}
          className="w-14 h-14 rounded-full bg-surface-800 hover:bg-surface-700 border border-surface-700/50 flex items-center justify-center transition-all duration-300 text-surface-300 hover:text-surface-100"
          aria-label={isPaused ? 'Resume' : 'Pause'}
          title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
        >
          {isPaused ? (
            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>

        {/* Complete — NOW ALWAYS ENABLED after minimum focus time */}
        <button
          id="focus-complete-btn"
          onClick={handleComplete}
          disabled={!canComplete}
          className={`px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${
            !canComplete
              ? 'bg-surface-800 text-surface-500 cursor-not-allowed border border-surface-700/50'
              : 'bg-ember-600 hover:bg-ember-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.25)] hover:shadow-[0_0_35px_rgba(249,115,22,0.35)]'
          }`}
          title={canComplete ? 'Complete quest' : `Focus for at least ${MIN_FOCUS_SECONDS}s`}
        >
          {!canComplete
            ? `Focus for ${MIN_FOCUS_SECONDS - elapsed}s...`
            : '✓ Complete Quest'}
        </button>
      </div>

      {/* Keyboard hints & elapsed info */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-6 text-xs text-surface-600">
          <div className="flex items-center gap-1.5">
            <span>⏱</span>
            <span>Elapsed: {formatSeconds(elapsed)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🎯</span>
            <span>Est: {Math.round(estimatedSeconds / 60)}m</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-surface-700">
          <span className="px-1.5 py-0.5 bg-surface-800 rounded border border-surface-700/50">Space</span>
          <span>Pause</span>
          <span className="px-1.5 py-0.5 bg-surface-800 rounded border border-surface-700/50">Esc</span>
          <span>Cancel</span>
        </div>
      </div>
    </div>
  );
}
