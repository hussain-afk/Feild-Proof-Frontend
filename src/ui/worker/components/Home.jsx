import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { context } from "../../../context/context";
import useVerification from "../../../hooks/useVerification";
import WorkerTaskCard from "./TaskCard";
import useAuth from "../../../hooks/useAuth";
import useNotification from "../../../hooks/useNotification";
import {
  Bell,
  CheckCircle2,
  MapPin,
  Clock3,
  Inbox,
  ListTodo,
  PlayCircle,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Modal from "../../Modal";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-[#0b1220] border border-slate-800 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const labelClass = "block text-xs font-medium text-slate-300 mb-1.5";

// Agar GPS is se zyada galat ho (meters), to check-in/out nahi hone dete
// (Laptop par development me GPS kai km galat hota hai, isliye wahan ye check band hai)
const MAX_GPS_ACCURACY = import.meta.env.DEV ? Infinity : 100;

const GEO_ERRORS = {
  1: "Location permission is blocked. Allow location for this site in your browser settings, then try again.",
  2: "Your location is not available. Turn on GPS (location) on your phone and try again.",
  3: "Getting your location took too long. Go to an open area and try again.",
};

// Task me site location hai ya nahi. Ye rule backend wala hi hai: (0, 0) ko "nahi" maante hain.
const hasSiteLocation = (task) => {
  const lat = task?.siteLocation?.latitude;
  const lng = task?.siteLocation?.longitude;
  if (lat === "" || lat == null || lng === "" || lng == null) return false;

  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && !(a === 0 && b === 0);
};

// Browser se GPS position maangta hai (promise ke saath)
const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true, // asli GPS use karo
      timeout: 20000,
      maximumAge: 0, // purani saved position kabhi nahi
    });
  });

const formatTimeAgo = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const diffInSeconds = Math.floor((new Date() - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function WorkerDashboard() {
  const { updatePayment } = useAuth();
  const { verifyCheckIn, verifyCheckOut } = useVerification();
  const { handleDeleteNotification } = useNotification();
  const { myTasks, notifications, user, paymentModalOpen, setPaymentModalOpen } =
    useContext(context);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const bellRef = useRef(null);
  const [panelTop, setPanelTop] = useState(72); // px, sirf mobile par use hota hai

  // payment modal state
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [jazzcashOrEasypaisaNumber, setJazzcashOrEasypaisaNumber] = useState("jazzcash");
  const [paymentError, setPaymentError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const tasks = useMemo(() => (Array.isArray(myTasks) ? myTasks : []), [myTasks]);
  const notificationsList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  const counts = useMemo(() => {
    const c = { pending: 0, "in-progress": 0, completed: 0 };
    tasks.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status] += 1;
    });
    return c;
  }, [tasks]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* ---------- Notifications dropdown: bahar click ya Escape par band ---------- */
  useEffect(() => {
    if (!notifOpen) return;

    const onPointerDown = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        bellRef.current?.focus();
      }
    };

    // Mobile par panel screen par fixed hota hai, isliye bell ke theek neeche rakho
    const updatePosition = () => {
      const rect = bellRef.current?.getBoundingClientRect();
      if (rect) setPanelTop(Math.round(rect.bottom + 8));
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [notifOpen]);

  /* ---------- Payment ---------- */
  const closePaymentModal = () => {
    setPaymentError("");
    setPaymentModalOpen(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (
      !bankName.trim() ||
      !accountNumber.trim() ||
      !accountHolderName.trim() ||
      !jazzcashOrEasypaisaNumber
    ) {
      setPaymentError("Fill in all payment details before saving.");
      return;
    }

    setPaymentError("");
    setIsSaving(true);
    try {
      await updatePayment(
        user._id,
        bankName,
        accountNumber,
        accountHolderName,
        jazzcashOrEasypaisaNumber
      );
      setPaymentModalOpen(false);
    } catch (error) {
      console.error("Payment update error:", error);
      setPaymentError("Could not save your details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- Check in / out ---------- */
  /**
   * Rule (backend jaisa hi):
   *  - Task me site location HAI  -> GPS zaroori, aur signal achha hona chahiye
   *  - Task me site location NAHI -> GPS optional, na mile to bina location ke aage badho
   *
   * Promise wapas deta hai (resolve = kaam ho gaya, reject = nahi hua).
   * Reject hone par Error ka message wahi hota hai jo worker ko dikhana hai.
   */
  const runWithLocation = async (taskId, imageFile, action, actionName) => {
    const task = tasks.find((t) => String(t._id) === String(taskId));
    const needsLocation = hasSiteLocation(task);

    // Khali string bhejte hain (null nahi), kyunke FormData me null "null" text ban jata hai
    let latitude = "";
    let longitude = "";
    let gpsAccuracy = ""; // phone batata hai ke location kitni meter tak galat ho sakti hai

    // 1. Location lo
    let position = null;
    try {
      position = await getPosition();
    } catch (geoError) {
      if (needsLocation) {
        throw new Error(
          GEO_ERRORS[geoError.code] ||
            `Your device could not give a location, so you cannot ${actionName} here.`,
          { cause: geoError }
        );
      }
      // Task me location nahi hai, to bina GPS ke bhi chalega
    }

    if (position) {
      const { latitude: lat, longitude: lng, accuracy } = position.coords;

      // Kamzor GPS signal worker ko asli jagah se door dikha sakta hai
      if (needsLocation && accuracy > MAX_GPS_ACCURACY) {
        throw new Error(
          `Your GPS signal is weak (accurate to about ${Math.round(accuracy)} m). Move to an open area, wait a few seconds and try again.`
        );
      }

      latitude = lat;
      longitude = lng;
      gpsAccuracy = Math.round(accuracy);
    }

    // 2. Server ko bhejo
    try {
      return await action(taskId, latitude, longitude, imageFile, gpsAccuracy);
    } catch (error) {
      // Server ka message (jaise "You are 800m away from the site") ya generic message.
      // TaskCard isko card ke andar dikhata hai.
      throw new Error(
        error?.response?.data?.message || `Could not complete ${actionName}. Please try again.`,
        { cause: error }
      );
    }
  };

  const handleCheckIn = (id, imageFile) =>
    runWithLocation(id, imageFile, verifyCheckIn, "check in");

  const handleCheckOut = (id, imageFile) =>
    runWithLocation(id, imageFile, verifyCheckOut, "check out");

  return (
    <>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {/* ================= HEADER ================= */}
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{today}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                My field tasks
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                Check in at each site and upload proof of your work.
              </p>
            </div>

            {/* Notifications dropdown */}
            <div ref={notifRef} className="relative shrink-0">
              <button
                ref={bellRef}
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={notifOpen}
                aria-label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                }
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  notifOpen
                    ? "border-slate-600 bg-slate-800 text-white"
                    : "border-slate-800 bg-[#111827] text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white ring-2 ring-[#0b0f17]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  role="dialog"
                  aria-label="Notifications"
                  style={{ "--fp-top": `${panelTop}px` }}
                  className="fp-pop fixed inset-x-3 top-[var(--fp-top)] z-50 origin-top overflow-hidden rounded-xl border border-slate-700/80 bg-[#111827] shadow-2xl shadow-black/50 sm:absolute sm:inset-x-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:origin-top-right"
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                    <h2 className="text-sm font-semibold text-white">Notifications</h2>
                    {unreadCount > 0 ? (
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400">
                        {unreadCount} new
                      </span>
                    ) : (
                      notificationsList.length > 0 && (
                        <span className="text-[11px] text-slate-500">All caught up</span>
                      )
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-[min(26rem,60vh)] overflow-y-auto">
                    {notificationsList.length > 0 ? (
                      <ul className="divide-y divide-slate-800/80">
                        {notificationsList.map((notification) => {
                          const notificationId = notification._id || notification.id;

                          return (
                            <li
                              key={notificationId}
                              className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-800/40 ${
                                !notification.isRead ? "bg-sky-500/5" : ""
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                  !notification.isRead ? "bg-sky-500" : "bg-transparent"
                                }`}
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <p
                                    className={`truncate text-sm ${
                                      !notification.isRead
                                        ? "font-semibold text-white"
                                        : "font-medium text-slate-300"
                                    }`}
                                  >
                                    {notification.title}
                                  </p>

                                  <div className="flex shrink-0 items-center gap-2">
                                    <span className="text-[11px] text-slate-500">
                                      {formatTimeAgo(notification.createdAt)}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteNotification(notificationId)}
                                      title="Delete notification"
                                      aria-label="Delete notification"
                                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/70 text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                                  {notification.message}
                                </p>

                                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                                  <span className="truncate">
                                    {notification.sender?.name || "Manager"}
                                  </span>

                                  {notification.task?.siteLocation?.name && (
                                    <>
                                      <span aria-hidden="true">&middot;</span>

                                      <span className="inline-flex min-w-0 items-center gap-1 text-sky-400">
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
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                          <Bell className="h-5 w-5 text-slate-400" />
                        </div>

                        <p className="text-sm font-medium text-slate-200">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Task updates from your manager will show up here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* ================= SUMMARY ================= */}
          <section
            aria-label="Task summary"
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            <SummaryCard label="Total" value={tasks.length} icon={ListTodo} tone="slate" />
            <SummaryCard label="Pending" value={counts.pending} icon={Clock3} tone="amber" />
            <SummaryCard
              label="In progress"
              value={counts["in-progress"]}
              icon={PlayCircle}
              tone="sky"
            />
            <SummaryCard
              label="Completed"
              value={counts.completed}
              icon={CheckCircle2}
              tone="emerald"
            />
          </section>

          {/* ================= TASKS ================= */}
          <section aria-label="Assigned tasks">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Assigned to you</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </p>
            </div>

            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tasks.map((task) => (
                  <WorkerTaskCard
                    key={task._id}
                    task={task}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-[#111827]/60 px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                  <Inbox className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">No tasks assigned</h3>
                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                  New site tasks from your manager appear here as soon as they are
                  assigned. You will also get a notification.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={closePaymentModal}
        title="Add payment details"
        subtitle="We need these to send you your payments."
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label htmlFor="bank-name" className={labelClass}>
              Bank name
            </label>
            <input
              id="bank-name"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Meezan Bank"
              autoComplete="off"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="account-number" className={labelClass}>
              Account number or IBAN
            </label>
            <input
              id="account-number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="PK00 XXXX 0000 0000 0000 0000"
              autoComplete="off"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label htmlFor="holder-name" className={labelClass}>
              Account holder name
            </label>
            <input
              id="holder-name"
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Name as shown on your account"
              autoComplete="name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="wallet" className={labelClass}>
              Mobile wallet
            </label>
            <select
              id="wallet"
              value={jazzcashOrEasypaisaNumber || "jazzcash"}
              onChange={(e) => setJazzcashOrEasypaisaNumber(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">Easypaisa</option>
            </select>
          </div>

          {paymentError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          <div className="flex gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={closePaymentModal}
              disabled={isSaving}
              className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save details"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        @keyframes fp-pop {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fp-pop { animation: fp-pop 140ms ease-out; }
        @media (prefers-reduced-motion: reduce) { .fp-pop { animation: none; } }
      `}</style>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

const TONES = {
  slate: { value: "text-white", icon: "text-slate-300", bg: "bg-slate-800" },
  amber: { value: "text-amber-400", icon: "text-amber-400", bg: "bg-amber-500/10" },
  sky: { value: "text-sky-400", icon: "text-sky-400", bg: "bg-sky-500/10" },
  emerald: {
    value: "text-emerald-400",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
};

function SummaryCard({ label, value, icon: Icon, tone = "slate" }) {
  const t = TONES[tone];
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${t.value}`}>{value}</p>
      </div>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.bg}`}>
        <Icon className={`h-4 w-4 ${t.icon}`} />
      </div>
    </div>
  );
}

export default WorkerDashboard;