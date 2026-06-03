import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Radio, MessageSquare, User, Settings } from 'lucide-react';
import ResonanceLogo from '@/components/ResonanceLogo';

const NAV_ITEMS = [
  { to: '/void', label: 'VOID', icon: Radio },
  { to: '/threads', label: 'THREADS', icon: MessageSquare },
  { to: '/profile', label: 'PROFILE', icon: User },
  { to: '/settings', label: 'SETTINGS', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const isSandbox = location.pathname.startsWith('/sandbox');

  return (
    <div className="min-h-screen flex flex-col font-mono" style={{ background: 'hsl(var(--background))' }}>
      {/* Top brand bar */}
      {!isSandbox && (
        <header
          className="flex-none border-b px-4 py-3 flex items-center justify-between"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div className="flex items-center gap-2">
            <ResonanceLogo size={28} />
          </div>
          <div className="flex items-center gap-1.5" style={{ fontSize: '9px', color: 'hsl(230 15% 60%)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="tracking-widest">ONLINE</span>
          </div>
        </header>
      )}

      {/* Page content — padded at bottom so content clears the nav */}
      <main className={`flex-1 ${!isSandbox ? 'pb-20' : ''}`}>
        <Outlet />
      </main>

      {/* Bottom nav — dating-app style */}
      {!isSandbox && (
        <nav
          className="fixed bottom-0 left-0 right-0 border-t flex items-center justify-around z-50"
          style={{
            borderColor: 'hsl(var(--border))',
            background: 'hsl(var(--card))',
            paddingBottom: 'env(safe-area-inset-bottom)',
            minHeight: '64px'
          }}
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all"
                style={{ minHeight: '56px' }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-2xl transition-all"
                  style={{
                    background: active ? 'hsl(258 90% 60% / 0.12)' : 'transparent',
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      color: active ? 'hsl(258 90% 60%)' : 'hsl(230 15% 55%)',
                      strokeWidth: active ? 2.5 : 1.5
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    letterSpacing: '1.5px',
                    color: active ? 'hsl(258 90% 60%)' : 'hsl(230 15% 55%)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: active ? 700 : 400
                  }}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}