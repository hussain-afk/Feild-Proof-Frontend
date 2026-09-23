import React from "react";
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
} from "lucide-react";

const VerificationCard = ({
  verificationData,
  onApprove,
  onReject,
}) => {
  const data = Array.isArray(verificationData)
    ? verificationData[0]
    : verificationData;

  if (!data) {
    return (
      <div className="w-full rounded-xl border border-slate-800 bg-[#0f172a] p-4 text-center text-xs text-slate-400 font-mono">
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

  // Verification Conditions Check
  const hasCheckIn = Boolean(checkIn?.time && checkIn?.photoUrl?.length > 0);
  const hasCheckOut = Boolean(checkOut?.time && checkOut?.photoUrl?.length > 0);
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

  return (
    <div className="mx-auto my-3 w-full max-w-3xl overflow-hidden rounded-xl border border-slate-800/90 bg-[#0f172a] shadow-xl transition-all hover:border-slate-700">

      {/* 1. AUDIT HEADER */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/90 bg-[#0b1220] px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Field Audit
          </span>
          <span className="shrink-0 text-[11px] font-mono text-slate-500">
            #{_id?.slice(-8)}
          </span>
          <h2 className="truncate text-sm font-bold text-white sm:text-base">
            {task?.title || "Untitled Assignment"}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            isVerified
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
          }`}
        >
          {isVerified ? "Verified" : "Pending Review"}
        </span>
      </div>

      {/* 2. WORKER & SITE LOCATION BAR */}
      <div className="grid grid-cols-1 border-b border-slate-800 bg-[#080d1a] sm:grid-cols-2">
        {/* Worker Info */}
        <div className="flex items-center gap-3 border-b border-slate-800/70 px-4 py-2.5 sm:border-b-0 sm:border-r">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700/50">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Field Worker</p>
            <p className="truncate text-xs font-semibold text-slate-200">
              {worker?.name || "Worker"}
            </p>
            <p className="truncate text-[10px] text-slate-500">{worker?.email || "No email provided"}</p>
          </div>
        </div>

        {/* Site Location */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-blue-400 border border-slate-700/50">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Assigned Location</p>
            <p className="truncate text-xs font-semibold text-slate-200">
              {task?.siteLocation?.name || "Location N/A"}
            </p>
            <p className="text-[10px] font-mono text-slate-500">
              Geofence Radius: {task?.siteLocation?.radiusInMeters || 100}m
            </p>
          </div>
        </div>
      </div>

      {/* 3. CHECK-IN vs CHECK-OUT PROOF PANELS */}
      <div className="grid grid-cols-1 gap-3 p-3.5 sm:grid-cols-2 bg-[#0d1424]">
        
        {/* CHECK-IN CARD */}
        <div className="rounded-lg border border-slate-800 bg-[#080d1a] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Check-In Arrival
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {formatDate(checkIn?.time)}
              </span>
            </div>

            {/* GPS Metadata */}
            <div className="mb-2.5 flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-[10px] font-mono text-slate-300">
              <span className="flex items-center gap-1 text-[9px] uppercase font-semibold text-slate-500">
                <Compass className="h-3 w-3 text-slate-400" /> GPS Coordinates
              </span>
              <span className="truncate text-slate-300">
                {checkIn?.latitude
                  ? `${checkIn.latitude.toFixed(4)}, ${checkIn.longitude.toFixed(4)}`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Photo Action */}
          {checkInPhoto ? (
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-1.5">
              <img
                src={checkInPhoto}
                alt="Arrival Thumbnail"
                className="h-9 w-9 rounded object-cover border border-slate-700"
              />
              <button
                type="button"
                onClick={() => openImage(checkInPhoto)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 py-1.5 text-[10px] font-semibold text-blue-400 transition hover:bg-blue-500/20 active:scale-[0.99]"
              >
                <ExternalLink className="h-3 w-3" />
                View Arrival Photo
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-800 py-2.5 text-[10px] text-slate-600 font-medium">
              <Camera className="h-3.5 w-3.5" />
              No Arrival Photo Uploaded
            </div>
          )}
        </div>

        {/* CHECK-OUT CARD */}
        <div className="rounded-lg border border-slate-800 bg-[#080d1a] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
              <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${hasCheckOut ? "text-emerald-400" : "text-amber-400"}`}>
                <span className={`h-2 w-2 rounded-full ${hasCheckOut ? "bg-emerald-500" : "bg-amber-500"}`} />
                Check-Out Departure
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {checkOut?.time ? formatDate(checkOut.time) : "Pending"}
              </span>
            </div>

            {/* GPS Metadata */}
            <div className="mb-2.5 flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-[10px] font-mono text-slate-300">
              <span className="flex items-center gap-1 text-[9px] uppercase font-semibold text-slate-500">
                <Compass className="h-3 w-3 text-slate-400" /> GPS Coordinates
              </span>
              <span className="truncate text-slate-300">
                {checkOut?.latitude
                  ? `${checkOut.latitude.toFixed(4)}, ${checkOut.longitude.toFixed(4)}`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Photo Action */}
          {checkOutPhoto ? (
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-1.5">
              <img
                src={checkOutPhoto}
                alt="Departure Thumbnail"
                className="h-9 w-9 rounded object-cover border border-slate-700"
              />
              <button
                type="button"
                onClick={() => openImage(checkOutPhoto)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 py-1.5 text-[10px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20 active:scale-[0.99]"
              >
                <ExternalLink className="h-3 w-3" />
                View Departure Photo
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 py-2.5 text-[10px] text-amber-400/80 font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Check-Out Photo Missing
            </div>
          )}
        </div>

      </div>

      {/* 4. TOTAL WORKING HOURS FOOTER */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-[#080d1a] px-4 py-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11px] font-medium">Logged Working Time:</span>
        </div>
        <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
          {totalHours || 0} Hours
        </span>
      </div>

      {/* 5. MANAGER APPROVAL CONTROLS */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        {!isEligibleForReview && (
          <div className="mb-2.5 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span>Manager review disabled. Both Check-In and Check-Out must be completed with photo proof.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onReject && onReject(data)}
            disabled={!isEligibleForReview}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition-all ${
              !isEligibleForReview
                ? "cursor-not-allowed border-slate-800 bg-slate-800/40 text-slate-600"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-[0.99]"
            }`}
          >
            <XCircle className="h-4 w-4" />
            Reject Verification
          </button>

          <button
            type="button"
            onClick={() => onApprove && onApprove(data)}
            disabled={!isEligibleForReview}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all ${
              !isEligibleForReview
                ? "cursor-not-allowed bg-slate-800/40 text-slate-600"
                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-[0.99]"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve Verification
          </button>
        </div>
      </div>

    </div>
  );
};

export default VerificationCard;