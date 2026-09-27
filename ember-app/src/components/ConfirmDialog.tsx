// ─── Confirm Dialog ───
// Reusable confirmation dialog for destructive actions.
// Prevents accidental data loss — every delete now requires confirmation.

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    confirmBtn: 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    icon: '🗑️',
    border: 'border-red-500/20',
  },
  warning: {
    confirmBtn: 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    icon: '⚠️',
    border: 'border-yellow-500/20',
  },
  default: {
    confirmBtn: 'bg-ember-600 hover:bg-ember-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    icon: '❓',
    border: 'border-ember-500/20',
  },
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const style = VARIANT_STYLES[variant];

  // Focus the cancel button on mount (safe default)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className={`relative z-10 w-full max-w-sm card-glass p-6 animate-slide-up ${style.border}`}>
        <div className="text-center">
          <div className="text-3xl mb-3">{style.icon}</div>
          <h3
            id="confirm-dialog-title"
            className="text-lg font-semibold text-surface-100 mb-2"
          >
            {title}
          </h3>
          <p className="text-sm text-surface-400 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-800 hover:bg-surface-700 text-surface-300 border border-surface-700/50 transition-all duration-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${style.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
