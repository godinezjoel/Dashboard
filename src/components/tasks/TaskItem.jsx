import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import toast from 'react-hot-toast';

export default function TaskItem({ task }) {
  const { completeTask, deleteTask } = useGame();
  const [completing, setCompleting] = useState(false);
  const [showReward, setShowReward] = useState(null);
  const [hovered, setHovered] = useState(false);

  async function handleComplete() {
    if (task.is_done || completing) return;
    setCompleting(true);
    try {
      await completeTask(task);
      setShowReward({ xp: task.xp_reward ?? 20, coins: task.coin_reward ?? 5 });
      // Toast notification
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm shadow-2xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-semibold">Task Complete!</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                +{task.xp_reward ?? 20} XP &nbsp;·&nbsp; +{task.coin_reward ?? 5} 🪙 &nbsp;·&nbsp; +15 HP
              </p>
            </div>
          </motion.div>
        ),
        { duration: 2500 }
      );
      setTimeout(() => setShowReward(null), 1200);
    } finally {
      setCompleting(false);
    }
  }

  async function handleDelete() {
    await deleteTask(task.id);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 transition-all duration-200 group ${
          task.is_done ? 'opacity-50' : 'hover:border-accent/30'
        }`}
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${hovered && !task.is_done ? 'var(--accent-glow)' : 'var(--border)'}`,
          boxShadow: hovered && !task.is_done ? '0 0 12px var(--accent-subtle)' : 'none',
        }}
      >
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={task.is_done || completing}
          className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: task.is_done ? 'var(--accent)' : 'var(--text-muted)',
            background: task.is_done ? 'var(--accent)' : 'transparent',
          }}
          id={`task-check-${task.id}`}
          aria-label={task.is_done ? 'Completed' : 'Mark as done'}
        >
          <AnimatePresence>
            {task.is_done && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* Title */}
        <span
          className={`flex-1 text-sm transition-all duration-200 ${
            task.is_done ? 'line-through' : ''
          }`}
          style={{ color: task.is_done ? 'var(--text-muted)' : 'var(--text-primary)' }}
        >
          {task.title}
        </span>

        {/* Rewards badge */}
        {!task.is_done && (
          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-violet-400">
              <Zap size={9} />
              {task.xp_reward ?? 20}
            </span>
            <span className="text-[10px] font-mono text-amber-400">
              🪙{task.coin_reward ?? 5}
            </span>
          </div>
        )}

        {/* Delete button */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleDelete}
              className="flex-shrink-0 p-1 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              id={`task-delete-${task.id}`}
              aria-label="Delete task"
            >
              <Trash2 size={13} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating reward pop */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 1, y: 0, x: '-50%' }}
            animate={{ opacity: 0, y: -40, x: '-50%' }}
            exit={{}}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute left-1/2 top-0 pointer-events-none text-xs font-bold text-emerald-400 whitespace-nowrap z-10"
          >
            +{showReward.xp} XP  +{showReward.coins}🪙  +15❤️
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
