import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronRight, CheckCircle2, Filter, ArrowUpDown, X, ChevronsUp, Equal, ChevronDown } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import TaskItem from './TaskItem';
import './tasks.css';

export const CATEGORY_STYLES = {
  work: 'category-work',
  health: 'category-health',
  private: 'category-private',
  general: 'category-general'
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

  const [filterCat, setFilterCat] = useState(() => localStorage.getItem('lifeos_filterCat') || 'all');
  const [sortBy, setSortBy]       = useState(() => localStorage.getItem('lifeos_sortBy') || 'created');

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

  if (loading) {
    return (
      <div className="task-list-container" style={{ padding: '24px', gap: '12px' }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '56px', width: '100%' }} />)}
      </div>
    );
  }

  return (
    <div className="task-list-container">

      {/* ══ FILTER + SORT BAR ══════════════════════════════════ */}
      <div className="task-list-filter-bar">
        {/* Date Filter Badge */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="task-date-filter-badge"
            >
              <span className="task-date-filter-text">
                Showing tasks for: {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <button 
                onClick={onClearDate}
                className="task-date-filter-close"
                title="Clear date filter"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="task-list-meta-row">
          <div className="task-list-label-group">
            <Filter size={12} />
            <span className="task-list-label-text">Filter Tasks</span>
          </div>

          {/* Sort */}
          <div className="task-list-sort-select">
            <ArrowUpDown size={11} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="task-list-sort-dropdown"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="task-list-cat-chips">
          {[{ value: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value === filterCat && c.value !== 'all' ? 'all' : c.value)}
              className={`task-list-chip ${filterCat === c.value ? 'active' : ''}`}
            >
              {c.label}
              {c.value !== 'all' && (
                <span className="task-list-chip-count">
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
              className="task-list-empty"
            >
              <CheckCircle2 size={28} className="task-list-empty-icon" />
              <p className="task-list-empty-text">
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
