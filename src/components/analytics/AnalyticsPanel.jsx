import { useMemo } from 'react';
import { CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';
import './AnalyticsPanel.css';

const CAT_TEXT_CLASSES = {
  work: 'cat-text-work',
  health: 'cat-text-health',
  private: 'cat-text-private',
  general: 'cat-text-general',
};

const CAT_BAR_CLASSES = {
  work: 'cat-bar-work',
  health: 'cat-bar-health',
  private: 'cat-bar-private',
  general: 'cat-bar-general',
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
    <div className="analytics-container">
      
      {/* Quick Stats */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <Activity size={14} />
          <h3 className="analytics-card-title">Velocity</h3>
        </div>
        
        <div className="analytics-stats-grid">
          <div className="analytics-stat-item">
            <p className="analytics-stat-label">Today</p>
            <p className="analytics-stat-value">{stats.completedToday}</p>
          </div>
          <div className="analytics-stat-item">
            <p className="analytics-stat-label">This Week</p>
            <p className="analytics-stat-value">{stats.completedWeek}</p>
          </div>
          <div className="analytics-stat-item">
            <p className="analytics-stat-label">This Month</p>
            <p className="analytics-stat-value">{stats.completedMonth}</p>
          </div>
          <div className="analytics-stat-item">
            <p className="analytics-stat-label">Open Tasks</p>
            <p className="analytics-stat-value value-secondary">{stats.openTasksCount}</p>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <CheckCircle2 size={14} />
          <h3 className="analytics-card-title">Completion Rates</h3>
        </div>

        <div className="analytics-cat-list">
          {Object.entries(stats.catStats).map(([cat, data]) => {
            const pct = data.total === 0 ? 0 : Math.round((data.done / data.total) * 100);
            const categoryKey = CAT_TEXT_CLASSES[cat] ? cat : 'general';
            
            return (
              <div key={cat}>
                <div className="analytics-cat-text-row">
                  <span className={`analytics-cat-label ${CAT_TEXT_CLASSES[categoryKey]}`}>{cat}</span>
                  <span className="analytics-cat-percent">{pct}%</span>
                </div>
                <div className="analytics-progress-container">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`analytics-progress-fill ${CAT_BAR_CLASSES[categoryKey]}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Chart */}
      <div className="analytics-card">
        <div className="analytics-card-header header-space-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={14} />
            <h3 className="analytics-card-title">XP Last 7 Days</h3>
          </div>
        </div>

        <div className="analytics-chart-container">
          {/* Subtle grid lines */}
          <div className="analytics-chart-gridline gridline-top" />
          <div className="analytics-chart-gridline gridline-middle" />
          
          {stats.chartData.map((d, i) => (
            <div key={i} className="analytics-chart-bar-column">
              {/* Tooltip */}
              <div className="analytics-tooltip">
                {d.val} XP
              </div>
              
              {/* Bar */}
              <div className="analytics-bar-wrapper">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.heightPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  className="analytics-bar-fill"
                />
              </div>
              
              {/* Label */}
              <span className="analytics-chart-label">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
