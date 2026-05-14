import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlignLeft, CheckSquare, Plus, Trash2, Zap, Coins, Repeat } from 'lucide-react';
import { useGame } from '../../context/GameContext';

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

  function handleAddSubtask(e) {
    e.preventDefault();
    const val = newSubtask.trim();
    if (!val) return;
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: val, is_done: false }]);
    setNewSubtask('');
  }

  function toggleSubtask(id) {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, is_done: !s.is_done } : s));
  }

  function deleteSubtask(id) {
    setSubtasks(subtasks.filter(s => s.id !== id));
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
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div 
              className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col pointer-events-auto max-h-[90vh] overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-bold bg-transparent outline-none flex-1 truncate"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors ml-4"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-6" style={{ scrollbarWidth: 'thin' }}>
                
                {/* Meta details row */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg outline-none cursor-pointer"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      <Repeat size={12} /> Repeat
                    </label>
                    <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg outline-none cursor-pointer"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value="none">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={12} /> Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    <AlignLeft size={12} /> Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add details, links, or context..."
                    className="w-full text-sm p-3 rounded-lg outline-none min-h-[100px] resize-y"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Subtasks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      <CheckSquare size={12} /> Subtasks
                    </label>
                    {subtasks.length > 0 && (
                      <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {completedSubtasks}/{subtasks.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Subtask list */}
                  <div className="space-y-2 mb-3">
                    {subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-start gap-2 group">
                        <button
                          onClick={() => toggleSubtask(sub.id)}
                          className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors"
                          style={{
                            borderColor: sub.is_done ? 'var(--accent)' : 'var(--text-muted)',
                            background: sub.is_done ? 'var(--accent)' : 'transparent',
                          }}
                        >
                          {sub.is_done && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>}
                        </button>
                        <span className={`flex-1 text-sm ${sub.is_done ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--text-primary)' }}>
                          {sub.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(sub.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask Form */}
                  <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask..."
                      className="flex-1 text-sm p-2 rounded-lg outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    <button
                      type="submit"
                      disabled={!newSubtask.trim()}
                      className="p-2 rounded-lg flex items-center justify-center transition-opacity"
                      style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
                    >
                      <Plus size={16} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                    <Zap size={10} /> {task.xp_reward} XP
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>
                    <Coins size={10} /> {task.coin_reward}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-4 py-2 text-sm font-bold rounded-xl btn-ghost" style={{ color: 'var(--text-muted)' }}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 text-sm font-bold rounded-xl btn-primary">
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
