import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import { useGame } from '../../context/GameContext';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { theme } = useGame();

  return (
    <div data-theme={theme === 'dark' ? undefined : theme} className="dashboard-grid">
      <Sidebar />
      <MobileHeader />
      <main className="layout-main">
        {/* Centered content wrapper — all pages benefit automatically */}
        <div className="layout-content">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
