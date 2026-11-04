import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { context } from "../context/context";
import {
  Crown,
  Users,
  ClipboardList,
  CalendarDays,
  ArrowUpRight,
  AlertCircle,
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

  const isFree = normalizedPlan === "free";
  const isPro = normalizedPlan === "pro";

  const expiryDate = endsAt ? new Date(endsAt) : null;
  const validDate = expiryDate && !Number.isNaN(expiryDate.getTime());

  const isExpired = isFree
    ? false
    : normalizedStatus !== "active" ||
      (validDate && now >= expiryDate.getTime());

  const displayStatus = isFree
    ? "Active"
    : isExpired
      ? "Expired"
      : normalizedStatus;

  const duration = isFree
    ? "Lifetime"
    : validDate
      ? expiryDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const theme = isExpired
    ? {
        shell: "border-rose-500/25 bg-gradient-to-r from-rose-500/[0.08] to-transparent",
        iconWrap: "border-rose-500/20 bg-rose-500/10 text-rose-400",
        badge: "border-rose-500/20 bg-rose-500/10 text-rose-300",
        cta: "bg-rose-600 hover:bg-rose-500 text-white",
        description: "Your plan has expired. Upgrade to keep full access.",
        accent: "bg-rose-500",
      }
    : isPro
      ? {
          shell: "border-violet-500/25 bg-gradient-to-r from-violet-500/[0.08] to-transparent",
          iconWrap: "border-violet-500/20 bg-violet-500/10 text-violet-400",
          badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
          cta: "bg-violet-600 hover:bg-violet-500 text-white",
          description: "Premium access is active for your team.",
          accent: "bg-violet-500",
        }
      : {
          shell: "border-sky-500/25 bg-gradient-to-r from-sky-500/[0.08] to-transparent",
          iconWrap: "border-sky-500/20 bg-sky-500/10 text-sky-400",
          badge: "border-sky-500/20 bg-sky-500/10 text-sky-300",
          cta: "bg-sky-600 hover:bg-sky-500 text-white",
          description: "Free plan with lifetime access.",
          accent: "bg-sky-500",
        };

  return (
    <div
      className={`relative mb-6 overflow-hidden rounded-xl border ${theme.shell}`}
    >
      {/* left accent bar */}
      <div className={`absolute inset-y-0 left-0 w-0.5 ${theme.accent}`} />

      <div className="px-4 py-3.5 pl-5">
        {/* top row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.iconWrap}`}
            >
              {isExpired ? <AlertCircle size={18} /> : <Crown size={18} />}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold capitalize tracking-tight text-white">
                  {normalizedPlan} plan
                </h3>
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${theme.badge}`}
                >
                  {displayStatus}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {theme.description}
              </p>
            </div>
          </div>

          <Link
            to="/manager/plans"
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition active:scale-[0.98] ${theme.cta}`}
          >
            {isPro && !isExpired ? "Manage" : "Upgrade"}
            <ArrowUpRight size={14} strokeWidth={2.25} />
          </Link>
        </div>

        {/* stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
          <div className="rounded-lg bg-black/20 px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <Users size={12} className="opacity-70" />
              Workers
            </div>
            <p className="mt-1 text-sm font-semibold tabular-nums text-slate-100">
              {workerLimit}
            </p>
          </div>

          <div className="rounded-lg bg-black/20 px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <ClipboardList size={12} className="opacity-70" />
              Tasks
            </div>
            <p className="mt-1 text-sm font-semibold tabular-nums text-slate-100">
              {taskLimit}
            </p>
          </div>

          <div className="rounded-lg bg-black/20 px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <CalendarDays size={12} className="opacity-70" />
              {isFree ? "Duration" : isExpired ? "Ended" : "Ends"}
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-slate-100">
              {duration}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanBanner;