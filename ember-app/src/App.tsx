// ─── EMBER App ───
// Main application component with screen routing.
// Changes: Added data management (export/import), fixed nav flow,
// removed Recovery duplication from Dashboard screen.

import { useState, useRef } from 'react';
import { useEmberStore } from './store';
import { downloadDataAsFile, importData } from './persistence';
import EmberVisual from './components/EmberVisual';
import QuestList from './components/QuestList';
import NewQuestlineFlow from './components/NewQuestlineFlow';
import QuestlineDetail from './components/QuestlineDetail';
import StudyDen from './components/StudyDen';
import TodayDashboard from './components/TodayDashboard';
import FocusSession from './components/FocusSession';
import NavBar from './components/NavBar';
import MomentumPopup from './components/MomentumPopup';
import CelebrationOverlay from './components/CelebrationOverlay';
import Login from './components/Login';
import ConfirmDialog from './components/ConfirmDialog';

type Screen =
  | { type: 'today' }
  | { type: 'dashboard' }
  | { type: 'newQuestline' }
  | { type: 'questlineDetail'; questlineId: string }
  | { type: 'den' };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'today' });
  const { player, questlines, startFocusSession, focusSession, importGameData, resetGame } = useEmberStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const activeQuestlines = questlines.filter((ql) => !ql.completed);

  const handleNavigate = (key: string) => {
    switch (key) {
      case 'today':
        setScreen({ type: 'today' });
        break;
      case 'dashboard':
        setScreen({ type: 'dashboard' });
        break;
      case 'den':
        setScreen({ type: 'den' });
        break;
    }
  };

  const handleStartFocus = (questId: string) => {
    startFocusSession(questId);
  };

  // Determine active nav key
  const getActiveNav = () => {
    if (screen.type === 'today') return 'today';
    if (screen.type === 'den') return 'den';
    return 'dashboard';
  };

  // Data import handler
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const data = importData(json);
      if (data) {
        importGameData(data);
        setImportSuccess(true);
        setImportError('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Invalid backup file. Please select a valid EMBER backup.');
        setTimeout(() => setImportError(''), 5000);
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  if (!player.isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Fixed background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-ember-500/[0.03] blur-[100px]" />
      </div>

      {/* Focus Session Overlay (above everything) */}
      {focusSession && <FocusSession />}

      {/* Popups & Overlays */}
      <MomentumPopup />
      <CelebrationOverlay />

      {/* Reset confirmation */}
      {showResetConfirm && (
        <ConfirmDialog
          title="Reset everything?"
          message="All your quests, questlines, items, and progress will be permanently deleted. This cannot be undone. Consider exporting your data first."
          confirmLabel="Delete Everything"
          cancelLabel="Keep My Data"
          variant="danger"
          onConfirm={() => { setShowResetConfirm(false); resetGame(); }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
        aria-hidden="true"
      />

      {/* Import/export toast notifications */}
      {importError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 card-glass px-5 py-3 border-red-500/30 bg-red-500/10 animate-slide-up">
          <p className="text-xs text-red-400 font-medium">{importError}</p>
        </div>
      )}
      {importSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 card-glass px-5 py-3 border-hp-green/30 bg-hp-green/10 animate-slide-up">
          <p className="text-xs text-hp-green font-medium">Data imported successfully!</p>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 pb-24">

        {/* ─── Today Dashboard ─── */}
        {screen.type === 'today' && (
          <TodayDashboard
            onStartFocus={handleStartFocus}
            onNavigateToQuestline={(id) =>
              setScreen({ type: 'questlineDetail', questlineId: id })
            }
            onNavigateToNewQuestline={() => setScreen({ type: 'newQuestline' })}
          />
        )}

        {/* ─── Quest Board (Dashboard) ─── */}
        {screen.type === 'dashboard' && (
          <div className="space-y-4 pt-2">
            {/* Ember Visual */}
            <EmberVisual />

            {/* Quick Add */}
            <div className="flex gap-2">
              <button
                id="new-questline-btn"
                onClick={() => setScreen({ type: 'newQuestline' })}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-ember-600 hover:bg-ember-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.25)] active:scale-[0.98]"
              >
                + New Questline
              </button>
            </div>

            {/* Active Boss Battles */}
            {activeQuestlines.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
                  Active Boss Battles
                </h3>
                {activeQuestlines.map((ql) => {
                  const hpPercent = ql.hpMax > 0 ? (ql.hpCurrent / ql.hpMax) * 100 : 0;
                  return (
                    <button
                      key={ql.id}
                      onClick={() => setScreen({ type: 'questlineDetail', questlineId: ql.id })}
                      className="w-full card-glass p-3 text-left hover:border-surface-600/60 transition-all duration-300 group active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-surface-200 group-hover:text-surface-100 transition-colors">
                          ⚔️ {ql.title}
                        </span>
                        <span className="text-[10px] font-mono text-surface-500">
                          {ql.hpCurrent}/{ql.hpMax} HP
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-900 rounded-full overflow-hidden">
                        <div
                          className={`hp-bar-fill h-full rounded-full ${
                            hpPercent <= 25
                              ? 'bg-hp-green'
                              : hpPercent <= 50
                              ? 'bg-hp-yellow'
                              : 'bg-hp-red'
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quest List */}
            <QuestList
              onNavigateToQuestline={(id) =>
                setScreen({ type: 'questlineDetail', questlineId: id })
              }
              onStartFocus={handleStartFocus}
            />

            {/* Data Management */}
            <div className="card-glass p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-3">
                Data Management
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadDataAsFile}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-300 border border-surface-700/50 transition-all active:scale-[0.98]"
                >
                  📥 Export Backup
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-surface-800 hover:bg-surface-700 text-surface-300 border border-surface-700/50 transition-all active:scale-[0.98]"
                >
                  📤 Import Backup
                </button>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full mt-2 py-2 rounded-lg text-xs text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                Reset All Data
              </button>
            </div>
          </div>
        )}

        {/* ─── New Questline ─── */}
        {screen.type === 'newQuestline' && (
          <div className="pt-6">
            <NewQuestlineFlow
              onComplete={(id) => setScreen({ type: 'questlineDetail', questlineId: id })}
              onCancel={() => setScreen({ type: 'today' })}
            />
          </div>
        )}

        {/* ─── Questline Detail ─── */}
        {screen.type === 'questlineDetail' && (
          <div className="pt-6">
            <QuestlineDetail
              questlineId={screen.questlineId}
              onBack={() => setScreen({ type: 'dashboard' })}
              onStartFocus={handleStartFocus}
            />
          </div>
        )}

        {/* ─── Study Den ─── */}
        {screen.type === 'den' && (
          <div className="pt-6">
            <StudyDen />
          </div>
        )}
      </main>

      {/* Navigation */}
      <NavBar
        activeScreen={getActiveNav()}
        onNavigate={handleNavigate}
        denItemCount={player.denItems.length}
      />
    </div>
  );
}
