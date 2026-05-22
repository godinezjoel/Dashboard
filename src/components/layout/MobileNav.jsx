import { NavLink, useLocation } from 'react-router-dom';
import {
  CheckSquare,
  GraduationCap,
  Heart,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',              icon: CheckSquare,   label: 'Tasks',  match: '/'       },
  { to: '/school/grades', icon: GraduationCap, label: 'School', match: '/school' },
  { to: '/pet',           icon: Heart,         label: 'Pet',    match: '/pet'    },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                 bg-[var(--bg-glass)] backdrop-blur-xl
                 border-t border-[var(--border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="h-16 flex items-stretch justify-around">
        {NAV_ITEMS.map(({ to, icon: Icon, label, match }) => {
          const isActive =
            match === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(match);

          return (
            <NavLink
              key={to}
              to={to}
              className={() =>
                `flex flex-col items-center justify-center gap-0.5 flex-1
                 transition-all duration-150 relative
                 ${
                   isActive
                     ? 'text-[var(--accent)]'
                     : 'text-[var(--text-muted)] active:text-[var(--text-secondary)]'
                 }`
              }
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute top-1.5 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-transform duration-150"
                style={isActive ? { transform: 'scale(1.1)' } : undefined}
              />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
