import { useContext, useState } from "react";
import {
  Activity,
  Clock,
  Search,
  X,
  RefreshCw,
  ArrowDownUp,
  CalendarDays,
  CalendarRange,
  Zap,
  Trash2,
  Plus,
  Pencil,
  MapPin,
} from "lucide-react";
import { context } from "../../../context/context.jsx";

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 days" },
];

// Same grid for the header and every row, so columns line up (desktop only)
const GRID = "md:grid-cols-[3fr_1fr_0.8fr]";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

// Icon + colour for each kind of activity (guessed from the message text)
const TYPE_STYLE = {
  create: { icon: Plus, box: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
  update: { icon: Pencil, box: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
  delete: { icon: Trash2, box: "border-rose-500/20 bg-rose-500/10 text-rose-400" },
  check: { icon: MapPin, box: "border-sky-500/20 bg-sky-500/10 text-sky-400" },
  other: { icon: Activity, box: "border-slate-700 bg-slate-800 text-slate-400" },
};

/* ------------------------------------------------------------------ */
/* Small helpers (plain JavaScript)                                     */
/* ------------------------------------------------------------------ */

// Decide the type of an activity from its message
const getType = (message = "") => {
  const text = message.toLowerCase();
  if (/delet|remov/.test(text)) return "delete";
  if (/creat|add|assign|regist/.test(text)) return "create";
  if (/updat|edit|chang/.test(text)) return "update";
  if (/check/.test(text)) return "check";
  return "other";
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// How many calendar days ago? (0 = today, 1 = yesterday)
const dayDiff = (date) =>
  Math.round((startOfDay(new Date()) - startOfDay(new Date(date))) / (1000 * 60 * 60 * 24));

// Does this activity belong to the selected filter?
const matchesFilter = (date, filter) => {
  if (filter === "all") return true;
  if (!date) return false;
  if (filter === "today") return dayDiff(date) === 0;
  return dayDiff(date) < 7; // "week"
};

// "Just now", "5 minutes ago", "2 hours ago", "Yesterday", ...
const formatTimeAgo = (date) => {
  if (!date) return "Unknown";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = dayDiff(date);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(date).toLocaleDateString();
};

// "08:42 AM"
const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "N/A";

// Title for each day group: "Today", "Yesterday" or "12 Mar 2025"
const getDayLabel = (date) => {
  if (!date) return "Unknown date";
  const days = dayDiff(date);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Put activities that happened on the same day into one group
const groupByDay = (list) => {
  const groups = [];
  list.forEach((info) => {
    const label = getDayLabel(info.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(info);
    else groups.push({ label, items: [info] });
  });
  return groups;
};

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

// One small box at the top, e.g. "Today: 4"
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-500/10 bg-sky-500/5">
        <Icon className="h-5 w-5 text-sky-400" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

// Colours the part of the text that matches the search
function Highlight({ text, term }) {
  const start = term ? text.toLowerCase().indexOf(term) : -1;
  if (start === -1) return text;

  const end = start + term.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-sky-500/25 px-0.5 text-sky-200">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

// One activity. On mobile it is a card, on desktop it is a table row.
function ActivityRow({ info, term }) {
  const { icon: Icon, box } = TYPE_STYLE[getType(info.message)];

  return (
    <div
      className={`grid gap-2 px-4 py-4 transition-colors hover:bg-white/[0.02] md:items-center md:gap-3 md:px-6 ${GRID}`}
    >
      {/* Message */}
      <div className="flex min-w-0 items-start gap-3 md:items-center">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${box}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm leading-relaxed text-slate-200">
          <Highlight text={info.message || "Unknown activity"} term={term} />
        </p>
      </div>

      {/* Time ago */}
      <p className="flex items-center gap-1.5 pl-12 text-xs text-slate-400 md:pl-0 md:text-sm">
        <Clock className="h-3 w-3 text-slate-500" />
        {formatTimeAgo(info.createdAt)}
      </p>

      {/* Exact time */}
      <p className="pl-12 text-xs text-slate-500 md:pl-0">{formatTime(info.createdAt)}</p>
    </div>
  );
}

// Day title that stays at the top while you scroll that day
function DayHeader({ label, count }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/70 bg-[#0e1522]/95 px-4 py-2 backdrop-blur md:px-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-xs text-slate-600">
        {count} {count === 1 ? "event" : "events"}
      </span>
    </div>
  );
}

// Grey placeholder rows while data is loading
function LoadingRows() {
  return (
    <div className="divide-y divide-slate-800/70" aria-busy="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex animate-pulse items-center gap-3 px-6 py-4">
          <div className="h-9 w-9 rounded-lg bg-slate-800" />
          <div className="h-3 flex-1 rounded bg-slate-800" />
          <div className="hidden h-3 w-24 rounded bg-slate-800 md:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ isFiltering, onClear }) {
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
      {isFiltering && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
        >
          Clear search and filters
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const Home = () => {
  const { adminInfos, refresh, isLoading } = useContext(context);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newestFirst, setNewestFirst] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Always work with an array, sorted by date
  const activities = (Array.isArray(adminInfos) ? [...adminInfos] : []).sort((a, b) =>
    newestFirst
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
  );

  // 2. Keep only what matches the search text and the time filter
  const text = search.trim().toLowerCase();
  const visibleActivities = activities.filter((info) => {
    const matchText = (info.message || "").toLowerCase().includes(text);
    return matchText && matchesFilter(info.createdAt, filter);
  });

  // 3. Group the result by day
  const groups = groupByDay(visibleActivities);

  // 4. Numbers for the stat cards and the filter buttons
  const countFor = (id) => activities.filter((info) => matchesFilter(info.createdAt, id)).length;
  const latest = [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const isFiltering = text.length > 0 || filter !== "all";

  const clearAll = () => {
    setSearch("");
    setFilter("all");
  };

  const handleRefresh = async () => {
    if (!refresh) return;
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* ================= Header ================= */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Activity</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Follow the latest actions performed in your system.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-[#0f1624] px-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-white disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {/* ================= Stat cards ================= */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Activity} label="Total events" value={activities.length} />
          <StatCard icon={CalendarDays} label="Today" value={countFor("today")} />
          <StatCard icon={CalendarRange} label="Last 7 days" value={countFor("week")} />
          <StatCard icon={Zap} label="Last activity" value={latest ? formatTimeAgo(latest.createdAt) : "None"} />
        </div>

        {/* ================= Search + filter ================= */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity"
              aria-label="Search activity"
              className={`${inputClass} pl-9 pr-9`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 overflow-x-auto rounded-lg border border-slate-800 bg-[#0f1624] p-1">
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
                    <span className={active ? "text-slate-300" : "text-slate-500"}>{countFor(id)}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setNewestFirst(!newestFirst)}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-800 bg-[#0f1624] px-3 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {newestFirst ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {/* ================= List ================= */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
          {/* Column titles (desktop only) */}
          <div
            className={`hidden gap-3 border-b border-slate-800 bg-[#0e1522] px-6 py-3 text-xs font-medium text-slate-500 md:grid ${GRID}`}
          >
            <span>Activity</span>
            <span>When</span>
            <span>Time</span>
          </div>

          {isLoading && activities.length === 0 ? (
            <LoadingRows />
          ) : visibleActivities.length > 0 ? (
            <div className="max-h-[calc(100vh-420px)] min-h-[300px] overflow-y-auto">
              {groups.map((group) => (
                <section key={group.label}>
                  <DayHeader label={group.label} count={group.items.length} />
                  <div className="divide-y divide-slate-800/70">
                    {group.items.map((info, index) => (
                      <ActivityRow key={info._id || index} info={info} term={text} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState isFiltering={isFiltering} onClear={clearAll} />
          )}

          {/* Footer with the result count */}
          {visibleActivities.length > 0 && (
            <div className="border-t border-slate-800 bg-[#0e1522] px-4 py-2.5 text-xs text-slate-500 md:px-6">
              Showing {visibleActivities.length} of {activities.length}{" "}
              {activities.length === 1 ? "event" : "events"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;