import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import './MiniCalendar.css';

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
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <span className="calendar-title">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <div className="calendar-nav-buttons">
          <button onClick={handlePrevMonth} className="calendar-nav-btn">
            <ChevronLeft size={14} />
          </button>
          <button onClick={handleNextMonth} className="calendar-nav-btn">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="calendar-grid">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {/* Empty slots for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day-offset" />
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
              className={`calendar-day-btn ${
                isSelected ? 'selected' : isToday ? 'today' : ''
              }`}
            >
              <span className="calendar-day-number">{dayNumber}</span>
              {hasTask && (
                <div className="day-dots">
                  {categories.map((cat, idx) => (
                    <span 
                      key={idx}
                      className={`day-dot ${
                        isSelected ? 'selected-dot' : cat
                      }`}
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
