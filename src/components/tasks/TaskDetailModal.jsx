import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlignLeft, CheckSquare, Plus, Trash2, Zap, Coins, Repeat } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import './tasks.css';

export default function TaskDetailModal({ task, isOpen, onClose }) {
  const { updateTask, completeTask } = useGame();

  // Local state for edits
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('open');
  const [recurrence, setRecurrence] = useState('none');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  
  const [newSubtask, setNewSubtask] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setStatus(task.status || 'open');
      setRecurrence(task.recurrence || 'none');
      
      // format datetime-local string (YYYY-MM-DDThh:mm)
      if (task.due_date) {
        const d = new Date(task.due_date);
        // adjust for timezone offset
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setDueDate(d.toISOString().slice(0, 16));
      } else {
        setDueDate('');
      }

      setNotes(task.notes || '');
      setSubtasks(Array.isArray(task.subtasks) ? task.subtasks : []);
    }
  }, [task]);

  if (!task) return null;

  async function handleSave() {
    setIsSaving(true);
    try {
      const updates = {
        title: title.trim() || 'Untitled Task',
        status,
        recurrence,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        notes,
        subtasks
      };
      
      await updateTask(task.id, updates);
      
      // If status changed to done, trigger complete flow
      if (status === 'done' && !task.is_done) {
        await completeTask({ ...task, ...updates });
      }
      
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddSubtask(e) {
    e.preventDefault();
    const val = newSubtask.trim();
    if (!val) return;
    const newSubtasks = [...subtasks, { id: crypto.randomUUID(), title: val, is_done: false }];
    setSubtasks(newSubtasks);
    setNewSubtask('');
    await updateTask(task.id, { subtasks: newSubtasks });
  }

  async function toggleSubtask(id) {
    const newSubtasks = subtasks.map(s => s.id === id ? { ...s, is_done: !s.is_done } : s);
    setSubtasks(newSubtasks);
    await updateTask(task.id, { subtasks: newSubtasks });
  }

  async function deleteSubtask(id) {
    const newSubtasks = subtasks.filter(s => s.id !== id);
    setSubtasks(newSubtasks);
    await updateTask(task.id, { subtasks: newSubtasks });
  }

  const completedSubtasks = subtasks.filter(s => s.is_done).length;

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
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="task-detail-modal-wrapper"
          >
            <div className="task-detail-modal-container">
              {/* Header */}
              <div className="task-detail-modal-header">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="task-detail-title-input"
                />
                <button 
                  onClick={onClose}
                  className="task-modal-close-btn"
                  style={{ marginLeft: '16px' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="task-detail-body thin-scrollbar">
                
                {/* Meta details row */}
                <div className="task-detail-meta-grid">
                  <div className="task-detail-meta-field">
                    <label className="task-modal-section-title">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="task-detail-select"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="task-detail-meta-field">
                    <label className="task-modal-section-title">
                      <Repeat size={12} style={{ marginRight: '6px' }} /> Repeat
                    </label>
                    <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      className="task-detail-select"
                    >
                      <option value="none">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="task-detail-meta-field field-wide">
                    <label className="task-modal-section-title">
                      <Calendar size={12} style={{ marginRight: '6px' }} /> Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="task-detail-input"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="task-modal-section-title">
                    <AlignLeft size={12} style={{ marginRight: '6px' }} /> Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add details, links, or context..."
                    className="task-detail-textarea"
                  />
                </div>

                {/* Subtasks */}
                <div>
                  <div className="subtasks-header-row">
                    <label className="subtasks-title-label">
                      <CheckSquare size={12} /> Subtasks
                    </label>
                    {subtasks.length > 0 && (
                      <span className="subtasks-fraction">
                        {completedSubtasks}/{subtasks.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Subtask list */}
                  <div className="subtask-list">
                    {subtasks.map((sub) => (
                      <div key={sub.id} className="subtask-row group">
                        <button
                          onClick={() => toggleSubtask(sub.id)}
                          className={`subtask-checkbox ${sub.is_done ? 'checked' : ''}`}
                        >
                          {sub.is_done && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              width="10"
                              height="10"
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
                        </button>
                        <span className={`subtask-title-text ${sub.is_done ? 'is-done' : ''}`}>
                          {sub.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(sub.id)}
                          className="subtask-delete-btn"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask Form */}
                  <form onSubmit={handleAddSubtask} className="subtask-add-form">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask..."
                      className="subtask-add-input"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtask.trim()}
                      className="subtask-add-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="task-detail-footer">
                <div className="task-detail-reward-summary">
                  <span className="task-detail-reward-item reward-xp">
                    <Zap size={10} style={{ marginRight: '4px' }} /> {task.xp_reward} XP
                  </span>
                  <span className="task-detail-reward-item reward-coins">
                    <Coins size={10} style={{ marginRight: '4px' }} /> {task.coin_reward}
                  </span>
                </div>
                <div className="task-detail-footer-actions">
                  <button onClick={onClose} className="task-detail-footer-btn btn-ghost">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="task-detail-footer-btn btn-primary">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
