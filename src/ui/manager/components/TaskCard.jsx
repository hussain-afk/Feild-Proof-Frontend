import { useState } from "react";
import {
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ExternalLink,
  Trash2,
  Mail,
  Radio,
  Users,
  ChevronDown,
  X,
} from "lucide-react";
import useTasks from "../../../hooks/useTasks.jsx";

function ManagerTaskCard({ task, onViewDetails }) {
  const [isWorkersOpen, setIsWorkersOpen] = useState(false);

  const {
    _id,
    title,
    description,
    status = "pending",
    assignedWorker,
    dueDate,
    siteLocation,
  } = task || {};

  const { handleDeleteTask } = useTasks();

  // Normalize assignedWorker to always be an array
  const workersList = Array.isArray(assignedWorker)
    ? assignedWorker
    : assignedWorker
      ? [assignedWorker]
      : [];

  // -----------------------------
  // Status Badge
  // -----------------------------
  const getStatusBadge = (status) => {
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-300">
          <X className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    }

    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    }

    if (status === "in-progress") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          In Progress
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
        <AlertCircle className="h-3.5 w-3.5" />
        Pending
      </span>
    );
  };

  // -----------------------------
  // Delete Task
  // -----------------------------
  const onDeleteTask = async (taskId) => {
    if (!taskId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    await handleDeleteTask(taskId);
  };

  // -----------------------------
  // Format Date
  // -----------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220] transition-all duration-200 hover:border-slate-700/80">
      {/* --------------------------------
          Card Header
      -------------------------------- */}
      <div className="border-b border-slate-800/80 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Field Task
            </p>
            <h3 className="truncate text-base font-semibold tracking-tight text-white">
              {title || "Untitled Field Task"}
            </h3>
          </div>
          <div className="shrink-0">{getStatusBadge(status)}</div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {description ||
            "No additional operational notes have been provided for this task."}
        </p>
      </div>

      {/* --------------------------------
          Card Content
      -------------------------------- */}
      <div className="flex-1 space-y-4 p-5">
        {/* Workers Collapsible */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Assigned Workers
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsWorkersOpen(!isWorkersOpen)}
            className="group/btn flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-[#0a0f1a] p-3 transition-all duration-200 hover:border-sky-500/30"
          >
            <div className="flex min-w-0 items-center gap-3">
              {/* Stacked Avatars */}
              <div className="flex shrink-0 -space-x-2">
                {workersList.slice(0, 3).map((w, i) => (
                  <div
                    key={i}
                    className="inline-block h-7 w-7 overflow-hidden rounded-lg ring-2 ring-[#0a0f1a] bg-slate-800"
                  >
                    {w?.avatar || w?.profilePic ? (
                      <img
                        src={w.avatar || w.profilePic}
                        alt={w.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-300">
                        {w?.name ? (
                          w.name.charAt(0).toUpperCase()
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {workersList.length > 3 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-[10px] font-medium text-slate-400 ring-2 ring-[#0a0f1a]">
                    +{workersList.length - 3}
                  </div>
                )}
              </div>

              <div className="min-w-0 text-left">
                <p className="truncate text-xs font-medium text-slate-200 transition-colors group-hover/btn:text-sky-300">
                  {workersList.length > 0
                    ? `${workersList.length} Worker${workersList.length > 1 ? "s" : ""} Assigned`
                    : "No Worker Assigned"}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {workersList.length > 0
                    ? workersList.map((w) => w.name || "Worker").join(", ")
                    : "Assign workers to this task"}
                </p>
              </div>
            </div>

            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                isWorkersOpen ? "rotate-180 text-sky-400" : ""
              }`}
            />
          </button>

          {/* Collapsible list */}
          {isWorkersOpen && (
            <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-slate-800/80 bg-[#090e18] p-2">
              {workersList.length > 0 ? (
                workersList.map((workerItem, index) => {
                  const worker =
                    typeof workerItem === "object" ? workerItem : {};
                  const workerName = worker.name || "Assigned Worker";
                  const workerEmail = worker.email || "No email registered";
                  const workerRole = worker.role || "Worker";
                  const avatar = worker.avatar || worker.profilePic;

                  return (
                    <div
                      key={worker._id || worker.id || index}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-800/60 bg-[#0d1422] p-2.5 transition hover:border-slate-700"
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={workerName}
                          className="h-7 w-7 shrink-0 rounded-lg border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-[10px] font-semibold text-slate-300">
                          {workerName !== "Assigned Worker" ? (
                            workerName.charAt(0).toUpperCase()
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-medium text-slate-200">
                            {workerName}
                          </p>
                          <span className="shrink-0 rounded border border-slate-700/80 bg-slate-800/80 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-slate-400">
                            {workerRole}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                          <Mail className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{workerEmail}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  No workers assigned yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deadline */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Target Deadline
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0a0f1a] px-3.5 py-2.5">
            <Calendar className="h-4 w-4 shrink-0 text-sky-400" />
            <span className="text-sm text-slate-300">{formatDate(dueDate)}</span>
          </div>
        </div>

        {/* Location */}
        {siteLocation && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Work Location
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#0a0f1a] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/80">
                  <MapPin className="h-4 w-4 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {siteLocation.name || "Unspecified Location"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-emerald-400" />
                    <span className="text-[11px] text-slate-500">
                      Radius:{" "}
                      <span className="font-medium text-slate-400">
                        {siteLocation.radiusInMeters || 100}m
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {siteLocation.latitude && siteLocation.longitude && (
                <a
                  href={`https://maps.google.com/?q=${siteLocation.latitude},${siteLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Maps"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/80 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                >
                  <Navigation className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------
          Card Footer
      -------------------------------- */}
      <div className="border-t border-slate-800/80 bg-[#0a0f1a]/60 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(task)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
          >
            <span>View Details</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteTask(_id || task.id)}
            title="Delete Task"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerTaskCard;