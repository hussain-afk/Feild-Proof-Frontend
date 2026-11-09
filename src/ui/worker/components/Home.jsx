import { useContext, useMemo, useState } from "react";

import { context } from "../../../context/context";
import useVerification from "../../../hooks/useVerification";
import useAuth from "../../../hooks/useAuth";

import WorkerTaskCard from "./TaskCard";
import NotificationDropdown from "../../NotificationDropdown.jsx";

import {
  CheckCircle2,
  Clock3,
  Inbox,
  ListTodo,
  PlayCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Modal from "../../Modal";
import LoadingState from "../../LoadingState.jsx";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-[#0b1220] border border-slate-800 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const labelClass = "block text-xs font-medium text-slate-300 mb-1.5";

// GPS accuracy limit
const MAX_GPS_ACCURACY = import.meta.env.DEV ? Infinity : 100;

const GEO_ERRORS = {
  1: "Location permission is blocked. Allow location for this site in your browser settings, then try again.",
  2: "Your location is not available. Turn on GPS (location) on your phone and try again.",
  3: "Getting your location took too long. Go to an open area and try again.",
};

// Check whether task has a valid site location
const hasSiteLocation = (task) => {
  const lat = task?.siteLocation?.latitude;
  const lng = task?.siteLocation?.longitude;

  if (lat === "" || lat == null || lng === "" || lng == null) {
    return false;
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0)
  );
};

// Get current GPS position
const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  });

/* ------------------------------------------------------------------ */
/* Worker Dashboard                                                   */
/* ------------------------------------------------------------------ */

function WorkerDashboard() {
  const { updatePayment } = useAuth();
  const { verifyCheckIn, verifyCheckOut } = useVerification();

  const {
    myTasks,
    user,
    paymentModalOpen,
    setPaymentModalOpen,
    isLoading,
  } = useContext(context);

  // Payment modal state
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [jazzcashOrEasypaisaNumber, setJazzcashOrEasypaisaNumber] =
    useState("jazzcash");

  const [paymentError, setPaymentError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Tasks
  const tasks = useMemo(
    () => (Array.isArray(myTasks) ? myTasks : []),
    [myTasks]
  );

  // Task counts
  const counts = useMemo(() => {
    const result = {
      pending: 0,
      "in-progress": 0,
      completed: 0,
    };

    tasks.forEach((task) => {
      if (result[task.status] !== undefined) {
        result[task.status] += 1;
      }
    });

    return result;
  }, [tasks]);

  // Current date
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* ---------------- Payment ---------------- */

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

    if (!user?._id) {
      setPaymentError("User information is unavailable. Please try again.");
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

  /* ---------------- Check in / out ---------------- */

  /**
   * Rules:
   * 1. If task has site location, GPS is required.
   * 2. If task has no site location, GPS is optional.
   * 3. If GPS accuracy is weak for a location-based task,
   *    check-in/check-out will not continue.
   */

  const runWithLocation = async (
    taskId,
    imageFile,
    action,
    actionName
  ) => {
    const task = tasks.find(
      (item) => String(item._id) === String(taskId)
    );

    const needsLocation = hasSiteLocation(task);

    // Empty strings are used instead of null for FormData
    let latitude = "";
    let longitude = "";
    let gpsAccuracy = "";

    // Get GPS position
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

      // GPS is optional when the task has no site location
    }

    if (position) {
      const {
        latitude: lat,
        longitude: lng,
        accuracy,
      } = position.coords;

      if (needsLocation && accuracy > MAX_GPS_ACCURACY) {
        throw new Error(
          `Your GPS signal is weak (accurate to about ${Math.round(
            accuracy
          )} m). Move to an open area, wait a few seconds and try again.`
        );
      }

      latitude = lat;
      longitude = lng;
      gpsAccuracy = Math.round(accuracy);
    }

    // Send request to backend
    try {
      return await action(
        taskId,
        latitude,
        longitude,
        imageFile,
        gpsAccuracy
      );
    } catch (error) {
      throw new Error(
        error?.response?.data?.message ||
          `Could not complete ${actionName}. Please try again.`,
        { cause: error }
      );
    }
  };

  const handleCheckIn = (id, imageFile) =>
    runWithLocation(id, imageFile, verifyCheckIn, "check in");

  const handleCheckOut = (id, imageFile) =>
    runWithLocation(id, imageFile, verifyCheckOut, "check out");

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <LoadingState
        message="Loading tasks"
        subtext="Syncing your workspace"
      />
    );
  }

  /* ---------------- Dashboard UI ---------------- */

  return (
    <>
      <div className="min-h-full text-slate-100">
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

            {/* Reusable notifications component */}
            <NotificationDropdown />
          </header>

          {/* ================= SUMMARY ================= */}

          <section
            aria-label="Task summary"
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            <SummaryCard
              label="Total"
              value={tasks.length}
              icon={ListTodo}
              tone="slate"
            />

            <SummaryCard
              label="Pending"
              value={counts.pending}
              icon={Clock3}
              tone="amber"
            />

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
              <h2 className="text-base font-semibold text-white">
                Assigned to you
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </p>
            </div>

            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
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

                <h3 className="text-sm font-semibold text-slate-100">
                  No tasks assigned
                </h3>

                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                  New site tasks from your manager appear here as soon as
                  they are assigned. You will also get a notification.
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
              onChange={(e) =>
                setJazzcashOrEasypaisaNumber(e.target.value)
              }
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
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Summary Card                                                       */
/* ------------------------------------------------------------------ */

const TONES = {
  slate: {
    value: "text-white",
    icon: "text-slate-300",
    bg: "bg-slate-800",
  },
  amber: {
    value: "text-amber-400",
    icon: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  sky: {
    value: "text-sky-400",
    icon: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  emerald: {
    value: "text-emerald-400",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
};

function SummaryCard({ label, value, icon: Icon, tone = "slate" }) {
  const t = TONES[tone] || TONES.slate;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div>
        <p className="text-xs text-slate-400">{label}</p>

        <p className={`mt-1 text-2xl font-semibold tabular-nums ${t.value}`}>
          {value}
        </p>
      </div>

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.bg}`}
      >
        <Icon className={`h-4 w-4 ${t.icon}`} />
      </div>
    </div>
  );
}

export default WorkerDashboard;