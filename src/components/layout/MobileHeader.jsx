import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hexagon,
  Sun,
  Moon,
  LogOut,
  Wrench,
  Plus,
  Minus,
  Zap,
  Heart,
  AlertTriangle,
  ShoppingBag,
  BarChart2,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import {
  calculateLevelPercent,
  xpToNextLevel,
  getPetHealthState,
  calculateCurrentHealth,
} from '../../lib/gameLogic';

const PAGE_TITLES = {
  '/': 'Tasks',
  '/pet': 'My Pet',
  '/shop': 'Shop',
  '/stats': 'Stats',
  '/school/grades': 'Grade Tracker',
  '/school/exams': 'Exam Prep',
};

export default function MobileHeader() {
  const [showMore, setShowMore] = useState(false);
  const { profile, activePet, signOut, theme, setTheme, devUpdateProfile } =
    useGame();
  const location = useLocation();
  const navigate = useNavigate();

  // Close sheet on route change
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';
  const levelPct = profile ? calculateLevelPercent(profile.xp) : 0;
  const xpLeft = profile ? xpToNextLevel(profile.xp) : 100;
  const petHealth = activePet
    ? calculateCurrentHealth(activePet.last_fed, activePet.health)
    : 0;
  const petHealthState = getPetHealthState(petHealth);

  async function handleSignOut() {
    await signOut();
    navigate('/auth');
    setShowMore(false);
  }

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-40 md:hidden
                   h-14 flex items-center justify-between px-4
                   bg-[var(--bg-glass)] backdrop-blur-xl
                   border-b border-[var(--border)]"
      >
        {/* Left — Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center
                       bg-[var(--text-primary)] text-[var(--bg-primary)]"
          >
            <Hexagon size={14} fill="currentColor" />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">
            Life-OS
          </span>
        </div>

        {/* Center — Page title */}
        <h1 className="text-sm font-semibold text-[var(--text-primary)] absolute left-1/2 -translate-x-1/2">
          {pageTitle}
        </h1>

        {/* Right — Coins + Avatar */}
        <button
          onClick={() => setShowMore(true)}
          className="flex items-center gap-2.5"
        >
          {profile && (
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Hexagon
                size={10}
                fill="currentColor"
                style={{ opacity: 0.5 }}
              />
              {profile.coins}
            </span>
          )}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center
                       text-xs font-bold
                       bg-[var(--text-primary)] text-[var(--bg-primary)]"
          >
            {(profile?.username?.[0] ?? 'U').toUpperCase()}
          </div>
        </button>
      </header>

      {/* ── "More" Sheet ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden
                         max-h-[80vh] overflow-y-auto
                         bg-[var(--bg-surface)] rounded-t-3xl
                         border-t border-[var(--border)]"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
              </div>

              {/* ── Profile Section ────────────────────────────────────── */}
              {profile && (
                <div className="px-5 pt-2 pb-4">
                  {/* Profile header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center
                                 text-lg font-bold
                                 bg-[var(--text-primary)] text-[var(--bg-primary)]"
                    >
                      {(profile.username?.[0] ?? 'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-[var(--text-primary)] truncate">
                        {profile.username || 'Player'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Level {profile.level}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-1.5 shrink-0">
                      <Hexagon
                        size={14}
                        fill="currentColor"
                        style={{ opacity: 0.5 }}
                      />
                      {profile.coins}
                    </span>
                  </div>

                  {/* XP progress */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                        <Zap size={10} /> XP
                      </span>
                      <span className="text-[11px] font-mono text-[var(--accent)]">
                        {xpLeft} to next
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent)]"
                        animate={{ width: `${levelPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Pet health */}
                  {activePet?.pet && (
                    <div className="pt-3 border-t border-[var(--border)]">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                          <Heart size={10} />{' '}
                          {activePet.custom_name || activePet.pet.name}
                        </span>
                        <span
                          className={`text-[11px] font-mono ${
                            petHealthState === 'critical'
                              ? 'text-red-400'
                              : petHealthState === 'low'
                                ? 'text-orange-400'
                                : 'text-[var(--accent)]'
                          }`}
                        >
                          {petHealthState === 'critical' && (
                            <AlertTriangle
                              size={10}
                              className="inline mr-0.5"
                            />
                          )}
                          {Math.round(petHealth)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                        <motion.div
                          className={`h-full rounded-full ${
                            petHealthState === 'critical'
                              ? 'bg-red-400'
                              : petHealthState === 'low'
                                ? 'bg-orange-400'
                                : 'bg-[var(--accent)]'
                          }`}
                          animate={{ width: `${petHealth}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-[var(--border)]" />

              {/* ── Actions ────────────────────────────────────────────── */}
              <div className="p-4 space-y-1">
                {/* Pet Shop */}
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                             text-sm font-medium text-[var(--text-secondary)]
                             hover:bg-[var(--accent-subtle)] active:bg-[var(--accent-subtle)]
                             transition-colors"
                >
                  <ShoppingBag size={18} />
                  <span>Pet Shop</span>
                </button>

                {/* Statistics */}
                <button
                  onClick={() => navigate('/stats')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                             text-sm font-medium text-[var(--text-secondary)]
                             hover:bg-[var(--accent-subtle)] active:bg-[var(--accent-subtle)]
                             transition-colors"
                >
                  <BarChart2 size={18} />
                  <span>Statistics</span>
                </button>

                {/* Theme toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl
                             text-sm font-medium text-[var(--text-secondary)]
                             hover:bg-[var(--accent-subtle)] active:bg-[var(--accent-subtle)]
                             transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon size={18} />
                    ) : (
                      <Sun size={18} />
                    )}
                    <span>
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <div className="w-9 h-5 rounded-full relative bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <motion.div
                      className="w-3.5 h-3.5 rounded-full bg-[var(--text-secondary)] absolute top-[2px]"
                      animate={{ left: theme === 'dark' ? '3px' : '16px' }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    />
                  </div>
                </button>

                {/* Dev Tools */}
                <div className="px-4 pt-3 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500 flex items-center gap-2 mb-3">
                    <Wrench size={10} /> Dev Tools
                  </p>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() =>
                        devUpdateProfile({ xpDelta: 50, coinsDelta: 50 })
                      }
                      className="flex-1 py-2.5 rounded-lg text-[11px] font-bold
                                 bg-purple-500/10 text-purple-400
                                 active:scale-95 transition-transform"
                    >
                      +50 XP/Coins
                    </button>
                    <button
                      onClick={() =>
                        devUpdateProfile({ targetLevel: profile.level + 1 })
                      }
                      className="flex-1 py-2.5 rounded-lg text-[11px] font-bold
                                 bg-purple-500/10 text-purple-400
                                 active:scale-95 transition-transform"
                    >
                      +1 Level
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => devUpdateProfile({ healthDelta: 20 })}
                      className="flex-1 py-2.5 rounded-lg text-[11px] font-bold
                                 bg-emerald-500/10 text-emerald-400
                                 active:scale-95 transition-transform
                                 flex items-center justify-center gap-1"
                    >
                      <Plus size={10} /> HP
                    </button>
                    <button
                      onClick={() => devUpdateProfile({ healthDelta: -20 })}
                      className="flex-1 py-2.5 rounded-lg text-[11px] font-bold
                                 bg-red-500/10 text-red-400
                                 active:scale-95 transition-transform
                                 flex items-center justify-center gap-1"
                    >
                      <Minus size={10} /> HP
                    </button>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                             text-sm font-medium text-[var(--text-muted)]
                             hover:text-red-500 active:text-red-500
                             transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
