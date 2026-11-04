
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { context } from "../context/context";
import {
  Crown,
  Users,
  ClipboardList,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

function PlanBanner() {
  const { user, mySubscription } = useContext(context);
  const [now] = useState(() => Date.now());

  if (!user || user.role !== "manager") return null;
  if (!mySubscription) return null;

  const {
    plan = "free",
    status = "active",
    workerLimit = 0,
    taskLimit = 0,
    endsAt,
  } = mySubscription;

  const normalizedPlan = String(plan).trim().toLowerCase();
  const normalizedStatus = String(status).trim().toLowerCase();

  // Plan type
  const isFree = normalizedPlan === "free";
  const isPro = normalizedPlan === "pro";

  // Expiry calculation
  const expiryDate = endsAt ? new Date(endsAt) : null;

  const validDate =
    expiryDate && !Number.isNaN(expiryDate.getTime());

  // Free plan always has lifetime access
  const isExpired = isFree
    ? false
    : normalizedStatus !== "active" ||
      (validDate && now >= expiryDate.getTime());

  // Status
  const displayStatus = isFree
    ? "Active"
    : isExpired
    ? "Expired"
    : normalizedStatus;

  // Duration
  const duration = isFree
    ? "Lifetime Access"
    : validDate
    ? expiryDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not Available";

  // Theme
  const theme = isExpired
    ? {
        border: "border-rose-500/20",
        background: "bg-rose-500/[0.06]",
        icon: "text-rose-400 bg-rose-500/10",
        badge: "text-rose-400 bg-rose-500/10",
        description: "Your subscription has expired. Upgrade to continue.",
      }
    : isPro
    ? {
        border: "border-violet-500/20",
        background: "bg-violet-500/[0.06]",
        icon: "text-violet-400 bg-violet-500/10",
        badge: "text-emerald-400 bg-emerald-500/10",
        description: "Your premium subscription is active.",
      }
    : {
        border: "border-sky-500/20",
        background: "bg-sky-500/[0.06]",
        icon: "text-sky-400 bg-sky-500/10",
        badge: "text-sky-400 bg-sky-500/10",
        description: "Enjoy your free plan with lifetime access.",
      };

  return (
    <div
      className={`mb-6 rounded-xl border ${theme.border} ${theme.background} px-4 py-3`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${theme.icon}`}
          >
            <Crown size={19} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold capitalize text-white">
                {normalizedPlan} Plan
              </h3>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${theme.badge}`}
              >
                {displayStatus}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-slate-400">
              {theme.description}
            </p>
          </div>
        </div>

        {/* Upgrade / Manage Button */}
        <Link
          to="/manager/plans"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-sky-600 px-3.5 text-xs font-medium text-white transition hover:bg-sky-500 active:scale-95"
        >
          {isPro && !isExpired ? "Manage Plan" : "Upgrade Plan"}
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Subscription Details */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-3 sm:grid-cols-3">

        {/* Worker Limit */}
        <div className="flex items-center gap-2.5">
          <Users size={16} className="shrink-0 text-slate-500" />

          <div>
            <p className="text-[10px] text-slate-500">
              Worker Limit
            </p>

            <p className="text-sm font-semibold text-slate-200">
              {workerLimit} Workers
            </p>
          </div>
        </div>

        {/* Task Limit */}
        <div className="flex items-center gap-2.5">
          <ClipboardList
            size={16}
            className="shrink-0 text-slate-500"
          />

          <div>
            <p className="text-[10px] text-slate-500">
              Task Limit
            </p>

            <p className="text-sm font-semibold text-slate-200">
              {taskLimit} Tasks
            </p>
          </div>
        </div>

        {/* Plan Duration */}
        <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1">
          <CalendarDays
            size={16}
            className="shrink-0 text-slate-500"
          />

          <div>
            <p className="text-[10px] text-slate-500">
              {isFree
                ? "Plan Duration"
                : isExpired
                ? "Expired On"
                : "Expires On"}
            </p>

            <p className="text-sm font-semibold text-slate-200">
              {duration}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanBanner;
