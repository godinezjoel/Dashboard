import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { getPetHealthState, getHealthBarColor, calculateLevelPercent } from '../../lib/gameLogic';

const HEALTH_ANIMATIONS = {
  healthy: 'animate-pet-float',
  normal: 'animate-pet-float',
  low: 'animate-[petFloat_2s_ease-in-out_infinite]',
  critical: 'animate-pet-critical',
};

const HEALTH_LABELS = {
  healthy: '✦ Happy',
  normal: '○ Okay',
  low: '⚠ Hungry',
  critical: '💀 Critical',
};

const HEALTH_LABEL_COLORS = {
  healthy: 'text-emerald-400',
  normal: 'text-yellow-400',
  low: 'text-amber-500',
  critical: 'text-red-400',
};

export default function PetStatusWidget() {
  const { profile, activePet } = useGame();
  if (!profile || !activePet) return null;

  const health = activePet.health ?? 0;
  const healthState = getPetHealthState(health);
  const barColor = getHealthBarColor(health);
  const levelPct = calculateLevelPercent(profile.xp);
  const petEmoji = activePet.pet?.sprite_emoji ?? '🥚';
  const petName = activePet.pet?.name ?? 'Pet';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="fixed top-4 right-4 z-50 w-56 select-none"
    >
      <div
        className="card p-3 backdrop-blur-md"
        style={{
          background: 'rgba(26, 27, 46, 0.85)',
          border: healthState === 'critical'
            ? '1px solid rgba(239, 68, 68, 0.5)'
            : 'var(--border)',
          boxShadow: healthState === 'critical'
            ? '0 0 24px rgba(239,68,68,0.25), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Pet + Info */}
        <div className="flex items-center gap-3 mb-2.5">
          {/* Pet sprite */}
          <div className="relative flex-shrink-0">
            <span
              className={`pet-emoji text-3xl ${HEALTH_ANIMATIONS[healthState]}`}
            >
              {petEmoji}
            </span>
            {healthState === 'critical' && (
              <span className="absolute -top-1 -right-1 text-xs animate-pulse">🆘</span>
            )}
          </div>

          {/* Name + Level */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {petName}
              </span>
              <span className="badge text-[10px] flex-shrink-0">
                Lv.{profile.level}
              </span>
            </div>
            <span className={`text-[10px] font-medium ${HEALTH_LABEL_COLORS[healthState]}`}>
              {HEALTH_LABELS[healthState]}
            </span>
          </div>
        </div>

        {/* Health Bar */}
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>HP</span>
            <span className={`text-[10px] font-mono font-medium ${
              healthState === 'critical' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {Math.round(health)}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
          >
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                boxShadow: healthState === 'critical'
                  ? '0 0 6px rgba(239,68,68,0.6)'
                  : undefined,
              }}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>XP</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>
              {profile.xp} total
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
          >
            <motion.div
              className="h-full rounded-full bg-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>

        {/* Coins */}
        <div
          className="mt-2.5 flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Coins</span>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
            <span>🪙</span>
            {profile.coins.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
