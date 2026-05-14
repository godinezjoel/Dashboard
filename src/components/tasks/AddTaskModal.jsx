import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { CATEGORIES, PRIORITIES } from './TaskList';

export default function AddTaskModal({ isOpen, onClose, selectedDate }) {
  const { addTask } = useGame();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategory('general');
      setPriority('medium');
      setAddError('');
    }
  }, [isOpen]);

  async function handleAdd(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setIsAdding(true);
    setAddError('');
    try {
      await addTask(t, { category, priority, dueDate: selectedDate });
      onClose(); // Close modal on success
    } catch (err) {
      console.error('[AddTaskModal] addTask error:', err);
      setAddError('Could not save task. Check console.');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                  New Task
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-5">
                {/* Title input */}
                <div>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder={selectedDate ? `Task for ${selectedDate.toLocaleDateString()}...` : "What needs to be done?"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isAdding}
                    id="add-task-input"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {/* Category & Priority */}
                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Category</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className="px-3 py-1.5 text-xs rounded-lg transition-all"
                          style={{
                            ...c.style,
                            opacity: category === c.value ? 1 : 0.4,
                            border: category === c.value ? `1px solid ${c.style.color}` : '1px solid transparent'
                          }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Priority</span>
                    <div className="flex gap-1.5">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs"
                          style={{
                            background: priority === p.value ? 'var(--bg-elevated)' : 'transparent',
                            border: priority === p.value ? '1px solid var(--border)' : '1px solid transparent',
                            color: 'var(--text-primary)',
                            opacity: priority === p.value ? 1 : 0.5
                          }}
                        >
                          <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
                            {p.icon}
                          </div>
                          <span className="capitalize">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {addError && (
                  <p className="text-xs text-red-400">{addError}</p>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    disabled={isAdding || !title.trim()}
                  >
                    <Plus size={16} />
                    {isAdding ? 'Adding Task…' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
