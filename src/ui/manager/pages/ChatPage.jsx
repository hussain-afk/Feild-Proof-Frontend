import { useContext, useMemo, useState } from "react";
import { ArrowLeft, MessageCircle, Search, Users, X } from "lucide-react";
import { context } from "../../../context/context.jsx";
import ChatPanel from "../../ChatPannel.jsx";
import { canUseChatPlan } from '../../../utils/PlanAccess.jsx';
import ChatLocked from "../../ChatLocked.jsx";

const AVATAR_COLORS = [
  "bg-sky-500/15 text-sky-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-violet-500/15 text-violet-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
];

const colorFor = (key) => {
  let hash = 0;
  const str = String(key || "");
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

function ManagerChatPage() {
  const { user, myWorkers, mySubscription } = useContext(context);
  const workers = useMemo(
    () => (Array.isArray(myWorkers) ? myWorkers : []),
    [myWorkers]
  );
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const chatOpen = canUseChatPlan(mySubscription);

  if (!chatOpen) return <ChatLocked />;

  const selected = workers.find(
    (w) => String(w._id || w.id) === String(selectedId)
  );

  const text = search.trim().toLowerCase();
  const visibleWorkers = workers.filter((w) =>
    `${w.name || ""} ${w.email || ""}`.toLowerCase().includes(text)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Chat
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Message your assigned workers
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Workers: on phones this hides once a chat is open */}
        <aside
          className={`flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0c1220] lg:flex lg:h-[calc(100dvh-13rem)] lg:max-h-[720px] ${
            selectedId ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <h2 className="text-sm font-semibold text-white">Workers</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
              {workers.length}
            </span>
          </div>

          {workers.length > 0 && (
            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search workers"
                  aria-label="Search workers"
                  className="h-10 w-full rounded-full border border-slate-800 bg-[#0b1220] pl-10 pr-9 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <ul className="min-h-0 max-h-[60vh] flex-1 space-y-0.5 overflow-y-auto border-t border-slate-800/80 p-2 [scrollbar-color:#1e293b_transparent] [scrollbar-width:thin] lg:max-h-none">
            {workers.length === 0 ? (
              <li className="flex flex-col items-center px-4 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/70">
                  <Users className="h-5 w-5 text-slate-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-300">
                  No workers yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Invited workers will appear here.
                </p>
              </li>
            ) : visibleWorkers.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-slate-500">
                No workers match your search
              </li>
            ) : (
              visibleWorkers.map((w) => {
                const id = w._id || w.id;
                const active = String(id) === String(selectedId);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(id)}
                      aria-current={active ? "true" : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${focusRing} ${
                        active
                          ? "bg-sky-500/10 ring-1 ring-inset ring-sky-500/20"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorFor(id)}`}
                      >
                        {w.avatar ? (
                          <img
                            src={w.avatar}
                            alt={`${w.name || "Worker"} avatar`}
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        ) : (
                          (w.name || "?").charAt(0).toUpperCase()
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-sm font-medium ${
                            active ? "text-sky-200" : "text-slate-200"
                          }`}
                        >
                          {w.name || "Worker"}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {w.email || ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Chat */}
        {selectedId ? (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className={`mb-3 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0c1220] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 lg:hidden ${focusRing}`}
            >
              <ArrowLeft className="h-4 w-4" />
              All workers
            </button>
            <div className="h-[calc(100dvh-15rem)] min-h-[420px] lg:h-[calc(100dvh-13rem)] lg:max-h-[720px]">
              <ChatPanel
                otherUserId={selectedId}
                otherName={selected?.name}
                myUserId={user?._id || user?.id}
              />
            </div>
          </div>
        ) : (
          <div className="hidden min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-[#0c1220]/50 px-6 text-center lg:flex lg:h-[calc(100dvh-13rem)] lg:max-h-[720px]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
              <MessageCircle className="h-7 w-7 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              Select a worker to open chat
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Your conversation will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerChatPage;