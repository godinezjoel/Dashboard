import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import TaskList from '../components/tasks/TaskList';
import KanbanBoard from '../components/tasks/KanbanBoard';
import MiniCalendar from '../components/layout/MiniCalendar';
import AnalyticsPanel from '../components/analytics/AnalyticsPanel';
import AddTaskModal from '../components/tasks/AddTaskModal';
import { LayoutList, Kanban, Clock, CheckCircle2, Trash2, Plus } from 'lucide-react';
import './Dashboard.css';

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
    <div className="view-toggle-bar">
      {[
        { id: 'list',  icon: LayoutList, label: 'List'  },
        { id: 'board', icon: Kanban,     label: 'Board' },
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={`view-toggle-btn ${view === id ? 'active' : ''}`}
        >
          {view === id && (
            <motion.div
              layoutId="view-pill"
              className="view-toggle-pill"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
            />
          )}
          <Icon size={13} style={{ position: 'relative', zIndex: 10 }} />
          <span style={{ position: 'relative', zIndex: 10 }}>{label}</span>
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setView = useCallback((v) => {
    setViewState(v);
    localStorage.setItem(VIEW_KEY, v);
  }, []);

  const activeView = isMobile ? 'list' : view;

  const doneTasks = tasks
    .filter((t) => t.is_done && t.completed_at)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 10);

  const RightColumn = (
    <div className="dashboard-sidebar-column">
      <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="column-header-row">
        <div className="column-header-title">
          <Clock size={13} />
          <span>History</span>
        </div>
        {doneTasks.length > 0 && (
          <button
            onClick={clearCompletedTasks}
            className="clear-history-btn"
          >
            <Trash2 size={11} />
            Clear
          </button>
        )}
      </div>

      {doneTasks.length === 0 ? (
        <p className="history-empty">
          No history yet.
        </p>
      ) : (
        <div className="history-list thin-scrollbar">
          {doneTasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="history-item"
            >
              <CheckCircle2 size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span className="history-item-title" title={task.title}>
                {task.title}
              </span>
              <div className="history-time-col">
                <p className="history-time-text">{formatDate(task.completed_at)}</p>
                <p className="history-time-text history-time-text-sub">{formatTime(task.completed_at)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-page">

      {/* View toggle header */}
      {!isMobile && (
        <div className="dashboard-view-header">
          <ViewToggle view={view} setView={setView} />
        </div>
      )}

      {/* LIST VIEW */}
      {activeView === 'list' && (
        <div className="dashboard-list-grid">
          {!isMobile && (
            <div className="dashboard-sidebar-column">
              <AnalyticsPanel />
            </div>
          )}
          <div>
            <TaskList selectedDate={selectedDate} onClearDate={() => setSelectedDate(null)} />
          </div>
          {RightColumn}
        </div>
      )}

      {/* BOARD VIEW */}
      {activeView === 'board' && (
        <div className="dashboard-board-grid">
          <div>
            <KanbanBoard />
          </div>
          {RightColumn}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="floating-add-btn"
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
