import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Zap, Coins, PartyPopper, Edit2, Check, Calendar, AlignLeft, CheckSquare, ChevronsUp, Equal, ChevronDown } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import TaskDetailModal from './TaskDetailModal';
import './tasks.css';

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
    work: 'category-work',
    health: 'category-health',
    private: 'category-private',
    general: 'category-general'
  };

  const catStyle = CATEGORY_STYLES[task.category || 'general'] || CATEGORY_STYLES.general;

  return (
    <div className="task-item-wrapper">
      <div
        onClick={handleCardClick}
        className={`task-item-card ${isVisuallyDone ? 'is-done' : ''} ${
          task.status === 'in_progress' && !isVisuallyDone ? 'in-progress' : ''
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={isVisuallyDone || completing}
          className={`task-checkbox ${isVisuallyDone ? 'checked' : ''}`}
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
          <div className="task-item-priority-icon" title={task.priority || 'medium'}>
            {PRIORITY_ICONS[task.priority || 'medium']}
          </div>
        )}

        {/* Category badge */}
        {!isVisuallyDone && (
          <span className={`category-badge ${catStyle}`}>
            {task.category || 'general'}
          </span>
        )}

        {/* Title & Details */}
        {isEditing ? (
          <div className="task-item-edit-container">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="task-item-edit-input"
            />
            <button onClick={handleSaveEdit} className="task-item-save-btn">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="task-item-details">
            <span
              onDoubleClick={() => !isVisuallyDone && setIsEditing(true)}
              className={`task-item-title ${isVisuallyDone ? 'title-done' : ''}`}
            >
              {task.title}
            </span>
            
            {/* Detail Indicators */}
            {!isVisuallyDone && (task.due_date || task.notes || hasSubtasks || task.status === 'in_progress') && (
              <div className="task-item-indicators">
                {task.status === 'in_progress' && (
                  <span className="task-item-status-tag">
                    <span className="task-item-status-dot animate-pulse-dot" />
                    In Progress
                  </span>
                )}
                
                {task.due_date && (
                  <span className="task-item-indicator indicator-date">
                    <Calendar size={10} />
                    {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                
                {hasSubtasks && (
                  <div className="task-item-indicator">
                    <span className="task-item-indicator indicator-subtasks">
                      <CheckSquare size={10} />
                      {completedSubtasksCount}/{task.subtasks.length}
                    </span>
                    <div className="task-subtasks-progress-bg">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSubtasksCount / task.subtasks.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="task-subtasks-progress-bar"
                      />
                    </div>
                  </div>
                )}
                
                {task.notes && (
                  <span className="task-item-indicator indicator-notes">
                    <AlignLeft size={10} />
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit & Delete buttons */}
        {!isVisuallyDone && !isEditing && (
          <div className="task-item-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="task-item-action-btn btn-edit"
              aria-label="Edit task"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={handleDelete}
              className="task-item-action-btn btn-delete"
              aria-label="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
        
        {isVisuallyDone && (
          <button
            onClick={handleDelete}
            className="task-item-action-btn btn-delete"
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
            className="task-reward-pop"
          >
            <span className="task-reward-title">
              Completed!
            </span>
            <div className="task-reward-badge-container">
              <span className="task-reward-xp">
                <Zap size={12} fill="currentColor" /> +{showReward.xp}
              </span>
              <span className="task-reward-coins">
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
