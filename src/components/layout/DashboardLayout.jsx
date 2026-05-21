import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useGame } from '../../context/GameContext';

export default function DashboardLayout() {
  const { theme } = useGame();

  return (
    <div data-theme={theme === 'dark' ? undefined : theme} className="dashboard-grid">
      <Sidebar />
      <main className="overflow-y-auto relative bg-primary-var">
        {/* Centered content wrapper — all pages benefit automatically */}
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
