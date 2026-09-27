// ─── Navigation Bar ───
// Bottom navigation for mobile-first game UI — 3 tabs.
// Added safe-area support for notched phones and better active states.

interface NavBarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  denItemCount: number;
}

const NAV_ITEMS = [
  { key: 'today', label: 'Today', emoji: '☀️' },
  { key: 'dashboard', label: 'Quests', emoji: '⚔️' },
  { key: 'den', label: 'Den', emoji: '🏠' },
];

export default function NavBar({ activeScreen, onNavigate, denItemCount }: NavBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-900/95 backdrop-blur-xl border-t border-surface-800/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.key;
          return (
            <button
              key={item.key}
              id={`nav-${item.key}`}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-300 relative active:scale-95 min-w-[64px] ${
                isActive
                  ? 'text-ember-400'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                {item.emoji}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-ember-500" />
              )}
              {/* Badge for den items */}
              {item.key === 'den' && denItemCount > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-ember-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {denItemCount > 9 ? '9+' : denItemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
