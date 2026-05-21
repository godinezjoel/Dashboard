import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  ShoppingBag,
  BarChart2,
  BookOpen,
  LogOut,
  Zap,
  Heart,
  Hexagon,
  AlertTriangle,
  Sun,
  Moon,
  Wrench,
  Plus,
  Minus
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
  { to: '/journal', icon: BookOpen, label: 'Journal' },
];

const PET_HEALTH_TEXT_CLASS = {
  critical: 'text-red-400',
  low: 'text-orange-400',
  normal: 'text-muted-var',
  healthy: 'text-muted-var',
};

const PET_HEALTH_BAR_CLASS = {
  critical: 'bg-red-400',
  low: 'bg-orange-400',
  normal: 'bg-[var(--accent)]',
  healthy: 'bg-[var(--accent)]',
};

export default function Sidebar() {
  const { profile, activePet, signOut, theme, setTheme, devUpdateProfile } = useGame();
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
    <aside className="flex flex-col h-screen relative z-10 overflow-hidden w-[var(--sidebar-width)] bg-surface-var border-r border-var">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg bg-[var(--text-primary)] text-[var(--bg-primary)]">
            <Hexagon size={18} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-primary-var">
              Life-OS
            </h1>
            <p className="text-[10px] text-muted-var">
              Productive
            </p>
          </div>
        </div>
      </div>

      {/* Profile + XP */}
      {profile && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-card-var border border-var">
          <div className="flex items-center gap-2 mb-2">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-[var(--text-primary)] text-[var(--bg-primary)]">
              {(profile.username?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-primary-var">
                {profile.username || 'Player'}
              </p>
              <p className="text-[10px] text-muted-var">
                Level {profile.level}
              </p>
            </div>
            <span className="text-sm flex items-center gap-1 text-primary-var">
              <Hexagon size={12} fill="currentColor" className="opacity-50" />
              <span className="text-xs font-semibold">{profile.coins}</span>
            </span>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] flex items-center gap-1 text-muted-var">
                <Zap size={9} />
                XP
              </span>
              <span className="text-[10px] font-mono text-accent-var">
                {xpLeft} to next
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-primary-var">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                animate={{ width: `${levelPct}%` }}
                layout
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Pet Vitality — merged into profile card */}
          {activePet?.pet && (
            <div className="mt-2.5 pt-2.5 border-t border-var">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] flex items-center gap-1 text-muted-var">
                  <Heart size={9} />
                  {activePet.custom_name || activePet.pet.name}
                </span>
                <span className={`text-[10px] font-mono ${PET_HEALTH_TEXT_CLASS[petHealthState] ?? 'text-muted-var'}`}>
                  {petHealthState === 'critical' && <AlertTriangle size={9} className="inline mr-0.5" />}
                  {Math.round(petHealth)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-primary-var">
                <motion.div
                  className={`h-full rounded-full ${PET_HEALTH_BAR_CLASS[petHealthState] ?? 'bg-[var(--accent)]'}`}
                  animate={{ width: `${petHealth}%` }}
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
                isActive ? 'nav-item-active' : 'text-secondary-var'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={`transition-colors ${isActive ? 'text-accent-var' : 'group-hover:text-accent'}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="mb-2 mt-6 px-3 text-[10px] font-bold tracking-wider text-neutral-600 uppercase">Productive</div>
        {DASHBOARD_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive ? 'nav-item-active' : 'text-secondary-var'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={`transition-colors ${isActive ? 'text-accent-var' : 'group-hover:text-accent'}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="mb-2 mt-6 px-3 flex items-center gap-2 text-[10px] font-bold tracking-wider text-purple-500 uppercase">
          <Wrench size={10} /> Dev Tools
        </div>
        <div className="px-3 space-y-2">
          {/* XP & Coins */}
          <div className="flex gap-2">
            <button 
              onClick={() => devUpdateProfile({ xpDelta: 50, coinsDelta: 50 })}
              className="flex-1 py-1.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[10px] font-bold transition-colors"
            >
              +50 XP/Coins
            </button>
            <button 
              onClick={() => devUpdateProfile({ targetLevel: profile.level + 1 })}
              className="flex-1 py-1.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-[10px] font-bold transition-colors"
            >
              +1 Level
            </button>
          </div>
          
          {/* Pet Health */}
          <div className="flex gap-2">
            <button 
              onClick={() => devUpdateProfile({ healthDelta: 20 })}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition-colors"
            >
              <Plus size={10} /> HP
            </button>
            <button 
              onClick={() => devUpdateProfile({ healthDelta: -20 })}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-bold transition-colors"
            >
              <Minus size={10} /> HP
            </button>
          </div>
        </div>
      </nav>

      {/* Pet Status Card — now merged into profile card above */}

      {/* Bottom Actions (Theme + Sign out) */}
      <div className="px-3 pb-5 space-y-1 mt-auto">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-muted-var icon-btn-muted"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className="w-8 h-4 rounded-full relative bg-elevated-var border border-var">
            <motion.div 
              className="absolute top-[1px] w-3 h-3 rounded-full bg-[var(--text-secondary)]"
              animate={{ left: theme === 'dark' ? '2px' : '16px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          </div>
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-muted-var icon-btn-danger"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
