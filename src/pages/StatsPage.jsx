import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { calculateLevelPercent, xpToNextLevel, calculateCurrentHealth } from '../lib/gameLogic';
import { BarChart2, Zap, CheckSquare, Heart, Trophy, Star, Coins } from 'lucide-react';
import './StatsPage.css';

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
    <div className="stats-page-container">
      <div className="stats-header">
        <h2 className="stats-title">
          <BarChart2 size={20} className="stats-title-icon" />
          Stats
        </h2>
      </div>

      {/* Level card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card level-card-custom"
      >
        <div className="level-info-row">
          <div className="level-badge">
            {profile.level}
          </div>
          <div className="level-text-column">
            <p className="level-label">Current Level</p>
            <p className="level-title">
              Level {profile.level}
            </p>
            <p className="level-xp-left">
              {xpLeft} XP to next level
            </p>
          </div>
        </div>
        <div>
          <div className="xp-progress-row">
            <span>{profile.xp % 100} / 100 XP</span>
            <span>{levelPct}%</span>
          </div>
          <div className="progress-bar-container">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="stats-grid">
        {[
          { label: 'Total XP', value: profile.xp, icon: <Zap size={24} strokeWidth={1.5} />, isLow: false },
          { label: 'Coins', value: profile.coins, icon: <Coins size={24} strokeWidth={1.5} />, isLow: false },
          { label: 'Tasks Done', value: totalDone, icon: <CheckSquare size={24} strokeWidth={1.5} />, isLow: false },
          { label: 'Pet Health', value: `${Math.round(health)}%`, icon: <Heart size={24} strokeWidth={1.5} />, isLow: health < 30 },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card stats-card"
          >
            <span className="stats-card-icon">{s.icon}</span>
            <div className="stats-card-text">
              <p className={`stats-card-value ${s.isLow ? 'stats-value-low' : ''}`}>{s.value}</p>
              <p className="stats-card-label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Milestones */}
      <div>
        <h3 className="milestones-title">
          <Trophy size={14} />
          Milestones
        </h3>
        <div className="milestones-grid">
          {milestones.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className={`card milestone-card ${m.reached ? 'reached' : ''}`}
            >
              <span className="milestone-icon">{m.icon}</span>
              <p className="milestone-label">
                {m.label}
              </p>
              {m.reached && <span className="milestone-reached-check">✓ Reached</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
