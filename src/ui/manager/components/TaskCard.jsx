import React, { useState } from "react";

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

  // Normalize assignedWorker to Always be an Array
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }

    if (status === "in-progress") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          In Progress
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
        <AlertCircle className="w-3.5 h-3.5" />
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
    <div className="w-full bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:border-slate-700">
      {/* --------------------------------
          Card Header
      -------------------------------- */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
              Field Task
            </p>

            <h3 className="text-base font-semibold text-white truncate">
              {title || "Untitled Field Task"}
            </h3>
          </div>

          <div className="shrink-0">{getStatusBadge(status)}</div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mt-3 line-clamp-2">
          {description ||
            "No additional operational notes have been provided for this task."}
        </p>
      </div>

      {/* --------------------------------
          Card Content
      -------------------------------- */}
      <div className="p-5 space-y-4">
        {/* Workers Collapsible Dropdown */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
              Assigned Workers
            </span>
          </div>

          {/* Trigger Header Button */}
          <button
            type="button"
            onClick={() => setIsWorkersOpen(!isWorkersOpen)}
            className="w-full flex items-center justify-between p-3 bg-[#0b1220] border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Stacked Avatars Preview */}
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                {workersList.slice(0, 3).map((w, i) => (
                  <div
                    key={i}
                    className="inline-block h-7 w-7 rounded-lg ring-2 ring-[#0b1220] bg-slate-800 overflow-hidden"
                  >
                    {w?.avatar ? (
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {w?.name ? w.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                  {workersList.length > 0
                    ? `${workersList.length} Worker${workersList.length > 1 ? "s" : ""} Assigned`
                    : "No Worker Assigned"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {workersList.map((w) => w.name || "Worker").join(", ")}
                </p>
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                isWorkersOpen ? "rotate-180 text-blue-400" : ""
              }`}
            />
          </button>

          {/* Collapsible Dropdown Content */}
          {isWorkersOpen && (
            <div className="mt-2 p-2 bg-[#090e18] border border-slate-800/90 rounded-xl space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
              {workersList.length > 0 ? (
                workersList.map((workerItem, index) => {
                  const worker = typeof workerItem === "object" ? workerItem : {};
                  const workerName = worker.name || "Assigned Worker";
                  const workerEmail = worker.email || "No email registered";
                  const workerRole = worker.role || "Worker";

                  return (
                    <div
                      key={worker._id || worker.id || index}
                      className="flex items-center gap-2.5 p-2 bg-[#0d1422] border border-slate-800/80 rounded-lg hover:border-slate-700 transition"
                    >
                      {/* Avatar */}
                      {worker.avatar ? (
                        <img
                          src={worker.avatar}
                          alt={workerName}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-[10px] shrink-0">
                          {workerName !== "Assigned Worker" ? (
                            workerName.charAt(0).toUpperCase()
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                        </div>
                      )}

                      {/* Worker Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-medium text-slate-200 truncate">
                            {workerName}
                          </p>

                          <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700/80 text-[8px] uppercase tracking-wide text-slate-400 shrink-0">
                            {workerRole}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                          <Mail className="w-2.5 h-2.5 shrink-0" />
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
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />

            <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
              Target Deadline
            </span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 bg-[#0b1220] border border-slate-800 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />

            <span className="text-sm text-slate-300">
              {formatDate(dueDate)}
            </span>
          </div>
        </div>

        {/* Location */}
        {siteLocation && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />

              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                Work Location
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 bg-[#0b1220] border border-slate-800 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {siteLocation.name || "Unspecified Location"}
                  </p>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Radio className="w-3 h-3 text-emerald-400" />

                    <span className="text-[11px] text-slate-500">
                      Radius:{" "}
                      <span className="text-slate-400 font-medium">
                        {siteLocation.radiusInMeters || 100}m
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              {siteLocation.latitude && siteLocation.longitude && (
                <a
                  href={`https://maps.google.com/?q=${siteLocation.latitude},${siteLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Maps"
                  className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------
          Card Footer
      -------------------------------- */}
      <div className="px-5 py-4 bg-[#0d1422] border-t border-slate-800">
        <div className="flex items-center gap-2">
          {/* View Details */}
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(task)}
            className="flex-1 h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <span>View Details</span>

            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDeleteTask(_id || task.id)}
            title="Delete Task"
            className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerTaskCard;