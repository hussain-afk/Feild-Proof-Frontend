import { Outlet } from 'react-router-dom';
import ManagerSidebar from './components/Sidebar.jsx';

function ManagerRootLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden">
      {/* Responsive Sidebar */}
      <ManagerSidebar />

      {/* Main Content Area */}
      <main className="min-h-0 flex-1 w-full min-w-0 lg:max-h-screen lg:overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default ManagerRootLayout;