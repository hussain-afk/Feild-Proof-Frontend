import { useContext, useState } from "react";
import { context } from "../../../context/context";
import { BadgeCheck, CalendarDays, Mail, Phone, Search, UserPlus, Users, X } from "lucide-react";
import useInvitation from "../../../hooks/useInvitation";

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

function AvalaibleWorkers() {
  const { availableWorkers } = useContext(context);
  const { handleInviteWorker } = useInvitation();

  const [search, setSearch] = useState("");

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

  return (
    <div className="min-h-screen p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* ================= Header ================= */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <Users className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Available workers
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                Workers with no manager yet. Send an invite to add them to your team.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-slate-800 bg-[#0c1220] px-3.5 py-1.5 text-sm text-slate-300">
            <span className="font-semibold text-white">{list.length}</span> available
          </span>
        </header>

        {list.length === 0 ? (
          /* ================= Nobody available ================= */
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-700 bg-[#0c1220]/70 px-6 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/60">
              <Users className="h-7 w-7 text-slate-500" />
            </div>
            <p className="text-base font-medium text-slate-200">No available workers</p>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
              When someone registers without a team, they will show up here.
            </p>
          </div>
        ) : (
          <>
            {/* ================= Search ================= */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  aria-label="Search available workers"
                  className="h-11 w-full rounded-xl border border-slate-800 bg-[#0c1220] pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Showing {visibleList.length} of {list.length}
              </p>
            </div>

            {visibleList.length === 0 ? (
              /* ================= Search found nothing ================= */
              <div className="mt-6 flex flex-col items-center rounded-3xl border border-slate-800 bg-[#0c1220] px-6 py-14 text-center">
                <Search className="mb-3 h-7 w-7 text-slate-600" />
                <p className="text-sm font-medium text-slate-200">No workers match your search</p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-3 text-sm font-medium text-sky-400 transition hover:text-sky-300"
                >
                  Clear search
                </button>
              </div>
            ) : (
              /* ================= The list ================= */
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {visibleList.map((worker) => (
                  <li
                    key={worker._id}
                    className="group flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-[#0c1220] p-4 transition duration-200 hover:border-sky-500/30 hover:bg-[#0e1526]"
                  >
                    {/* Photo, name, email */}
                    <div className="flex items-center gap-3.5">
                      {worker.avatar ? (
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-800 transition group-hover:ring-sky-500/30"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-300 ring-2 ring-slate-800 transition group-hover:ring-sky-500/30">
                          {getInitials(worker.name)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {worker.name || "No name"}
                          </p>
                          {worker.isVerified && (
                            <BadgeCheck
                              className="h-4 w-4 shrink-0 text-emerald-400"
                              aria-label="Verified"
                            />
                          )}
                        </div>

                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{worker.email || "No email"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Extra details (shown only when the worker has them) */}
                    {(worker.phone || worker.createdAt) && (
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                        {worker.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            {worker.phone}
                          </span>
                        )}
                        {worker.createdAt && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                            Registered {timeAgo(worker.createdAt).toLowerCase()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Invite: the logic is written by you (handleInvite) */}
                    <button
                      type="button"
                      onClick={() => handleInvite(worker)}
                      aria-label={`Invite ${worker.name || "worker"}`}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-medium text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 active:scale-[0.99]"
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite to my team
                    </button>
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