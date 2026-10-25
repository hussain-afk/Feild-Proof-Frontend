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

  const isFreeWorker = !user?.managerId;

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const sections = useMemo(
    () => [
      {
        title: "Work",
        items: [
          {
            id: "tasks",
            label: "My tasks",
            path: "/worker",
            icon: CheckSquare,
            end: true,
            needsTeam: true,
          },
          {
            id: "reviewed",
            label: "Reviewed tasks",
            path: "/worker/reviewed",
            icon: ClipboardCheck,
            end: false,
            needsTeam: true,
          },
        ],
      },
      {
        title: "Team",
        items: [
          {
            id: "my-invites",
            label: "My invites",
            path: "/worker/my-invites",
            icon: Mail,
            end: false,
            needsTeam: false,
          },
        ],
      },
      {
        title: "Account",
        items: [
          {
            id: "profile",
            label: "Profile",
            path: `/worker/me/${user?._id}`,
            icon: UserCircle,
            end: false,
            needsTeam: false,
          },
        ],
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
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-800/80 bg-[#0a0f1a]/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">FieldProof</p>
            <p className="text-[11px] text-slate-500">Worker</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((o) => !o)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] shrink-0 flex-col border-r border-slate-800/80 bg-[#0a0f1a] transition-all duration-300 lg:sticky
          ${isMobileOpen ? "w-[260px] translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
        `}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed((c) => !c)}
          title={isCollapsed ? "Expand" : "Collapse"}
          className="absolute -right-3 top-8 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow hover:bg-slate-700 hover:text-white lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Brand */}
        <div className="flex h-[4.25rem] shrink-0 items-center gap-3 border-b border-slate-800/80 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/25">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {showLabels && (
            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-white">
                FieldProof
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                Worker portal
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {isFreeWorker && showLabels && (
            <p className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-200/90">
              Join a manager&apos;s team from{" "}
              <span className="font-medium text-amber-100">My invites</span> to
              unlock tasks.
            </p>
          )}

          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                {showLabels && (
                  <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {section.title}
                  </p>
                )}

                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const locked = isFreeWorker && item.needsTeam;

                    if (locked) {
                      return (
                        <li key={item.id}>
                          <div
                            title="Join a team to unlock"
                            className={`flex h-10 cursor-not-allowed items-center gap-3 rounded-xl text-[13px] font-medium text-slate-600 opacity-60 ${
                              showLabels ? "px-2.5" : "justify-center px-0"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600">
                              <Icon className="h-4 w-4" strokeWidth={1.75} />
                            </span>
                            {showLabels && (
                              <>
                                <span className="min-w-0 flex-1 truncate">
                                  {item.label}
                                </span>
                                <Lock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                              </>
                            )}
                            {!showLabels && (
                              <Lock className="h-3 w-3 text-slate-500" />
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
                            `group relative flex h-10 items-center gap-3 rounded-xl text-[13px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${
                              showLabels ? "px-2.5" : "justify-center px-0"
                            } ${
                              isActive
                                ? "bg-sky-500/10 text-sky-300 shadow-sm shadow-sky-500/5"
                                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && showLabels && (
                                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sky-400" />
                              )}
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                                  isActive
                                    ? "bg-sky-500/15 text-sky-400"
                                    : "text-slate-500 group-hover:text-slate-300"
                                }`}
                              >
                                <Icon className="h-4 w-4" strokeWidth={1.75} />
                              </span>
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
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {showLabels ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-[#0c1220] p-2.5">
                <UserAvatar user={user} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.name || "Worker"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user?.email || "worker@fieldproof.com"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
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
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
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