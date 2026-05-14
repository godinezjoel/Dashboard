import { useMemo } from 'react';
import { CheckCircle2, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { CATEGORY_STYLES } from '../tasks/TaskList';
import { motion } from 'framer-motion';

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
      <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-muted)' }}>
          <Activity size={14} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Velocity</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Today</p>
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.completedToday}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>This Week</p>
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.completedWeek}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>This Month</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.completedMonth}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Open Tasks</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-secondary)' }}>{stats.openTasksCount}</p>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-5" style={{ color: 'var(--text-muted)' }}>
          <CheckCircle2 size={14} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Completion Rates</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(stats.catStats).map(([cat, data]) => {
            const pct = data.total === 0 ? 0 : Math.round((data.done / data.total) * 100);
            const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.general;
            
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: style.color }}>{cat}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: style.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Chart */}
      <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <TrendingUp size={14} />
            <h3 className="text-xs font-bold uppercase tracking-wider">XP Last 7 Days</h3>
          </div>
        </div>

        <div className="h-32 flex items-end justify-between gap-1 relative">
          {/* Subtle grid line */}
          <div className="absolute top-0 left-0 w-full border-t border-dashed opacity-20" style={{ borderColor: 'var(--text-muted)' }} />
          <div className="absolute top-1/2 left-0 w-full border-t border-dashed opacity-20" style={{ borderColor: 'var(--text-muted)' }} />
          
          {stats.chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 relative group">
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                {d.val} XP
              </div>
              
              {/* Bar */}
              <div className="w-full relative flex items-end justify-center h-full rounded-t-sm" style={{ background: 'var(--bg-elevated)' }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.heightPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  className="w-full rounded-t-sm"
                  style={{ background: 'var(--accent)' }}
                />
              </div>
              
              {/* Label */}
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
