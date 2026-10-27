import Sidebar from '../admin/components/Sidebar'
import {Outlet} from 'react-router-dom'

const AdminRootLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden">
      {/* Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="min-h-0 flex-1 w-full min-w-0 lg:max-h-screen lg:overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminRootLayout
