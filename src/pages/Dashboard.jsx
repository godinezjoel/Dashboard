import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import TaskList from '../components/tasks/TaskList';
import { Zap, CheckSquare, Heart } from 'lucide-react';
import { calculateCurrentHealth } from '../lib/gameLogic';

export default function Dashboard() {
  const { profile, activePet, tasks } = useGame();

  const openCount = tasks.filter((t) => !t.is_done).length;
  const doneCount = tasks.filter((t) => t.is_done).length;
  const health = activePet ? calculateCurrentHealth(activePet.last_fed, activePet.health) : 0;

  const stats = [
    {
      label: 'Open Tasks',
      value: openCount,
      icon: '📋',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total XP',
      value: profile?.xp ?? 0,
      icon: '⚡',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Pet Health',
      value: `${Math.round(health)}%`,
      icon: '❤️',
      color: health < 30 ? 'text-red-400' : 'text-emerald-400',
      bg: health < 30 ? 'bg-red-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Coins',
      value: profile?.coins ?? 0,
      icon: '🪙',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top header */}
      <div
        className="px-6 pt-6 pb-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-end justify-between pr-60">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {getGreeting()},{' '}
              <span style={{ color: 'var(--accent)' }}>
                {profile?.username || 'Adventurer'}
              </span>{' '}
              👋
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {openCount > 0
                ? `You have ${openCount} task${openCount === 1 ? '' : 's'} waiting.`
                : 'All tasks done! Your pet is happy.'}
            </p>
          </div>
        </div>

        {/* Mini stats strip */}
        <div className="grid grid-cols-4 gap-3 mt-4 pr-60">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`${s.bg} rounded-xl px-3 py-2.5 flex items-center gap-2`}
            >
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Task list */}
      <TaskList />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
