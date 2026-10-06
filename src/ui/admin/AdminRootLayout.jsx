import Sidebar from '../admin/components/Sidebar'
import {Outlet} from 'react-router-dom'

const AdminRootLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden">
      {/* Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 max-h-screen overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminRootLayout
