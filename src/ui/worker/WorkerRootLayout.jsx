import { Outlet } from 'react-router-dom'
import WorkerSidebar from './components/Sidebar'

function WorkerLayout() {

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0b0f19] text-slate-100 lg:flex-row">
      {/* Responsive Sidebar */}
      <WorkerSidebar />

      {/* Main Content Area */}
      <main className="min-h-0 flex-1 w-full min-w-0 lg:max-h-screen lg:overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default WorkerLayout;