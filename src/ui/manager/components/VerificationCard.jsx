import { useState } from "react";
import {
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Clock,
  ExternalLink,
  Camera,
  Compass,
  Trash2,
  Loader2,
} from "lucide-react";

const MAX_REASON_LENGTH = 300;

const formatCoordinates = (point) => {
  const latitude = Number(point?.latitude);
  const longitude = Number(point?.longitude);

  if (!point || Number.isNaN(latitude) || Number.isNaN(longitude)) return "N/A";
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

const VerificationCard = ({
  verificationData,
  onApprove,
  onReject,
  onDeleteVerification,
}) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const data = Array.isArray(verificationData)
    ? verificationData[0]
    : verificationData;

  if (!data) {
    return (
      <div className="w-full rounded-2xl border border-slate-800/80 bg-[#0c1220] p-5 text-center text-xs text-slate-500">
        No verification data available.
      </div>
    );
  }

  const {
    _id,
    checkIn,
    checkOut,
    task,
    worker,
    totalHours,
    isVerified,
  } = data;

  const hasCheckIn = Boolean(
    checkIn?.time && checkIn?.photoUrl?.length > 0
  );

  const hasCheckOut = Boolean(
    checkOut?.time && checkOut?.photoUrl?.length > 0
  );

  const isEligibleForReview = hasCheckIn && hasCheckOut;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Pending";

    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const checkInPhoto = Array.isArray(checkIn?.photoUrl)
    ? checkIn?.photoUrl[0]
    : checkIn?.photoUrl;

  const checkOutPhoto = Array.isArray(checkOut?.photoUrl)
    ? checkOut?.photoUrl[0]
    : checkOut?.photoUrl;

  const openImage = (imageUrl) => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  const openRejectForm = () => {
    setReasonError("");
    setIsRejecting(true);
  };

  const closeRejectForm = () => {
    setIsRejecting(false);
    setReason("");
    setReasonError("");
  };

  const handleRejectSubmit = async (event) => {
    event.preventDefault();

    const cleanReason = reason.trim();
    if (!cleanReason) {
      setReasonError("Please write the reason for rejecting.");
      return;
    }

    setSubmitting(true);
    setReasonError("");

    try {
      await (onReject && onReject(data, cleanReason));
      closeRejectForm();
    } catch (error) {
      setReasonError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not reject. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto my-3 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220] transition-all duration-200 hover:border-slate-700/80">
      {/* =====================================================
          1. HEADER
      ====================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0a0f1a] px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-sky-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Field Audit
          </span>

          <span className="shrink-0 font-mono text-[11px] text-slate-500">
            #{_id?.slice(-8)}
          </span>

          <h2 className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
            {task?.title || "Untitled Assignment"}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
              isVerified
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/25 bg-amber-500/10 text-amber-300"
            }`}
          >
            {isVerified ? "Verified" : "Pending Review"}
          </span>

          <button
            onClick={() => onDeleteVerification && onDeleteVerification(data)}
            type="button"
            title="Delete Verification"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* =====================================================
          2. WORKER & LOCATION
      ====================================================== */}
      <div className="grid grid-cols-1 border-b border-slate-800/80 bg-[#0a0f1a]/60 sm:grid-cols-2">
        {/* Worker */}
        <div className="flex items-center gap-3 border-b border-slate-800/60 px-5 py-3.5 sm:border-b-0 sm:border-r sm:border-slate-800/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/80 text-slate-400">
            {worker?.avatar ? (
              <img
                src={worker.avatar}
                alt={worker?.name ? `${worker.name} avatar` : "User avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Field Worker
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-200">
              {worker?.name || "Worker"}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {worker?.email || "No email provided"}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
            <MapPin className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Assigned Location
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-200">
              {task?.siteLocation?.name || "Location N/A"}
            </p>
            <p className="text-[11px] text-slate-500">
              Geofence:{" "}
              <span className="font-medium text-slate-400">
                {task?.siteLocation?.radiusInMeters || 100}m
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          3. CHECK-IN / CHECK-OUT PANELS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-3 bg-[#0c1220] p-4 sm:grid-cols-2">
        {/* CHECK-IN */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#0a0f1a] p-3.5">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Check-In Arrival
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {formatDate(checkIn?.time)}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#070a12] px-3 py-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                <Compass className="h-3 w-3 text-slate-400" />
                GPS
              </span>
              <span className="truncate font-mono text-slate-300">
                {formatCoordinates(checkIn)}
              </span>
            </div>
          </div>

          {checkInPhoto ? (
            <div className="mt-1 flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-[#070a12]/60 p-2">
              <img
                src={checkInPhoto}
                alt="Arrival Thumbnail"
                className="h-10 w-10 rounded-lg border border-slate-700 object-cover"
              />
              <button
                type="button"
                onClick={() => openImage(checkInPhoto)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-500/25 bg-sky-500/10 py-2 text-[11px] font-medium text-sky-300 transition hover:bg-sky-500/20 active:scale-[0.99]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Arrival Photo
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 py-3 text-[11px] font-medium text-slate-600">
              <Camera className="h-3.5 w-3.5" />
              No Arrival Photo Uploaded
            </div>
          )}
        </div>

        {/* CHECK-OUT */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#0a0f1a] p-3.5">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span
                className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${
                  hasCheckOut ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasCheckOut ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                Check-Out Departure
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {checkOut?.time ? formatDate(checkOut.time) : "Pending"}
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-800/80 bg-[#070a12] px-3 py-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                <Compass className="h-3 w-3 text-slate-400" />
                GPS
              </span>
              <span className="truncate font-mono text-slate-300">
                {formatCoordinates(checkOut)}
              </span>
            </div>
          </div>

          {checkOutPhoto ? (
            <div className="mt-1 flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-[#070a12]/60 p-2">
              <img
                src={checkOutPhoto}
                alt="Departure Thumbnail"
                className="h-10 w-10 rounded-lg border border-slate-700 object-cover"
              />
              <button
                type="button"
                onClick={() => openImage(checkOutPhoto)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 py-2 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-500/20 active:scale-[0.99]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Departure Photo
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-500/20 bg-amber-500/5 py-3 text-[11px] font-medium text-amber-400/80">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Check-Out Photo Missing
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          4. WORKING HOURS
      ====================================================== */}
      <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#0a0f1a]/60 px-5 py-2.5">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11px] font-medium">Logged Working Time</span>
        </div>
        <span className="rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 font-mono text-xs font-semibold text-white">
          {totalHours || 0} Hours
        </span>
      </div>

      {/* =====================================================
          5. APPROVAL CONTROLS
      ====================================================== */}
      <div className="border-t border-slate-800/80 bg-[#0a0f1a]/40 p-4">
        {!isEligibleForReview && (
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-[11px] text-amber-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">
              Manager review disabled. Both Check-In and Check-Out must be
              completed with photo proof.
            </span>
          </div>
        )}

        {isRejecting ? (
          <form onSubmit={handleRejectSubmit} className="space-y-3">
            <label
              htmlFor={`reject-reason-${_id}`}
              className="block text-[11px] font-medium uppercase tracking-wider text-slate-400"
            >
              Reason for rejection{" "}
              <span className="normal-case tracking-normal text-rose-400">
                *
              </span>
            </label>

            <textarea
              id={`reject-reason-${_id}`}
              required
              autoFocus
              rows={3}
              maxLength={MAX_REASON_LENGTH}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError("");
              }}
              placeholder="Why are you rejecting this verification?"
              className="w-full resize-none rounded-xl border border-slate-700/80 bg-[#070a12] px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/15"
            />

            {reasonError && (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-[11px] text-rose-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {reasonError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={closeRejectForm}
                disabled={submitting}
                className="flex h-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/60 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-rose-600 text-xs font-medium text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Confirm Reject
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={openRejectForm}
              disabled={!isEligibleForReview}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition ${
                !isEligibleForReview
                  ? "cursor-not-allowed border-slate-800 bg-slate-800/40 text-slate-600"
                  : "border-rose-500/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 active:scale-[0.99]"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Reject Verification
            </button>

            <button
              type="button"
              onClick={() => onApprove && onApprove(data)}
              disabled={!isEligibleForReview}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-medium transition ${
                !isEligibleForReview
                  ? "cursor-not-allowed bg-slate-800/40 text-slate-600"
                  : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-[0.99]"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationCard;