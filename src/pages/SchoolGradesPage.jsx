import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import { useGame } from '../context/GameContext';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import './SchoolPage.css';

export default function SchoolGradesPage() {
  const { user } = useGame();

  // DB States
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // Grading System State (Germany, Switzerland, points, percent)
  const [gradingSystem, setGradingSystem] = useState(() => {
    return localStorage.getItem('school_grading_system') || 'de';
  });

  useEffect(() => {
    localStorage.setItem('school_grading_system', gradingSystem);
  }, [gradingSystem]);

  // Subject Form State
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjSemester, setNewSubjSemester] = useState('Semester 1');

  // Grade Form State
  const [newGradeValue, setNewGradeValue] = useState('');
  const [newGradeWeight, setNewGradeWeight] = useState('100');
  const [newGradeType, setNewGradeType] = useState('Exam');
  const [newGradeDate, setNewGradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGradeDesc, setNewGradeDesc] = useState('');

  // ── Grading system helper functions ─────────────────────────────────────────
  const formatGrade = (gradeVal) => {
    if (gradeVal === undefined || gradeVal === null) return '';
    const num = parseFloat(gradeVal);
    if (isNaN(num)) return '';

    if (num % 1 === 0) {
      return num.toFixed(1).replace('.', ',');
    }
    const formatted = num.toFixed(2);
    if (formatted.endsWith('0')) {
      return parseFloat(formatted).toFixed(1).replace('.', ',');
    }
    return formatted.replace('.', ',');
  };

  const getGradeColor = (val) => {
    if (!val) return 'var(--text-primary)';
    const num = parseFloat(val);
    if (isNaN(num)) return 'var(--text-primary)';

    if (gradingSystem === 'de') {
      if (num <= 2.0) return '#34d399'; // green (1.0 - 2.0)
      if (num <= 4.0) return '#fb923c'; // orange (2.1 - 4.0)
      return '#f87171'; // red (4.1 - 6.0)
    } else if (gradingSystem === 'ch') {
      if (num >= 5.0) return '#34d399'; // green (5.0 - 6.0)
      if (num >= 4.0) return '#fb923c'; // orange (4.0 - 4.9)
      return '#f87171'; // red (1.0 - 3.9)
    } else if (gradingSystem === 'points') {
      if (num >= 11) return '#34d399'; // green (11 - 15)
      if (num >= 5) return '#fb923c'; // orange (5 - 10)
      return '#f87171'; // red (0 - 4)
    } else if (gradingSystem === 'percent') {
      if (num >= 90) return '#34d399'; // green (90 - 100)
      if (num >= 60) return '#fb923c'; // orange (60 - 89)
      return '#f87171'; // red (0 - 59)
    }
    return 'var(--accent)';
  };

  const getBarHeightPct = (val) => {
    if (!val) return 0;
    const num = parseFloat(val);
    if (isNaN(num)) return 0;

    if (gradingSystem === 'de') {
      // 1 is best (100%), 6 is worst (10%)
      return Math.max(10, Math.min(100, ((6 - num) / 5) * 90 + 10));
    } else if (gradingSystem === 'ch') {
      // 6 is best (100%), 1 is worst (10%)
      return Math.max(10, Math.min(100, ((num - 1) / 5) * 90 + 10));
    } else if (gradingSystem === 'points') {
      // 15 is best (100%), 0 is worst (10%)
      return Math.max(10, Math.min(100, (num / 15) * 90 + 10));
    } else if (gradingSystem === 'percent') {
      // 100 is best (100%), 0 is worst (10%)
      return Math.max(10, Math.min(100, (num / 100) * 90 + 10));
    }
    return 50;
  };

  // ── Load Grade Tracker Data ──────────────────────────────────────────────────
  const loadSchoolGradesData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [subjRes, gradeRes] = await Promise.all([
        supabase.from('school_subjects').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('school_grades').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);

      if (subjRes.error) throw subjRes.error;
      if (gradeRes.error) throw gradeRes.error;

      const loadedSubjects = subjRes.data || [];
      setSubjects(loadedSubjects);
      setGrades(gradeRes.data || []);

      // Auto-select first subject if none selected
      if (loadedSubjects.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(loadedSubjects[0].id);
      }
    } catch (err) {
      console.error('[SchoolGradesPage] error loading data:', err);
      toast.error('Error loading school grades data.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedSubjectId]);

  useEffect(() => {
    if (user) {
      loadSchoolGradesData();
    }
  }, [user, loadSchoolGradesData]);

  // ── Actions ──────────────────────────────────────────────────────────
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('school_subjects')
        .insert({
          user_id: user.id,
          name: newSubjName.trim(),
          semester: newSubjSemester,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Subject created successfully!');
      setSubjects(prev => [...prev, data]);
      setNewSubjName('');
      setSelectedSubjectId(data.id);
    } catch (err) {
      toast.error(err.message || 'Error creating subject.');
    }
  };

  const handleDeleteSubject = async (subjId) => {
    if (!window.confirm('Are you sure you want to delete this subject and all associated grades?')) return;

    try {
      const { error } = await supabase
        .from('school_subjects')
        .delete()
        .eq('id', subjId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Subject deleted.');

      setSubjects(prev => {
        const filtered = prev.filter(s => s.id !== subjId);
        if (selectedSubjectId === subjId) {
          setSelectedSubjectId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });

      setGrades(prev => prev.filter(g => g.subject_id !== subjId));
    } catch (err) {
      toast.error(err.message || 'Error deleting subject.');
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    const gradeNum = parseFloat(newGradeValue.replace(',', '.'));
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error('Please enter a valid grade or percentage between 0 and 100.');
      return;
    }
    const weightNum = parseFloat(newGradeWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error('Please enter a valid weight.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('school_grades')
        .insert({
          user_id: user.id,
          subject_id: selectedSubjectId,
          grade: gradeNum,
          weight: weightNum,
          type: newGradeType,
          date: newGradeDate,
          description: newGradeDesc.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Grade added!');
      setGrades(prev => [data, ...prev]);
      setNewGradeValue('');
      setNewGradeDesc('');
    } catch (err) {
      toast.error(err.message || 'Error adding grade.');
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      const { error } = await supabase
        .from('school_grades')
        .delete()
        .eq('id', gradeId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Grade deleted.');
      setGrades(prev => prev.filter(g => g.id !== gradeId));
    } catch (err) {
      toast.error(err.message || 'Error deleting grade.');
    }
  };

  // Calculations for Averages
  const calculateSubjectAverage = (subjId) => {
    const subjGrades = grades.filter(g => g.subject_id === subjId);
    if (subjGrades.length === 0) return null;

    let weightedSum = 0;
    let weightSum = 0;
    subjGrades.forEach(g => {
      weightedSum += parseFloat(g.grade) * parseFloat(g.weight);
      weightSum += parseFloat(g.weight);
    });

    return weightSum > 0 ? (weightedSum / weightSum).toFixed(2) : null;
  };

  const calculateOverallAverage = () => {
    const validAverages = subjects
      .map(s => calculateSubjectAverage(s.id))
      .filter(avg => avg !== null)
      .map(avg => parseFloat(avg));

    if (validAverages.length === 0) return null;
    const sum = validAverages.reduce((acc, curr) => acc + curr, 0);
    return (sum / validAverages.length).toFixed(2);
  };

  const getSemesterAverages = () => {
    const semesters = [...new Set(subjects.map(s => s.semester))].sort();
    return semesters.map(sem => {
      const semSubjects = subjects.filter(s => s.semester === sem);
      const avgs = semSubjects
        .map(s => calculateSubjectAverage(s.id))
        .filter(avg => avg !== null)
        .map(avg => parseFloat(avg));

      const avg = avgs.length > 0 ? (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2) : null;
      return { semester: sem, average: avg };
    });
  };



  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedSubjectGrades = grades.filter(g => g.subject_id === selectedSubjectId);
  const overallAverage = calculateOverallAverage();
  const semesterAverages = getSemesterAverages();

  return (
    <div className="school-page-container">
      {/* Header */}
      <div className="school-header">
        <h2 className="school-title">
          <GraduationCap size={26} className="school-title-icon" />
          School Portal
        </h2>
        {/* Mobile Tab Switcher */}
        <div className="school-mobile-tabs">
          <NavLink
            to="/school/grades"
            className={({ isActive }) => `school-mobile-tab ${isActive ? 'active' : ''}`}
          >
            Grade Tracker
          </NavLink>
          <NavLink
            to="/school/exams"
            className={({ isActive }) => `school-mobile-tab ${isActive ? 'active' : ''}`}
          >
            Exam Prep
          </NavLink>
        </div>
      </div>

      {/* Main Grade Tracker Layout */}
      <div className="noten-dashboard">
        {/* Sidebar: Subject list */}
        <div className="subject-sidebar">
          {/* Overall stats */}
          <div className="card overview-card">
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>GPA / Average</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Average of all subjects</p>
            </div>
            <div className="overall-avg-badge" style={{
              borderColor: getGradeColor(overallAverage),
              background: getGradeColor(overallAverage) + '15',
              boxShadow: `0 0 20px ${getGradeColor(overallAverage)}33`
            }}>
              <span className="overall-avg-value" style={{ color: getGradeColor(overallAverage) }}>
                {overallAverage ? formatGrade(overallAverage) : '—'}
              </span>
              <span className="overall-avg-label">GPA</span>
            </div>
          </div>

          {/* Grading System Selection */}
          <div className="card school-form-card" style={{ padding: '12px', gap: '8px' }}>
            <label className="school-label" style={{ fontSize: '10px' }}>Select Grading System</label>
            <select
              value={gradingSystem}
              onChange={e => setGradingSystem(e.target.value)}
              className="school-input"
              style={{ fontSize: '13px' }}
            >
              <option value="de">Germany / Austria (1–6, 1=Best)</option>
              <option value="ch">Switzerland (1–6, 6=Best)</option>
              <option value="points">Gymnasium Upper Level (0–15, 15=Best)</option>
              <option value="percent">Percentage Scale (0–100, 100=Best)</option>
            </select>
          </div>

          {/* Add Subject form */}
          <form onSubmit={handleAddSubject} className="school-form-card">
            <span className="school-label">Add New Subject</span>
            <input
              type="text"
              value={newSubjName}
              onChange={e => setNewSubjName(e.target.value)}
              placeholder="e.g. Mathematics, Physics..."
              className="school-input"
              required
            />
            <div className="school-input-row">
              <input
                type="text"
                list="semester-options"
                value={newSubjSemester}
                onChange={e => setNewSubjSemester(e.target.value)}
                placeholder="Semester (e.g. Semester 1)"
                className="school-input"
                style={{ flex: 1 }}
                required
              />
              <datalist id="semester-options">
                <option value="Semester 1" />
                <option value="Semester 2" />
                <option value="Semester 3" />
                <option value="Semester 4" />
                <option value="Semester 5" />
                <option value="Semester 6" />
              </datalist>
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                <Plus size={16} />
              </button>
            </div>
          </form>

          {/* Subject lists */}
          <div className="subject-list">
            <span className="school-label">My Subjects</span>
            {subjects.length === 0 ? (
              <p className="empty-state">No subjects created yet.</p>
            ) : (
              subjects.map(subj => {
                const avg = calculateSubjectAverage(subj.id);
                const avgColor = getGradeColor(avg);
                return (
                  <div
                    key={subj.id}
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`card subject-item-card ${selectedSubjectId === subj.id ? 'active' : ''}`}
                  >
                    <div>
                      <div className="subject-name">{subj.name}</div>
                      <div className="subject-meta">{subj.semester}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="subject-avg" style={{
                        color: avgColor,
                        borderColor: avg ? avgColor + '33' : 'var(--border)',
                        background: avg ? avgColor + '11' : 'rgba(255,255,255,0.05)'
                      }}>
                        {avg ? formatGrade(avg) : '—'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subj.id);
                        }}
                        className="btn-danger-icon"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Grades details & chart pane */}
        <div className="subject-grades-pane">
          {selectedSubject ? (
            <>
              <div className="pane-header">
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{selectedSubject.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{selectedSubject.semester} • Grades & Tests</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="school-label">Subject Average:</span>
                  {(() => {
                    const subjAvg = calculateSubjectAverage(selectedSubject.id);
                    const avgColor = getGradeColor(subjAvg);
                    return (
                      <span className="subject-avg" style={{
                        fontSize: '20px',
                        padding: '6px 12px',
                        color: avgColor,
                        borderColor: subjAvg ? avgColor + '33' : 'var(--border)',
                        background: subjAvg ? avgColor + '11' : 'rgba(255,255,255,0.05)'
                      }}>
                        {subjAvg ? formatGrade(subjAvg) : '—'}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Add grade form */}
              <form onSubmit={handleAddGrade} className="card school-form-card">
                <span className="school-label">Enter Grade</span>
                <div className="school-form-grid">
                  <div className="school-field">
                    <label className="school-label">Grade</label>
                    <input
                      type="text"
                      placeholder={
                        gradingSystem === 'de' ? 'e.g., 1,3 or 2,0' :
                          gradingSystem === 'ch' ? 'e.g., 5,5 or 6,0' :
                            gradingSystem === 'points' ? 'e.g., 12 or 15' : 'e.g., 95 or 100'
                      }
                      value={newGradeValue}
                      onChange={e => setNewGradeValue(e.target.value)}
                      className="school-input"
                      required
                    />
                  </div>
                  <div className="school-field">
                    <label className="school-label">Weight (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newGradeWeight}
                      onChange={e => setNewGradeWeight(e.target.value)}
                      className="school-input"
                      required
                    />
                  </div>
                  <div className="school-field">
                    <label className="school-label">Type</label>
                    <select
                      value={newGradeType}
                      onChange={e => setNewGradeType(e.target.value)}
                      className="school-input"
                    >
                      <option value="Exam">Exam (Written)</option>
                      <option value="Oral">Oral Grade</option>
                      <option value="Assignment">Assignment / Paper</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="school-field">
                    <label className="school-label">Date</label>
                    <input
                      type="date"
                      value={newGradeDate}
                      onChange={e => setNewGradeDate(e.target.value)}
                      className="school-input"
                      required
                    />
                  </div>
                </div>
                <div className="school-field">
                  <label className="school-label">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Chapters, exam topics or general notes..."
                    value={newGradeDesc}
                    onChange={e => setNewGradeDesc(e.target.value)}
                    className="school-input"
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Add Grade
                </button>
              </form>

              {/* Grades Grid */}
              <div>
                <span className="school-label" style={{ marginBottom: '10px', display: 'block' }}>Entered Grades</span>
                {selectedSubjectGrades.length === 0 ? (
                  <p className="empty-state">No grades entered yet. Enter your first grade above!</p>
                ) : (
                  <div className="grades-grid">
                    {selectedSubjectGrades.map(g => {
                      const gradeColor = getGradeColor(g.grade);
                      return (
                        <div key={g.id} className="card grade-card" style={{ borderColor: gradeColor + '33' }}>
                          <button
                            onClick={() => handleDeleteGrade(g.id)}
                            className="grade-delete-btn"
                            title="Delete grade"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div>
                            <div className="grade-value" style={{ color: gradeColor }}>
                              {formatGrade(g.grade)}
                            </div>
                            <div className="grade-type">{g.type}</div>
                            <div className="grade-weight">{g.weight}% Weight</div>
                          </div>
                          <div>
                            {g.description && <div className="grade-desc">{g.description}</div>}
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {new Date(g.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ marginTop: '100px' }}>
              <BookOpen size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
              <p>Select a subject on the left or add a new subject to enter grades.</p>
            </div>
          )}

          {/* Semester Comparison Widget */}
          {semesterAverages.length > 0 && semesterAverages.some(s => s.average !== null) && (
            <div className="comparison-card">
              <span className="school-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={14} />
                Semester Comparison & Progress
              </span>
              <div className="comparison-chart-container">
                {semesterAverages.map(semAvg => {
                  const val = semAvg.average ? parseFloat(semAvg.average) : null;
                  const heightPct = getBarHeightPct(val);
                  const barColor = getGradeColor(val);

                  return (
                    <div key={semAvg.semester} className="comparison-bar-wrapper">
                      <div className="comparison-bar-val">{semAvg.average ? formatGrade(semAvg.average) : '—'}</div>
                      <div className="comparison-bar-bg">
                        {val && (
                          <motion.div
                            className="comparison-bar-fill"
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            style={{
                              background: `linear-gradient(180deg, ${barColor}, ${barColor}aa)`,
                              boxShadow: `0 0 10px ${barColor}44`
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        )}
                      </div>
                      <div className="comparison-bar-label">{semAvg.semester}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
