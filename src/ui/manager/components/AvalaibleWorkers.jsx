import { useContext, useState } from "react";
import { context } from "../../../context/context";
import {
  BadgeCheck,
  CalendarDays,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import useInvitation from "../../../hooks/useInvitation";
import LoadingState from "../../LoadingState.jsx";

// "Ali Khan" -> "AK"
const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

// 2026-10-20 -> "5 days ago"
const timeAgo = (date) => {
  if (!date) return "";

  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);

  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
};

// Registered in the last 7 days
const isNewWorker = (date) => {
  if (!date) return false;
  const days = (Date.now() - new Date(date).getTime()) / 86400000;
  return Number.isFinite(days) && days <= 7;
};

// Every worker gets a steady colour, picked from their id/name
const AVATAR_COLORS = [
  "bg-sky-500/15 text-sky-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-violet-500/15 text-violet-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
];

const colorFor = (worker) => {
  const key = String(worker._id || worker.name || "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17]";

function WorkerAvatar({ worker, size = "h-14 w-14" }) {
  return worker.avatar ? (
    <img
      src={worker.avatar}
      alt={worker.name}
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full text-base font-semibold ${colorFor(worker)}`}
    >
      {getInitials(worker.name)}
    </div>
  );
}

function InviteButton({ worker, onInvite, compact }) {
  return (
    <button
      type="button"
      onClick={() => onInvite(worker)}
      aria-label={`Invite ${worker.name || "worker"}`}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500 active:scale-[0.98] ${focusRing} ${
        compact ? "h-9 px-4" : "h-11 w-full px-4"
      }`}
    >
      <UserPlus className="h-4 w-4" />
      {compact ? "Invite" : "Invite to my team"}
    </button>
  );
}

function WorkerName({ worker }) {
  return (
    <div className="flex items-center gap-2">
      <p className="truncate text-[15px] font-semibold text-white">
        {worker.name || "No name"}
      </p>
      {worker.isVerified && (
        <BadgeCheck
          className="h-4 w-4 shrink-0 text-sky-400"
          aria-label="Verified"
        />
      )}
      {isNewWorker(worker.createdAt) && (
        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
          New
        </span>
      )}
    </div>
  );
}

function AvalaibleWorkers() {
  const { availableWorkers, isLoading } = useContext(context);
  const { handleInviteWorker } = useInvitation();

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");

  if (isLoading) {
    return (
      <LoadingState
        message="Loading available workers"
        subtext="Finding workers for your team"
      />
    );
  }

  // API kabhi array deti hai, kabhi { workers: [...] }
  const list = Array.isArray(availableWorkers)
    ? availableWorkers
    : availableWorkers?.workers || [];

  const handleInvite = (worker) => {
    // TODO: yahan apni invite API call likho
    // example: await inviteWorker(worker._id)
    console.log("Invite clicked:", worker._id);
    handleInviteWorker(worker._id);
  };

  // Search sirf screen par list chhoti karti hai (koi API call nahi)
  const text = search.trim().toLowerCase();
  const visibleList = list.filter((worker) =>
    `${worker.name || ""} ${worker.email || ""}`.toLowerCase().includes(text)
  );

  const newCount = list.filter((w) => isNewWorker(w.createdAt)).length;

  return (
    <div className="min-h-full p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* ================= Header ================= */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Available workers
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-400">
              Workers with no manager yet. Send an invite to add them to your
              team.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="rounded-2xl border border-slate-800 bg-[#111827] px-4 py-2.5">
              <p className="text-[11px] text-slate-500">Available</p>
              <p className="text-xl font-semibold leading-tight text-white">
                {list.length}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-2.5">
              <p className="text-[11px] text-emerald-400/70">New this week</p>
              <p className="text-xl font-semibold leading-tight text-emerald-300">
                {newCount}
              </p>
            </div>
          </div>
        </header>

        {list.length === 0 ? (
          /* ================= Nobody available ================= */
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-700 bg-[#111827]/60 px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/70">
              <Users className="h-7 w-7 text-slate-500" />
            </div>
            <p className="text-base font-medium text-slate-200">
              No available workers
            </p>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
              When someone registers without a team, they will show up here.
            </p>
          </div>
        ) : (
          <>
            {/* ================= Toolbar ================= */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  aria-label="Search available workers"
                  className="h-11 w-full rounded-full border border-slate-800 bg-[#111827] pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500">
                  Showing {visibleList.length} of {list.length}
                </p>
                <div className="flex rounded-full border border-slate-800 bg-[#111827] p-1">
                  {[
                    { key: "grid", icon: LayoutGrid, label: "Grid view" },
                    { key: "list", icon: List, label: "List view" },
                  ].map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      aria-label={label}
                      aria-pressed={view === key}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition ${focusRing} ${
                        view === key
                          ? "bg-sky-500/15 text-sky-300"
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {visibleList.length === 0 ? (
              /* ================= Search found nothing ================= */
              <div className="mt-6 flex flex-col items-center rounded-3xl border border-slate-800 bg-[#111827] px-6 py-14 text-center">
                <Search className="mb-3 h-7 w-7 text-slate-600" />
                <p className="text-sm font-medium text-slate-200">
                  No workers match your search
                </p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-3 text-sm font-medium text-sky-400 transition hover:text-sky-300"
                >
                  Clear search
                </button>
              </div>
            ) : view === "grid" ? (
              /* ================= Grid view ================= */
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleList.map((worker) => (
                  <li
                    key={worker._id}
                    className="flex flex-col rounded-3xl border border-slate-800 bg-[#111827] p-5 transition hover:border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <WorkerAvatar worker={worker} />
                      <div className="min-w-0 flex-1">
                        <WorkerName worker={worker} />
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {worker.email || "No email"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {(worker.phone || worker.createdAt) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {worker.phone && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b1220] px-3 py-1.5 text-xs text-slate-300">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            {worker.phone}
                          </span>
                        )}
                        {worker.createdAt && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b1220] px-3 py-1.5 text-xs text-slate-300">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                            {timeAgo(worker.createdAt)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-5 flex-1" />
                    <InviteButton worker={worker} onInvite={handleInvite} />
                  </li>
                ))}
              </ul>
            ) : (
              /* ================= List view ================= */
              <ul className="mt-5 divide-y divide-slate-800 overflow-hidden rounded-3xl border border-slate-800 bg-[#111827]">
                {visibleList.map((worker) => (
                  <li
                    key={worker._id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 transition hover:bg-[#0e1526]"
                  >
                    <WorkerAvatar worker={worker} size="h-11 w-11" />

                    <div className="min-w-0 flex-1 basis-48">
                      <WorkerName worker={worker} />
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {worker.email || "No email"}
                      </p>
                    </div>

                    <div className="hidden min-w-[130px] text-xs text-slate-400 md:block">
                      {worker.phone || "No phone"}
                    </div>
                    <div className="hidden min-w-[110px] text-xs text-slate-500 md:block">
                      {worker.createdAt ? timeAgo(worker.createdAt) : ""}
                    </div>

                    <InviteButton worker={worker} onInvite={handleInvite} compact />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AvalaibleWorkers;