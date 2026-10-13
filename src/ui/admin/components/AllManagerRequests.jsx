import { useContext, useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Check,
  X,
  Inbox,
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { context } from "../../../context/context.jsx";
import useAdmin from "../../../hooks/useAdmin.jsx";

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

// Colours for each status (badge, dot, and the thin line on the left of the card)
const STATUS = {
  pending: {
    label: "Pending",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
    accent: "border-l-amber-500/60",
  },
  approved: {
    label: "Approved",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
    accent: "border-l-emerald-500/60",
  },
  rejected: {
    label: "Rejected",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
    dot: "bg-red-400",
    accent: "border-l-red-500/60",
  },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] pl-9 pr-9 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

/* ------------------------------------------------------------------ */
/* Small helpers (plain JavaScript)                                     */
/* ------------------------------------------------------------------ */

// A request without a status is treated as "pending"
const getStatus = (request) => (STATUS[request.status] ? request.status : "pending");

// "Ali Khan" -> "AK"
const getInitials = (name) =>
  (name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "U";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "";

// "Just now", "5 minutes ago", "3 hours ago", "Yesterday", "4 days ago", or the date
const formatTimeAgo = (date) => {
  if (!date) return "";

  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
};

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

// One number box at the top
function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111827] p-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-lg font-semibold leading-none text-white">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const style = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ${status === "pending" ? "animate-pulse" : ""}`} />
      {style.label}
    </span>
  );
}

// One request card (compact: one row on desktop, stacked on phones)
function RequestCard({ request, busyStatus, anyBusy, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false); // show the whole message or only one line

  const status = getStatus(request);
  const isLongMessage = (request.message || "").length > 90;

  return (
    <li
      className={`rounded-xl border border-l-4 border-slate-800 bg-[#111827] p-4 transition-colors hover:border-slate-700 ${STATUS[status].accent}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Avatar, name, status and contact in one tidy block */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300 ring-1 ring-sky-500/20">
            {getInitials(request.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="truncate text-sm font-semibold text-white">{request.name || "Unknown"}</h2>
              <StatusBadge status={status} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <a
                href={request.email ? `mailto:${request.email}` : undefined}
                className="inline-flex min-w-0 max-w-full items-center gap-1.5 transition hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span className="truncate">{request.email || "No email"}</span>
              </a>
              <a
                href={request.phone ? `tel:${request.phone}` : undefined}
                className="inline-flex items-center gap-1.5 transition hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                {request.phone || "No phone"}
              </a>
              {request.createdAt && (
                <span className="inline-flex items-center gap-1.5 text-slate-500" title={formatDate(request.createdAt)}>
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {formatTimeAgo(request.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Approve / Reject (only for pending requests) */}
        {status === "pending" && (
          <div className="flex gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={onReject}
              disabled={anyBusy}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 px-3.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {busyStatus === "rejected" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              {busyStatus === "rejected" ? "Rejecting..." : "Reject"}
            </button>

            <button
              type="button"
              onClick={onApprove}
              disabled={anyBusy}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {busyStatus === "approved" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {busyStatus === "approved" ? "Approving..." : "Approve"}
            </button>
          </div>
        )}
      </div>

      {/* Message: one line only, click to read all of it */}
      {request.message && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          disabled={!isLongMessage}
          aria-expanded={expanded}
          className={`mt-3 flex w-full items-start gap-2 rounded-lg border border-slate-800 bg-[#0b1220] px-3 py-2 text-left ${
            isLongMessage ? "cursor-pointer transition hover:border-slate-700" : "cursor-default"
          }`}
        >
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
          <p className={`min-w-0 flex-1 text-[13px] leading-5 text-slate-300 ${expanded ? "" : "truncate"}`}>
            {request.message}
          </p>
          {isLongMessage && (
            <ChevronDown
              className={`mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          )}
        </button>
      )}
    </li>
  );
}

function EmptyState({ isFiltering, onClear }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-700 bg-[#111827]/60 px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
        <Inbox className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-200">
        {isFiltering ? "No requests found" : "No manager requests yet"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {isFiltering ? "Try a different search or filter." : "New requests will show up here."}
      </p>
      {isFiltering && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
        >
          Clear search and filter
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function AllManagerRequests() {
  const { updateManagerRequestStatus } = useAdmin();
  const { managerRequests = [] } = useContext(context);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(null); // { id, status } while a request is being saved
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Count each status (for the number boxes and the filter buttons)
  const counts = { all: managerRequests.length, pending: 0, approved: 0, rejected: 0 };
  managerRequests.forEach((request) => {
    counts[getStatus(request)] += 1;
  });

  // 2. Pending first, then newest first
  const sorted = [...managerRequests].sort((a, b) => {
    const aPending = getStatus(a) === "pending" ? 0 : 1;
    const bPending = getStatus(b) === "pending" ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // 3. Keep only what matches the filter and the search text
  const text = search.trim().toLowerCase();
  const visibleRequests = sorted.filter((request) => {
    const matchFilter = filter === "all" || getStatus(request) === filter;
    const matchText = `${request.name || ""} ${request.email || ""} ${request.phone || ""}`
      .toLowerCase()
      .includes(text);
    return matchFilter && matchText;
  });

  const isFiltering = text.length > 0 || filter !== "all";

  const clearAll = () => {
    setSearch("");
    setFilter("all");
  };

  // Same API call as before. The button shows a spinner until the server answers.
  const decide = async (requestId, newStatus) => {
    setErrorMessage("");
    setBusy({ id: requestId, status: newStatus });

    try {
      await updateManagerRequestStatus(requestId, newStatus);
    } catch (error) {
      // console.error("Could not update the request:", error);
      setErrorMessage(error?.response?.data?.message || error?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = (requestId) => decide(requestId, "approved");
  const handleReject = (requestId) => decide(requestId, "rejected");

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        {/* ===== Header ===== */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Manager requests</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              People who asked for manager access. Review each request and decide.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#111827] px-3.5 py-1.5 text-sm text-slate-300">
            {counts.pending > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
            <span className="font-semibold text-white">{counts.pending}</span> pending
          </span>
        </header>

        {/* ===== Number boxes ===== */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Users} label="Total requests" value={counts.all} tone="border-sky-500/10 bg-sky-500/5 text-sky-400" />
          <StatCard icon={Clock} label="Pending" value={counts.pending} tone="border-amber-500/10 bg-amber-500/5 text-amber-400" />
          <StatCard icon={CheckCircle2} label="Approved" value={counts.approved} tone="border-emerald-500/10 bg-emerald-500/5 text-emerald-400" />
          <StatCard icon={XCircle} label="Rejected" value={counts.rejected} tone="border-red-500/10 bg-red-500/5 text-red-400" />
        </div>

        {/* ===== Search + filter ===== */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone"
              aria-label="Search requests"
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
                  <span className={active ? "text-slate-300" : "text-slate-500"}>{counts[id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Error message ===== */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss"
              className="rounded p-0.5 text-red-300 transition hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ===== List ===== */}
        {visibleRequests.length === 0 ? (
          <EmptyState isFiltering={isFiltering} onClear={clearAll} />
        ) : (
          <ul className="space-y-3">
            {visibleRequests.map((request) => {
              const id = request._id || request.id;
              return (
                <RequestCard
                  key={id}
                  request={request}
                  busyStatus={busy?.id === request._id ? busy.status : null}
                  anyBusy={Boolean(busy)}
                  onApprove={() => handleApprove(request._id)}
                  onReject={() => handleReject(request._id)}
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AllManagerRequests;