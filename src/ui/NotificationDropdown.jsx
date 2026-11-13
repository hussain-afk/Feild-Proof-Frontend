import { useContext, useEffect, useId, useRef, useState } from "react";
import { Bell, MapPin, Trash2, Volume2 } from "lucide-react";

import { context } from "../context/context";
import useNotification from "../hooks/useNotification";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

const formatTimeAgo = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ------------------------------------------------------------------ */
/* One notification row                                                 */
/* ------------------------------------------------------------------ */

function NotificationItem({ notification, onDelete }) {
  const id = notification._id || notification.id;
  const unread = !notification.isRead;
  const location = notification.task?.siteLocation?.name;

  const meta = [
    formatTimeAgo(notification.createdAt),
    notification.sender?.name || "Manager",
  ].filter(Boolean);

  return (
    <li
      className={`group relative flex gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] ${
        unread ? "bg-sky-400/[0.04]" : ""
      }`}
    >
      {/* Unread marker */}
      <span
        aria-hidden="true"
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          unread ? "bg-sky-400" : "bg-transparent"
        }`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`truncate text-sm ${
              unread ? "font-semibold text-white" : "font-medium text-slate-300"
            }`}
          >
            {notification.title || "Task update"}
            {unread && <span className="sr-only"> (unread)</span>}
          </h3>

          <button
            type="button"
            onClick={(event) => onDelete(event, id)}
            title="Delete notification"
            aria-label="Delete notification"
            className={`-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${focusRing}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
          {notification.message || "You have a new update."}
        </p>

        <p className="mt-2 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-500">
          {meta.join(" · ")}

          {location && (
            <span className="inline-flex min-w-0 items-center gap-1 text-sky-400">
              <span aria-hidden="true">·</span>
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          )}
        </p>
      </div>
    </li>
  );
}

function GroupLabel({ children }) {
  return (
    <li className="bg-[#0d1524] px-4 pb-1.5 pt-3 text-xs font-medium text-slate-500">
      {children}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Dropdown                                                             */
/* ------------------------------------------------------------------ */

function NotificationDropdown() {
  const { notifications, enableNotificationSound } = useContext(context);
  const { handleDeleteNotification } = useNotification();

  const [notifOpen, setNotifOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(72);

  const notifRef = useRef(null);
  const bellRef = useRef(null);
  const panelId = useId();

  const list = Array.isArray(notifications) ? notifications : [];
  const unreadList = list.filter((n) => !n.isRead);
  const readList = list.filter((n) => n.isRead);
  const unreadCount = unreadList.length;

  useEffect(() => {
    if (!notifOpen) return;

    const handleOutsideClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
        bellRef.current?.focus();
      }
    };

    // Phone par panel poori chaudai mein bell ke neeche khulta hai
    const updatePosition = () => {
      const rect = bellRef.current?.getBoundingClientRect();
      if (rect) setPanelTop(Math.round(rect.bottom + 10));
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

  const renderItems = (items) =>
    items.map((notification) => (
      <NotificationItem
        key={notification._id || notification.id}
        notification={notification}
        onDelete={handleDelete}
      />
    ));

  return (
    <>
      <div ref={notifRef} className="relative shrink-0">
        {/* Bell */}
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
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${focusRing} ${
            notifOpen
              ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
              : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-slate-200"
          }`}
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0b0f17] bg-sky-500 px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Panel */}
        {notifOpen && (
          <div
            id={panelId}
            role="dialog"
            aria-label="Notifications"
            style={{ "--fp-top": `${panelTop}px` }}
            className="fp-notification-panel fixed inset-x-3 top-[var(--fp-top)] z-[100] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d1524] shadow-2xl shadow-black/60 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[380px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3.5">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white">
                  Notifications
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : list.length > 0
                      ? "You're all caught up"
                      : "Nothing new"}
                </p>
              </div>

              <button
                type="button"
                onClick={enableNotificationSound}
                title="Enable notification sound"
                className={`flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white ${focusRing}`}
              >
                <Volume2 className="h-3.5 w-3.5" />
                Sound
              </button>
            </div>

            {/* List */}
            <div className="max-h-[min(26rem,65vh)] overflow-y-auto [scrollbar-color:rgba(100,116,139,0.3)_transparent] [scrollbar-width:thin]">
              {list.length > 0 ? (
                <ul className="divide-y divide-white/[0.05]">
                  {unreadList.length > 0 && (
                    <>
                      {readList.length > 0 && <GroupLabel>New</GroupLabel>}
                      {renderItems(unreadList)}
                    </>
                  )}

                  {readList.length > 0 && (
                    <>
                      {unreadList.length > 0 && <GroupLabel>Earlier</GroupLabel>}
                      {renderItems(readList)}
                    </>
                  )}
                </ul>
              ) : (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-slate-500">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-200">
                    No notifications
                  </h3>
                  <p className="mt-1 max-w-[230px] text-xs leading-relaxed text-slate-500">
                    Task updates from your manager will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fp-notification-enter {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fp-notification-panel {
          animation: fp-notification-enter 150ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .fp-notification-panel { animation: none; }
        }
      `}</style>
    </>
  );
}

export default NotificationDropdown;