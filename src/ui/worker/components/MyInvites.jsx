import { useContext, useState } from "react";
import { context } from "../../../context/context";
import { Mail, Check, X, Loader2, AlertCircle, Clock, Users } from "lucide-react";
import useInvitation from "../../../hooks/useInvitation";
import { Avatar, StatusBadge, PageHeader, EmptyState, SearchBox } from "../../Inviteparts";
import { formatTimeAgo, newestFirst } from "../../../utils/inviteUtils";
import LoadingState from "../../LoadingState.jsx";

// Show the search box only when the list is long
const SEARCH_FROM = 6;

function MyInvites() {
  const { myInvitations, isLoading } = useContext(context);
  const { handleAcceptInvite, handleRejectInvite } = useInvitation();

  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null); // { id, action } while the server answers
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <LoadingState
        message="Loading invites"
        subtext="Syncing your team invitations"
      />
    );
  }

  const list = Array.isArray(myInvitations) ? myInvitations : [];

  // Runs accept or reject. The buttons of that invite show a spinner until the server answers.
  const run = async (invite, action, apiCall) => {
    setBusy({ id: invite._id, action });
    setError("");

    try {
      await apiCall(invite._id);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleAccept = (invite) => run(invite, "accept", handleAcceptInvite);
  const handleReject = (invite) => run(invite, "reject", handleRejectInvite);

  // Newest first, and only what matches the search
  const text = search.trim().toLowerCase();
  const visible = newestFirst(list).filter((invite) => {
    const manager = invite.managerId || {};
    return `${manager.name || ""} ${manager.email || ""}`.toLowerCase().includes(text);
  });

  return (
    <div className="min-h-full p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          icon={Mail}
          title="My invites"
          subtitle="Managers who want you on their team. Accept or reject each invite."
          count={list.length}
          countLabel={list.length === 1 ? "invite" : "invites"}
        />

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss"
              className="rounded p-0.5 transition hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {list.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No invites yet"
            text="When a manager invites you to their team, it will show up here."
          />
        ) : (
          <>
            {list.length >= SEARCH_FROM && (
              <SearchBox value={search} onChange={setSearch} placeholder="Search by manager name or email" />
            )}

            {visible.length === 0 ? (
              <EmptyState icon={Mail} title="No invites found" text="Try a different name or email." />
            ) : (
              <ul className="space-y-3">
                {visible.map((invite) => {
                  const manager = invite.managerId || {};
                  const name = manager.name || "Unknown manager";
                  const email = manager.email || "No email";
                  const status = invite.status || "pending";
                  const isPending = status === "pending";
                  const isBusy = busy?.id === invite._id; // this invite is waiting for the server
                  const anyBusy = Boolean(busy); // wait for one answer before the next click

                  return (
                    <li
                      key={invite._id}
                      className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827] transition-colors hover:border-slate-700"
                    >
                      {/* Who invited you */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-5">
                        <Avatar name={name} tone="sky" />

                        <div className="min-w-0 flex-1 basis-48">
                          <p className="truncate text-sm font-medium text-white">{name}</p>
                          <p className="truncate text-xs text-slate-500">{email}</p>
                          {invite.createdAt && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                              <Clock className="h-3 w-3" />
                              Received {formatTimeAgo(invite.createdAt)}
                            </p>
                          )}
                        </div>

                        <StatusBadge status={status} />
                      </div>

                      {/* What to do (only while the invite is waiting for an answer) */}
                      {isPending && (
                        <div className="flex flex-col gap-3 border-t border-slate-800 bg-[#0e1522] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <Users className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                            If you accept, you join {name}&apos;s team.
                          </p>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReject(invite)}
                              disabled={anyBusy}
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-4 text-xs font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                            >
                              {isBusy && busy.action === "reject" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              {isBusy && busy.action === "reject" ? "Rejecting..." : "Reject"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAccept(invite)}
                              disabled={anyBusy}
                              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                            >
                              {isBusy && busy.action === "accept" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              {isBusy && busy.action === "accept" ? "Accepting..." : "Accept"}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyInvites;