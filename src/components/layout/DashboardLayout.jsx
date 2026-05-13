import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PetStatusWidget from '../pet/PetStatusWidget';
import { useGame } from '../../context/GameContext';

export default function DashboardLayout() {
  const { profile } = useGame();
  const theme = profile?.active_theme ?? 'default';

  return (
    <div data-theme={theme === 'default' ? undefined : theme} className="dashboard-grid">
      <Sidebar />

      {/* Main Content */}
      <main
        className="overflow-y-auto relative"
        style={{ background: 'var(--bg-primary)' }}
      >
        <Outlet />
      </main>

      {/* Persistent Pet Widget */}
      <PetStatusWidget />
    </div>
  );
}
