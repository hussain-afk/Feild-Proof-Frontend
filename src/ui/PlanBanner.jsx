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
  Clock,
  Sparkles,
  X,
  Loader,
} from "lucide-react";

const DAY_MS = 86400000;

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-3.5 sm:py-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${tone}`}
      >
        <Icon size={16} />
      </div>
      <div className="w-full min-w-0">
        <p className="truncate text-[11px] text-slate-500">{label}</p>
        <p
          title={String(value)}
          className="truncate text-sm font-semibold tabular-nums text-white sm:text-base"
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function PlanBanner() {
  const { user, mySubscription, isLoading } = useContext(context);
  const [now] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState(false);

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

  // Days left until the plan ends (only for active paid plans with a date)
  const daysLeft =
    !isFree && !isExpired && validDate
      ? Math.max(0, Math.ceil((expiryDate.getTime() - now) / DAY_MS))
      : null;
  const expiringSoon = daysLeft !== null && daysLeft <= 7;

  // How much of the plan period has passed (needs a start date from the API)
  const startRaw =
    mySubscription.startsAt ||
    mySubscription.startedAt ||
    mySubscription.createdAt;
  const startDate = startRaw ? new Date(startRaw) : null;
  const validStart = startDate && !Number.isNaN(startDate.getTime());
  const progress =
    !isFree && !isExpired && validDate && validStart && expiryDate > startDate
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((now - startDate.getTime()) /
                (expiryDate.getTime() - startDate.getTime())) *
                100
            )
          )
        )
      : null;

  // Users can hide the banner for this visit, but never an expired warning
  if (dismissed && !isExpired) return null;

  const theme = isExpired
    ? {
        shell: "border-rose-500/25 bg-rose-500/[0.06]",
        iconWrap: "bg-rose-500/15 text-rose-300",
        badge: "bg-rose-500/15 text-rose-300",
        dot: "bg-rose-400",
        cta: "bg-rose-500 hover:bg-rose-400",
        stat: "bg-rose-500/10 text-rose-300",
        description: "Your plan has expired. Upgrade to keep full access.",
      }
    : expiringSoon
      ? {
          shell: "border-amber-500/25 bg-amber-500/[0.06]",
          iconWrap: "bg-amber-500/15 text-amber-300",
          badge: "bg-amber-500/15 text-amber-300",
          dot: "bg-amber-400",
          cta: "bg-amber-500 hover:bg-amber-400 text-slate-900",
          stat: "bg-amber-500/10 text-amber-300",
          description: "Your plan is ending soon. Renew to avoid any interruption.",
        }
      : isPro
        ? {
            shell: "border-violet-500/25 bg-violet-500/[0.06]",
            iconWrap: "bg-violet-500/15 text-violet-300",
            badge: "bg-emerald-500/15 text-emerald-300",
            dot: "bg-emerald-400",
            cta: "bg-violet-500 hover:bg-violet-400",
            stat: "bg-violet-500/10 text-violet-300",
            description: "Premium access is active for your team.",
          }
        : {
            shell: "border-sky-500/25 bg-sky-500/[0.06]",
            iconWrap: "bg-sky-500/15 text-sky-300",
            badge: "bg-sky-500/15 text-sky-300",
            dot: "bg-sky-400",
            cta: "bg-sky-500 hover:bg-sky-400",
            stat: "bg-sky-500/10 text-sky-300",
            description: "Free plan with lifetime access.",
          };

  const ctaLabel = isExpired
    ? "Renew plan"
    : expiringSoon
      ? "Renew"
      : isPro
        ? "Manage"
        : "Upgrade";

        if(isLoading) {
          return (
            <div className="mb-6 rounded-2xl border p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800">
                    <Loader size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold capitalize tracking-tight text-white">
                        Loading...
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

  return (
    <section
      aria-label="Your subscription"
      className={`mb-6 rounded-2xl border p-4 sm:p-5 ${theme.shell}`}
    >
      {/* top row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.iconWrap}`}
          >
            {isExpired ? <AlertCircle size={22} /> : <Crown size={22} />}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold capitalize tracking-tight text-white">
                {normalizedPlan} plan
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${theme.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                {displayStatus}
              </span>
              {daysLeft !== null && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    expiringSoon
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Clock size={11} />
                  {daysLeft === 0
                    ? "Ends today"
                    : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">{theme.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
        <Link
          to="/manager/plans"
          className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${theme.cta}`}
        >
          {ctaLabel}
          <ArrowUpRight size={15} strokeWidth={2.25} />
        </Link>
        {!isExpired && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Hide plan banner"
            title="Hide for now"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <X size={16} />
          </button>
        )}
        </div>
      </div>

      {progress !== null && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>Plan period</span>
            <span className="tabular-nums">{progress}% used</span>
          </div>
          <div
            role="progressbar"
            aria-label="Plan period used"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-black/30"
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ${theme.dot}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {isFree && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-black/20 px-3.5 py-2.5 text-xs text-slate-400">
          <Sparkles size={14} className="shrink-0 text-sky-300" />
          Need more workers or tasks? Upgrade to raise your limits.
        </p>
      )}

      {/* stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
        <Stat
          icon={Users}
          label="Workers"
          value={workerLimit}
          tone={theme.stat}
        />
        <Stat
          icon={ClipboardList}
          label="Tasks"
          value={taskLimit}
          tone={theme.stat}
        />
        <Stat
          icon={CalendarDays}
          label={isFree ? "Duration" : isExpired ? "Ended" : "Ends"}
          value={duration}
          tone={theme.stat}
        />
      </div>
    </section>
  );
}

export default PlanBanner;