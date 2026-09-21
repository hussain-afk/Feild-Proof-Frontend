import React, { useContext, useState } from "react";
import { context } from "../../../context/context";
import WorkerTaskCard from "./TaskCard";
import {
  Bell,
  CheckCircle2,
  MapPin,
  Clock,
  User,
  Inbox,
  X,
  Sparkles
} from "lucide-react";
import Modal from "../../Modal";

function WorkerDashboard() {
  const { myTasks, notifications } = useContext(context);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  const handleCheckIn = (task) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Worker Lat/Lng:", latitude, longitude);
        // verifyCheckInAPI({ taskId: task._id, latitude, longitude });
      },
      () => {
        alert("Please enable GPS/Location permission to check in.");
      }
    );
  };

  const tasks = Array.isArray(myTasks) ? myTasks : [];
  const notificationsList = Array.isArray(notifications) ? notifications : [];

  // Unread count calculate karne ke liye
  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  // Date/Time Formatter Function
  const formatTimeAgo = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <div className="min-h-screen text-slate-100 p-4 sm:p-6 lg:p-8 bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Top Header Bar */}
          <div className="flex items-center justify-between bg-[#111827] border border-slate-800/80 p-5 rounded-2xl shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  My Field Tasks
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tasks.length} Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage your daily site check-ins and field assignments.
              </p>
            </div>

            {/* Notification Bell Button with Unread Badge */}
            <button
              onClick={() => setNotificationsModalOpen(true)}
              className="relative p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 group"
              title="Notifications"
            >
              <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-4 ring-[#0b0f19] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Tasks Grid / Empty State */}
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <WorkerTaskCard
                  key={task._id}
                  task={task}
                  onCheckIn={handleCheckIn}
                />
              ))}
            </div>
          ) : (
            <div className="min-h-[350px] flex items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-[#111827]/50 backdrop-blur-sm p-8">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400 mb-4 shadow-lg shadow-blue-500/5">
                  <Inbox className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-200">
                  No Tasks Assigned
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You are all caught up! New site tasks assigned by your manager will appear here in real-time.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Enhanced Notification Modal */}
      <Modal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        title="Notifications"
      >
        <div className="p-4 sm:p-5 bg-[#111827] max-h-[70vh] overflow-y-auto space-y-3 font-sans">
          {notificationsList.length > 0 ? (
            <div className="space-y-2.5">
              {notificationsList.map((notification) => (
                <div
                  key={notification._id || notification.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 relative ${!notification.isRead
                      ? "bg-slate-900/80 border-blue-500/40 shadow-sm"
                      : "bg-slate-900/30 border-slate-800/80"
                    }`}
                >
                  {/* Header: Status Dot, Title & Time */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {!notification.isRead ? (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
                      )}
                      <h4 className="text-xs font-semibold text-white truncate tracking-tight">
                        {notification.title}
                      </h4>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-2.5 pl-4">
                    {notification.message}
                  </p>

                  {/* Footer Details: Sender & Location Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] pl-4">
                    <span className="text-slate-400 text-[10px]">
                      By: <span className="text-slate-200 font-medium">{notification.sender?.name || "Manager"}</span>
                    </span>

                    {notification.task?.siteLocation?.name && (
                      <div className="flex items-center gap-1 text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {notification.task.siteLocation.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Clean Empty State */
            <div className="py-10 text-center">
              <div className="w-10 h-10 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-center mx-auto text-slate-400 mb-2.5">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                No notifications available
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default WorkerDashboard;