import { useState, useContext, useEffect, useMemo } from "react";
import feildproofLogo from "../../../assets/fieldproof-logo.png";
import {
  CheckSquare,
  UserCircle,
  ClipboardCheck,
  Lock,
  Mail,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  X,
  MessageCircle,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { context } from "../../../context/context.jsx";
import { NavLink } from "react-router-dom";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

function UserAvatar({ user, className = "", showStatus = false }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "W";
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-sky-600 text-sm font-semibold text-white ring-2 ring-slate-800">
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
      {showStatus && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0c1220] bg-emerald-400" />
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
          { id: "tasks", label: "My tasks", path: "/worker", icon: CheckSquare, end: true, needsTeam: true },
          { id: "reviewed", label: "Reviewed tasks", path: "/worker/reviewed", icon: ClipboardCheck, end: false, needsTeam: true },
        ],
      },
      {
        title: "Team",
        items: [
          { id: "my-invites", label: "My invites", path: "/worker/my-invites", icon: Mail, end: false, needsTeam: false },
          { id: "chat", label: "Chat", path: "/worker/chat", icon: MessageCircle, end: false, needsTeam: true },
        ],
      },
      {
        title: "Account",
        items: [
          { id: "profile", label: "Profile", path: `/worker/me/${user?._id}`, icon: UserCircle, end: false, needsTeam: false },
        ],
      },
    ],
    [user?._id]
  );

  const profilePath = `/worker/me/${user?._id}`;
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
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-800/80 bg-[#0a0f1a]/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <img src={feildproofLogo} alt="FieldProof Logo" className="h-10 w-auto" />
          <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
            Worker
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((o) => !o)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 text-slate-300 transition hover:bg-slate-800 hover:text-white ${focusRing}`}
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
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] shrink-0 flex-col border-r border-slate-800/80 bg-[#0a0f1a] transition-all duration-300 motion-reduce:transition-none lg:sticky
          ${isMobileOpen ? "w-[272px] translate-x-0 shadow-2xl shadow-black/60" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-[76px]" : "lg:w-[272px]"}
        `}
      >
        {/* Collapse */}
        <button
          type="button"
          onClick={() => setIsCollapsed((c) => !c)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`absolute -right-3 top-8 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow transition hover:bg-slate-700 hover:text-white lg:flex ${focusRing}`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Brand */}
        <div className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-slate-800/80 px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/25">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {showLabels && (
            <>
              <img
                src={feildproofLogo}
                alt="FieldProof Logo"
                className="h-10 w-auto min-w-0"
              />
              <span className="hidden rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300 lg:inline-block">
                Worker
              </span>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
            className={`ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden ${focusRing}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav
          className={`min-h-0 flex-1 px-3 py-5 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent] ${
            showLabels ? "overflow-y-auto" : "overflow-visible"
          }`}
        >
          {isFreeWorker && showLabels && (
            <NavLink
              to="/worker/my-invites"
              onClick={() => setIsMobileOpen(false)}
              className={`mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 transition hover:bg-amber-500/15 ${focusRing}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                <Lock className="h-4 w-4" />
              </span>
              <span className="text-[12px] leading-relaxed text-amber-200/90">
                <span className="block font-medium text-amber-100">
                  Tasks are locked
                </span>
                Join a manager&apos;s team from My invites to unlock them.
              </span>
            </NavLink>
          )}

          <div className="space-y-5">
            {sections.map((section, sectionIndex) => (
              <div key={section.title}>
                {showLabels ? (
                  <p className="mb-2 px-3 text-xs font-medium text-slate-500">
                    {section.title}
                  </p>
                ) : (
                  sectionIndex > 0 && (
                    <div className="mx-auto mb-3 h-px w-6 bg-slate-800" />
                  )
                )}

                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const locked = isFreeWorker && item.needsTeam;

                    if (locked) {
                      return (
                        <li key={item.id}>
                          <div
                            title="Join a team to unlock"
                            className={`flex h-11 cursor-not-allowed items-center gap-3 rounded-xl text-[13px] font-medium text-slate-600 ${
                              showLabels ? "px-2.5" : "relative justify-center px-0"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/30 text-slate-600">
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
                              <Lock className="absolute bottom-1.5 right-2.5 h-3 w-3 text-slate-500" />
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
                          className={({ isActive }) =>
                            `group relative flex h-11 items-center gap-3 rounded-xl text-[13px] font-medium transition-colors ${focusRing} ${
                              showLabels ? "px-2.5" : "justify-center px-0"
                            } ${
                              isActive
                                ? "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/15"
                                : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sky-400" />
                              )}
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                  isActive
                                    ? "bg-sky-500/20 text-sky-300"
                                    : "bg-slate-800/40 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-200"
                                }`}
                              >
                                <Icon className="h-4 w-4" strokeWidth={1.75} />
                              </span>
                              {showLabels && (
                                <span className="min-w-0 flex-1 truncate">
                                  {item.label}
                                </span>
                              )}
                              {showLabels && item.badge ? (
                                <span className="shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-300">
                                  {item.badge}
                                </span>
                              ) : null}
                              {!showLabels && (
                                <span
                                  role="tooltip"
                                  className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg shadow-black/40 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                >
                                  {item.label}
                                </span>
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
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-[#0c1220] p-2.5">
              <NavLink
                to={profilePath}
                onClick={() => setIsMobileOpen(false)}
                title="View profile"
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition hover:bg-white/[0.05] ${focusRing}`}
              >
                <UserAvatar user={user} showStatus className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.name || "Worker"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user?.email || "worker@fieldproof.com"}
                  </p>
                </div>
              </NavLink>
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400 ${focusRing}`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <NavLink
                to={profilePath}
                title="View profile"
                className={`rounded-full ${focusRing}`}
              >
                <UserAvatar user={user} showStatus className="h-10 w-10" />
              </NavLink>
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400 ${focusRing}`}
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