import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { calculateLevelPercent, xpToNextLevel, calculateCurrentHealth } from '../lib/gameLogic';
import { BarChart2, Zap, CheckSquare, Heart, Trophy, Star, Coins } from 'lucide-react';

export default function StatsPage() {
  const { profile, tasks, activePet } = useGame();

  if (!profile) return null;

  const levelPct = calculateLevelPercent(profile.xp);
  const xpLeft = xpToNextLevel(profile.xp);
  const totalDone = tasks.filter((t) => t.is_done).length;
  const health = activePet ? calculateCurrentHealth(activePet.last_fed, activePet.health) : 0;

  const milestones = [
    { label: 'First Task', reached: totalDone >= 1, icon: <CheckSquare size={24} strokeWidth={1} /> },
    { label: 'Level 5', reached: profile.level >= 5, icon: <Star size={24} strokeWidth={1} /> },
    { label: 'Level 10', reached: profile.level >= 10, icon: <Trophy size={24} strokeWidth={1} /> },
    { label: '10 Tasks', reached: totalDone >= 10, icon: <CheckSquare size={24} strokeWidth={1} /> },
    { label: '500 XP', reached: profile.xp >= 500, icon: <Zap size={24} strokeWidth={1} /> },
    { label: 'Rich (1000 coins)', reached: profile.coins >= 1000, icon: <Coins size={24} strokeWidth={1} /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary-var">
          <BarChart2 size={20} className="text-accent-var" />
          Stats
        </h2>
      </div>

      {/* Level card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 mb-4 shadow-[0_0_24px_var(--accent-glow)]"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 bg-[var(--accent)] text-[var(--bg-primary)]">
            {profile.level}
          </div>
          <div>
            <p className="text-xs text-muted-var">Current Level</p>
            <p className="text-2xl font-bold text-primary-var">
              Level {profile.level}
            </p>
            <p className="text-xs text-accent-var">
              {xpLeft} XP to next level
            </p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1 text-muted-var">
            <span>{profile.xp % 100} / 100 XP</span>
            <span>{levelPct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-surface-var">
            <motion.div
              className="h-full rounded-full bg-[var(--accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Total XP', value: profile.xp, icon: <Zap size={24} strokeWidth={1.5} />, color: 'text-neutral-300' },
          { label: 'Coins', value: profile.coins, icon: <Coins size={24} strokeWidth={1.5} />, color: 'text-neutral-300' },
          { label: 'Tasks Done', value: totalDone, icon: <CheckSquare size={24} strokeWidth={1.5} />, color: 'text-neutral-300' },
          { label: 'Pet Health', value: `${Math.round(health)}%`, icon: <Heart size={24} strokeWidth={1.5} />, color: health < 30 ? 'text-red-400' : 'text-neutral-300' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-var">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-secondary-var">
          <Trophy size={14} />
          Milestones
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {milestones.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className={`card p-3 text-center transition-all ${
                m.reached
                  ? 'border-[var(--accent-glow)] shadow-[0_0_12px_var(--accent-subtle)]'
                  : 'opacity-40'
              }`}
            >
              <span className="text-2xl block mb-1">{m.icon}</span>
              <p className={`text-[10px] font-medium ${m.reached ? 'text-accent-var' : 'text-muted-var'}`}>
                {m.label}
              </p>
              {m.reached && <span className="text-[8px] text-emerald-400">✓ Reached</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
