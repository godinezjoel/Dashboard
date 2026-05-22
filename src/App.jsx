import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GameProvider, useGame } from './context/GameContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ShopPage from './components/shop/ShopPage';
import StatsPage from './pages/StatsPage';
import AuthPage from './pages/AuthPage';
import PetPage from './pages/PetPage';
import SchoolGradesPage from './pages/SchoolGradesPage';
import SchoolExamsPage from './pages/SchoolExamsPage';


// ── Auth Guard ─────────────────────────────────────────────────────────────────
function ProtectedRoutes() {
  const { user, initialized } = useGame();

  // Show spinner only during the very first cold boot
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-var">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-var">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="school" element={<Navigate to="/school/grades" replace />} />
        <Route path="school/grades" element={<SchoolGradesPage />} />
        <Route path="school/exams" element={<SchoolExamsPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="pet" element={<PetPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        position={isMobile ? "top-center" : "bottom-center"}
        toastOptions={{
          className: 'toast-theme',
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
