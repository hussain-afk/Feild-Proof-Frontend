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
    Trash2
} from 'lucide-react';
import useTasks from '../../../hooks/useTasks.jsx';

function ManagerTaskCard({ task, onViewDetails }) {
    // Provided JSON structure destructured
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

    // Status Badge Helper
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                    </span>
                );
            case 'in-progress':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Clock className="w-3 h-3 animate-spin" />
                        In Progress
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Pending
                    </span>
                );
        }
    };

    const onDeleteTask = async (taskId) => {
        await handleDeleteTask(taskId);
    }

    // Date Formatter
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="w-full bg-[#111827] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group">

            {/* Header: Title & Status */}
            <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {title || 'Untitled Task'}
                    </h3>
                    <div className="shrink-0">
                        {getStatusBadge(status)}
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {description || 'No description provided.'}
                </p>
            </div>

            {/* Meta Specs */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs">

                {/* Worker Info */}
                <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                            <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <span className="text-slate-500 text-[10px] block leading-none">Assigned Worker</span>
                            <span className="font-medium text-slate-200">
                                {assignedWorker?.name || 'Unassigned'}
                            </span>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[11px]">{formatDate(dueDate)}</span>
                    </div>
                </div>

                {/* Site Location Geo-Fence Box */}
                {siteLocation && (
                    <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                            <div className="truncate">
                                <span className="text-slate-200 font-medium text-xs block truncate">
                                    {siteLocation.name || 'Site Location'}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                    Geo-Fence Radius: {siteLocation.radiusInMeters || 100}m
                                </span>
                            </div>
                        </div>

                        {/* Google Maps External Direction Link */}
                        {siteLocation.latitude && siteLocation.longitude && (
                            <a
                                href={`https://maps.google.com/?q=${siteLocation.latitude},${siteLocation.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all shrink-0"
                                title="View on Google Maps"
                            >
                                <Navigation className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                )}

            </div>

            {/* Card Actions Footer */}
            <div className="flex items-center gap-2 pt-4 mt-2">
                <button
                    type="button"
                    onClick={() => onViewDetails && onViewDetails(task)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-700/50"
                >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>

                {/* Delete Task Button */}
                <button
                    type="button"
                    onClick={() => onDeleteTask(_id || task.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl transition-all shrink-0"
                    title="Delete Task"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

        </div>
    );
}

export default ManagerTaskCard;