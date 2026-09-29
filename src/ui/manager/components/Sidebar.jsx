import React, { useState, useContext } from 'react';
import {
  Shield,
  ListTodo,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { context } from '../../../context/context.jsx';
import { NavLink } from 'react-router-dom';

function ManagerSidebar() {
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

  const navItems = [
    { id: 'tasks', label: 'Field Tasks', path: '/manager', icon: ListTodo, end: true },
    { id: 'workers', label: 'Verification', path: '/manager/verification', icon: Users, end: false },
    { id: 'profile', label: 'Profile', path: `/manager/me/${user?._id}`, icon: Shield, end: false },
  ];

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-white">
            FieldProof Manager
          </span>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full border border-slate-800 transition z-50"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Header Section */}
        <div className="border-b border-slate-800 flex-shrink-0">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-white">FieldProof</h1>
                  <p className="text-xs text-slate-500">Manager Portal</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 flex-shrink-0`} />

                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
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
                              {user?.name || 'Manager'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {user?.email || 'manager@fieldproof.com'}
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

export default ManagerSidebar;