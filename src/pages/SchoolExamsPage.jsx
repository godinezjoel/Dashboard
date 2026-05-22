import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase/client';
import { useGame } from '../context/GameContext';
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Upload,
  FileText,
  Loader2,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import './SchoolPage.css';

export default function SchoolExamsPage() {
  const { user } = useGame();

  // DB States
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [examTopics, setExamTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedExam, setSelectedExam] = useState(null);

  // Exam Form State
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubjId, setNewExamSubjId] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamDesc, setNewExamDesc] = useState('');

  // Topic Form State
  const [newTopicName, setNewTopicName] = useState('');

  // Bulk Import State
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  // Quick Subject Form State
  const [showQuickAddSubj, setShowQuickAddSubj] = useState(false);
  const [quickSubjName, setQuickSubjName] = useState('');
  const [quickSubjSemester, setQuickSubjSemester] = useState('Semester 1');

  // ── Load Exam Data ──────────────────────────────────────────────────────────
  const loadSchoolExamsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [subjRes, examRes, topicRes] = await Promise.all([
        supabase.from('school_subjects').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('school_exams').select('*').eq('user_id', user.id).order('exam_date'),
        supabase.from('school_exam_topics').select('*').eq('user_id', user.id).order('created_at'),
      ]);

      if (subjRes.error) throw subjRes.error;
      if (examRes.error) throw examRes.error;
      if (topicRes.error) throw topicRes.error;

      setSubjects(subjRes.data || []);
      setExams(examRes.data || []);
      setExamTopics(topicRes.data || []);
    } catch (err) {
      console.error('[SchoolExamsPage] error loading data:', err);
      toast.error('Error loading school exam preparation data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSchoolExamsData();
    }
  }, [user, loadSchoolExamsData]);

  // ── Subject actions ──────────────────────────────────────────────────────────
  const handleQuickAddSubject = async () => {
    if (!quickSubjName.trim()) {
      toast.error('Please enter a subject name.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('school_subjects')
        .insert({
          user_id: user.id,
          name: quickSubjName.trim(),
          semester: quickSubjSemester,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Subject created successfully!');
      setSubjects(prev => [...prev, data]);
      setNewExamSubjId(data.id);
      setQuickSubjName('');
      setShowQuickAddSubj(false);
    } catch (err) {
      toast.error(err.message || 'Error creating subject.');
    }
  };

  // ── Exam actions ──────────────────────────────────────────────────────────
  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamSubjId || !newExamDate) {
      toast.error('Please fill in all required fields for the exam.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('school_exams')
        .insert({
          user_id: user.id,
          subject_id: newExamSubjId,
          title: newExamTitle.trim(),
          exam_date: newExamDate,
          description: newExamDesc.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Exam added successfully!');
      setExams(prev => [...prev, data]);
      setNewExamTitle('');
      setNewExamDate('');
      setNewExamDesc('');
    } catch (err) {
      toast.error(err.message || 'Error adding exam.');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam and all associated topics?')) return;

    try {
      const { error } = await supabase
        .from('school_exams')
        .delete()
        .eq('id', examId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Exam deleted.');
      setExams(prev => prev.filter(ex => ex.id !== examId));
      setExamTopics(prev => prev.filter(t => t.exam_id !== examId));

      if (selectedExam && selectedExam.id === examId) {
        setSelectedExam(null);
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting exam.');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedExam) return;

    try {
      const { data, error } = await supabase
        .from('school_exam_topics')
        .insert({
          user_id: user.id,
          exam_id: selectedExam.id,
          name: newTopicName.trim(),
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Topic added!');
      setExamTopics(prev => [...prev, data]);
      setNewTopicName('');
    } catch (err) {
      toast.error(err.message || 'Error adding topic.');
    }
  };

  // ── Bulk Import Topics ──────────────────────────────────────────────────────
  const handleBulkImportTopics = async () => {
    if (!selectedExam || !bulkImportText.trim()) return;

    setBulkImporting(true);
    try {
      // Parse lines: one topic per line, trim whitespace, ignore empties
      const lines = bulkImportText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) {
        toast.error('No valid topics found. Enter one topic per line.');
        setBulkImporting(false);
        return;
      }

      // Deduplicate against existing topics for this exam
      const existingNames = new Set(
        examTopics
          .filter(t => t.exam_id === selectedExam.id)
          .map(t => t.name.toLowerCase())
      );

      const newTopics = lines.filter(name => !existingNames.has(name.toLowerCase()));

      if (newTopics.length === 0) {
        toast('All topics already exist for this exam.', { icon: 'ℹ️' });
        setBulkImporting(false);
        return;
      }

      // Build insert rows
      const rows = newTopics.map(name => ({
        user_id: user.id,
        exam_id: selectedExam.id,
        name,
        is_completed: false,
      }));

      const { data, error } = await supabase
        .from('school_exam_topics')
        .insert(rows)
        .select();

      if (error) throw error;

      toast.success(`${data.length} topic${data.length !== 1 ? 's' : ''} imported!`);
      setExamTopics(prev => [...prev, ...data]);
      setBulkImportText('');
      setShowBulkImport(false);
    } catch (err) {
      toast.error(err.message || 'Error importing topics.');
    } finally {
      setBulkImporting(false);
    }
  };

  // Count valid lines for the import preview
  const getBulkImportPreview = () => {
    if (!bulkImportText.trim()) return { total: 0, newCount: 0, dupes: 0 };

    const lines = bulkImportText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const existingNames = new Set(
      examTopics
        .filter(t => t.exam_id === selectedExam?.id)
        .map(t => t.name.toLowerCase())
    );

    const newCount = lines.filter(l => !existingNames.has(l.toLowerCase())).length;
    return { total: lines.length, newCount, dupes: lines.length - newCount };
  };

  const handleToggleTopic = async (topic) => {
    const updatedStatus = !topic.is_completed;
    try {
      // Optimistic update
      setExamTopics(prev => prev.map(t => t.id === topic.id ? { ...t, is_completed: updatedStatus } : t));

      const { error } = await supabase
        .from('school_exam_topics')
        .update({ is_completed: updatedStatus })
        .eq('id', topic.id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      // Rollback
      setExamTopics(prev => prev.map(t => t.id === topic.id ? { ...t, is_completed: !updatedStatus } : t));
      toast.error('Failed to update topic status.');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      const { error } = await supabase
        .from('school_exam_topics')
        .delete()
        .eq('id', topicId)
        .eq('user_id', user.id);

      if (error) throw error;

      setExamTopics(prev => prev.filter(t => t.id !== topicId));
    } catch (err) {
      toast.error('Error deleting topic.');
    }
  };

  // Countdown Helper
  const getCountdown = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(dateString);
    examDate.setHours(0, 0, 0, 0);

    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today!', class: 'urgent' };
    if (diffDays === 1) return { text: 'Tomorrow!', class: 'urgent' };
    if (diffDays > 1) return { text: `In ${diffDays} days`, class: diffDays <= 3 ? 'urgent' : 'normal' };
    return { text: `${Math.abs(diffDays)} days ago`, class: 'passed' };
  };

  // Dynamic Exam progress and status
  const getExamProgressInfo = (examId) => {
    const topics = examTopics.filter(t => t.exam_id === examId);
    if (topics.length === 0) {
      return { pct: 0, completed: 0, total: 0, status: 'open', statusText: 'Open' };
    }

    const completed = topics.filter(t => t.is_completed).length;
    const pct = Math.round((completed / topics.length) * 100);

    let status = 'in-progress';
    let statusText = 'In Progress';

    if (completed === 0) {
      status = 'open';
      statusText = 'Open';
    } else if (completed === topics.length) {
      status = 'ready';
      statusText = 'Ready';
    }

    return { pct, completed, total: topics.length, status, statusText };
  };



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

      {/* Exam Prep Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Title */}
        <div className="exams-header-bar">
          <h3 className="exams-section-title">Upcoming Exams & Tests</h3>
        </div>

        <div className="exams-layout-grid">
          {/* Left Column: Form to Add Exam */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <form onSubmit={handleAddExam} className="card school-form-card">
              <span className="school-label">Add New Exam</span>

              <div className="school-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="school-label">Subject</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddSubj(!showQuickAddSubj)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
                  >
                    <Plus size={10} /> {showQuickAddSubj ? 'Cancel' : 'Add New Subject'}
                  </button>
                </div>

                {showQuickAddSubj ? (
                  <div className="card" style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Subject name (e.g. Chemistry)"
                      value={quickSubjName}
                      onChange={e => setQuickSubjName(e.target.value)}
                      className="school-input"
                      style={{ padding: '6px 10px', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        list="semester-options"
                        placeholder="Semester (e.g. Semester 1)"
                        value={quickSubjSemester}
                        onChange={e => setQuickSubjSemester(e.target.value)}
                        className="school-input"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
                      />
                      <datalist id="semester-options">
                        <option value="Semester 1" />
                        <option value="Semester 2" />
                        <option value="Semester 3" />
                        <option value="Semester 4" />
                        <option value="Semester 5" />
                        <option value="Semester 6" />
                      </datalist>
                      <button
                        type="button"
                        onClick={handleQuickAddSubject}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={newExamSubjId}
                    onChange={e => setNewExamSubjId(e.target.value)}
                    className="school-input"
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.semester})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="school-field">
                <label className="school-label">Exam Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Final Exam, Vocabulary Test..."
                  value={newExamTitle}
                  onChange={e => setNewExamTitle(e.target.value)}
                  className="school-input"
                  required
                />
              </div>

              <div className="school-field">
                <label className="school-label">Exam Date</label>
                <input
                  type="date"
                  value={newExamDate}
                  onChange={e => setNewExamDate(e.target.value)}
                  className="school-input"
                  required
                />
              </div>

              <div className="school-field">
                <label className="school-label">Description (Optional)</label>
                <textarea
                  placeholder="e.g. Allowed materials, exam room..."
                  value={newExamDesc}
                  onChange={e => setNewExamDesc(e.target.value)}
                  className="school-input"
                  style={{ height: '80px', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Plus size={16} />
                Add Exam
              </button>
            </form>
          </div>

          {/* Right Column: Exams Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {exams.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 10px' }}>
                <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                <p>No exams added yet. Add a new exam on the left to start preparation!</p>
              </div>
            ) : (
              <div className="exams-grid">
                {exams.map(ex => {
                  const subj = subjects.find(s => s.id === ex.subject_id);
                  const countdown = getCountdown(ex.exam_date);
                  const progress = getExamProgressInfo(ex.id);
                  const nextTopic = examTopics
                    .filter(t => t.exam_id === ex.id && !t.is_completed)
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

                  return (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedExam(ex)}
                      className="card exam-card"
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span className="exam-subject-badge">{subj ? subj.name : 'Subject'}</span>
                          <span className={`exam-countdown ${countdown.class}`}>
                            <Clock size={12} />
                            {countdown.text}
                          </span>
                        </div>
                        <h4 className="exam-card-title">{ex.title}</h4>
                        {ex.description && <p className="exam-card-desc">{ex.description}</p>}
                      </div>

                      {/* Next Topic */}
                      {nextTopic ? (
                        <div className="exam-next-topic">
                          <div className="exam-next-topic-label">
                            <BookOpen size={11} />
                            <span>Next up</span>
                          </div>
                          <span className="exam-next-topic-name">{nextTopic.name}</span>
                        </div>
                      ) : progress.total > 0 ? (
                        <div className="exam-next-topic all-done">
                          <div className="exam-next-topic-label">
                            <CheckCircle size={11} />
                            <span>All topics prepared!</span>
                          </div>
                        </div>
                      ) : null}

                      {/* Progress */}
                      <div>
                        <div className="exam-progress-row">
                          <span>Learning Progress</span>
                          <span className={`exam-status-indicator ${progress.status}`}>{progress.statusText}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar-container" style={{ flex: 1, height: '8px' }}>
                            <motion.div
                              className="progress-bar-fill"
                              animate={{ width: `${progress.pct}%` }}
                              style={{ backgroundColor: progress.status === 'ready' ? '#34d399' : progress.status === 'in-progress' ? '#fb923c' : '#f87171' }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{progress.pct}%</span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} />
                          {progress.completed} of {progress.total} topics prepared
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} />
                          {new Date(ex.exam_date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent)' }}>
                          Edit Topics
                          <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam Detail Modal (Topic Checklist Drawer) */}
      <AnimatePresence>
        {selectedExam && (
          <div className="exam-modal-overlay" onClick={() => setSelectedExam(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="exam-modal-content"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="exam-modal-header">
                <div className="exam-modal-header-text">
                  <span className="exam-subject-badge">
                    {subjects.find(s => s.id === selectedExam.subject_id)?.name || 'Subject'}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                    {selectedExam.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    Exam Date: {new Date(selectedExam.exam_date).toLocaleDateString()}
                  </p>
                </div>
                <button className="exam-modal-close" onClick={() => setSelectedExam(null)}>×</button>
              </div>

                {selectedExam.description && (
                  <div className="card" style={{ padding: '12px', background: 'var(--bg-elevated)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div className="school-label" style={{ marginBottom: '4px', fontSize: '10px' }}>Description / Notes</div>
                  {selectedExam.description}
                </div>
              )}

              {/* Topics Checklist Section */}
              <div className="exam-topics-section">
                <div className="topics-header">
                  <span>Chapters & Topics</span>
                  <span>{getExamProgressInfo(selectedExam.id).pct}% prepared</span>
                </div>

                {/* Add Topic Inline Form + Import Button */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <form onSubmit={handleAddTopic} className="school-input-row" style={{ marginTop: 0, flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Add new chapter/topic..."
                      value={newTopicName}
                      onChange={e => setNewTopicName(e.target.value)}
                      className="school-input"
                      style={{ flex: 1, padding: '6px 12px', fontSize: '13px' }}
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '6px 12px' }}>
                      <Plus size={14} />
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setShowBulkImport(!showBulkImport)}
                    className={`bulk-import-toggle-btn ${showBulkImport ? 'active' : ''}`}
                    title="Import multiple topics at once"
                  >
                    <Upload size={14} />
                  </button>
                </div>

                {/* Bulk Import Panel */}
                <AnimatePresence>
                  {showBulkImport && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="bulk-import-panel">
                        <div className="bulk-import-header">
                          <div className="bulk-import-title">
                            <FileText size={14} />
                            <span>Bulk Import Topics</span>
                          </div>
                          <span className="bulk-import-hint">One topic per line</span>
                        </div>

                        <textarea
                          className="school-input bulk-import-textarea"
                          placeholder={`Chapter 1: Introduction\nChapter 2: Variables & Types\nChapter 3: Control Flow\nChapter 4: Functions\n...`}
                          value={bulkImportText}
                          onChange={e => setBulkImportText(e.target.value)}
                          rows={6}
                        />

                        {bulkImportText.trim() && (() => {
                          const preview = getBulkImportPreview();
                          return (
                            <div className="bulk-import-stats">
                              <span className="bulk-import-stat">
                                <span className="stat-number">{preview.total}</span> topic{preview.total !== 1 ? 's' : ''} found
                              </span>
                              {preview.dupes > 0 && (
                                <span className="bulk-import-stat dupe">
                                  <span className="stat-number">{preview.dupes}</span> duplicate{preview.dupes !== 1 ? 's' : ''} skipped
                                </span>
                              )}
                              <span className="bulk-import-stat new">
                                <span className="stat-number">{preview.newCount}</span> new
                              </span>
                            </div>
                          );
                        })()}

                        <div className="bulk-import-actions">
                          <button
                            type="button"
                            onClick={() => { setShowBulkImport(false); setBulkImportText(''); }}
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkImportTopics}
                            disabled={bulkImporting || !bulkImportText.trim()}
                            className="btn-primary bulk-import-submit"
                          >
                            {bulkImporting ? (
                              <><Loader2 size={14} className="spin-icon" /> Importing...</>
                            ) : (
                              <><Upload size={14} /> Import Topics</>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Topics Checklist List */}
                <div className="topics-list">
                  {examTopics.filter(t => t.exam_id === selectedExam.id).length === 0 ? (
                    <p className="empty-state" style={{ padding: '20px 0' }}>No topics added yet. Start by adding one above!</p>
                  ) : (
                    examTopics
                      .filter(t => t.exam_id === selectedExam.id)
                      .map(topic => (
                        <div key={topic.id} className="topic-item">
                          <div className="topic-item-left">
                            <input
                              type="checkbox"
                              checked={topic.is_completed}
                              onChange={() => handleToggleTopic(topic)}
                              className="topic-checkbox"
                            />
                            <span className={`topic-text ${topic.is_completed ? 'completed' : ''}`}>
                              {topic.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="topic-delete-btn"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  onClick={() => handleDeleteExam(selectedExam.id)}
                  className="btn-danger"
                  style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={12} />
                  Delete Exam
                </button>
                <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 16px' }} onClick={() => setSelectedExam(null)}>
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
