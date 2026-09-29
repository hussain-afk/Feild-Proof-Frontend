import React, { useState, useContext } from 'react';
import {
  Shield,
  CheckSquare,
  Clock,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { context } from '../../../context/context.jsx';
import { NavLink } from 'react-router-dom';

function WorkerSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user } = useContext(context);
  const { logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Enhanced Navigation Items Array
  const navItems = [
    {
      id: 'tasks',
      label: 'My Tasks',
      path: '/worker',
      icon: CheckSquare,
      badge: null,
      description: 'View assigned work'
    },
    // {
    //   id: 'history',
    //   label: 'Work History',
    //   path: '/worker/history',
    //   icon: Clock,
    //   badge: null,
    //   description: 'Completed tasks'
    // },
    // {
    //   id: 'earnings',
    //   label: 'Earnings',
    //   path: '/worker/earnings',
    //   icon: BarChart3,
    //   badge: null,
    //   description: 'Payment history'
    // },
    {
      id: 'profile',
      label: 'Profile',
      path: `/worker/me/${user?._id}`,
      icon: Shield,
      badge: null,
      description: 'Account settings'
    },
  ];

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden w-full bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-600 text-white flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">FieldProof</h1>
            <p className="text-xs text-slate-500">Worker</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 top-0 left-0 z-50
    h-screen min-h-screen shrink-0
    bg-slate-900 border-r border-slate-800
    flex flex-col
    transition-all duration-300

    ${isMobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
          }

    ${isCollapsed ? "lg:w-20" : "lg:w-64"}
  `}
      >
        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full border border-slate-800 transition z-50"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Header Section */}
        <div className="border-b border-slate-800 flex-shrink-0">
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-blue-600 text-white flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-white truncate">FieldProof</h1>
                  <p className="text-xs text-slate-500">Worker Portal</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3.5 py-3 rounded-lg font-medium text-sm transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`
                  }
                  title={(!isCollapsed || isMobileOpen) ? '' : item.label}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 flex-shrink-0 transition ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'
                        }`} />

                      {(!isCollapsed || isMobileOpen) && (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm">{item.label}</p>
                            {isActive && (
                              <p className="text-xs text-blue-100 opacity-75">{item.description}</p>
                            )}
                          </div>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Profile Footer */}
        <div className="border-t border-slate-800 flex-shrink-0 bg-slate-900">
          <div className="p-4">
            {(!isCollapsed || isMobileOpen) ? (
              <>
                <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-800/50">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {/* {user?.name ? user.name.charAt(0).toUpperCase() : 'W'} */}
                    {
                      user.avatar ? <img src={user.avatar} alt="User Avatar" className="rounded-lg w-full h-full object-cover" /> : <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'W'}</span>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.name || 'Worker'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || 'worker@fieldproof.com'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {
                      user.avatar ? <img src={user.avatar} alt="User Avatar" className="rounded-lg w-full h-full object-cover" /> : <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'W'}</span>
                    }
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full flex justify-center p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default WorkerSidebar;