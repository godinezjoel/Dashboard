import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronRight, CheckCircle2, Filter, ArrowUpDown, X, ChevronsUp, Equal, ChevronDown } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import TaskItem from './TaskItem';

export const CATEGORY_STYLES = {
  work: { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' },
  health: { background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
  private: { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' },
  general: { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
};

export const CATEGORIES = [
  { value: 'general', label: 'General', style: CATEGORY_STYLES.general },
  { value: 'work',    label: 'Work',    style: CATEGORY_STYLES.work },
  { value: 'private', label: 'Private', style: CATEGORY_STYLES.private },
  { value: 'health',  label: 'Health',  style: CATEGORY_STYLES.health },
];

export const PRIORITIES = [
  { value: 'low',    label: 'Low',    icon: <ChevronDown size={14} color="#3b82f6" />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  { value: 'medium', label: 'Medium', icon: <Equal size={14} color="#f59e0b" />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { value: 'high',   label: 'High',   icon: <ChevronsUp size={14} color="#ef4444" />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const SORT_OPTIONS = [
  { value: 'created',  label: 'Date added' },
  { value: 'priority', label: 'Priority'   },
  { value: 'category', label: 'Category'   },
];

export default function TaskList({ selectedDate, onClearDate }) {
  const { tasks, addTask, loading } = useGame();

  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const [filterCat, setFilterCat] = useState(() => localStorage.getItem('lifeos_filterCat') || 'all');
  const [sortBy, setSortBy]       = useState(() => localStorage.getItem('lifeos_sortBy') || 'created');
  const [showDone, setShowDone]   = useState(false);

  useEffect(() => {
    localStorage.setItem('lifeos_filterCat', filterCat);
  }, [filterCat]);

  useEffect(() => {
    localStorage.setItem('lifeos_sortBy', sortBy);
  }, [sortBy]);


  const openTasks = useMemo(() => {
    let list = tasks.filter((t) => !t.is_done);
    if (filterCat !== 'all') list = list.filter((t) => (t.category ?? 'general') === filterCat);
    
    if (selectedDate) {
      const targetStr = selectedDate.toDateString();
      list = list.filter(t => t.due_date && new Date(t.due_date).toDateString() === targetStr);
    }
    
    if (sortBy === 'priority') list = [...list].sort((a, b) => PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium']);
    else if (sortBy === 'category') list = [...list].sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''));
    return list;
  }, [tasks, filterCat, sortBy, selectedDate]);

  const doneTasks = tasks.filter((t) => t.is_done);

  async function handleAdd(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setIsAdding(true);
    setAddError('');
    try {
      await addTask(t, { category, priority, dueDate: selectedDate });
      setTitle('');
      setCategory('general');
      setPriority('medium');
    } catch (err) {
      console.error('[TaskList] addTask error:', err);
      setAddError('Could not save task. Check console.');
    } finally {
      setIsAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ══ ADD TASK CARD ═══════════════════════════════════════ */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          New Task
        </p>

        <form onSubmit={handleAdd} className="space-y-3">
          {/* Title input */}
          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder={selectedDate ? `Add task for ${selectedDate.toLocaleDateString()}...` : "What needs to be done?"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isAdding}
              id="add-task-input"
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn-primary flex items-center gap-1.5 flex-shrink-0"
              disabled={isAdding || !title.trim()}
              id="add-task-btn"
            >
              <Plus size={14} />
              {isAdding ? 'Adding…' : 'Add'}
            </button>
          </div>

          {/* Category + Priority on same row */}
          <div className="flex items-center gap-4">
            {/* Category */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Category</span>
              <div className="flex gap-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className="px-2.5 py-1 text-xs rounded-lg transition-all"
                    style={
                      category === c.value
                        ? c.style
                        : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                    }
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px self-stretch" style={{ background: 'var(--border)' }} />

            {/* Priority */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Priority</span>
              <div className="flex gap-1">
                {PRIORITIES.map((p) =>                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5"
                        style={
                          priority === p.value
                            ? { background: p.bg, color: 'var(--text-primary)', border: `1px solid ${p.color}` }
                            : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                        }
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-3 h-3">
                          {p.icon}
                        </div>
                        {p.label}
                      </button>
                )}
              </div>
            </div>
          </div>

          {addError && (
            <p className="text-xs text-red-400">{addError}</p>
          )}
        </form>
      </div>

      {/* ══ FILTER + SORT BAR ══════════════════════════════════ */}
      <div className="pt-4 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Date Filter Badge */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                Showing tasks for: {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <button 
                onClick={onClearDate}
                className="p-1 rounded-md hover:bg-black/20 transition-colors"
                title="Clear date filter"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Filter size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Filter Tasks</span>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <ArrowUpDown size={11} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-transparent outline-none cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: '#0a0a0a' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-1.5 flex-wrap">
          {[{ value: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value === filterCat && c.value !== 'all' ? 'all' : c.value)}
              className="px-2.5 py-1 text-xs rounded-lg transition-all"
              style={
                filterCat === c.value
                  ? { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--text-muted)' }
                  : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {c.label}
              {c.value !== 'all' && (
                <span className="ml-1 opacity-50">
                  {tasks.filter(t => !t.is_done && (t.category ?? 'general') === c.value).length || ''}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ OPEN TASKS ══════════════════════════════════════════ */}
      <div>
        <AnimatePresence mode="popLayout">
          {openTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: 'var(--border)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {filterCat === 'all' ? 'No open tasks.' : `No open ${filterCat} tasks.`}
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


      </div>
    </div>
  );
}
