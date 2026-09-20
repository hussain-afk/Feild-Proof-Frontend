import React from 'react';
import { 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Navigation,
  ExternalLink,
  Trash2,
  Mail,
  ShieldAlert,
  Radio
} from 'lucide-react';
import useTasks from '../../../hooks/useTasks.jsx';

function ManagerTaskCard({ task, onViewDetails }) {
  const {
    _id,
    title,
    description,
    status = 'pending',
    assignedWorker,
    dueDate,
    siteLocation,
    createdAt
  } = task || {};

  const { handleDeleteTask } = useTasks();

  // Enhanced Status Badges with Pulsing Elements
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  const onDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to remove this field task?')) {
      await handleDeleteTask(taskId);
    }
  };

  // Date Formatter
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#131c2e] to-[#0f172a] border border-slate-800/90 hover:border-blue-500/40 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />

      {/* Header: Title & Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 tracking-tight">
            {title || 'Untitled Field Task'}
          </h3>
          <div className="shrink-0">
            {getStatusBadge(status)}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
          {description || 'No additional field operational notes provided for this assignment.'}
        </p>
      </div>

      {/* Detailed Meta Specifications Box */}
      <div className="space-y-3 pt-3.5 border-t border-slate-800/80 text-xs">
        
        {/* Expanded Assigned Worker Block */}
        <div className="p-3 bg-slate-900/80 border border-slate-800/90 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar / Initials */}
            {assignedWorker?.avatar ? (
              <img 
                src={assignedWorker.avatar} 
                alt={assignedWorker.name} 
                className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0" 
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                {assignedWorker?.name ? assignedWorker.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
            )}

            {/* Worker Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 truncate text-xs">
                  {assignedWorker?.name || 'Unassigned Worker'}
                </span>
                {assignedWorker?.role && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700/80 uppercase tracking-wider shrink-0">
                    {assignedWorker.role}
                  </span>
                )}
              </div>
              
              {/* Worker Email */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate mt-0.5">
                <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{assignedWorker?.email || 'No email registered'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Due Date & Timeline Indicator */}
        <div className="flex items-center justify-between px-1 text-slate-400">
          <span className="text-[11px] text-slate-500 font-medium">Target Deadline</span>
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800/90 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium">{formatDate(dueDate)}</span>
          </div>
        </div>

        {/* Geo-Fence Boundary Panel */}
        {siteLocation && (
          <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 overflow-hidden">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-slate-200 font-medium text-xs block truncate">
                  {siteLocation.name || 'Unspecified Location'}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Fence Radius: <strong className="text-slate-400 font-semibold">{siteLocation.radiusInMeters || 100}m</strong>
                </span>
              </div>
            </div>

            {/* Google Maps External Direction Link */}
            {siteLocation.latitude && siteLocation.longitude && (
              <a
                href={`https://maps.google.com/?q=${siteLocation.latitude},${siteLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700/60 transition-all shrink-0"
                title="Open Location in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
              </a>
            )}
          </div>
        )}

      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center gap-2 pt-4 mt-2">
        <button
          type="button"
          onClick={() => onViewDetails && onViewDetails(task)}
          className="flex-1 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700/60 shadow-sm group-hover:border-blue-500/30"
        >
          <span>View Full Specifications</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
        </button>

        {/* Delete Task Action */}
        <button
          type="button"
          onClick={() => onDeleteTask(_id || task.id)}
          className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl transition-all shrink-0"
          title="Delete Field Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

export default ManagerTaskCard;