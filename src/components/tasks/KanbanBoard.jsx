import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ChevronsUp, Equal, ChevronDown, Calendar, AlignLeft, CheckSquare, GripVertical } from 'lucide-react';
import { CATEGORY_STYLES } from '../tasks/TaskList';
import TaskDetailModal from './TaskDetailModal';

const PRIORITY_ICONS = {
  high:   <ChevronsUp size={13} color="#ef4444" />,
  medium: <Equal size={13} color="#f59e0b" />,
  low:    <ChevronDown size={13} color="#3b82f6" />,
};

const COLUMNS = [
  { id: 'open',        label: 'Open',        colorClass: 'text-muted-var',  dotClass: 'bg-[var(--text-muted)]', accentClass: 'bg-transparent' },
  { id: 'in_progress', label: 'In Progress', colorClass: 'text-amber-500',  dotClass: 'bg-amber-500', accentClass: 'bg-amber-500/20' },
  { id: 'done',        label: 'Done',        colorClass: 'text-green-500',  dotClass: 'bg-green-500', accentClass: 'bg-green-500/20' },
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
      className="group rounded-xl p-3 bg-card-var border border-var cursor-grab select-none transition-colors"
      whileHover={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.3)' }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Top row: priority + drag handle + category */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${catStyle}`}
        >
          {task.category || 'general'}
        </span>
        <div className="flex items-center gap-1">
          {/* Drag handle icon */}
          <div
            className="p-0.5 rounded opacity-30 group-hover:opacity-70 transition-opacity"
            title="Drag to move"
          >
            <GripVertical size={13} className="text-muted-var" />
          </div>
          <span className="opacity-50">{PRIORITY_ICONS[task.priority] || PRIORITY_ICONS.medium}</span>
        </div>
      </div>

      {/* Title */}
      <p className="text-xs font-semibold leading-snug mb-2.5 text-primary-var">
        {task.title}
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-3 flex-wrap">
        {task.due_date && (
          <span className="flex items-center gap-1 text-[9px] text-muted-var">
            <Calendar size={9} />
            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        {hasSubtasks && (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[9px] text-muted-var">
              <CheckSquare size={9} />
              {completedSubtasks}/{task.subtasks.length}
            </span>
            <div className="w-10 h-1 rounded-full overflow-hidden bg-elevated-var">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                animate={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
        {task.notes && (
          <span className="flex items-center gap-1 text-[9px] text-muted-var">
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
      className={`flex flex-col rounded-2xl overflow-hidden bg-surface-var border min-h-[500px] transition-colors ${
        isDragOver ? column.dotClass.replace('bg-', 'border-') : 'border-var'
      }`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      {/* Column header */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b border-var transition-colors ${
          isDragOver ? column.accentClass : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${column.dotClass}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${column.colorClass}`}>
            {column.label}
          </span>
        </div>
        <span
          className="text-xs font-black min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-elevated-var text-muted-var"
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-0">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-24 rounded-xl border border-dashed border-var"
            >
              <p className="text-[10px] text-muted-var">Drop tasks here</p>
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
      <div className="grid grid-cols-3 gap-4">
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
