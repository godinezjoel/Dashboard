import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  ShoppingBag,
  BarChart2,
  LogOut,
  Zap,
  Heart,
  Hexagon,
  AlertTriangle,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { calculateLevelPercent, xpToNextLevel, getPetHealthState, calculateCurrentHealth } from '../../lib/gameLogic';

const PERSONAL_ITEMS = [
  { to: '/pet',   icon: Heart,       label: 'My Pet' },
  { to: '/stats', icon: BarChart2,   label: 'Stats'  },
  { to: '/shop',  icon: ShoppingBag, label: 'Shop'   },
];

const DASHBOARD_ITEMS = [
  { to: '/',      icon: CheckSquare, label: 'Tasks'  },
];

export default function Sidebar() {
  const { profile, activePet, signOut, theme, setTheme } = useGame();
  const navigate = useNavigate();

  const levelPct = profile ? calculateLevelPercent(profile.xp) : 0;
  const xpLeft = profile ? xpToNextLevel(profile.xp) : 100;
  const petHealth = activePet ? calculateCurrentHealth(activePet.last_fed, activePet.health) : 0;
  const petHealthState = getPetHealthState(petHealth);

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
            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            <Hexagon size={18} fill="currentColor" />
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
              style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
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
            <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <Hexagon size={12} fill="currentColor" className="opacity-50" />
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

          {/* Pet Vitality — merged into profile card */}
          {activePet?.pet && (
            <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Heart size={9} />
                  {activePet.custom_name || activePet.pet.name}
                </span>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: petHealthState === 'critical' ? '#f87171' : petHealthState === 'low' ? '#fb923c' : 'var(--text-muted)' }}
                >
                  {petHealthState === 'critical' && <AlertTriangle size={9} className="inline mr-0.5" />}
                  {Math.round(petHealth)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${petHealth}%`,
                    background: petHealthState === 'critical' ? '#f87171' : petHealthState === 'low' ? '#fb923c' : 'var(--accent)',
                  }}
                  layout
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="mb-2 mt-2 px-3 text-[10px] font-bold tracking-wider text-neutral-600 uppercase">Personal</div>
        {PERSONAL_ITEMS.map(({ to, icon: Icon, label }) => (
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

        <div className="mb-2 mt-6 px-3 text-[10px] font-bold tracking-wider text-neutral-600 uppercase">Dashboard</div>
        {DASHBOARD_ITEMS.map(({ to, icon: Icon, label }) => (
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

      {/* Pet Status Card — now merged into profile card above */}

      {/* Bottom Actions (Theme + Sign out) */}
      <div className="px-3 pb-5 space-y-1 mt-auto">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div 
            className="w-8 h-4 rounded-full relative" 
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <motion.div 
              className="absolute top-[1px] w-3 h-3 rounded-full"
              style={{ background: 'var(--text-secondary)' }}
              animate={{ left: theme === 'dark' ? '2px' : '16px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          </div>
        </button>

        {/* Sign out */}
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
