import { useState } from "react";

import {
  MapPin,
  Calendar,
  User,
  Navigation,
  CheckCircle2,
  Map,
  Camera,
  X,
  UploadCloud,
  Image as ImageIcon,
  LogOut,
} from "lucide-react";

const WorkerTaskCard = ({ task, onCheckIn, onCheckOut }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // -----------------------------
  // STATUS
  // -----------------------------

  const isCompleted = task?.status === "completed";

  const isCheckedIn =
    task?.status === "in_progress" ||
    task?.status === "in-progress" ||
    task?.isCheckedIn;

  // -----------------------------
  // STATUS BADGE
  // -----------------------------

  const getStatusBadge = (status) => {
    if (status === "completed") {
      return {
        text: "Completed",
        className:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    }

    if (status === "in-progress" || status === "in_progress") {
      return {
        text: "Checked In (In Progress)",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    }

    return {
      text: "Pending Check-In",
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  };

  // -----------------------------
  // DATE
  // -----------------------------

  const formatDate = (dateValue) => {
    if (!dateValue) return "No due date";

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

  // -----------------------------
  // COORDINATES
  // -----------------------------

  const formatCoordinate = (value) => {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }

    const number = Number(value);

    return Number.isNaN(number) ? "N/A" : number.toFixed(4);
  };

  // -----------------------------
  // IMAGE SELECT
  // -----------------------------

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    setImageFile(file);
  };

  // -----------------------------
  // REMOVE IMAGE
  // -----------------------------

  const handleRemoveImage = () => {
    setImageFile(null);
  };

  // -----------------------------
  // CHECK IN / CHECK OUT
  // -----------------------------

  const handleActionClick = async () => {
    if (isLocating || isCompleted || !imageFile) {
      return;
    }

    setIsLocating(true);

    try {
      if (!isCheckedIn) {
        // CHECK IN
        if (onCheckIn) {
          await onCheckIn(task._id, imageFile);
        }
      } else {
        // CHECK OUT
        if (onCheckOut) {
          await onCheckOut(task._id, imageFile);
        }
      }

      // Clear selected image after successful submission
      handleRemoveImage();
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setIsLocating(false);
    }
  };

  const status = getStatusBadge(task?.status);

  const latitude = task?.siteLocation?.latitude;
  const longitude = task?.siteLocation?.longitude;

  const mapsUrl =
    latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : null;

  return (
    <div className="w-full max-w-[520px] bg-[#111827] border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700">

      {/* ================= HEADER ================= */}

      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
              Field Task
            </p>

            <h3 className="text-base sm:text-lg font-semibold text-white truncate">
              {task?.title || "Untitled Task"}
            </h3>

            <p className="text-[10px] font-mono text-slate-600 mt-0.5">
              ID: #{task?._id?.slice(-6) || "N/A"}
            </p>
          </div>

          <span
            className={`shrink-0 px-2.5 py-1 rounded-md border text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.text}
          </span>
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}

      <div className="px-4 pt-3">
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
          {task?.description ||
            "No description provided for this field assignment."}
        </p>
      </div>

      {/* ================= LOCATION ================= */}

      <div className="px-4 pt-3">
        <div className="bg-[#0b1220] border border-slate-800 rounded-lg p-3">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-3 min-w-0">

              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Work Location
                </p>

                <p className="text-sm font-medium text-slate-200 truncate mt-0.5">
                  {task?.siteLocation?.name || "Location not specified"}
                </p>
              </div>
            </div>

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

          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800">

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

      {/* ================= TASK INFORMATION ================= */}

      <div className="px-4 py-3">

        <div className="grid grid-cols-2 gap-3">

          {/* Due Date */}

          <div className="flex items-center gap-2.5 min-w-0">

            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-600">
                Due Date
              </p>

              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {formatDate(task?.dueDate)}
              </p>
            </div>

          </div>

          {/* Assigned By */}

          <div className="flex items-center gap-2.5 min-w-0">

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

      {/* ================= IMAGE UPLOAD ================= */}

      {!isCompleted && (
        <div className="px-4 pb-3">

          <label className="block text-[10px] uppercase tracking-wide font-semibold mb-2 text-slate-300">
            {isCheckedIn
              ? "Completion / Check-Out Proof Photo"
              : "Check-In Arrival Photo"}

            <span className="text-rose-500"> * (Required)</span>
          </label>

          {!imageFile ? (

            <label className="flex items-center justify-between gap-3 w-full h-11 px-3 border border-dashed border-slate-700 hover:border-blue-500/80 bg-[#0b1220] rounded-lg cursor-pointer transition-all group">

              <div className="flex items-center gap-2 min-w-0">

                <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4 text-blue-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 group-hover:text-blue-400 truncate">
                    {isCheckedIn
                      ? "Select Work Proof Photo"
                      : "Select Site Arrival Photo"}
                  </p>

                  <p className="text-[9px] text-slate-600">
                    JPG, PNG or WEBP
                  </p>
                </div>

              </div>

              <span className="text-[10px] font-medium text-blue-400 border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 rounded-md shrink-0">
                Choose
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

            </label>

          ) : (

            /* Selected file - NO IMAGE PREVIEW */

            <div className="flex items-center justify-between gap-3 w-full h-11 px-3 bg-[#0b1220] border border-blue-500/30 rounded-lg">

              <div className="flex items-center gap-2 min-w-0">

                <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">
                    {imageFile.name}
                  </p>

                  <p className="text-[9px] text-emerald-400">
                    Photo selected
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-7 h-7 rounded-md bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 transition"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>

            </div>
          )}
        </div>
      )}

      {/* ================= ACTION BUTTON ================= */}

      <div className="px-4 pb-4">

        <button
          type="button"
          onClick={handleActionClick}
          disabled={isLocating || isCompleted || !imageFile}
          className={`w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            isCompleted
              ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
              : !imageFile
              ? "bg-slate-800/80 border border-slate-700 text-slate-500 cursor-not-allowed"
              : isCheckedIn
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-[0.99]"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.99]"
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Task Completed
            </>
          ) : isLocating ? (
            <>
              <Navigation className="w-4 h-4 animate-spin" />
              Processing Request...
            </>
          ) : !imageFile ? (
            <>
              <UploadCloud className="w-4 h-4 text-slate-500" />
              {isCheckedIn
                ? "Upload Work Proof to Check Out"
                : "Upload Photo to Enable Check-In"}
            </>
          ) : isCheckedIn ? (
            <>
              <LogOut className="w-4 h-4" />
              Check Out & Submit Work
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Check In
            </>
          )}
        </button>

        {!isCompleted && !imageFile && (
          <p className="text-center text-[10px] text-amber-400/80 mt-2">
            Please capture or attach proof photo first.
          </p>
        )}

      </div>
    </div>
  );
};

export default WorkerTaskCard;