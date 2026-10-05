import React, { useContext, useState } from "react";
import { Activity, Clock, Search } from "lucide-react";
import { context } from "../../../context/context.jsx";

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 days" },
];

// Same grid for the header and every row, so columns line up (desktop only)
const GRID = "md:grid-cols-[3fr_1fr_1.2fr]";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

// How many whole days ago did this happen? (0 = today)
const daysAgo = (date) => Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));

const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();

// Does this activity belong to the selected filter?
const matchesFilter = (date, filter) => {
  if (filter === "all") return true;
  if (!date) return false;
  if (filter === "today") return isToday(date);
  return daysAgo(date) < 7; // "week"
};

// "Just now", "5 minutes ago", "2 hours ago", "Yesterday", ...
const formatTimeAgo = (date) => {
  if (!date) return "Unknown";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(date).toLocaleDateString();
};

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

// One activity. On mobile it is a card, on desktop it is a table row.
function ActivityRow({ info }) {
  return (
    <div
      className={`grid gap-2 px-4 py-4 transition-colors hover:bg-white/[0.02] md:items-center md:gap-3 md:px-6 ${GRID}`}
    >
      {/* Message */}
      <div className="flex min-w-0 items-start gap-3 md:items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/10 bg-sky-500/5">
          <Activity className="h-4 w-4 text-sky-400" />
        </div>
        <p className="text-sm leading-relaxed text-slate-200">
          {info.message || "Unknown activity"}
        </p>
      </div>

      {/* Time ago */}
      <p className="flex items-center gap-1.5 pl-12 text-xs text-slate-400 md:pl-0 md:text-sm">
        <Clock className="h-3 w-3 text-slate-500" />
        {formatTimeAgo(info.createdAt)}
      </p>

      {/* Exact date */}
      <p className="pl-12 text-xs text-slate-500 md:pl-0">{formatDateTime(info.createdAt)}</p>
    </div>
  );
}

function EmptyState({ isFiltering }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
        <Activity className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-200">
        {isFiltering ? "No activity found" : "No activity yet"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {isFiltering
          ? "Try a different search or time filter."
          : "Activity will appear here as soon as an action is performed."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const Home = () => {
  const { adminInfos } = useContext(context);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // 1. Always work with an array, newest activity first
  const activities = (Array.isArray(adminInfos) ? [...adminInfos] : []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // 2. Keep only what matches the search text and the time filter
  const text = search.trim().toLowerCase();
  const visibleActivities = activities.filter((info) => {
    const matchText = (info.message || "").toLowerCase().includes(text);
    return matchText && matchesFilter(info.createdAt, filter);
  });

  // 3. Number shown next to each filter button
  const countFor = (id) => activities.filter((info) => matchesFilter(info.createdAt, id)).length;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* ================= Header ================= */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Activity</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Follow the latest actions performed in your system.
          </p>
        </header>

        {/* ================= Search + filter ================= */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity"
              aria-label="Search activity"
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="flex overflow-x-auto rounded-lg border border-slate-800 bg-[#0f1624] p-1">
            {FILTERS.map(({ id, label }) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    active ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                  <span className={active ? "text-slate-300" : "text-slate-500"}>
                    {countFor(id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= List ================= */}
        <div className="rounded-xl border border-slate-800 bg-[#111827]">
          {/* Column titles (desktop only) */}
          <div
            className={`hidden gap-3 rounded-t-xl border-b border-slate-800 bg-[#0e1522] px-6 py-3 text-xs font-medium text-slate-500 md:grid ${GRID}`}
          >
            <span>Activity</span>
            <span>When</span>
            <span>Date</span>
          </div>

          {visibleActivities.length > 0 ? (
            <div className="max-h-[calc(100vh-320px)] min-h-[300px] divide-y divide-slate-800/70 overflow-y-auto">
              {visibleActivities.map((info, index) => (
                <ActivityRow key={info._id || index} info={info} />
              ))}
            </div>
          ) : (
            <EmptyState isFiltering={search.length > 0 || filter !== "all"} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;