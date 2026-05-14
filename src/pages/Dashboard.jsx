import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import TaskList from '../components/tasks/TaskList';
import KanbanBoard from '../components/tasks/KanbanBoard';
import MiniCalendar from '../components/layout/MiniCalendar';
import AnalyticsPanel from '../components/analytics/AnalyticsPanel';
import AddTaskModal from '../components/tasks/AddTaskModal';
import { LayoutList, Kanban, Clock, CheckCircle2, Trash2, Plus } from 'lucide-react';

const VIEW_KEY = 'dashboard_view';

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function ViewToggle({ view, setView }) {
  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-xl"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      {[
        { id: 'list',  icon: LayoutList, label: 'List'  },
        { id: 'board', icon: Kanban,     label: 'Board' },
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ color: view === id ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          {view === id && (
            <motion.div
              layoutId="view-pill"
              className="absolute inset-0 rounded-lg"
              style={{ background: 'var(--bg-elevated)' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
            />
          )}
          <Icon size={13} className="relative z-10" />
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { tasks, clearCompletedTasks } = useGame();

  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setViewState] = useState(() => localStorage.getItem(VIEW_KEY) || 'list');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setView = useCallback((v) => {
    setViewState(v);
    localStorage.setItem(VIEW_KEY, v);
  }, []);

  const doneTasks = tasks
    .filter((t) => t.is_done && t.completed_at)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 10);

  const RightColumn = (
    <div className="sticky top-6">
      <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="mb-4 flex items-center justify-between mt-8">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Clock size={13} />
          <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
        </div>
        {doneTasks.length > 0 && (
          <button
            onClick={clearCompletedTasks}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={11} />
            Clear
          </button>
        )}
      </div>

      {doneTasks.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
          No history yet.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[calc(100vh-420px)] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          {doneTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <CheckCircle2 size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span className="flex-1 text-[11px] line-through truncate" style={{ color: 'var(--text-muted)' }} title={task.title}>
                {task.title}
              </span>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{formatDate(task.completed_at)}</p>
                <p className="text-[9px] font-mono" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{formatTime(task.completed_at)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* View toggle header */}
      <div className="flex items-center justify-end px-6 pt-6 pb-2">
        <ViewToggle view={view} setView={setView} />
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-8 items-start pt-2 px-6 pb-12">
          <div className="sticky top-6">
            <AnalyticsPanel />
          </div>
          <div>
            <TaskList selectedDate={selectedDate} onClearDate={() => setSelectedDate(null)} />
          </div>
          {RightColumn}
        </div>
      )}

      {/* BOARD VIEW */}
      {view === 'board' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start pt-2 px-6 pb-12">
          <div>
            <KanbanBoard />
          </div>
          {RightColumn}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ background: 'var(--accent)', color: '#ffffff', boxShadow: '0 4px 20px var(--accent-glow)' }}
      >
        <Plus size={28} />
      </button>

      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedDate} 
      />

    </div>
  );
}
