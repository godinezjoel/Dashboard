import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CalendarDays, TrendingUp, Star, X } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useGame } from '../context/GameContext';

const QUESTIONS = [
  { key: 'wins', label: 'What am I proud of this week?' },
  { key: 'challenge', label: 'What challenged me the most this week?' },
  { key: 'lesson', label: 'What did I learn about myself?' },
  { key: 'next', label: 'What is one intention for next week?' },
];

function toWeekStartSunday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function weekKey(date) {
  const d = toWeekStartSunday(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function buildEmptyAnswers() {
  return QUESTIONS.reduce((acc, q) => ({ ...acc, [q.key]: '' }), {});
}

function buildDraftForWeek(weeklyEntries, currentWeekKey) {
  const entryForCurrentWeek =
    weeklyEntries.find((entry) => weekKey(entry.created_at) === currentWeekKey) || null;

  if (!entryForCurrentWeek) {
    return { rating: 3, answers: buildEmptyAnswers() };
  }

  const nextAnswers = buildEmptyAnswers();
  const dbAnswers = entryForCurrentWeek.answers || {};
  QUESTIONS.forEach((q) => {
    nextAnswers[q.key] = typeof dbAnswers[q.key] === 'string' ? dbAnswers[q.key] : '';
  });

  return { rating: entryForCurrentWeek.rating ?? 3, answers: nextAnswers };
}

export default function JournalPage() {
  const { user } = useGame();
  const [entries, setEntries] = useState([]);
  const [rating, setRating] = useState(3);
  const [answers, setAnswers] = useState(buildEmptyAnswers);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  const currentWeek = toWeekStartSunday(new Date());
  const currentWeekKey = weekKey(currentWeek);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      return () => {
        isMounted = false;
      };
    }

    async function loadEntries() {
      if (isMounted) {
        setLoading(true);
        setError('');
      }

      try {
        const { data, error: loadError } = await supabase
          .from('journals')
          .select('id, rating, answers, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (loadError) {
          throw loadError;
        }

        const byWeek = new Map();
        (data || []).forEach((entry) => {
          const key = weekKey(entry.created_at);
          if (!byWeek.has(key)) byWeek.set(key, entry);
        });

        const weeklyEntries = Array.from(byWeek.values()).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        if (!isMounted) return;
        const draft = buildDraftForWeek(weeklyEntries, currentWeekKey);
        setEntries(weeklyEntries);
        setRating(draft.rating);
        setAnswers(draft.answers);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Could not load journal entries.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, [user, currentWeekKey]);

  const currentEntry = entries.find((entry) => weekKey(entry.created_at) === currentWeekKey) || null;

  const avgMood = useMemo(() => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + Number(entry.rating || 0), 0);
    return Math.round((sum / entries.length) * 10) / 10;
  }, [entries]);

  const moodSeries = useMemo(() => {
    return [...entries]
      .slice(0, 8)
      .reverse()
      .map((entry) => ({
        id: entry.id,
        rating: Number(entry.rating || 0),
        label: formatDate(toWeekStartSunday(entry.created_at)),
      }));
  }, [entries]);

  async function saveJournal() {
    if (!user) return;
    setSaving(true);
    setError('');

    const payload = {
      rating,
      answers,
      created_at: new Date().toISOString(),
    };

    if (currentEntry) {
      const { error: updateError } = await supabase
        .from('journals')
        .update(payload)
        .eq('id', currentEntry.id)
        .eq('user_id', user.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('journals').insert({
        user_id: user.id,
        ...payload,
      });
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    const { data, error: loadError } = await supabase
      .from('journals')
      .select('id, rating, answers, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setSaving(false);
      return;
    }

    const byWeek = new Map();
    (data || []).forEach((entry) => {
      const key = weekKey(entry.created_at);
      if (!byWeek.has(key)) byWeek.set(key, entry);
    });
    const weeklyEntries = Array.from(byWeek.values()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const draft = buildDraftForWeek(weeklyEntries, currentWeekKey);
    setEntries(weeklyEntries);
    setRating(draft.rating);
    setAnswers(draft.answers);
    setSaving(false);
  }

  if (loading && user) {
    return (
      <div className="p-6">
        <p className="text-muted-var">Loading journal...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary-var">
            <BookOpen size={20} className="text-accent-var" />
            Journal
          </h2>
          <p className="text-xs mt-1 text-muted-var">
            Weekly reflection (Sunday cycle): {formatDate(currentWeek)} - {formatDate(addDays(currentWeek, 6))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-var">
              This week reflection
            </p>
            <span className="badge">
              <CalendarDays size={12} />
              {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2 text-secondary-var">
              Weekly mood rating
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                    value <= rating
                      ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-accent-var'
                      : 'bg-surface-var border-var text-muted-var'
                  }`}
                >
                  <Star size={16} fill="currentColor" />
                </button>
              ))}
              <span className="text-sm font-semibold ml-2 text-primary-var">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {QUESTIONS.map((q) => (
              <div key={q.key}>
                <label className="text-xs font-semibold mb-1 block text-secondary-var">
                  {q.label}
                </label>
                <textarea
                  className="input min-h-20 resize-y"
                  value={answers[q.key] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
                  placeholder="Write your reflection..."
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="text-xs font-medium text-red-400">
              {error}
            </p>
          )}

          <button className="btn-primary" onClick={saveJournal} disabled={saving}>
            {saving ? 'Saving...' : currentEntry ? 'Update this week' : 'Save this week'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4 text-muted-var">
              <TrendingUp size={14} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Mood Analytics</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-surface-var border border-var">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-var">
                  Average Mood
                </p>
                <p className="text-xl font-bold text-primary-var">{avgMood || '-'}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-var border border-var">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-var">
                  Total Weeks
                </p>
                <p className="text-xl font-bold text-primary-var">{entries.length}</p>
              </div>
            </div>

            {moodSeries.length === 0 ? (
              <p className="text-xs text-muted-var">
                Add your first reflection to build your mood history.
              </p>
            ) : (
              <div className="h-36 flex items-end gap-2">
                {moodSeries.map((point) => (
                  <div key={point.id} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max((point.rating / 5) * 100, 8)}%` }}
                      transition={{ duration: 0.5 }}
                      className="w-full rounded-t-md bg-[var(--accent)]"
                    />
                    <span className="text-[9px] text-center leading-tight text-muted-var">
                      {point.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4 text-primary-var">
          Past reflections
        </h3>

        {entries.length === 0 ? (
          <p className="text-xs text-muted-var">
            No reflections yet.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const weekStart = toWeekStartSunday(entry.created_at);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedHistoryEntry(entry)}
                  className="w-full p-4 rounded-xl text-left transition-colors bg-surface-var border border-var"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-var">
                      Week of {formatDate(weekStart)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 text-accent-var">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={`${entry.id}-${idx}`}
                            size={12}
                            fill={idx + 1 <= Number(entry.rating || 0) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-secondary-var">
                        {entry.rating}/5
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedHistoryEntry && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/55"
              onClick={() => setSelectedHistoryEntry(null)}
              aria-label="Close journal details"
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="relative w-full max-w-2xl rounded-2xl p-5 bg-card-var border border-var"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-var">
                    Week of {formatDate(toWeekStartSunday(selectedHistoryEntry.created_at))}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-accent-var">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={`modal-rating-${idx}`}
                        size={14}
                        fill={idx + 1 <= Number(selectedHistoryEntry.rating || 0) ? 'currentColor' : 'none'}
                      />
                    ))}
                    <span className="text-xs font-semibold ml-1 text-secondary-var">
                      {selectedHistoryEntry.rating}/5
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHistoryEntry(null)}
                  className="p-2 rounded-lg transition-colors text-muted-var bg-surface-var"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUESTIONS.map((q) => (
                  <div key={`modal-${selectedHistoryEntry.id}-${q.key}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-muted-var">
                      {q.label}
                    </p>
                    <p className="text-xs whitespace-pre-wrap text-secondary-var">
                      {(selectedHistoryEntry.answers || {})[q.key] || '-'}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
