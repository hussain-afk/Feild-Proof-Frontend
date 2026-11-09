
import { useContext, useEffect, useId, useRef, useState } from "react";
import {
  Bell,
  MapPin,
  Trash2,
  Inbox,
  Clock3,
  Sparkles,
} from "lucide-react";

import { context } from "../context/context";
import useNotification from "../hooks/useNotification";

const formatTimeAgo = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) return "";

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

function NotificationDropdown() {
  const { notifications } = useContext(context);
  const { handleDeleteNotification } = useNotification();

  const [notifOpen, setNotifOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(72);

  const notifRef = useRef(null);
  const bellRef = useRef(null);
  const panelId = useId();

  const notificationsList = Array.isArray(notifications)
    ? notifications
    : [];

  const unreadCount = notificationsList.filter(
    (notification) => !notification.isRead
  ).length;

  useEffect(() => {
    if (!notifOpen) return;

    const handleOutsideClick = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setNotifOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
        bellRef.current?.focus();
      }
    };

    const updatePosition = () => {
      const rect = bellRef.current?.getBoundingClientRect();

      if (rect) {
        setPanelTop(Math.round(rect.bottom + 10));
      }
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notifOpen]);

  const handleDelete = (event, notificationId) => {
    event.stopPropagation();
    handleDeleteNotification(notificationId);
  };

  return (
    <>
      <div ref={notifRef} className="relative shrink-0">
        {/* Notification Trigger */}
        <button
          ref={bellRef}
          type="button"
          onClick={() => setNotifOpen((open) => !open)}
          aria-haspopup="dialog"
          aria-expanded={notifOpen}
          aria-controls={panelId}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className={`
            group relative flex h-11 w-11 items-center justify-center
            rounded-xl border transition-all duration-200
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-sky-400 focus-visible:ring-offset-2
            focus-visible:ring-offset-[#0b0f17]
            ${
              notifOpen
                ? "border-sky-500/40 bg-sky-500/10 text-sky-400 shadow-lg shadow-sky-950/20"
                : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-sky-500/30 hover:bg-sky-500/[0.08] hover:text-sky-400"
            }
          `}
        >
          <Bell
            className={`h-[19px] w-[19px] transition-transform duration-300 ${
              notifOpen
                ? "rotate-[-12deg]"
                : "group-hover:rotate-[-12deg]"
            }`}
          />

          {unreadCount > 0 && (
            <>
              <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-sky-400" />

              <span className="absolute -right-2 -top-2 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-[#0b0f17] bg-sky-500 px-1 text-[9px] font-bold text-white shadow-lg shadow-sky-500/30">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </button>

        {/* Notification Panel */}
        {notifOpen && (
          <div
            id={panelId}
            role="dialog"
            aria-label="Notifications"
            style={{ "--fp-top": `${panelTop}px` }}
            className="
              fp-notification-panel fixed inset-x-3 z-[100]
              overflow-hidden rounded-2xl
              border border-white/[0.09]
              bg-[#0d1524]/[0.97]
              shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)]
              backdrop-blur-2xl
              top-[var(--fp-top)]
              sm:absolute sm:inset-x-auto sm:right-0
              sm:top-full sm:mt-3 sm:w-[390px]
            "
          >
            {/* Panel Header */}
            <div className="relative overflow-hidden border-b border-white/[0.07] px-5 py-4">
              <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-sky-500/[0.08] blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/[0.08] text-sky-400">
                    <Bell className="h-[18px] w-[18px]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold tracking-wide text-white">
                      Notifications
                    </h2>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Your latest activity and updates
                    </p>
                  </div>
                </div>

                {unreadCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/15 bg-sky-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-sky-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                    All caught up
                  </span>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[min(28rem,65vh)] overflow-y-auto fp-notification-scroll">
              {notificationsList.length > 0 ? (
                <ul className="divide-y divide-white/[0.045]">
                  {notificationsList.map((notification) => {
                    const notificationId =
                      notification._id || notification.id;

                    const isUnread = !notification.isRead;

                    return (
                      <li
                        key={notificationId}
                        className={`
                          group relative flex gap-3 px-5 py-4
                          transition-all duration-200
                          hover:bg-white/[0.035]
                          ${
                            isUnread
                              ? "bg-sky-400/[0.035]"
                              : "bg-transparent"
                          }
                        `}
                      >
                        {/* Notification Icon */}
                        <div
                          className={`
                            mt-0.5 flex h-9 w-9 shrink-0
                            items-center justify-center rounded-xl
                            border
                            ${
                              isUnread
                                ? "border-sky-400/15 bg-sky-400/[0.08] text-sky-400"
                                : "border-white/[0.06] bg-white/[0.035] text-slate-500"
                            }
                          `}
                        >
                          <Inbox className="h-4 w-4" />
                        </div>

                        {/* Notification Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <h3
                                className={`
                                  truncate text-[13px]
                                  ${
                                    isUnread
                                      ? "font-semibold text-white"
                                      : "font-medium text-slate-300"
                                  }
                                `}
                              >
                                {notification.title || "Task update"}
                              </h3>

                              {isUnread && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(event) =>
                                handleDelete(event, notificationId)
                              }
                              title="Delete notification"
                              aria-label="Delete notification"
                              className="
                                flex h-7 w-7 shrink-0 items-center
                                justify-center rounded-lg
                                text-slate-600 opacity-100
                                transition-all duration-200
                                hover:bg-red-500/10 hover:text-red-400
                                focus:outline-none focus-visible:ring-2
                                focus-visible:ring-red-400
                                sm:opacity-0 sm:group-hover:opacity-100
                              "
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="mt-1 text-xs leading-[1.65] text-slate-400">
                            {notification.message || "You have a new update."}
                          </p>

                          {/* Metadata */}
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                              <Clock3 className="h-3 w-3" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-slate-700" />

                            <span className="max-w-[110px] truncate text-[10px] font-medium text-slate-400">
                              {notification.sender?.name || "Manager"}
                            </span>

                            {notification.task?.siteLocation?.name && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-slate-700" />

                                <span className="inline-flex min-w-0 items-center gap-1 text-[10px] font-medium text-sky-400">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {notification.task.siteLocation.name}
                                  </span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                /* Empty State */
                <div className="relative flex flex-col items-center px-6 py-12 text-center">
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.06] blur-3xl" />

                  <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-inner">
                    <Bell className="h-7 w-7 text-slate-500" />

                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0d1524] bg-sky-500 text-white">
                      <Sparkles className="h-3 w-3" />
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200">
                    You're all clear!
                  </h3>

                  <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-slate-500">
                    No notifications right now. Task updates from your manager will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            {notificationsList.length > 0 && (
              <div className="flex items-center justify-between border-t border-white/[0.07] bg-white/[0.015] px-5 py-3">
                <p className="text-[10px] font-medium text-slate-500">
                  {notificationsList.length} total notifications
                </p>

                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live updates
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fp-notification-enter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .fp-notification-panel {
          animation: fp-notification-enter 180ms ease-out;
          transform-origin: top right;
        }

        .fp-notification-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.25) transparent;
        }

        .fp-notification-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .fp-notification-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .fp-notification-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.25);
          border-radius: 20px;
        }

        @media (prefers-reduced-motion: reduce) {
          .fp-notification-panel {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

export default NotificationDropdown;