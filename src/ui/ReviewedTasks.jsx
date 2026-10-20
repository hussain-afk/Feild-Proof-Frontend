import { useContext, useState } from "react";
import { Search, X, ArrowDownUp, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { context } from "../context/context.jsx";

/**
 * ONE page for approved AND rejected tasks.
 * One table, with a Status column. Click a box at the top to see only approved or only rejected.
 */

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

// What is different between an approved row and a rejected row
const KINDS = {
  approved: {
    person: "approvedBy", // the field of the item that holds the reviewer
    badge: "Approved",
    badgeStyle: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    messageLabel: "Approval message",
    noMessage: "No approval message.",
  },
  rejected: {
    person: "rejectedBy",
    badge: "Rejected",
    badgeStyle: "border-red-500/20 bg-red-500/10 text-red-400",
    messageLabel: "Reason",
    noMessage: "No reason was given.",
  },
};

// The three boxes at the top (they also work as filters)
const TILES = [
  { id: "all", label: "All reviewed", icon: ClipboardList, tone: "border-sky-500/10 bg-sky-500/5 text-sky-400" },
  { id: "approved", label: "Approved", icon: CheckCircle2, tone: "border-emerald-500/10 bg-emerald-500/5 text-emerald-400" },
  { id: "rejected", label: "Rejected", icon: XCircle, tone: "border-red-500/10 bg-red-500/5 text-red-400" },
];

const PAGE_SIZE = 10; // how many rows show first, and how many more each "Show more" adds
const LONG_MESSAGE = 90; // a message longer than this gets a "Read more" button

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] pl-9 pr-9 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";

const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

const timeOf = (item) => (item.createdAt ? new Date(item.createdAt).getTime() : 0);

// Each row needs its own id, because an approved and a rejected record could share the same _id
const rowId = (item) => `${item.kind}-${item._id}`;

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

// The message / reason. Long ones are cut to 2 lines, with a "Read more" button.
function MessageText({ text, open, onToggle }) {
  const isLong = text.length > LONG_MESSAGE;

  return (
    <div>
      <p className={`break-words text-sm leading-5 text-slate-300 ${open || !isLong ? "" : "line-clamp-2"}`}>
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="mt-1 text-xs font-medium text-sky-400 transition hover:text-sky-300"
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
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeStyle} ${className}`}>
      {badge}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function ReviewedTasks() {
  const { myApprovedTasks, myRejectedTasks } = useContext(context);

  const [filter, setFilter] = useState("all"); // all | approved | rejected
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [limit, setLimit] = useState(PAGE_SIZE); // how many rows are shown
  const [openId, setOpenId] = useState(null); // the row whose full message is open

  // 1. Put both lists together. Each item remembers if it is approved or rejected.
  const approved = Array.isArray(myApprovedTasks) ? myApprovedTasks : [];
  const rejected = Array.isArray(myRejectedTasks) ? myRejectedTasks : [];

  const all = [
    ...approved.map((item) => ({ ...item, kind: "approved" })),
    ...rejected.map((item) => ({ ...item, kind: "rejected" })),
  ];

  const counts = { all: all.length, approved: approved.length, rejected: rejected.length };

  // 2. Keep what matches the filter and the search text. Then sort by date.
  const text = search.trim().toLowerCase();

  const matching = all
    .filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;

      const person = item[KINDS[item.kind].person];
      const searchable = `${item.task?.title || ""} ${person?.name || ""} ${person?.email || ""} ${item.message || ""}`;
      return searchable.toLowerCase().includes(text);
    })
    .sort((a, b) => (newestFirst ? timeOf(b) - timeOf(a) : timeOf(a) - timeOf(b)));

  // 3. Only the first rows (the rest come with "Show more")
  const rows = matching.slice(0, limit);

  const changeFilter = (id) => {
    setFilter(id);
    setLimit(PAGE_SIZE);
  };

  const toggleMessage = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* ===== Header ===== */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Reviewed tasks</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Every task that was approved or rejected after review.
          </p>
        </header>

        {/* ===== Number boxes (click one to filter) ===== */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {TILES.map(({ id, label, icon: Icon, tone }) => (
            <button
              key={id}
              type="button"
              onClick={() => changeFilter(id)}
              aria-pressed={filter === id}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition sm:p-4 ${
                filter === id
                  ? "border-sky-500/50 bg-sky-500/10"
                  : "border-slate-800 bg-[#111827] hover:border-slate-700"
              }`}
            >
              <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border sm:flex ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-500">{label}</p>
                <p className="mt-0.5 text-xl font-semibold leading-none text-white">{counts[id]}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ===== Search + sort ===== */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNewestFirst(!newestFirst)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-800 bg-[#0f1624] px-3 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            {newestFirst ? "Newest first" : "Oldest first"}
          </button>
        </div>

        {/* ===== Table ===== */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
          {matching.length === 0 ? (
            /* Nothing to show */
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                <ClipboardList className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                {all.length === 0 ? "No reviewed tasks yet" : "No tasks found"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
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
                  className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  Clear search and filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-[#0e1522] text-xs font-medium text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">Task</th>
                    <th scope="col" className="hidden px-4 py-3 sm:table-cell">Status</th>
                    <th scope="col" className="px-4 py-3">Reviewed by</th>
                    <th scope="col" className="px-4 py-3">Date</th>
                    <th scope="col" className="hidden px-4 py-3 pr-6 lg:table-cell">Message / reason</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/70">
                  {rows.map((item) => {
                    const kind = KINDS[item.kind];
                    const person = item[kind.person];
                    const message = item.message || kind.noMessage;
                    const id = rowId(item);
                    const open = openId === id;

                    return (
                      <tr key={id} className="align-top transition-colors hover:bg-white/[0.02]">
                        {/* Task (on small screens the status and the message are shown here too) */}
                        <td className="px-4 py-4 sm:px-6">
                          <p className="break-words font-medium text-white">
                            {item.task?.title || "Untitled task"}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-600">
                            #{item.task?._id?.slice(-6) || "N/A"}
                          </p>

                          <StatusBadge kind={item.kind} className="mt-2 sm:hidden" />

                          <div className="mt-3 lg:hidden">
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              {kind.messageLabel}
                            </p>
                            <MessageText text={message} open={open} onToggle={() => toggleMessage(id)} />
                          </div>
                        </td>

                        {/* Status (from tablet up) */}
                        <td className="hidden px-4 py-4 sm:table-cell">
                          <StatusBadge kind={item.kind} />
                        </td>

                        {/* Who reviewed it */}
                        <td className="px-4 py-4">
                          <p className="break-words text-slate-200">{person?.name || "Unknown"}</p>
                          <p className="mt-0.5 break-all text-xs text-slate-500">
                            {person?.email || "No email"}
                          </p>
                        </td>

                        {/* Date and time */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <p className="text-slate-300">{formatDate(item.createdAt)}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{formatTime(item.createdAt)}</p>
                        </td>

                        {/* Message (big screens only) */}
                        <td className="hidden max-w-sm px-4 py-4 pr-6 lg:table-cell">
                          <MessageText text={message} open={open} onToggle={() => toggleMessage(id)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer: how many rows, and "Show more" */}
          {matching.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-[#0e1522] px-4 py-3 text-xs text-slate-500 sm:px-6">
              <span>
                Showing {rows.length} of {matching.length} {matching.length === 1 ? "task" : "tasks"}
              </span>

              {rows.length < matching.length && (
                <button
                  type="button"
                  onClick={() => setLimit(limit + PAGE_SIZE)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 transition hover:bg-slate-700"
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