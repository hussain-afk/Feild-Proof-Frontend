import { useContext, useState } from "react";
import { context } from "../../../context/context";
import { Send, Mail, Clock, XCircle } from "lucide-react";
import { Avatar, StatusBadge, PageHeader, EmptyState, SearchBox } from "../../Inviteparts";
import { formatTimeAgo, newestFirst } from "../../../utils/inviteUtils";
import LoadingState from "../../LoadingState.jsx";

// Show the search box only when the list is long
const SEARCH_FROM = 6;

// Set this to true when your handleCancel below really cancels the invite
const CAN_CANCEL = false;

function PendingInvites() {
  const { managerInvitations, isLoading } = useContext(context);
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <LoadingState
        message="Loading pending invites"
        subtext="Syncing your team invitations"
      />
    );
  }

  const list = Array.isArray(managerInvitations) ? managerInvitations : [];

  const handleCancel = (invite) => {
    // TODO: yahan cancel / withdraw API likho
    console.log("Cancel invite:", invite._id);
  };

  // Newest first, and only what matches the search
  const text = search.trim().toLowerCase();
  const visible = newestFirst(list).filter((invite) => {
    const worker = invite.workerId || {};
    return `${worker.name || ""} ${worker.email || ""}`.toLowerCase().includes(text);
  });

  return (
    <div className="min-h-full p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          icon={Send}
          title="Pending invites"
          subtitle="Invites you sent. Waiting for the worker to accept or reject."
          count={list.length}
          countLabel={list.length === 1 ? "invite" : "invites"}
        />

        {list.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No pending invites"
            text="When you invite a worker, it will show up here until they answer."
          />
        ) : (
          <>
            {list.length >= SEARCH_FROM && (
              <SearchBox value={search} onChange={setSearch} placeholder="Search by name or email" />
            )}

            {visible.length === 0 ? (
              <EmptyState icon={Mail} title="No invites found" text="Try a different name or email." />
            ) : (
              <ul className="divide-y divide-slate-800/70 overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
                {visible.map((invite) => {
                  const worker = invite.workerId || {};
                  const name = worker.name || "Unknown worker";
                  const email = worker.email || "No email";

                  return (
                    <li
                      key={invite._id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-5"
                    >
                      <Avatar name={name} tone="amber" />

                      <div className="min-w-0 flex-1 basis-48">
                        <p className="truncate text-sm font-medium text-white">{name}</p>
                        <p className="truncate text-xs text-slate-500">{email}</p>
                        {invite.createdAt && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                            <Clock className="h-3 w-3" />
                            Sent {formatTimeAgo(invite.createdAt)}
                          </p>
                        )}
                      </div>

                      <StatusBadge status={invite.status || "pending"} />

                      {CAN_CANCEL && (
                        <button
                          type="button"
                          onClick={() => handleCancel(invite)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel
                        </button>
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

export default PendingInvites;