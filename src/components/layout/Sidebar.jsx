import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  ShoppingBag,
  BarChart2,
  LogOut,
  Zap,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { calculateLevelPercent, xpToNextLevel } from '../../lib/gameLogic';

const NAV_ITEMS = [
  { to: '/',      icon: CheckSquare, label: 'Tasks'  },
  { to: '/shop',  icon: ShoppingBag, label: 'Shop'   },
  { to: '/stats', icon: BarChart2,   label: 'Stats'  },
];

export default function Sidebar() {
  const { profile, activePet, signOut } = useGame();
  const navigate = useNavigate();

  const levelPct = profile ? calculateLevelPercent(profile.xp) : 0;
  const xpLeft = profile ? xpToNextLevel(profile.xp) : 100;

  async function handleSignOut() {
    await signOut();
    navigate('/auth');
  }

  return (
    <aside
      className="flex flex-col h-screen relative z-10 overflow-hidden"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Life-OS
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Profile + XP */}
      {profile && (
        <div
          className="mx-3 mb-4 p-3 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              {(profile.username?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {profile.username || 'Player'}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Level {profile.level}
              </p>
            </div>
            <span className="text-sm text-amber-400 flex items-center gap-0.5">
              <span className="text-xs">🪙</span>
              <span className="text-xs font-semibold">{profile.coins}</span>
            </span>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Zap size={9} />
                XP
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>
                {xpLeft} to next
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-primary)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--accent)', width: `${levelPct}%` }}
                layout
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive ? 'nav-item-active' : ''
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {}
                : { color: 'var(--text-secondary)' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={`transition-colors ${isActive ? '' : 'group-hover:text-accent'}`}
                  style={isActive ? { color: 'var(--accent)' } : {}}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Active pet mini indicator */}
      {activePet?.pet && (
        <div
          className="mx-3 mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <span className="text-base">{activePet.pet.sprite_emoji}</span>
          <div>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>
              {activePet.pet.name}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              HP: {Math.round(activePet.health ?? 0)}%
            </p>
          </div>
        </div>
      )}

      {/* Sign out */}
      <div className="px-3 pb-5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
