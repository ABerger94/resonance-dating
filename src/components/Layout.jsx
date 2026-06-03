import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Radio, MessageSquare, User, Settings, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/void', label: 'VOID', icon: Radio },
  { to: '/threads', label: 'THREADS', icon: MessageSquare },
  { to: '/profile', label: 'PROFILE', icon: User },
  { to: '/settings', label: 'SETTINGS', icon: Settings },
];

export default function Layout() {
  const location = useLocation();

  // Don't show nav in sandbox (full-screen experience)
  const isSandbox = location.pathname.startsWith('/sandbox');

  return (
    <div className="min-h-screen flex flex-col font-mono" style={{ background: 'hsl(var(--background))' }}>
      {/* Top nav */}
      {!isSandbox && (
        <nav 
          className="border-b px-4 sm:px-6 py-3 flex items-center justify-between flex-none"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            <span className="font-bold tracking-widest text-sm text-primary">RESONANCE</span>
            <span className="hidden sm:block text-muted-foreground/30" style={{ fontSize: '9px' }}>
              v0.1.0-mvp
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
              return (
                <NavLink
                  key={to}
                  to={to}
                  className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '2px',
                    color: active ? 'hsl(258 90% 60%)' : 'hsl(230 15% 50%)',
                    borderBottom: active ? '2px solid hsl(258 90% 60%)' : '2px solid transparent',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  <Icon size={10} />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5" style={{ fontSize: '9px', color: 'hsl(230 15% 60%)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="hidden sm:block tracking-widest">ONLINE</span>
          </div>
        </nav>
      )}

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}