import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ChevronsUp, Equal, ChevronDown, Calendar, AlignLeft, CheckSquare, GripVertical } from 'lucide-react';
import { CATEGORY_STYLES } from '../tasks/TaskList';
import TaskDetailModal from './TaskDetailModal';
import './tasks.css';

const PRIORITY_ICONS = {
  high:   <ChevronsUp size={13} color="#ef4444" />,
  medium: <Equal size={13} color="#f59e0b" />,
  low:    <ChevronDown size={13} color="#3b82f6" />,
};

const COLUMNS = [
  { id: 'open',        label: 'Open',        status: 'open' },
  { id: 'in_progress', label: 'In Progress', status: 'in_progress' },
  { id: 'done',        label: 'Done',        status: 'done' },
];

function KanbanCard({ task, onDragStart, onDoubleClick }) {
  const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.general;
  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
  const completedSubtasks = hasSubtasks ? task.subtasks.filter(s => s.is_done).length : 0;

  // Track drag state to prevent double-click firing after a drag
  const dragging = useRef(false);

  function handleDragStart(e) {
    dragging.current = true;
    onDragStart(e, task);
  }

  function handleDragEnd() {
    // Small delay so click/dblclick fired right after dragend are ignored
    setTimeout(() => { dragging.current = false; }, 200);
  }

  function handleDoubleClick(e) {
    if (e.target.closest('[data-grip]')) return; // ignore grip
    if (dragging.current) return;
    onDoubleClick(task);
  }

  return (
    <motion.div
      layout
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onDoubleClick={handleDoubleClick}
      className="kanban-card"
      whileHover={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.3)' }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Top row: priority + drag handle + category */}
      <div className="kanban-card-top-row">
        <span className={`category-badge ${catStyle}`}>
          {task.category || 'general'}
        </span>
        <div className="kanban-card-action-group">
          {/* Drag handle icon */}
          <div
            className="kanban-card-grip"
            title="Drag to move"
            data-grip
          >
            <GripVertical size={13} className="text-muted-var" />
          </div>
          <span className="opacity-50">{PRIORITY_ICONS[task.priority] || PRIORITY_ICONS.medium}</span>
        </div>
      </div>

      {/* Title */}
      <p className="kanban-card-title">
        {task.title}
      </p>

      {/* Metadata row */}
      <div className="kanban-card-meta">
        {task.due_date && (
          <span className="kanban-card-meta-item">
            <Calendar size={9} />
            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        {hasSubtasks && (
          <div className="kanban-card-meta-item">
            <span className="flex items-center gap-1">
              <CheckSquare size={9} />
              {completedSubtasks}/{task.subtasks.length}
            </span>
            <div className="kanban-card-progress-bg">
              <motion.div
                className="kanban-card-progress-bar"
                animate={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
        {task.notes && (
          <span className="kanban-card-meta-item">
            <AlignLeft size={9} />
            Note
          </span>
        )}
      </div>

    </motion.div>
  );
}

function KanbanColumn({ column, tasks, onDrop, onDragOver, onDragLeave, isDragOver, onDoubleClick }) {
  return (
    <div
      className={`kanban-column status-${column.status} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      {/* Column header */}
      <div className={`kanban-column-header header-${column.status} ${isDragOver ? 'drag-over' : ''}`}>
        <div className="kanban-column-title-group">
          <div className={`kanban-column-dot dot-${column.status}`} />
          <span className={`kanban-column-label label-${column.status}`}>
            {column.label}
          </span>
        </div>
        <span className="kanban-column-count">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="kanban-cards-body">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="kanban-empty-placeholder"
            >
              <p>Drop tasks here</p>
            </motion.div>
          )}
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              onDoubleClick={onDoubleClick}
              onDragStart={(e, t) => {
                e.dataTransfer.setData('taskId', t.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { tasks, updateTask, completeTask } = useGame();
  const [dragOverCol, setDragOverCol] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Exclude already-completed tasks (is_done = true), they live in history
  const columnTasks = {
    open:        tasks.filter(t => !t.is_done && (!t.status || t.status === 'open')),
    in_progress: tasks.filter(t => !t.is_done && t.status === 'in_progress'),
    done:        tasks.filter(t => !t.is_done && t.status === 'done'),
  };

  function handleDragOver(e, colId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCol(null);
    }
  }

  async function handleDrop(e, colId) {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (colId === 'done') {
      // Dropping into Done = fully complete the task (XP, coins, health boost)
      await completeTask(task);
    } else {
      if (task.status === colId) return;
      await updateTask(taskId, { status: colId });
    }
  }

  return (
    <>
      <div className="kanban-grid">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={columnTasks[col.id] || []}
            isDragOver={dragOverCol === col.id}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.id)}
            onDoubleClick={setSelectedTask}
          />
        ))}
      </div>

      {/* Modal — isOpen is driven by whether a task is selected */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}
