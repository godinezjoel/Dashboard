import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { CATEGORIES, PRIORITIES } from './TaskList';
import './tasks.css';

const CATEGORY_BUTTON_CLASSES = {
  general: 'category-general',
  work: 'category-work',
  private: 'category-private',
  health: 'category-health',
};

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
            className="task-modal-backdrop"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="task-modal-content"
            >
              <div className="task-modal-header">
                <h3 className="task-modal-title">
                  New Task
                </h3>
                <button
                  onClick={onClose}
                  className="task-modal-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="task-modal-form">
                {/* Title input */}
                <div className="task-modal-section">
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
                <div className="task-modal-section">
                  {/* Category */}
                  <div>
                    <span className="task-modal-section-title">Category</span>
                    <div className="task-modal-chips-row">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`category-btn ${CATEGORY_BUTTON_CLASSES[c.value] || CATEGORY_BUTTON_CLASSES.general} ${
                            category === c.value ? 'active' : ''
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <span className="task-modal-section-title">Priority</span>
                    <div className="task-modal-chips-row">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={`priority-btn ${priority === p.value ? 'active' : ''}`}
                        >
                          <div className="task-item-priority-icon">
                            {p.icon}
                          </div>
                          <span style={{ textTransform: 'capitalize' }}>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {addError && (
                  <p className="text-xs text-red-400">{addError}</p>
                )}

                {/* Submit Button */}
                <div style={{ paddingTop: '8px' }}>
                  <button
                    type="submit"
                    className="task-submit-btn"
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
