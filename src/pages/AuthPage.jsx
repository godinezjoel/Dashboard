import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import { Hexagon, Rocket, LogIn, Egg } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() || email.split('@')[0] },
          },
        });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.', { duration: 4000 });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-container">
      {/* Background grid glow */}
      <div className="auth-bg-glow" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="auth-card-wrapper"
      >
        {/* Card */}
        <div className="card auth-card-custom">
          {/* Logo */}
          <div className="auth-logo-section">
            <div className="auth-logo-badge">
              <Hexagon size={32} strokeWidth={1.5} />
            </div>
            <h1 className="auth-title">
              Life-OS
            </h1>
            <p className="auth-subtitle">
              Your gamified productivity companion
            </p>
          </div>

          {/* Tab toggle */}
          <div className="auth-tabs">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                id={`auth-tab-${m}`}
                className={`auth-tab-btn ${mode === m ? 'active' : ''}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="auth-form-field"
              >
                <label className="auth-label">
                  Username (optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="YourName"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  id="auth-username"
                  autoComplete="username"
                />
              </motion.div>
            )}

            <div className="auth-form-field">
              <label className="auth-label">
                Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="auth-email"
                autoComplete="email"
              />
            </div>

            <div className="auth-form-field">
              <label className="auth-label">
                Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                id="auth-password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={loading}
              id="auth-submit"
            >
              {loading
                ? 'Loading…'
                : mode === 'signup'
                ? <><Rocket size={16} /> Start your Journey</>
                : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          {/* Footer note */}
          <p className="auth-footer-note">
            {mode === 'signup'
              ? <>A pet will be waiting for you <Egg size={12} className="auth-footer-icon" /></>
              : "Don't have an account? "}
            {mode === 'login' && (
              <button
                onClick={() => setMode('signup')}
                className="auth-footer-link"
              >
                Sign up free
              </button>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
