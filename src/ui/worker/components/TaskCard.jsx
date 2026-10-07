import { useState } from "react";

import {
  MapPin,
  Calendar,
  User,
  Navigation,
  CheckCircle2,
  Map as MapIcon,
  Camera,
  X,
  UploadCloud,
  Image as ImageIcon,
  LogOut,
  AlertCircle,
} from "lucide-react";

const MAX_IMAGE_MB = 10;

// Task me asli site location hai ya nahi (backend jaisa hi rule: (0, 0) = location nahi)
const hasSiteLocation = (loc) => {
  if (!loc) return false;
  const { latitude, longitude } = loc;
  if (latitude === "" || latitude == null || longitude === "" || longitude == null) return false;

  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
};

const formatDate = (dateValue) => {
  if (!dateValue) return "No due date";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCoordinate = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(4) : "N/A";
};

const BADGE = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  checkedOut: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  inProgress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const WorkerTaskCard = ({ task, onCheckIn, onCheckOut }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [actionError, setActionError] = useState("");

  // -----------------------------
  // STATUS
  // -----------------------------
  // Backend har worker ki apni progress "myProgress" me bhejta hai:
  //   "not_started" | "checked_in" | "checked_out"
  // Ye isliye zaroori hai ke ek task par kai workers ho sakte hain, aur
  // task ka status sab ka milakar hota hai. Agar myProgress na ho to purane tareeqe se task.status dekho.
  const myProgress = task?.myProgress;
  const taskDone = task?.status === "completed";

  const hasCheckedOut = myProgress ? myProgress === "checked_out" : taskDone;

  const isCheckedIn = myProgress
    ? myProgress === "checked_in"
    : task?.status === "in-progress" || task?.status === "in_progress" || Boolean(task?.isCheckedIn);

  const badge = taskDone
    ? { text: "Completed", className: BADGE.completed }
    : hasCheckedOut
      ? { text: "You checked out", className: BADGE.checkedOut }
      : isCheckedIn
        ? { text: "Checked in (in progress)", className: BADGE.inProgress }
        : { text: "Pending check-in", className: BADGE.pending };

  // -----------------------------
  // LOCATION
  // -----------------------------
  const location = task?.siteLocation;
  const hasLocation = hasSiteLocation(location);

  const mapsUrl = hasLocation
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : null;

  // -----------------------------
  // IMAGE
  // -----------------------------
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // wahi file dobara chunne par bhi change event aaye
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(`Photo is too large. Choose one under ${MAX_IMAGE_MB} MB.`);
      return;
    }

    setImageError("");
    setActionError("");
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageError("");
  };

  // -----------------------------
  // CHECK IN / CHECK OUT
  // -----------------------------
  const handleActionClick = async () => {
    if (isProcessing || hasCheckedOut || !imageFile) return;

    setIsProcessing(true);
    setActionError("");

    try {
      if (isCheckedIn) {
        await onCheckOut?.(task._id, imageFile);
      } else {
        await onCheckIn?.(task._id, imageFile);
      }

      // Kamyab hone par photo hata do
      handleRemoveImage();
    } catch (error) {
      // Dashboard ka message (jaise "GPS signal is weak" ya "You are 800m away") card me dikhao
      setActionError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const disabled = isProcessing || hasCheckedOut || !imageFile;

  return (
    <div className="w-full max-w-[520px] overflow-hidden rounded-xl border border-slate-800 bg-[#111827] transition-colors hover:border-slate-700">
      {/* ================= HEADER ================= */}
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-0.5 text-xs text-slate-500">Field task</p>

            <h3 className="truncate text-base font-semibold text-white sm:text-lg">
              {task?.title || "Untitled task"}
            </h3>

            <p className="mt-0.5 font-mono text-[10px] text-slate-600">
              ID: #{task?._id?.slice(-6) || "N/A"}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium ${badge.className}`}
          >
            {badge.text}
          </span>
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="px-4 pt-3">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {task?.description || "No description provided for this field assignment."}
        </p>
      </div>

      {/* ================= LOCATION ================= */}
      <div className="px-4 pt-3">
        <div className="rounded-lg border border-slate-800 bg-[#0b1220] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <MapPin className="h-4 w-4 text-blue-400" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">Work location</p>

                <p className="mt-0.5 truncate text-sm font-medium text-slate-200">
                  {hasLocation
                    ? location?.name || "Site location"
                    : "No site location for this task"}
                </p>
              </div>
            </div>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 transition-colors hover:bg-slate-700"
                title="Open Google Maps"
                aria-label="Open in Google Maps"
              >
                <MapIcon className="h-3.5 w-3.5 text-slate-300" />
              </a>
            )}
          </div>

          {/* Coordinates (sirf tab jab location ho) */}
          {hasLocation ? (
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-800 pt-3">
              <div>
                <p className="text-[10px] text-slate-600">Latitude</p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {formatCoordinate(location.latitude)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-600">Longitude</p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {formatCoordinate(location.longitude)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-600">Radius</p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {location.radiusInMeters ?? 100}m
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-500">
              Your distance from a site is not checked for this task.
            </p>
          )}
        </div>
      </div>

      {/* ================= TASK INFORMATION ================= */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-600">Due date</p>
              <p className="mt-0.5 truncate text-xs text-slate-300">{formatDate(task?.dueDate)}</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
              <User className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-600">Assigned by</p>
              <p className="mt-0.5 truncate text-xs text-slate-300">
                {task?.createdBy?.name || task?.createdBy?.username || "Manager"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= IMAGE UPLOAD ================= */}
      {!hasCheckedOut && (
        <div className="px-4 pb-3">
          <p className="mb-2 text-xs font-medium text-slate-300">
            {isCheckedIn ? "Completion / check-out proof photo" : "Check-in arrival photo"}
            <span className="text-rose-500"> * required</span>
          </p>

          {!imageFile ? (
            <label className="group flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-700 bg-[#0b1220] px-3 transition-all hover:border-blue-500/80">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                  <Camera className="h-4 w-4 text-blue-400" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-300 group-hover:text-blue-400">
                    {isCheckedIn ? "Select work proof photo" : "Select site arrival photo"}
                  </p>
                  <p className="text-[10px] text-slate-600">JPG, PNG or WEBP</p>
                </div>
              </div>

              <span className="shrink-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-medium text-blue-400">
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
            <div className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-blue-500/30 bg-[#0b1220] px-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                  <ImageIcon className="h-4 w-4 text-blue-400" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-300">{imageFile.name}</p>
                  <p className="text-[10px] text-emerald-400">Photo selected</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20"
                title="Remove photo"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {imageError && <p className="mt-2 text-xs text-rose-400">{imageError}</p>}
        </div>
      )}

      {/* ================= ACTION BUTTON ================= */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleActionClick}
          disabled={disabled}
          className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
            hasCheckedOut
              ? "cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500"
              : !imageFile
                ? "cursor-not-allowed border border-slate-700 bg-slate-800/80 text-slate-500"
                : isCheckedIn
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-[0.99]"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.99]"
          }`}
        >
          {hasCheckedOut ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {taskDone ? "Task completed" : "You have checked out"}
            </>
          ) : isProcessing ? (
            <>
              <Navigation className="h-4 w-4 animate-spin" />
              Getting your location...
            </>
          ) : !imageFile ? (
            <>
              <UploadCloud className="h-4 w-4 text-slate-500" />
              {isCheckedIn ? "Upload work proof to check out" : "Upload photo to enable check-in"}
            </>
          ) : isCheckedIn ? (
            <>
              <LogOut className="h-4 w-4" />
              Check out and submit work
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              Check in
            </>
          )}
        </button>

        {/* Error yahin card me dikhta hai, jahan worker dekh raha hai */}
        {actionError && (
          <div
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {!hasCheckedOut && !imageFile && !actionError && (
          <p className="mt-2 text-center text-[11px] text-amber-400/80">
            Please capture or attach a proof photo first.
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkerTaskCard;