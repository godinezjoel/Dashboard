import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { getPetHealthState, getHealthBarColor, calculateLevelPercent } from '../../lib/gameLogic';
import './PetStatusWidget.css';

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
  healthy: 'color-healthy',
  normal: 'color-normal',
  low: 'color-low',
  critical: 'color-critical',
};

const HEALTH_BAR_CLASSES = {
  'bg-red-500': 'bar-critical',
  'bg-amber-500': 'bar-low',
  'bg-emerald-500': 'bar-healthy',
  'bg-yellow-400': 'bar-normal',
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
      className="pet-widget-container"
    >
      <div className={`card pet-widget-card ${healthState === 'critical' ? 'state-critical' : ''}`}>
        {/* Pet + Info */}
        <div className="pet-widget-header">
          {/* Pet sprite */}
          <div className="pet-widget-avatar-container">
            <span
              className={`pet-sprite-icon ${HEALTH_ANIMATIONS[healthState]}`}
            >
              {petEmoji}
            </span>
            {healthState === 'critical' && (
              <span className="pet-widget-critical-badge">🆘</span>
            )}
          </div>

          {/* Name + Level */}
          <div className="pet-widget-info">
            <div className="pet-widget-name-row">
              <span className="pet-widget-name">
                {petName}
              </span>
              <span className="pet-widget-level-badge">
                Lv.{profile.level}
              </span>
            </div>
            <span className={`pet-widget-status-label ${HEALTH_LABEL_COLORS[healthState]}`}>
              {HEALTH_LABELS[healthState]}
            </span>
          </div>
        </div>

        {/* Health Bar */}
        <div className="pet-widget-section">
          <div className="pet-widget-section-header">
            <span className="pet-widget-section-label">HP</span>
            <span className={`pet-widget-section-value ${healthState === 'critical' ? 'color-critical' : 'color-healthy'}`}>
              {Math.round(health)}%
            </span>
          </div>
          <div className="pet-widget-progress-container">
            <motion.div
              className={`pet-widget-progress-fill ${HEALTH_BAR_CLASSES[barColor] || 'bar-normal'}`}
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div className="pet-widget-section xp-section">
          <div className="pet-widget-section-header">
            <span className="pet-widget-section-label">XP</span>
            <span className="pet-widget-section-value" style={{ color: 'var(--accent)' }}>
              {profile.xp} total
            </span>
          </div>
          <div className="pet-widget-progress-container xp-container">
            <motion.div
              className="pet-widget-progress-fill bar-xp"
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>

        {/* Coins */}
        <div className="pet-widget-coins-row">
          <span className="pet-widget-coins-label">Coins</span>
          <span className="pet-widget-coins-value">
            <span>🪙</span>
            {profile.coins.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
