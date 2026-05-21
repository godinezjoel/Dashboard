import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import { Hexagon, Rocket, LogIn, Egg } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-var">
      {/* Background grid glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15)_0%,transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full max-w-sm relative"
      >
        {/* Card */}
          <div className="card p-8 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 text-white bg-black border border-neutral-800"
            >
              <Hexagon size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-primary-var">
              Life-OS
            </h1>
            <p className="text-sm mt-1 text-muted-var">
              Your gamified productivity companion
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface-var">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                id={`auth-tab-${m}`}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  mode === m ? 'bg-elevated-var text-accent-var' : 'text-muted-var'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs mb-1.5 text-muted-var">
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

            <div>
              <label className="block text-xs mb-1.5 text-muted-var">
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

            <div>
              <label className="block text-xs mb-1.5 text-muted-var">
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
              className="btn-primary w-full mt-2 py-3 text-sm font-semibold flex items-center justify-center gap-2"
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
          <p className="text-center text-xs mt-5 flex items-center justify-center gap-1 text-muted-var">
            {mode === 'signup'
              ? <>A pet will be waiting for you <Egg size={12} className="inline" /></>
              : "Don't have an account? "}
            {mode === 'login' && (
                <button
                  onClick={() => setMode('signup')}
                  className="underline text-accent-var"
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
