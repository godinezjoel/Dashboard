import { useMemo } from 'react';
import { CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';

const CAT_TEXT_CLASSES = {
  work: 'text-[#60a5fa]',
  health: 'text-[#4ade80]',
  private: 'text-[#c084fc]',
  general: 'text-muted-var',
};

const CAT_BAR_CLASSES = {
  work: 'bg-[#60a5fa]',
  health: 'bg-[#4ade80]',
  private: 'bg-[#c084fc]',
  general: 'bg-[var(--text-muted)]',
};

export default function AnalyticsPanel() {
  const { tasks } = useGame();

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Quick Stats
    let completedToday = 0;
    let completedWeek = 0;
    let completedMonth = 0;
    let openTasksCount = 0;

    // XP Chart (last 7 days)
    const xpByDay = Array(7).fill(0);
    const dayLabels = Array(7).fill('');
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today - (6 - i) * 86400000);
      dayLabels[i] = d.toLocaleDateString(undefined, { weekday: 'short' });
    }

    // Category Stats
    const catStats = {
      work: { total: 0, done: 0 },
      health: { total: 0, done: 0 },
      private: { total: 0, done: 0 },
      general: { total: 0, done: 0 }
    };

    tasks.forEach(t => {
      const isDone = t.is_done && t.completed_at;
      const cat = t.category || 'general';
      
      if (catStats[cat]) {
        catStats[cat].total++;
        if (isDone) catStats[cat].done++;
      }

      if (isDone) {
        const compDate = new Date(t.completed_at).getTime();
        const diffDays = Math.floor((today - new Date(new Date(t.completed_at).getFullYear(), new Date(t.completed_at).getMonth(), new Date(t.completed_at).getDate()).getTime()) / 86400000);

        if (diffDays === 0) completedToday++;
        if (diffDays >= 0 && diffDays < 7) {
          completedWeek++;
          // Add to chart
          const idx = 6 - diffDays;
          xpByDay[idx] += (t.xp_reward || 0);
        }
        if (diffDays >= 0 && diffDays < 30) completedMonth++;
      } else {
        openTasksCount++;
      }
    });

    const maxChartXp = Math.max(...xpByDay, 50); // Minimum scale 50
    const chartData = xpByDay.map((val, i) => ({
      val,
      label: dayLabels[i],
      heightPct: (val / maxChartXp) * 100
    }));

    return { completedToday, completedWeek, completedMonth, openTasksCount, catStats, chartData, maxChartXp };
  }, [tasks]);

  return (
    <div className="space-y-6">
      
      {/* Quick Stats */}
      <div className="p-5 rounded-2xl bg-surface-var border border-var">
        <div className="flex items-center gap-2 mb-4 text-muted-var">
          <Activity size={14} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Velocity</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1 text-muted-var">Today</p>
            <p className="text-2xl font-black text-primary-var">{stats.completedToday}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1 text-muted-var">This Week</p>
            <p className="text-2xl font-black text-primary-var">{stats.completedWeek}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1 text-muted-var">This Month</p>
            <p className="text-xl font-bold text-primary-var">{stats.completedMonth}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1 text-muted-var">Open Tasks</p>
            <p className="text-xl font-bold text-secondary-var">{stats.openTasksCount}</p>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="p-5 rounded-2xl bg-surface-var border border-var">
        <div className="flex items-center gap-2 mb-5 text-muted-var">
          <CheckCircle2 size={14} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Completion Rates</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(stats.catStats).map(([cat, data]) => {
            const pct = data.total === 0 ? 0 : Math.round((data.done / data.total) * 100);
            const categoryKey = CAT_TEXT_CLASSES[cat] ? cat : 'general';
            
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${CAT_TEXT_CLASSES[categoryKey]}`}>{cat}</span>
                  <span className="text-[10px] font-mono font-bold text-muted-var">{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-elevated-var">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${CAT_BAR_CLASSES[categoryKey]}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Chart */}
      <div className="p-5 rounded-2xl bg-surface-var border border-var">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-var">
            <TrendingUp size={14} />
            <h3 className="text-xs font-bold uppercase tracking-wider">XP Last 7 Days</h3>
          </div>
        </div>

        <div className="h-32 flex items-end justify-between gap-1 relative">
          {/* Subtle grid line */}
          <div className="absolute top-0 left-0 w-full border-t border-dashed opacity-20 border-muted-var" />
          <div className="absolute top-1/2 left-0 w-full border-t border-dashed opacity-20 border-muted-var" />
          
          {stats.chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 relative group">
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none bg-[var(--text-primary)] text-[var(--bg-primary)]">
                {d.val} XP
              </div>
              
              {/* Bar */}
              <div className="w-full relative flex items-end justify-center h-full rounded-t-sm bg-elevated-var">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.heightPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  className="w-full rounded-t-sm bg-[var(--accent)]"
                />
              </div>
              
              {/* Label */}
              <span className="text-[8px] font-bold uppercase tracking-wider text-muted-var">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
