import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Heart, Flame, Pencil, Check } from 'lucide-react';
import { calculateCurrentHealth } from '../lib/gameLogic';
import { getPetComponent } from '../components/pets/PetSprites';
import './PetPage.css';

export default function PetPage() {
  const { activePet, devUpdateProfile, profile } = useGame();
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  const health = activePet ? calculateCurrentHealth(activePet.last_fed, activePet.health) : 0;
  const displayName = activePet?.custom_name || activePet?.pet?.name || 'No Pet Active';
  const streak = profile?.streak || 0;

  useEffect(() => {
    if (activePet) {
      setTempName(activePet.custom_name || activePet.pet?.name || '');
    }
  }, [activePet]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      devUpdateProfile({ customPetName: tempName.trim() });
    }
    setIsRenaming(false);
  };

  const statusState = health > 60 ? 'thriving' : health > 30 ? 'low' : 'critical';
  const PetComponent = activePet?.pet?.name ? getPetComponent(activePet.pet.name) : null;

  if (!activePet) {
    return (
      <div className="pet-page-container">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '48px', margin: 0 }}>🥚</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>No active pet</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Head over to the Shop to get your first companion!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-page-container">
      {/* Radial ambient background glow */}
      <div className="ambient-glow-wrapper">
        <motion.div
          className={`ambient-glow ${statusState}`}
          animate={{ opacity: [0.6, 1.0, 0.6], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
      </div>

      <div className="pet-content-wrapper">

        {/* Streak chip */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="streak-chip"
        >
          <Flame size={14} className={streak > 0 ? 'text-orange-500' : 'text-muted-var'} />
          <span className="streak-chip-text">
            {streak} Day Streak
          </span>
        </motion.div>

        {/* Pet Name */}
        <div className="pet-name-container">
          <AnimatePresence mode="wait">
            {isRenaming ? (
              <motion.div
                key="renaming"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <input
                  autoFocus
                  className="pet-rename-input"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  maxLength={20}
                />
                <button
                  onClick={handleSaveName}
                  className="pet-rename-save-btn"
                >
                  <Check size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="display"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setIsRenaming(true)}
                className="pet-name-display-btn"
              >
                <h2 className="pet-name-title">
                  {displayName}
                </h2>
                <div className="pet-name-pencil-icon">
                  <Pencil size={14} />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Pet type sub-label */}
        {activePet.custom_name && (
          <p className="pet-type-subtitle">
            {activePet.pet?.name}
          </p>
        )}

        {/* Pet Sprite */}
        <motion.div
          className="pet-sprite-container"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          {/* Subtle under-glow */}
          <div className={`pet-under-glow ${statusState}`} />

          {PetComponent && <PetComponent health={health} />}
        </motion.div>

        {/* Health status label */}
        <motion.p
          key={Math.round(health / 10)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`pet-health-status ${statusState}`}
        >
          {health > 80 ? '✦ Thriving' : health > 60 ? 'Healthy' : health > 30 ? 'Needs attention' : '⚠ Critical'}
        </motion.p>

        {/* Health Bar */}
        <div className="pet-health-bar-container">
          <div className="pet-health-bar-header">
            <span className="pet-health-bar-label">
              <Heart size={11} className={statusState} fill={health > 30 ? 'currentColor' : 'none'} />
              Vitality
            </span>
            <span className="pet-health-bar-percent">{Math.round(health)}%</span>
          </div>

          <div className="pet-health-bar-track">
            <motion.div
              className={`pet-health-bar-fill ${statusState}`}
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          {/* Tick marks */}
          <div className="pet-health-bar-ticks">
            {[0, 25, 50, 75, 100].map(mark => (
              <span key={mark} className="pet-health-bar-tick">
                {mark}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
