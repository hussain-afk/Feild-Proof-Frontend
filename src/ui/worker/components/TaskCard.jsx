import { useRef, useState } from "react";
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
  if (
    latitude === "" ||
    latitude == null ||
    longitude === "" ||
    longitude == null
  )
    return false;

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

const BADGE_STYLE =
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium";

const WorkerTaskCard = ({ task, onCheckIn, onCheckOut }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [actionError, setActionError] = useState("");

  const processingRef = useRef(false);

  // -----------------------------
  // STATUS
  // -----------------------------
  const myProgress = task?.myProgress;
  const taskDone = task?.status === "completed";
  const taskRejected = task?.status === "rejected";
  const taskApproved = task?.status === "approved";

  const hasCheckedOut = myProgress ? myProgress === "checked_out" : taskDone;

  const isCheckedIn = myProgress
    ? myProgress === "checked_in"
    : task?.status === "in-progress" ||
      task?.status === "in_progress" ||
      Boolean(task?.isCheckedIn);

  const isLocked = hasCheckedOut || taskApproved || taskRejected;

  const getStatusBadge = () => {
    if (taskDone) {
      return (
        <span
          className={`${BADGE_STYLE} border-emerald-500/25 bg-emerald-500/10 text-emerald-300`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      );
    }

    if (taskApproved) {
      return (
        <span
          className={`${BADGE_STYLE} border-emerald-500/25 bg-emerald-500/10 text-emerald-300`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    }

    if (taskRejected) {
      return (
        <span
          className={`${BADGE_STYLE} border-rose-500/25 bg-rose-500/10 text-rose-300`}
        >
          <X className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    }

    if (hasCheckedOut) {
      return (
        <span
          className={`${BADGE_STYLE} border-emerald-500/25 bg-emerald-500/10 text-emerald-300`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          You checked out
        </span>
      );
    }

    if (isCheckedIn) {
      return (
        <span
          className={`${BADGE_STYLE} border-sky-500/25 bg-sky-500/10 text-sky-300`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          Checked in
        </span>
      );
    }

    return (
      <span
        className={`${BADGE_STYLE} border-amber-500/25 bg-amber-500/10 text-amber-300`}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Pending check-in
      </span>
    );
  };

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
    e.target.value = "";
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
    if (processingRef.current || isLocked || !imageFile) return;

    processingRef.current = true;
    setIsProcessing(true);
    setActionError("");

    try {
      if (isCheckedIn) {
        await onCheckOut?.(task._id, imageFile);
      } else {
        await onCheckIn?.(task._id, imageFile);
      }

      handleRemoveImage();
    } catch (error) {
      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  const disabled = isProcessing || isLocked || !imageFile;

  return (
    <div className="group flex w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220] transition-all duration-200 hover:border-slate-700/80">
      {/* ================= HEADER ================= */}
      <div className="border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Field task
            </p>
            <h3 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
              {task?.title || "Untitled task"}
            </h3>
            <p className="mt-0.5 font-mono text-[10px] text-slate-600">
              ID: #{task?._id?.slice(-6) || "N/A"}
            </p>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="px-5 pt-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
          {task?.description ||
            "No description provided for this field assignment."}
        </p>
      </div>

      {/* ================= LOCATION ================= */}
      <div className="px-5 pt-4">
        <div className="rounded-xl border border-slate-800/80 bg-[#0a0f1a] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
                <MapPin className="h-4 w-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Work location
                </p>
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
                rel="noopener noreferrer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/80 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                title="Open Google Maps"
                aria-label="Open in Google Maps"
              >
                <MapIcon className="h-4 w-4" />
              </a>
            )}
          </div>

          {hasLocation ? (
            <div className="mt-3.5 grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-3.5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Latitude
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {formatCoordinate(location.latitude)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Longitude
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {formatCoordinate(location.longitude)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Radius
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {location.radiusInMeters ?? 100}m
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3.5 border-t border-slate-800/80 pt-3.5 text-xs text-slate-500">
              Your distance from a site is not checked for this task.
            </p>
          )}
        </div>
      </div>

      {/* ================= TASK INFORMATION ================= */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800/60 bg-[#0a0f1a]/60 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                Due date
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-300">
                {formatDate(task?.dueDate)}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-800/60 bg-[#0a0f1a]/60 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80">
              <User className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                Assigned by
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-300">
                {task?.createdBy?.name ||
                  task?.createdBy?.username ||
                  "Manager"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= IMAGE UPLOAD ================= */}
      {!isLocked && (
        <div className="px-5 pb-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {isCheckedIn
              ? "Completion / check-out proof photo"
              : "Check-in arrival photo"}
            <span className="normal-case tracking-normal text-rose-400">
              {" "}
              * required
            </span>
          </p>

          {!imageFile ? (
            <label className="group flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-700/80 bg-[#0a0f1a] px-3.5 transition-all hover:border-sky-500/50 focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/15">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10">
                  <Camera className="h-4 w-4 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-300 transition group-hover:text-sky-300">
                    {isCheckedIn
                      ? "Select work proof photo"
                      : "Select site arrival photo"}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    JPG, PNG or WEBP · max {MAX_IMAGE_MB} MB
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-medium text-sky-400">
                Choose
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          ) : (
            <div className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-sky-500/30 bg-[#0a0f1a] px-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10">
                  <ImageIcon className="h-4 w-4 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-300">
                    {imageFile.name}
                  </p>
                  <p className="text-[10px] text-emerald-400">Photo selected</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isProcessing}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                title="Remove photo"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {imageError && (
            <p role="alert" className="mt-2 text-xs text-rose-400">
              {imageError}
            </p>
          )}
        </div>
      )}

      {/* ================= ACTION BUTTON ================= */}
      <div className="border-t border-slate-800/80 bg-[#0a0f1a]/40 px-5 py-4">
        <button
          type="button"
          onClick={handleActionClick}
          disabled={disabled}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all ${
            isLocked
              ? "cursor-not-allowed border border-slate-700/80 bg-slate-800/60 text-slate-500"
              : !imageFile
                ? "cursor-not-allowed border border-slate-700/80 bg-slate-800/60 text-slate-500"
                : isCheckedIn
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-[0.99]"
                  : "bg-sky-600 text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500 active:scale-[0.99]"
          }`}
        >
          {taskRejected ? (
            <>
              <X className="h-4 w-4 text-rose-400" />
              Task rejected
            </>
          ) : taskApproved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Task approved
            </>
          ) : hasCheckedOut ? (
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
              {isCheckedIn
                ? "Upload work proof to check out"
                : "Upload photo to enable check-in"}
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

        {actionError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">{actionError}</span>
          </div>
        )}

        {!isLocked && !imageFile && !actionError && (
          <p className="mt-2.5 text-center text-[11px] text-amber-400/80">
            Please capture or attach a proof photo first.
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkerTaskCard;