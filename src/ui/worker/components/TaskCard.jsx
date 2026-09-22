import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  User,
  Navigation,
  CheckCircle2,
  Clock3,
  Map,
  Camera,
  X,
  UploadCloud,
  Image as ImageIcon,
  LogOut
} from "lucide-react";

const WorkerTaskCard = ({ task, onCheckIn, onCheckOut }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Status Check Helpers
  const isCompleted = task?.status === "completed";
  const isCheckedIn = task?.status === "in_progress" || task?.status === "in-progress" || task?.isCheckedIn;

  // Status Badges
  const getStatusBadge = (status) => {
    if (status === "completed") {
      return { text: "Completed", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
    if (status === "in-progress" || status === "in_progress") {
      return { text: "Checked In (In Progress)", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    }
    return { text: "Pending Check-In", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
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
    if (value === undefined || value === null || value === "") return "N/A";
    const number = Number(value);
    return Number.isNaN(number) ? "N/A" : number.toFixed(4);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      console.log(`📸 Image Selected for ${isCheckedIn ? "Check-Out" : "Check-In"}:`, {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        rawFile: file,
      });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Action Click Handler (Check-In & Check-Out Both Require Image)
  const handleActionClick = async () => {
    if (isLocating || isCompleted || !imageFile) return;

    setIsLocating(true);
    try {
      if (!isCheckedIn) {
        // --- CHECK IN ACTION ---
        if (onCheckIn) {
          await onCheckIn(task._id, imageFile);
        }
      } else {
        // --- CHECK OUT ACTION ---
        if (onCheckOut) {
          await onCheckOut(task._id, imageFile);
        }
      }
      handleRemoveImage(); // Reset photo state after successful submission
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setIsLocating(false);
    }
  };

  const status = getStatusBadge(task?.status);
  const latitude = task?.siteLocation?.latitude;
  const longitude = task?.siteLocation?.longitude;
  const mapsUrl = latitude && longitude ? `https://maps.google.com/?q=${latitude},${longitude}` : null;

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700">
      
      {/* HEADER */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
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

          <span className={`shrink-0 px-2.5 py-1 rounded-md border text-[10px] font-semibold uppercase tracking-wide ${status.className}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="px-5 pt-4">
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
          {task?.description || "No description provided for this field assignment."}
        </p>
      </div>

      {/* LOCATION */}
      <div className="px-5 pt-4">
        <div className="bg-[#0b1220] border border-slate-800 rounded-lg p-4">
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

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-600">Latitude</p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">{formatCoordinate(latitude)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-600">Longitude</p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">{formatCoordinate(longitude)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-600">Radius</p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">{task?.siteLocation?.radiusInMeters ?? 100}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* TASK INFORMATION */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-600">Due Date</p>
              <p className="text-xs text-slate-300 mt-0.5">{formatDate(task?.dueDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-600">Assigned By</p>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {task?.createdBy?.name || task?.createdBy?.username || "Manager"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC PROOF PHOTO UPLOAD BOX (Both Check-in & Check-out Require Photo) */}
      {!isCompleted && (
        <div className="px-5 pb-3">
          <label className="block text-[10px] uppercase tracking-wide font-semibold mb-2 text-slate-300">
            {isCheckedIn ? "Completion / Check-Out Proof Photo" : "Check-In Arrival Photo"}{" "}
            <span className="text-rose-500">* (Required)</span>
          </label>

          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 hover:border-blue-500/80 bg-[#0b1220] rounded-xl cursor-pointer transition-all group">
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400">
                <Camera className="w-5 h-5" />
                <span className="text-xs font-medium">
                  {isCheckedIn ? "Take Photo of Completed Work" : "Take Photo of Site Arrival"}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1">JPG, PNG or WEBP</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-blue-500/40 bg-[#0b1220]">
              <img src={imagePreview} alt="Proof Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-3">
                <div className="flex items-center gap-2 text-white text-xs font-medium bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate max-w-[150px]">{imageFile?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC ACTION BUTTON */}
      <div className="px-5 pb-5">
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
              {isCheckedIn ? "Upload Work Proof to Check Out" : "Upload Photo to Enable Check-In"}
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
            ⚠️ Please capture or attach proof photo first.
          </p>
        )}
      </div>

    </div>
  );
};

export default WorkerTaskCard;