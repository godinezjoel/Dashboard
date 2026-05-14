import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Heart, Activity, Flame, Egg, Dog, Cat, Bird, Rabbit, Ghost, Shield, Zap } from 'lucide-react';
import { calculateCurrentHealth } from '../lib/gameLogic';

const PET_ICONS = {
  'Eggling': Egg,
  'Pup': Dog,
  'Fox': Cat,
  'Dragon': Bird,
  'Bunny': Rabbit,
  'Ghost': Ghost,
};

export default function PetPage() {
  const { activePet, devUpdateProfile, profile } = useGame();
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  // Fallback to Egg if pet not found
  const PetIcon = activePet?.pet?.name ? (PET_ICONS[activePet.pet.name] || Ghost) : Egg;
  const health = activePet ? calculateCurrentHealth(activePet.last_fed, activePet.health) : 0;
  
  // Custom name fallback to original name
  const displayName = activePet?.custom_name || activePet?.pet?.name || 'No Pet Active';
  const streak = profile?.streak || 0;

  useEffect(() => {
    if (activePet) {
      setTempName(activePet.custom_name || activePet.pet.name);
    }
  }, [activePet]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      devUpdateProfile({ customPetName: tempName.trim() });
    }
    setIsRenaming(false);
  };

  if (!activePet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">You don't have an active pet. Go to the shop!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background ambient glow based on health */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div 
          className="w-96 h-96 blur-3xl rounded-full transition-all duration-1000"
          style={{ background: health < 30 ? 'radial-gradient(circle, #ef4444 0%, transparent 70%)' : 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        />
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Streak indicator */}
        <div className="mb-12 flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <Flame size={16} className={streak > 0 ? "text-white" : "text-neutral-600"} />
          <span className="text-sm font-bold tracking-wider">
            {streak} DAY STREAK
          </span>
        </div>

        {/* Pet Name */}
        <div className="mb-8 flex items-center justify-center h-10">
          <AnimatePresence mode="wait">
            {isRenaming ? (
              <motion.div
                key="renaming"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <input
                  autoFocus
                  className="bg-neutral-900 border border-neutral-700 text-white px-3 py-1.5 rounded-lg text-center outline-none focus:border-white"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
                <button onClick={handleSaveName} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-medium">Save</button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setIsRenaming(true)}
              >
                <h2 className="text-3xl font-bold tracking-tight text-white">{displayName}</h2>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 text-xs">Edit</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pet Avatar / Animation Container */}
        <motion.div 
          className="relative w-48 h-48 flex items-center justify-center mb-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-white/5 rounded-full blur-xl" />
          <PetIcon size={120} strokeWidth={1} className={health < 30 ? "text-neutral-400" : "text-white"} />
        </motion.div>

        {/* Health Bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-500 tracking-wider flex items-center gap-1">
              <Heart size={12} className={health < 30 ? "text-white" : "text-neutral-500"} />
              VITALITY
            </span>
            <span className="text-xs font-mono font-bold text-white">{Math.round(health)}%</span>
          </div>
          <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <motion.div
              className="h-full rounded-full"
              style={{ background: health < 30 ? '#ffffff' : '#ffffff' }}
              initial={{ width: 0 }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
