
import { useContext, useState } from "react";
import {
  Activity,
  Search,
  X,
  RefreshCw,
  ArrowDownUp,
  CalendarDays,
  CalendarRange,
  Zap,
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

const FEED_DOT = {
  login: "bg-emerald-400",
  logout: "bg-slate-400",
  register: "bg-blue-400",
  create: "bg-amber-400",
  update: "bg-orange-400",
  delete: "bg-rose-400",
  checkin: "bg-cyan-400",
  checkout: "bg-indigo-400",
  approve: "bg-green-400",
  reject: "bg-red-500",
  ban: "bg-red-600",
  unban: "bg-lime-400",
  assign: "bg-violet-400",
  invite: "bg-pink-400",
  other: "bg-[#5f7191]",
};

const FEED_LABEL = {
  login: "Login",
  logout: "Logout",
  register: "Registration",
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  checkin: "Check-in",
  checkout: "Check-out",
  approve: "Approved",
  reject: "Rejected",
  ban: "Banned",
  unban: "Unbanned",
  assign: "Assigned",
  invite: "Invitation",
  other: "Activity",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

// Detect activity type from backend message
const getType = (message = "") => {
  const text = String(message).toLowerCase();

  // Login / Logout
  if (
    /log(?:ged)?[\s_-]*out|logout|sign(?:ed)?[\s_-]*out/.test(text)
  ) {
    return "logout";
  }

  if (
    /log(?:ged)?[\s_-]*in|login|sign(?:ed)?[\s_-]*in/.test(text)
  ) {
    return "login";
  }

  // Check-in / Check-out
  if (/check[\s_-]*out|checked[\s_-]*out/.test(text)) {
    return "checkout";
  }

  if (/check[\s_-]*in|checked[\s_-]*in/.test(text)) {
    return "checkin";
  }

  // Approval / Rejection
  if (/reject|declin/.test(text)) return "reject";
  if (/approv|accept/.test(text)) return "approve";

  // Account actions
  if (/unban|unblock/.test(text)) return "unban";
  if (/ban|suspend/.test(text)) return "ban";
  if (/invit/.test(text)) return "invite";
  if (/regist|sign[\s_-]*up/.test(text)) return "register";

  // Task actions
  if (/assign/.test(text)) return "assign";
  if (/delet|remov/.test(text)) return "delete";
  if (/creat|add/.test(text)) return "create";
  if (/updat|edit|chang/.test(text)) return "update";

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

  return dayDiff(date) >= 0 && dayDiff(date) < 7;
};

const formatTimeAgo = (date) => {
  if (!date) return "Unknown";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "Just now";

  if (minutes < 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;

  if (hours < 24)
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

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

    if (last && last.label === label) {
      last.items.push(info);
    } else {
      groups.push({ label, items: [info] });
    }
  });

  return groups;
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                         */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-[#1d2b45] bg-[#0a1220] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#38bdf8]/20 bg-[#38bdf8]/10">
        <Icon className="h-5 w-5 text-[#38bdf8]" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-[#5f7191]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-[#e8eef7]">
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

      <mark className="rounded bg-[#38bdf8]/25 px-0.5 text-sky-100">
        {text.slice(start, end)}
      </mark>

      {text.slice(end)}
    </>
  );
}

function FeedRow({ info, term }) {
  const type = getType(info.message);

  const dotColor = FEED_DOT[type] || FEED_DOT.other;
  const actionLabel = FEED_LABEL[type] || FEED_LABEL.other;

  return (
    <li className="flex items-start gap-3 border-b border-[#1d2b45] px-5 py-3.5 last:border-b-0">
      {/* Action-specific colored dot */}
      <span
        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dotColor}`}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-[#e8eef7]">
          <Highlight
            text={info.message || "Unknown activity"}
            term={term}
          />
        </p>

        <p className="text-[11px] uppercase tracking-wider text-[#5f7191]">
          {actionLabel}
        </p>
      </div>

      <div className="shrink-0 pt-0.5 text-right">
        <p className="text-xs tabular-nums text-[#93a4bd]">
          {formatTimeAgo(info.createdAt)}
        </p>

        <p className="mt-0.5 font-mono text-[11px] text-[#5f7191]">
          {formatTime(info.createdAt)}
        </p>
      </div>
    </li>
  );
}

function DayHeader({ label, count }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1d2b45] bg-[#0c1626] px-5 py-2.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[#93a4bd]">
        {label}
      </span>

      <span className="text-[11px] text-[#5f7191]">
        {count} {count === 1 ? "event" : "events"}
      </span>
    </div>
  );
}

function EmptyState({ isFiltering, onClear }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1d2b45] bg-[#0f1a2e]">
        <Activity className="h-5 w-5 text-[#5f7191]" />
      </div>

      <p className="text-sm font-medium text-[#e8eef7]">
        {isFiltering ? "No activity found" : "No activity yet"}
      </p>

      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#93a4bd]">
        {isFiltering
          ? "Try a different search or time filter."
          : "Activity will appear here as soon as an action is performed."}
      </p>

      {isFiltering && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-[#1d2b45] bg-[#0f1a2e] px-4 py-2 text-xs font-medium text-[#e8eef7] transition hover:border-[#2a3b5a]"
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
    <div className="min-h-screen  text-[#e8eef7]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <DashboardCharts />

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#38bdf8]">
              <span className="h-px w-6 bg-[#38bdf8]" />
              Activity log
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#e8eef7] sm:text-3xl">
              One timeline for everything
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#93a4bd]">
              Check-ins, tasks and account changes — with a time on every row.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-xl border border-[#1d2b45] bg-[#0f1a2e] px-4 text-sm font-medium text-[#e8eef7] transition hover:border-[#2a3b5a] disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 text-[#38bdf8] ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </header>

        {/* Stats */}
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

        {/* Search + Filters */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f7191]" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity"
              aria-label="Search activity"
              className="h-11 w-full rounded-xl border border-[#1d2b45] bg-[#0a1220] py-2 pl-10 pr-10 text-sm text-[#e8eef7] placeholder:text-[#5f7191] outline-none transition focus:border-[#38bdf8]/50 focus:ring-2 focus:ring-[#38bdf8]/15"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#5f7191] transition hover:bg-[#0f1a2e] hover:text-[#e8eef7]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 overflow-x-auto rounded-xl border border-[#1d2b45] bg-[#0a1220] p-1">
              {FILTERS.map(({ id, label }) => {
                const active = filter === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition ${
                      active
                        ? "bg-[#38bdf8]/15 font-medium text-[#38bdf8]"
                        : "text-[#93a4bd] hover:text-[#e8eef7]"
                    }`}
                  >
                    {label}

                    <span
                      className={`tabular-nums ${
                        active ? "text-[#38bdf8]/70" : "text-[#5f7191]"
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
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#1d2b45] bg-[#0a1220] px-3.5 text-xs font-medium text-[#e8eef7] transition hover:border-[#2a3b5a]"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-[#38bdf8]" />
              {newestFirst ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="overflow-hidden rounded-2xl border border-[#1d2b45] bg-[#0a1220] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-[#1d2b45] px-5 py-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-[#e8eef7]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              Activity log
            </span>

            <span className="text-xs text-[#93a4bd]">
              {visibleActivities.length} shown
            </span>
          </div>

          {visibleActivities.length > 0 ? (
            <div className="max-h-[calc(100vh-420px)] min-h-[280px] overflow-y-auto">
              {groups.map((group) => (
                <section key={group.label}>
                  <DayHeader
                    label={group.label}
                    count={group.items.length}
                  />

                  <ul>
                    {group.items.map((info, index) => (
                      <FeedRow
                        key={info._id || index}
                        info={info}
                        term={text}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              isFiltering={isFiltering}
              onClear={clearAll}
            />
          )}

          {visibleActivities.length > 0 && (
            <div className="border-t border-[#1d2b45] px-5 py-2.5 text-center text-[11px] text-[#5f7191]">
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
