import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  ShoppingBag,
  BarChart2,
  GraduationCap,
  LogOut,
  Zap,
  Heart,
  Hexagon,
  AlertTriangle,
  Sun,
  Moon,
  Wrench,
  Plus,
  Minus,
  Calendar
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { calculateLevelPercent, xpToNextLevel, getPetHealthState, calculateCurrentHealth } from '../../lib/gameLogic';
import './Sidebar.css';

const PERSONAL_ITEMS = [
  { to: '/pet',   icon: Heart,       label: 'My Pet' },
  { to: '/stats', icon: BarChart2,   label: 'Stats'  },
  { to: '/shop',  icon: ShoppingBag, label: 'Shop'   },
];

const DASHBOARD_ITEMS = [
  { to: '/',      icon: CheckSquare, label: 'Tasks'  },
];

const SCHOOL_ITEMS = [
  { to: '/school/grades', icon: GraduationCap, label: 'Grade Tracker' },
  { to: '/school/exams',  icon: Calendar,      label: 'Exam Prep'     },
];

const PET_HEALTH_TEXT_CLASS = {
  critical: 'pet-vitality-critical',
  low: 'pet-vitality-low',
  normal: '',
  healthy: '',
};

const PET_HEALTH_BAR_CLASS = {
  critical: 'pet-bar-critical',
  low: 'pet-bar-low',
  normal: '',
  healthy: '',
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
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <div className="sidebar-logo-icon">
            <Hexagon size={18} fill="currentColor" />
          </div>
          <div>
            <h1 className="sidebar-logo-title">Life-OS</h1>
            <p className="sidebar-logo-subtitle">Productive</p>
          </div>
        </div>
      </div>

      {/* Profile + XP */}
      {profile && (
        <div className="sidebar-profile-card">
          <div className="profile-header">
            {/* Avatar */}
            <div className="profile-avatar">
              {(profile.username?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="profile-info">
              <p className="profile-username">
                {profile.username || 'Player'}
              </p>
              <p className="profile-level">
                Level {profile.level}
              </p>
            </div>
            <span className="profile-coins">
              <Hexagon size={12} fill="currentColor" style={{ opacity: 0.5 }} />
              <span>{profile.coins}</span>
            </span>
          </div>

          {/* XP Progress */}
          <div>
            <div className="xp-header">
              <span className="xp-label">
                <Zap size={9} />
                XP
              </span>
              <span className="xp-value">
                {xpLeft} to next
              </span>
            </div>
            <div className="progress-bar-bg">
              <motion.div
                className="progress-bar-fill"
                animate={{ width: `${levelPct}%` }}
                layout
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Pet Vitality */}
          {activePet?.pet && (
            <div className="pet-vitality">
              <div className="xp-header">
                <span className="xp-label">
                  <Heart size={9} />
                  {activePet.custom_name || activePet.pet.name}
                </span>
                <span className={`xp-value ${PET_HEALTH_TEXT_CLASS[petHealthState] ?? ''}`}>
                  {petHealthState === 'critical' && <AlertTriangle size={9} style={{ display: 'inline', marginRight: '2px' }} />}
                  {Math.round(petHealth)}%
                </span>
              </div>
              <div className="progress-bar-bg">
                <motion.div
                  className={`progress-bar-fill ${PET_HEALTH_BAR_CLASS[petHealthState] ?? ''}`}
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
      <nav className="sidebar-nav">
        <div className="nav-group-title">Personal</div>
        {PERSONAL_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="nav-group-title">Productive</div>
        {DASHBOARD_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="nav-group-title">School</div>
        {SCHOOL_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="nav-group-title dev-title">
          <Wrench size={10} /> Dev Tools
        </div>
        <div className="dev-tools-panel">
          {/* XP & Coins */}
          <div className="dev-tools-row">
            <button 
              onClick={() => devUpdateProfile({ xpDelta: 50, coinsDelta: 50 })}
              className="dev-btn dev-btn-purple"
            >
              +50 XP/Coins
            </button>
            <button 
              onClick={() => devUpdateProfile({ targetLevel: profile.level + 1 })}
              className="dev-btn dev-btn-purple"
            >
              +1 Level
            </button>
          </div>
          
          {/* Pet Health */}
          <div className="dev-tools-row">
            <button 
              onClick={() => devUpdateProfile({ healthDelta: 20 })}
              className="dev-btn dev-btn-emerald"
            >
              <Plus size={10} /> HP
            </button>
            <button 
              onClick={() => devUpdateProfile({ healthDelta: -20 })}
              className="dev-btn dev-btn-red"
            >
              <Minus size={10} /> HP
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Actions (Theme + Sign out) */}
      <div className="sidebar-footer">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="footer-btn"
        >
          <div className="footer-btn-left">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className="toggle-track">
            <motion.div 
              className="toggle-handle"
              animate={{ left: theme === 'dark' ? '2px' : '16px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          </div>
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="footer-btn footer-btn-danger"
        >
          <div className="footer-btn-left">
            <LogOut size={16} />
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
