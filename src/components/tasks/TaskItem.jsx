import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Zap, Coins, PartyPopper, Edit2, Check, Calendar, AlignLeft, CheckSquare, ChevronsUp, Equal, ChevronDown } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import TaskDetailModal from './TaskDetailModal';


export default function TaskItem({ task }) {
  const { completeTask, updateTask, deleteTask } = useGame();
  const [completing, setCompleting] = useState(false);
  const [localDone, setLocalDone] = useState(false);
  const [showReward, setShowReward] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleComplete() {
    if (task.is_done || localDone || completing) return;
    setCompleting(true);
    setLocalDone(true);
    
    try {
      setShowReward({ xp: task.xp_reward ?? 20, coins: task.coin_reward ?? 5 });
      // Wait for the cool animation to play before moving the task to history
      await new Promise(res => setTimeout(res, 1200));
      
      await completeTask(task);
    } finally {
      setShowReward(null);
      setCompleting(false);
    }
  }

  const isVisuallyDone = task.is_done || localDone;

  async function handleDelete() {
    await deleteTask(task.id);
  }

  async function handleSaveEdit() {
    if (!editTitle.trim() || editTitle.trim() === task.title) {
      setIsEditing(false);
      setEditTitle(task.title);
      return;
    }
    await updateTask(task.id, { title: editTitle.trim() });
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
    }
  }

  function handleCardClick(e) {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsModalOpen(true);
  }

  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
  const completedSubtasksCount = hasSubtasks ? task.subtasks.filter(s => s.is_done).length : 0;

  const PRIORITY_ICONS = {
    high: <ChevronsUp size={14} color="#ef4444" />,
    medium: <Equal size={14} color="#f59e0b" />,
    low: <ChevronDown size={14} color="#3b82f6" />
  };

  const CATEGORY_STYLES = {
    work: { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' },
    health: { background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
    private: { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' },
    general: { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
  };

  const catStyle = CATEGORY_STYLES[task.category || 'general'] || CATEGORY_STYLES.general;

  return (
    <div className="relative">
      <div
        onClick={handleCardClick}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 transition-all duration-200 cursor-pointer ${
          isVisuallyDone ? 'opacity-50' : 'hover:border-accent/30'
        }`}
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${task.status === 'in_progress' && !isVisuallyDone ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={isVisuallyDone || completing}
          className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: isVisuallyDone ? 'var(--accent)' : 'var(--text-muted)',
            background: isVisuallyDone ? 'var(--accent)' : 'transparent',
          }}
          id={`task-check-${task.id}`}
          aria-label={isVisuallyDone ? 'Completed' : 'Mark as done'}
        >
          <AnimatePresence>
            {isVisuallyDone && (
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

        {/* Priority Icon */}
        {!isVisuallyDone && (
          <div className="flex-shrink-0 flex items-center justify-center w-4 h-4" title={task.priority || 'medium'}>
            {PRIORITY_ICONS[task.priority || 'medium']}
          </div>
        )}

        {/* Category badge */}
        {!isVisuallyDone && (
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase tracking-widest font-bold"
            style={catStyle}
          >
            {task.category || 'general'}
          </span>
        )}

        {/* Title & Details */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 text-sm bg-transparent outline-none px-1 py-0.5 rounded-md"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--accent)' }}
            />
            <button onClick={handleSaveEdit} className="p-1 rounded-md text-green-500 hover:bg-white/5 transition-colors">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <span
              onDoubleClick={() => !isVisuallyDone && setIsEditing(true)}
              className={`text-sm truncate transition-all duration-200 ${
                isVisuallyDone ? 'line-through' : ''
              }`}
              style={{ color: isVisuallyDone ? 'var(--text-muted)' : 'var(--text-primary)' }}
            >
              {task.title}
            </span>
            
            {/* Detail Indicators */}
            {!isVisuallyDone && (task.due_date || task.notes || hasSubtasks || task.status === 'in_progress') && (
              <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                {task.status === 'in_progress' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    In Progress
                  </span>
                )}
                
                {task.due_date && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={10} />
                    {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                
                {hasSubtasks && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <CheckSquare size={10} />
                    {completedSubtasksCount}/{task.subtasks.length}
                  </span>
                )}
                
                {task.notes && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <AlignLeft size={10} />
                  </span>
                )}
              </div>
            )}
          </div>
        )}





        {/* Edit & Delete buttons */}
        {!isVisuallyDone && !isEditing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              aria-label="Edit task"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              aria-label="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
        
        {isVisuallyDone && (
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Floating reward pop */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: [0, -40, -50, -70], 
              scale: [0.5, 1.2, 1, 0.8] 
            }}
            transition={{ duration: 1.5, times: [0, 0.15, 0.8, 1], ease: 'easeOut' }}
            className="absolute left-1/2 top-0 pointer-events-none whitespace-nowrap z-50 flex flex-col items-center gap-1.5"
            style={{ transform: 'translateX(-50%)' }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
              Completed!
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-glow)' }}>
              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#fbbf24' }}>
                <Zap size={12} fill="currentColor" /> +{showReward.xp}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#f59e0b' }}>
                <Coins size={12} fill="currentColor" /> +{showReward.coins}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TaskDetailModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
