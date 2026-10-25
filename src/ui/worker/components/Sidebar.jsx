import { useState, useContext, useEffect, useMemo } from "react";
import {
  CheckSquare,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  X,
  ClipboardCheck,
  Lock,
  Mail,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { context } from "../../../context/context.jsx";
import { NavLink } from "react-router-dom";

function UserAvatar({ user, className = "" }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "W";
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-600 text-sm font-semibold text-white ${className}`}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user?.name ? `${user.name} avatar` : "User avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

function WorkerSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user } = useContext(context);
  const { logout } = useAuth();

  // Abhi kisi manager ki team mein nahi
  const isFreeWorker = !user?.managerId;

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const navItems = useMemo(
    () => [
      {
        id: "tasks",
        label: "My tasks",
        path: "/worker",
        icon: CheckSquare,
        end: true,
        needsTeam: true, // lock if free
      },
      {
        id: "reviewed",
        label: "Reviewed tasks",
        path: "/worker/reviewed",
        icon: ClipboardCheck,
        end: false,
        needsTeam: true,
      },
      {
        id: "my-invites",
        label: "My invites",
        path: "/worker/my-invites",
        icon: Mail,
        end: false,
        needsTeam: false,
      },
      {
        id: "profile",
        label: "Profile",
        path: `/worker/me/${user?._id}`,
        icon: UserCircle,
        end: false,
        needsTeam: false,
      },
    ],
    [user?._id]
  );

  const showLabels = !isCollapsed || isMobileOpen;

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsMobileOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-800 bg-[#0d1320]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">FieldProof</p>
            <p className="text-[11px] text-slate-500">Worker portal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((o) => !o)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] shrink-0 flex-col border-r border-slate-800 bg-[#0d1320] transition-all duration-300 lg:sticky
          ${isMobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
        `}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed((c) => !c)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow transition hover:bg-slate-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm shadow-sky-900/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {showLabels && (
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-sm font-semibold text-white">
                  FieldProof
                </h1>
                <p className="text-[11px] text-slate-500">Worker portal</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          aria-label="Main"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
        >
          {showLabels && (
            <p className="mb-2 px-3 text-xs font-medium text-slate-500">Menu</p>
          )}

          {isFreeWorker && showLabels && (
            <p className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200/90">
              Join a manager&apos;s team from My invites to unlock tasks.
            </p>
          )}

          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const locked = isFreeWorker && item.needsTeam;

              if (locked) {
                return (
                  <li key={item.id}>
                    <div
                      title="Join a team to unlock"
                      className={`flex h-10 cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 opacity-70 ${
                        showLabels ? "" : "justify-center px-0"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0 text-slate-600" />
                      {showLabels && (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          <Lock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        </>
                      )}
                      {!showLabels && (
                        <Lock className="absolute right-2 h-3 w-3 text-slate-500" />
                      )}
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsMobileOpen(false)}
                    title={showLabels ? undefined : item.label}
                    className={({ isActive }) =>
                      `group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        showLabels ? "" : "justify-center px-0"
                      } ${
                        isActive
                          ? "bg-sky-500/10 text-sky-300"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-sky-400"
                          />
                        )}
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                            isActive
                              ? "text-sky-400"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        />
                        {showLabels && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-slate-800 bg-[#0d1320] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {showLabels ? (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-slate-800/40 p-2.5">
                <UserAvatar user={user} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.name || "Worker"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email || "worker@fieldproof.com"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UserAvatar user={user} className="h-9 w-9" />
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default WorkerSidebar;