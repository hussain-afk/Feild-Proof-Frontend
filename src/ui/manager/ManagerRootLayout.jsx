import { Outlet, useLocation, NavLink } from "react-router-dom";
import ManagerSidebar from "./components/Sidebar.jsx";
import { BookOpen, ChevronRight } from "lucide-react";
import NotificationDropdown from "../NotificationDropdown.jsx";
import usePageMeta from "../../hooks/usePageMeta.jsx";

const ROLE_LABEL = "Manager";
const ROOT_PATH = "/manager";
const ROOT_TITLE = "Field tasks";

const looksLikeId = (part) =>
  /^[a-f0-9]{12,}$/i.test(part) || /^\d+$/.test(part);

const prettify = (part) =>
  part === "me"
    ? "Profile"
    : part.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

const getCrumbs = (pathname) => {
  const parts = pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .filter((part) => !looksLikeId(part));

  return parts.length ? parts.map(prettify) : [ROOT_TITLE];
};

function TopBar() {
  const { pathname } = useLocation();
  const crumbs = getCrumbs(pathname);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-800/80 bg-[#0b0f19]/90 px-3 backdrop-blur-md sm:px-5 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1 overflow-hidden">
        <ol className="flex items-center gap-1.5 truncate text-xs sm:text-sm">
          <li className="shrink-0">
            <NavLink
              to={ROOT_PATH}
              className="text-slate-500 transition-colors hover:text-sky-400"
            >
              {ROLE_LABEL}
            </NavLink>
          </li>

          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const parts = pathname.split("/").filter(Boolean);
            const routeParts = parts.slice(0, index + 2);
            const route = `/${routeParts.join("/")}`;

            return (
              <li
                key={`${crumb}-${index}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-700" />
                {isLast ? (
                  <span
                    aria-current="page"
                    className="truncate font-medium text-white"
                  >
                    {crumb}
                  </span>
                ) : (
                  <NavLink
                    to={route}
                    className="truncate text-slate-500 transition-colors hover:text-sky-400"
                  >
                    {crumb}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Right: date + docs + notifications */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <p className="hidden whitespace-nowrap text-xs text-slate-500 lg:block">
          {today}
        </p>

        <NavLink
          to="/docs"
          className="group flex h-9 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/50 px-2.5 text-xs font-medium text-slate-300 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-300 sm:px-3"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-sky-400" />
          <span className="hidden sm:inline">Docs</span>
        </NavLink>

        <NotificationDropdown />
      </div>
    </div>
  );
}

function ManagerRootLayout() {
  usePageMeta({
    title: "Manager Workspace | FieldProof",
    description: "Private FieldProof manager workspace.",
    canonical: "/",
    noIndex: true,
  });

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0b0f19] text-slate-100 lg:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-sky-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <ManagerSidebar />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col outline-none [scrollbar-color:#1e293b_transparent] [scrollbar-width:thin] lg:max-h-screen lg:overflow-y-auto"
      >
        <TopBar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default ManagerRootLayout;