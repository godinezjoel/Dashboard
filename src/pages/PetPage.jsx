import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Heart, Flame, Pencil, Check } from 'lucide-react';
import { calculateCurrentHealth } from '../lib/gameLogic';
import { getPetComponent } from '../components/pets/PetSprites';

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

  const healthColor = health > 60 ? '#4ade80' : health > 30 ? '#f59e0b' : '#ef4444';
  const glowColor   = health > 60 ? '#4ade80' : health > 30 ? '#f59e0b' : '#ef4444';
  const healthTextClass = health > 60 ? 'text-green-400' : health > 30 ? 'text-amber-500' : 'text-red-500';
  const glowClass = health > 60
    ? 'bg-[radial-gradient(circle,#4ade80_0%,transparent_70%)]'
    : health > 30
      ? 'bg-[radial-gradient(circle,#f59e0b_0%,transparent_70%)]'
      : 'bg-[radial-gradient(circle,#ef4444_0%,transparent_70%)]';
  const glowBarClass = health > 60 ? 'bg-green-400' : health > 30 ? 'bg-amber-500' : 'bg-red-500';

  const PetComponent = activePet?.pet?.name ? getPetComponent(activePet.pet.name) : null;

  if (!activePet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-primary-var">
        <div className="text-center space-y-4">
          <p className="text-5xl">🥚</p>
          <p className="text-lg font-bold text-primary-var">No active pet</p>
          <p className="text-sm text-muted-var">Head over to the Shop to get your first companion!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-primary-var">
      {/* Radial ambient background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.div
          className={`rounded-full blur-3xl w-[500px] h-[500px] ${glowClass}`}
          animate={{ opacity: [0.12, 0.22, 0.12], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

        {/* Streak chip */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-2 px-5 py-2 rounded-full backdrop-blur-sm bg-surface-var border border-var"
        >
          <Flame size={14} className={streak > 0 ? 'text-orange-500' : 'text-muted-var'} />
          <span className="text-xs font-black uppercase tracking-widest text-secondary-var">
            {streak} Day Streak
          </span>
        </motion.div>

        {/* Pet Name */}
        <div className="mb-6 flex items-center justify-center min-h-[44px]">
          <AnimatePresence mode="wait">
            {isRenaming ? (
              <motion.div
                key="renaming"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <input
                  autoFocus
                  className="text-2xl font-black text-center bg-transparent outline-none px-2 py-1 rounded-lg w-48 text-primary-var border border-[var(--accent)]"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  maxLength={20}
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 rounded-xl flex items-center justify-center bg-[var(--accent)] text-[var(--bg-primary)]"
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
                className="relative flex items-center justify-center group"
              >
                <h2 className="text-3xl font-black tracking-tight px-6 text-primary-var">
                  {displayName}
                </h2>
                <div className="absolute right-0 opacity-0 group-hover:opacity-60 transition-opacity">
                  <Pencil size={14} className="text-muted-var" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Pet type sub-label */}
        {activePet.custom_name && (
          <p className="text-[11px] uppercase tracking-widest mb-6 text-muted-var">
            {activePet.pet?.name}
          </p>
        )}

        {/* Pet Sprite */}
        <motion.div
          className="relative"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          {/* Subtle under-glow */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full blur-xl opacity-30 ${glowBarClass}`}
          />

          {PetComponent && <PetComponent health={health} />}
        </motion.div>

        {/* Health status label */}
        <motion.p
          key={Math.round(health / 10)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 mb-6 text-xs font-bold uppercase tracking-widest ${healthTextClass}`}
        >
          {health > 80 ? '✦ Thriving' : health > 60 ? 'Healthy' : health > 30 ? 'Needs attention' : '⚠ Critical'}
        </motion.p>

        {/* Health Bar */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-muted-var">
              <Heart size={11} className={healthTextClass} />
              Vitality
            </span>
            <span className="text-xs font-mono font-black text-primary-var">{Math.round(health)}%</span>
          </div>

          <div className="h-3 w-full rounded-full overflow-hidden bg-elevated-var">
            <motion.div
              className={`h-full rounded-full relative overflow-hidden ${glowBarClass}`}
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Shine */}
              <div className="absolute inset-0 bg-white/20 w-1/2 skew-x-12" />
            </motion.div>
          </div>

          {/* Tick marks */}
          <div className="flex justify-between px-0.5">
            {[0, 25, 50, 75, 100].map(mark => (
              <span key={mark} className="text-[8px] font-mono text-muted-var opacity-40">
                {mark}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
