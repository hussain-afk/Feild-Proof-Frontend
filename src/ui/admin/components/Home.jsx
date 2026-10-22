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
import LoadingState from "../../LoadingState.jsx";
import DashboardCharts from "./DashboardCharts.jsx";

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 days" },
];

const GRID = "md:grid-cols-[3fr_1fr_0.8fr]";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-800/80 bg-[#0a0f1a] px-3.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/15";

const TYPE_STYLE = {
  create: {
    icon: Plus,
    box: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  },
  update: {
    icon: Pencil,
    box: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  },
  delete: {
    icon: Trash2,
    box: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  },
  check: {
    icon: MapPin,
    box: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  },
  other: {
    icon: Activity,
    box: "border-slate-700/80 bg-slate-800/60 text-slate-400",
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const getType = (message = "") => {
  const text = message.toLowerCase();
  if (/delet|remov/.test(text)) return "delete";
  if (/creat|add|assign|regist/.test(text)) return "create";
  if (/updat|edit|chang/.test(text)) return "update";
  if (/check/.test(text)) return "check";
  return "other";
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayDiff = (date) =>
  Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(date))) /
      (1000 * 60 * 60 * 24)
  );

const matchesFilter = (date, filter) => {
  if (filter === "all") return true;
  if (!date) return false;
  if (filter === "today") return dayDiff(date) === 0;
  return dayDiff(date) < 7;
};

const formatTimeAgo = (date) => {
  if (!date) return "Unknown";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "Just now";
  if (minutes < 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = dayDiff(date);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(date).toLocaleDateString();
};

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

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

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/80 bg-[#0c1220] p-4 transition hover:border-slate-700/80">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/15 bg-sky-500/10">
        <Icon className="h-5 w-5 text-sky-400" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function Highlight({ text, term }) {
  const start = term ? text.toLowerCase().indexOf(term) : -1;
  if (start === -1) return text;

  const end = start + term.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-sky-500/25 px-0.5 text-sky-200">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}

function ActivityRow({ info, term }) {
  const { icon: Icon, box } = TYPE_STYLE[getType(info.message)];

  return (
    <div
      className={`grid gap-2 px-4 py-4 transition-colors hover:bg-white/[0.02] md:items-center md:gap-3 md:px-6 ${GRID}`}
    >
      <div className="flex min-w-0 items-start gap-3 md:items-center">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${box}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm leading-relaxed text-slate-200">
          <Highlight text={info.message || "Unknown activity"} term={term} />
        </p>
      </div>

      <p className="flex items-center gap-1.5 pl-12 text-xs text-slate-400 md:pl-0 md:text-sm">
        <Clock className="h-3.5 w-3.5 text-slate-500" />
        {formatTimeAgo(info.createdAt)}
      </p>

      <p className="pl-12 font-mono text-xs text-slate-500 md:pl-0">
        {formatTime(info.createdAt)}
      </p>
    </div>
  );
}

function DayHeader({ label, count }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/60 bg-[#0a0f1a]/95 px-4 py-2.5 backdrop-blur-sm md:px-6">
      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="text-[11px] text-slate-600">
        {count} {count === 1 ? "event" : "events"}
      </span>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-slate-800/60" aria-busy="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="flex animate-pulse items-center gap-3 px-6 py-4">
          <div className="h-9 w-9 rounded-xl bg-slate-800/80" />
          <div className="h-3 flex-1 rounded-full bg-slate-800/80" />
          <div className="hidden h-3 w-24 rounded-full bg-slate-800/80 md:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ isFiltering, onClear }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-800/60">
        <Activity className="h-5 w-5 text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-200">
        {isFiltering ? "No activity found" : "No activity yet"}
      </p>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
        {isFiltering
          ? "Try a different search or time filter."
          : "Activity will appear here as soon as an action is performed."}
      </p>
      {isFiltering && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-slate-700/80 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
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

  const activities = (Array.isArray(adminInfos) ? [...adminInfos] : []).sort(
    (a, b) =>
      newestFirst
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
  );

  const text = search.trim().toLowerCase();
  const visibleActivities = activities.filter((info) => {
    const matchText = (info.message || "").toLowerCase().includes(text);
    return matchText && matchesFilter(info.createdAt, filter);
  });

  const groups = groupByDay(visibleActivities);

  const countFor = (id) =>
    activities.filter((info) => matchesFilter(info.createdAt, id)).length;
  const latest = [...activities].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

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

  if (isLoading || adminInfos === null) {
    return (
      <LoadingState
        message="Loading activity"
        subtext="Syncing your workspace"
      />
    );
  }

  return (
    <div className="min-h-screen text-slate-100">
      {/* Soft top glow */}
      {/* <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-sky-500/[0.04] to-transparent" /> */}

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* ================= Dashboard Charts ================= */}
        <DashboardCharts />

        {/* ================= Header ================= */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Activity
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-slate-500">
              Follow the latest actions performed in your system.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-800/80 bg-[#0c1220] px-4 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-white disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </header>

        {/* ================= Stat cards ================= */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Total events"
            value={activities.length}
          />
          <StatCard
            icon={CalendarDays}
            label="Today"
            value={countFor("today")}
          />
          <StatCard
            icon={CalendarRange}
            label="Last 7 days"
            value={countFor("week")}
          />
          <StatCard
            icon={Zap}
            label="Last activity"
            value={latest ? formatTimeAgo(latest.createdAt) : "None"}
          />
        </div>

        {/* ================= Search + filter ================= */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity"
              aria-label="Search activity"
              className={`${inputClass} pl-10 pr-10`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0c1220] p-1">
              {FILTERS.map(({ id, label }) => {
                const active = filter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                      active
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {label}
                    <span
                      className={`tabular-nums ${
                        active ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {countFor(id)}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setNewestFirst(!newestFirst)}
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-800/80 bg-[#0c1220] px-3.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {newestFirst ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {/* ================= List ================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220]">
          {/* Column titles (desktop only) */}
          <div
            className={`hidden gap-3 border-b border-slate-800/80 bg-[#0a0f1a]/60 px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 md:grid ${GRID}`}
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
                  <div className="divide-y divide-slate-800/50">
                    {group.items.map((info, index) => (
                      <ActivityRow
                        key={info._id || index}
                        info={info}
                        term={text}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState isFiltering={isFiltering} onClear={clearAll} />
          )}

          {/* Footer */}
          {visibleActivities.length > 0 && (
            <div className="border-t border-slate-800/80 bg-[#0a0f1a]/40 px-4 py-3 text-xs text-slate-500 md:px-6">
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