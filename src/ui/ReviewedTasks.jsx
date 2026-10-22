import { useContext, useState } from "react";
import {
  Search,
  X,
  ArrowDownUp,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { context } from "../context/context.jsx";
import LoadingState from "./LoadingState.jsx";

/**
 * ONE page for approved AND rejected tasks.
 * One table, with a Status column. Click a box at the top to see only approved or only rejected.
 */

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const KINDS = {
  approved: {
    person: "approvedBy",
    badge: "Approved",
    badgeStyle: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    messageLabel: "Approval message",
    noMessage: "No approval message.",
  },
  rejected: {
    person: "rejectedBy",
    badge: "Rejected",
    badgeStyle: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    messageLabel: "Reason",
    noMessage: "No reason was given.",
  },
};

const TILES = [
  {
    id: "all",
    label: "All reviewed",
    icon: ClipboardList,
    tone: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  },
  {
    id: "approved",
    label: "Approved",
    icon: CheckCircle2,
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  {
    id: "rejected",
    label: "Rejected",
    icon: XCircle,
    tone: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  },
];

const PAGE_SIZE = 10;
const LONG_MESSAGE = 90;

const inputClass =
  "h-11 w-full rounded-xl border border-slate-800/80 bg-[#0a0f1a] pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/15 hover:border-slate-700";

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const timeOf = (item) => (item.createdAt ? new Date(item.createdAt).getTime() : 0);

const rowId = (item) => `${item.kind}-${item._id}`;

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

function MessageText({ text, open, onToggle }) {
  const isLong = text.length > LONG_MESSAGE;

  return (
    <div>
      <p
        className={`break-words text-sm leading-relaxed text-slate-300 ${
          open || !isLong ? "" : "line-clamp-2"
        }`}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="mt-1.5 text-xs font-medium text-sky-400 transition hover:text-sky-300"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function StatusBadge({ kind, className = "" }) {
  const { badge, badgeStyle } = KINDS[kind];

  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-medium ${badgeStyle} ${className}`}
    >
      {badge}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function ReviewedTasks() {
  const { myApprovedTasks, myRejectedTasks, isLoading } = useContext(context);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState(null);

  const approved = Array.isArray(myApprovedTasks) ? myApprovedTasks : [];
  const rejected = Array.isArray(myRejectedTasks) ? myRejectedTasks : [];

  const all = [
    ...approved.map((item) => ({ ...item, kind: "approved" })),
    ...rejected.map((item) => ({ ...item, kind: "rejected" })),
  ];

  const counts = {
    all: all.length,
    approved: approved.length,
    rejected: rejected.length,
  };

  const text = search.trim().toLowerCase();

  const matching = all
    .filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;

      const person = item[KINDS[item.kind].person];
      const searchable = `${item.task?.title || ""} ${person?.name || ""} ${
        person?.email || ""
      } ${item.message || ""}`;
      return searchable.toLowerCase().includes(text);
    })
    .sort((a, b) =>
      newestFirst ? timeOf(b) - timeOf(a) : timeOf(a) - timeOf(b)
    );

  const rows = matching.slice(0, limit);

  const changeFilter = (id) => {
    setFilter(id);
    setLimit(PAGE_SIZE);
  };

  const toggleMessage = (id) => setOpenId(openId === id ? null : id);

  if (isLoading) {
    return (
      <LoadingState
        message="Loading reviewed tasks"
        subtext="Syncing your review history"
      />
    );
  }

  return (
    <div className="min-h-screen  text-slate-100">
      {/* Soft top glow */}
      {/* <div className="pointer-events-none fixed inset-x-0 top-0 h-56 bg-gradient-to-b from-sky-500/[0.04] to-transparent" /> */}

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* ===== Header ===== */}
        <header className="mb-8 space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Reviewed tasks
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-slate-500">
            Every task that was approved or rejected after review.
          </p>
        </header>

        {/* ===== Number boxes (filters) ===== */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {TILES.map(({ id, label, icon: Icon, tone }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => changeFilter(id)}
                aria-pressed={active}
                className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                  active
                    ? "border-sky-500/40 bg-sky-500/10 shadow-sm shadow-sky-500/10"
                    : "border-slate-800/80 bg-[#0c1220] hover:border-slate-700/80"
                }`}
              >
                <div
                  className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:flex ${tone}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-white">
                    {counts[id]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ===== Search + sort ===== */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="Search task, person or message"
              aria-label="Search tasks"
              className={inputClass}
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

          <button
            type="button"
            onClick={() => setNewestFirst(!newestFirst)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-[#0c1220] px-4 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            {newestFirst ? "Newest first" : "Oldest first"}
          </button>
        </div>

        {/* ===== Table ===== */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220]">
          {matching.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80">
                <ClipboardList className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {all.length === 0 ? "No reviewed tasks yet" : "No tasks found"}
              </p>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
                {all.length === 0
                  ? "Approved and rejected tasks will show up here."
                  : "Try a different search or filter."}
              </p>
              {all.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    changeFilter("all");
                  }}
                  className="mt-5 rounded-xl border border-slate-700/80 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Clear search and filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800/80 bg-[#0a0f1a] text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 sm:px-6">
                      Task
                    </th>
                    <th scope="col" className="hidden px-4 py-3.5 sm:table-cell">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Reviewed by
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Date
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3.5 pr-6 lg:table-cell"
                    >
                      Message / reason
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {rows.map((item) => {
                    const kind = KINDS[item.kind];
                    const person = item[kind.person];
                    const message = item.message || kind.noMessage;
                    const id = rowId(item);
                    const open = openId === id;

                    return (
                      <tr
                        key={id}
                        className="align-top transition-colors hover:bg-white/[0.02]"
                      >
                        {/* Task */}
                        <td className="px-4 py-4 sm:px-6">
                          <p className="break-words font-medium text-white">
                            {item.task?.title || "Untitled task"}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-600">
                            #{item.task?._id?.slice(-6) || "N/A"}
                          </p>

                          <StatusBadge
                            kind={item.kind}
                            className="mt-2.5 sm:hidden"
                          />

                          <div className="mt-3.5 lg:hidden">
                            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                              {kind.messageLabel}
                            </p>
                            <MessageText
                              text={message}
                              open={open}
                              onToggle={() => toggleMessage(id)}
                            />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="hidden px-4 py-4 sm:table-cell">
                          <StatusBadge kind={item.kind} />
                        </td>

                        {/* Reviewed by */}
                        <td className="px-4 py-4">
                          <p className="break-words font-medium text-slate-200">
                            {person?.name || "Unknown"}
                          </p>
                          <p className="mt-0.5 break-all text-xs text-slate-500">
                            {person?.email || "No email"}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <p className="text-slate-300">
                            {formatDate(item.createdAt)}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatTime(item.createdAt)}
                          </p>
                        </td>

                        {/* Message */}
                        <td className="hidden max-w-sm px-4 py-4 pr-6 lg:table-cell">
                          <MessageText
                            text={message}
                            open={open}
                            onToggle={() => toggleMessage(id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {matching.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-[#0a0f1a]/60 px-4 py-3.5 text-xs text-slate-500 sm:px-6">
              <span>
                Showing{" "}
                <span className="font-medium text-slate-400">
                  {rows.length}
                </span>{" "}
                of {matching.length}{" "}
                {matching.length === 1 ? "task" : "tasks"}
              </span>

              {rows.length < matching.length && (
                <button
                  type="button"
                  onClick={() => setLimit(limit + PAGE_SIZE)}
                  className="rounded-xl border border-slate-700/80 bg-slate-800/60 px-4 py-2 font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewedTasks;