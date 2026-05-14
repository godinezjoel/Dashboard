import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GameProvider, useGame } from './context/GameContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ShopPage from './components/shop/ShopPage';
import StatsPage from './pages/StatsPage';
import AuthPage from './pages/AuthPage';
import PetPage from './pages/PetPage';

// ── Auth Guard ─────────────────────────────────────────────────────────────────
function ProtectedRoutes() {
  const { user, loading, initialized } = useGame();

  // Show spinner only during the very first cold boot
  if (!initialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="pet" element={<PetPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRedirect />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>

      {/* Global toast notifications */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
    </GameProvider>
  );
}

// Redirect already logged-in users away from /auth
function AuthRedirect() {
  const { user, initialized } = useGame();
  if (!initialized) return null;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}
