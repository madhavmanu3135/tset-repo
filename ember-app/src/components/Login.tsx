// ─── Welcome / Setup Screen ───
// Replaces the old fake-auth Login. No hardcoded credentials.
// Since there's no backend, we're honest: just collect name + email.
// Email is validated for Providence domain for future backend integration.

import { useState } from 'react';
import { useEmberStore } from '../store';

export default function Login() {
  const { login } = useEmberStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your college email.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate Providence domain
    if (!trimmedEmail.endsWith('@providence.edu') && !trimmedEmail.endsWith('@providence.edu.in')) {
      setError('Please use your @providence.edu or @providence.edu.in email.');
      return;
    }

    login(trimmedName, trimmedEmail);
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ember-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in text-center space-y-8">
        <div>
          <div className="text-6xl mb-4 animate-float">🔥</div>
          <h1 className="text-3xl font-bold tracking-tight text-surface-100">EMBER</h1>
          <p className="text-sm text-surface-400 mt-2">Gamified Academic Wellness</p>
        </div>

        <form onSubmit={handleSubmit} className="card-glass p-6 text-left space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium" role="alert">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="setup-name" className="block text-xs font-semibold uppercase tracking-widest text-surface-400 mb-2">
              Your Name
            </label>
            <input
              id="setup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              autoFocus
              autoComplete="given-name"
              className="w-full bg-surface-900/60 border border-surface-700/50 rounded-xl px-4 py-3 text-surface-100 placeholder:text-surface-600 focus:outline-none focus:border-ember-500/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="setup-email" className="block text-xs font-semibold uppercase tracking-widest text-surface-400 mb-2">
              College Email
            </label>
            <input
              id="setup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@providence.edu"
              autoComplete="email"
              className="w-full bg-surface-900/60 border border-surface-700/50 rounded-xl px-4 py-3 text-surface-100 placeholder:text-surface-600 focus:outline-none focus:border-ember-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !email.trim()}
            className="w-full py-3 mt-2 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-ember-600 hover:bg-ember-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          >
            Get Started →
          </button>

          <p className="text-[10px] text-surface-600 text-center leading-relaxed">
            Your data is stored locally on this device.
            <br />No account or password needed.
          </p>
        </form>
      </div>
    </div>
  );
}
