import { Outlet, useLocation } from "react-router-dom";
import Sidebar from '../admin/components/Sidebar'
import { ChevronRight } from "lucide-react";

const ROLE_LABEL = "Admin";
const ROOT_TITLE = "Dashboard";

// Ids in the URL (Mongo ids, numbers) should not show in the breadcrumb
const looksLikeId = (part) => /^[a-f0-9]{12,}$/i.test(part) || /^\d+$/.test(part);

const prettify = (part) =>
  part === "me"
    ? "Profile"
    : part.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

// /admin/add-plan -> ["Add plan"], /admin -> ["Dashboard"]
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
    <div className="sticky top-0 z-30 hidden h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0b0f19]/85 px-8 backdrop-blur-md lg:flex">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="text-slate-500">{ROLE_LABEL}</li>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-white" : "text-slate-500"}
                >
                  {crumb}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <p className="text-xs text-slate-500">{today}</p>
    </div>
  );
}

function AdminRootLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#0b0f19] text-slate-100 lg:flex-row">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-sky-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      {/* Responsive Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
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

export default AdminRootLayout;