import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import TaskItem from './TaskItem';

export default function TaskList() {
  const { tasks, addTask, loading } = useGame();
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const openTasks = tasks.filter((t) => !t.is_done);
  const doneTasks = tasks.filter((t) => t.is_done);

  async function handleAdd(e) {
    e.preventDefault();
    const title = inputValue.trim();
    if (!title) return;
    setIsAdding(true);
    try {
      await addTask(title);
      setInputValue('');
    } finally {
      setIsAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Tasks
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {openTasks.length} open · {doneTasks.length} completed
        </p>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          className="input flex-1"
          placeholder="Add a new task…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isAdding}
          id="add-task-input"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-primary flex items-center gap-1.5 flex-shrink-0"
          disabled={isAdding || !inputValue.trim()}
          id="add-task-btn"
        >
          <Plus size={15} />
          Add
        </button>
      </form>

      {/* Open Tasks */}
      <AnimatePresence mode="popLayout">
        {openTasks.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-3xl mb-3">✅</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              All done! Your pet is happy.
            </p>
          </motion.div>
        ) : (
          openTasks.map((task, i) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16, scale: 0.95 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <TaskItem task={task} />
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {/* Completed Tasks Accordion */}
      {doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="flex items-center gap-2 text-xs font-medium mb-3 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <span
              className="inline-block transition-transform duration-200"
              style={{ transform: showDone ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              ▶
            </span>
            Completed ({doneTasks.length})
          </button>
          <AnimatePresence>
            {showDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                {doneTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
