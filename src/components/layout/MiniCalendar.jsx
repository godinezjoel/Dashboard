import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { CATEGORY_STYLES } from '../tasks/TaskList';

export default function MiniCalendar({ selectedDate, onSelectDate }) {
  const { tasks } = useGame();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  // Find days that have open tasks and track their categories
  const taskDates = useMemo(() => {
    const dates = new Map();
    tasks.forEach(t => {
      if (!t.is_done && t.due_date) {
        const d = new Date(t.due_date);
        const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!dates.has(dateKey)) {
          dates.set(dateKey, new Set());
        }
        dates.get(dateKey).add(t.category || 'general');
      }
    });
    return dates;
  }, [tasks]);

  const today = new Date();

  return (
    <div className="p-4 rounded-2xl mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevMonth} className="p-1 rounded-md transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={handleNextMonth} className="p-1 rounded-md transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-[9px] font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
            {day}
          </div>
        ))}

        {/* Empty slots for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
          const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
          const hasTask = taskDates.has(dateKey);
          const categories = hasTask ? Array.from(taskDates.get(dateKey)).slice(0, 3) : [];
          
          const isSelected = selectedDate && selectedDate.toDateString() === dateObj.toDateString();
          const isToday = today.toDateString() === dateObj.toDateString();

          return (
            <button
              key={dayNumber}
              onClick={() => onSelectDate(isSelected ? null : dateObj)}
              className="relative h-7 w-full flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors"
              style={{
                background: isSelected ? 'var(--accent)' : 'transparent',
                color: isSelected ? 'var(--bg-primary)' : isToday ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isToday || isSelected ? 'bold' : 'normal',
                border: isToday && !isSelected ? '1px solid var(--border)' : '1px solid transparent'
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="mb-1">{dayNumber}</span>
              {hasTask && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {categories.map((cat, idx) => (
                    <span 
                      key={idx}
                      className="w-1 h-1 rounded-full" 
                      style={{ 
                        background: isSelected 
                          ? 'var(--bg-primary)' 
                          : CATEGORY_STYLES[cat]?.color || CATEGORY_STYLES.general.color 
                      }} 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
