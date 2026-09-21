import React from 'react'
import { Outlet } from 'react-router-dom'
import WorkerSidebar from './components/Sidebar'
import { Menu, Bell } from 'lucide-react'
import { useContext, useState } from 'react'
import { context } from '../../context/context'

function WorkerLayout() {
  const { user, setUser } = useContext(context);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    // setUser(null);
    // window.location.href = '/login';
    console.log("Logout clicked");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0f19] text-slate-100 overflow-x-hidden">
      {/* Responsive Sidebar */}
      <WorkerSidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 max-h-screen overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default WorkerLayout;