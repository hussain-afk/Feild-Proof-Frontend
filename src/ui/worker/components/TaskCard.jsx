import React, { useState } from "react";

import {
  MapPin,
  Calendar,
  User,
  Navigation,
  CheckCircle2,
  Clock3,
  Map,
} from "lucide-react";

const WorkerTaskCard = ({ task, onCheckIn }) => {
  const [isLocating, setIsLocating] = useState(false);

  // =========================================
  // STATUS
  // =========================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return {
          text: "Completed",
          className:
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };

      case "in-progress":
      case "in_progress":
        return {
          text: "In Progress",
          className:
            "bg-blue-500/10 text-blue-400 border-blue-500/20",
        };

      case "pending":
      default:
        return {
          text: "Pending",
          className:
            "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
    }
  };

  // =========================================
  // DATE FORMAT
  // =========================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "No due date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================
  // COORDINATE FORMAT
  // =========================================

  const formatCoordinate = (value) => {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "N/A";
    }

    return number.toFixed(4);
  };

  // =========================================
  // CHECK IN
  // =========================================

  const handleCheckInClick = async () => {
    if (isLocating || task.status === "completed") {
      return;
    }

    setIsLocating(true);

    try {
      if (onCheckIn) {
        await onCheckIn(task);
      } else {
        console.log("Checking in for task:", task?._id);
      }
    } catch (error) {
      console.error("Check-in error:", error);
    } finally {
      setTimeout(() => {
        setIsLocating(false);
      }, 1000);
    }
  };

  // =========================================
  // STATUS DATA
  // =========================================

  const status = getStatusBadge(task?.status);

  const isCompleted = task?.status === "completed";

  const latitude = task?.siteLocation?.latitude;
  const longitude = task?.siteLocation?.longitude;

  const hasLocation =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null;

  const mapsUrl = hasLocation
    ? `https://maps.google.com/?q=${latitude},${longitude}`
    : null;

  // =========================================
  // UI
  // =========================================

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="p-5 border-b border-slate-800">

        <div className="flex items-start justify-between gap-3">

          {/* Task Info */}

          <div className="min-w-0">

            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Field Task
            </p>

            <h3 className="text-base sm:text-lg font-semibold text-white truncate">
              {task?.title || "Untitled Task"}
            </h3>

            <p className="text-[10px] font-mono text-slate-600 mt-1">
              ID: #{task?._id?.slice(-6) || "N/A"}
            </p>

          </div>

          {/* Status */}

          <span
            className={`shrink-0 px-2.5 py-1 rounded-md border text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.text}
          </span>

        </div>

      </div>

      {/* =========================================
          DESCRIPTION
      ========================================= */}

      <div className="px-5 pt-4">

        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
          {task?.description ||
            "No description provided for this field assignment."}
        </p>

      </div>

      {/* =========================================
          LOCATION
      ========================================= */}

      <div className="px-5 pt-4">

        <div className="bg-[#0b1220] border border-slate-800 rounded-lg p-4">

          {/* Location Header */}

          <div className="flex items-start justify-between gap-3">

            <div className="flex items-start gap-3 min-w-0">

              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">

                <MapPin className="w-4 h-4 text-blue-400" />

              </div>

              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Work Location
                </p>

                <p className="text-sm font-medium text-slate-200 truncate mt-0.5">
                  {task?.siteLocation?.name ||
                    "Location not specified"}
                </p>

              </div>

            </div>

            {/* Map Button */}

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 w-8 h-8 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                title="Open Google Maps"
              >
                <Map className="w-3.5 h-3.5 text-slate-300" />
              </a>
            )}

          </div>

          {/* Coordinates */}

          <div className="grid grid-cols-3 gap-2 mt-4">

            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-600">
                Latitude
              </p>

              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {formatCoordinate(latitude)}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-600">
                Longitude
              </p>

              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {formatCoordinate(longitude)}
              </p>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-600">
                Radius
              </p>

              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {task?.siteLocation?.radiusInMeters ?? 100}m
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          TASK INFORMATION
      ========================================= */}

      <div className="px-5 py-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* DUE DATE */}

          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">

              <Calendar className="w-3.5 h-3.5 text-slate-400" />

            </div>

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-wide text-slate-600">
                Due Date
              </p>

              <p className="text-xs text-slate-300 mt-0.5">
                {formatDate(task?.dueDate)}
              </p>

            </div>

          </div>

          {/* CREATED BY */}

          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">

              <User className="w-3.5 h-3.5 text-slate-400" />

            </div>

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-wide text-slate-600">
                Assigned By
              </p>

              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {task?.createdBy?.name ||
                  task?.createdBy?.username ||
                  "Manager"}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          CHECK IN BUTTON
      ========================================= */}

      <div className="px-5 pb-5">

        <button
          type="button"
          onClick={handleCheckInClick}
          disabled={isLocating || isCompleted}
          className={`w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            isCompleted
              ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
              : isLocating
              ? "bg-blue-600/70 text-white cursor-wait"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >

          {/* COMPLETED */}

          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />

              Task Completed
            </>
          ) : isLocating ? (
            <>
              <Navigation className="w-4 h-4 animate-spin" />

              Verifying Location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />

              Check In
            </>
          )}

        </button>

        {/* Small helper text */}

        {!isCompleted && !isLocating && (
          <p className="text-center text-[10px] text-slate-600 mt-2">
            Your location will be verified before check-in.
          </p>
        )}

        {isLocating && (
          <div className="flex items-center justify-center gap-1.5 mt-2">

            <Clock3 className="w-3 h-3 text-blue-400" />

            <p className="text-[10px] text-blue-400">
              Checking your current location...
            </p>

          </div>
        )}

      </div>

    </div>
  );
};

export default WorkerTaskCard;