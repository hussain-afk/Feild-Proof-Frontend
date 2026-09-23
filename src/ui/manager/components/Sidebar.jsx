import React, { useState, useContext } from 'react';
import { 
  ShieldCheck, 
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
  ];

  return (
    <>
      {/* 📱 Mobile Top Header Bar */}
      <div className="lg:hidden w-full bg-[#111827] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-sm font-extrabold text-white tracking-tight">
            Field<span className="text-blue-500">Proof</span>
          </h1>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/80 rounded-lg border border-slate-700/60"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 📱 Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-[#0b0f19]/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 💻 Desktop & Mobile Drawer Sidebar */}
      <aside 
        className={`fixed lg:static top-0 left-0 z-50 h-full min-h-screen bg-[#111827] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-7 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-full border border-slate-900 shadow-md transition-all z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Branding Header */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                    Field<span className="text-blue-500">Proof</span>
                  </h1>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                    Manager Portal
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                      
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {isActive && (!isCollapsed || isMobileOpen) && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-900/40">
          <div className={`flex items-center gap-3 ${(isCollapsed && !isMobileOpen) ? 'justify-center' : 'p-2'}`}>
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden flex-1">
                <h4 className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || 'Manager User'}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'manager@fieldproof.com'}
                </p>
              </div>
            )}

            {(!isCollapsed || isMobileOpen) && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default ManagerSidebar;