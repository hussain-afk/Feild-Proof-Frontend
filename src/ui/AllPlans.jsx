import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { context } from "../context/context";
import {
  Check,
  ChevronDown,
  Users,
  ClipboardList,
  PackageOpen,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import useSubscriptions from "../hooks/useSubscriptions";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const isFreePlan = (plan) =>
  normalize(plan?.plan) === "free" || toNumber(plan?.price) === 0;

const getStatus = (plan) => {
  if (isFreePlan(plan)) return "active";
  return normalize(plan?.status) || "inactive";
};

const isPlanExpired = (plan) => {
  if (isFreePlan(plan)) return false;
  if (getStatus(plan) !== "active") return true;
  if (plan.endsAt) {
    const expiry = new Date(plan.endsAt).getTime();
    if (Number.isFinite(expiry) && Date.now() >= expiry) return true;
  }
  return false;
};

const formatPrice = (price) => {
  const amount = toNumber(price);
  if (amount === 0) return "Free";
  return `Rs ${amount.toLocaleString("en-PK")}`;
};

const getBillingText = (plan) => {
  if (isFreePlan(plan)) return "forever";
  const days = toNumber(plan.days);
  if (days === 30) return "/ month";
  if (days === 365) return "/ year";
  return days > 0 ? `/ ${days} days` : "one-time";
};

const pricePerWorker = (plan) => {
  const price = toNumber(plan.price);
  const workers = toNumber(plan.workerLimit);
  return price > 0 && workers > 0 ? price / workers : null;
};

const isCurrentPlan = (plan, subscription) => {
  if (!plan || !subscription) return false;
  const subPlan = normalize(subscription.plan);
  if (!subPlan || subPlan === "none") return false;
  if (normalize(subscription.status) !== "active") return false;
  if (subscription.planId && plan._id) {
    return String(subscription.planId) === String(plan._id);
  }
  return normalize(plan.plan) === subPlan;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const matchesFilter = (plan, filter) => {
  if (filter === "all" || isFreePlan(plan)) return true;
  const days = toNumber(plan.days);
  return filter === "monthly" ? days === 30 : days === 365;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17]";

/* ------------------------------------------------------------------ */
/* Plan Card                                                            */
/* ------------------------------------------------------------------ */

function PlanCard({ plan, isCurrent, isBestValue, onChoose, onCancel }) {
  const [showAll, setShowAll] = useState(false);
  const free = isFreePlan(plan);
  const available = !isPlanExpired(plan);
  const perWorker = pricePerWorker(plan);
  const features = Array.isArray(plan.features) ? plan.features : [];
  const visibleFeatures = showAll ? features : features.slice(0, 4);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border transition duration-200 ${
        isCurrent
          ? "border-emerald-500/40 bg-[#0f1a14] shadow-[0_0_0_1px_rgba(16,185,129,0.12)]"
          : isBestValue
            ? "border-sky-500/40 bg-[#0c1524] shadow-[0_0_40px_-20px_rgba(56,189,248,0.35)]"
            : "border-slate-800/90 bg-[#111827] hover:border-slate-700"
      }`}
    >
      {/* top accent */}
      <div
        className={`h-1 w-full ${
          isCurrent
            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
            : isBestValue
              ? "bg-gradient-to-r from-sky-500 to-cyan-400"
              : "bg-slate-800"
        }`}
      />

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {/* title + badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold capitalize tracking-tight text-white">
              {plan.plan}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {free ? "Starter access" : "Full field team access"}
            </p>
          </div>
          {isCurrent ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <Check size={12} strokeWidth={2.5} />
              Current
            </span>
          ) : isBestValue ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300">
              <Sparkles size={12} />
              Best value
            </span>
          ) : null}
        </div>

        {/* price */}
        <div className="mt-6">
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-semibold tracking-tight text-white sm:text-[2.5rem]">
              {formatPrice(plan.price)}
            </span>
            <span className="mb-1 text-sm text-slate-500">
              {getBillingText(plan)}
            </span>
          </div>
          <p className="mt-2 min-h-[1.25rem] text-sm text-slate-500">
            {free
              ? "No card required"
              : perWorker
                ? `~ Rs ${Math.round(perWorker).toLocaleString("en-PK")} per worker`
                : "\u00a0"}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-6">
          {isCurrent ? (
            <>
              <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
                <Check size={16} strokeWidth={2.5} />
                Your active plan
              </div>
              {!free && (
                <button
                  type="button"
                  onClick={() => onCancel(plan)}
                  className={`mt-2 h-10 w-full rounded-xl text-sm font-medium text-rose-400/90 transition hover:bg-rose-500/10 hover:text-rose-300 ${focusRing}`}
                >
                  Cancel plan
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              disabled={!available}
              onClick={() => onChoose(plan)}
              className={`h-11 w-full rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-800/60 disabled:text-slate-500 ${focusRing} ${
                isBestValue
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
                  : free
                    ? "border border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
                    : "border border-sky-500/35 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
              }`}
            >
              {available
                ? free
                  ? "Get started free"
                  : "Choose plan"
                : "Not available"}
            </button>
          )}
        </div>

        {/* limits */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-800/80 bg-[#0b1220]/80 px-3 py-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <Users size={13} className="text-sky-400/80" />
              Workers
            </div>
            <p className="mt-1.5 text-lg font-semibold tabular-nums text-white">
              {toNumber(plan.workerLimit)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#0b1220]/80 px-3 py-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <ClipboardList size={13} className="text-sky-400/80" />
              Tasks
            </div>
            <p className="mt-1.5 text-lg font-semibold tabular-nums text-white">
              {toNumber(plan.taskLimit)}
            </p>
          </div>
        </div>

        {/* features */}
        {features.length > 0 && (
          <div className="mt-6 border-t border-slate-800/80 pt-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Includes
            </p>
            <ul className="space-y-2.5">
              {visibleFeatures.map((feature, index) => (
                <li
                  key={`${feature}-${index}`}
                  className="flex items-start gap-2.5 text-sm text-slate-300"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
            {features.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className={`mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition hover:text-sky-300 ${focusRing}`}
              >
                {showAll ? "Show less" : `+${features.length - 4} more`}
                <ChevronDown
                  size={15}
                  className={`transition-transform ${showAll ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Cancel modal                                                         */
/* ------------------------------------------------------------------ */

function ConfirmCancel({ plan, onClose, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f17]/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl shadow-black/40"
      >
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 id="cancel-title" className="text-lg font-semibold text-white">
            Cancel {plan.plan}?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Your team will lose this plan’s limits and benefits. You can
            subscribe again anytime.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`h-11 rounded-xl px-5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 ${focusRing}`}
          >
            Keep plan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-500 ${focusRing}`}
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function AllPlans() {
  const { handleCancelSubscription, handleCreateCheckoutSession } =
    useSubscriptions();
  const { allPlans, mySubscription, syncUser, refresh } = useContext(context);

  const [searchParams, setSearchParams] = useSearchParams();
  const paymentHandled = useRef(false);

  const plans = useMemo(
    () => (Array.isArray(allPlans) ? allPlans : []),
    [allPlans]
  );

  const [filter, setFilter] = useState("all");
  const [planToCancel, setPlanToCancel] = useState(null);

  useEffect(() => {
    if (paymentHandled.current) return;

    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (canceled === "1") {
      paymentHandled.current = true;
      toast.error("Payment canceled");
      setSearchParams({}, { replace: true });
      return;
    }

    if (success === "1") {
      paymentHandled.current = true;
      toast.success("Payment successful. Updating your plan...");

      if (typeof refresh === "function") {
        refresh();
      } else if (typeof syncUser === "function") {
        syncUser();
      }

      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, syncUser, refresh]);

  const handleChoosePlan = async (plan) => {
    if (isFreePlan(plan)) return;

    try {
      await handleCreateCheckoutSession(plan._id);
    } catch (error) {
      console.error("Checkout Frontend Error:", error);
    }
  };

  const handleConfirmCancel = async () => {
    await handleCancelSubscription();
    setPlanToCancel(null);
  };

  const visiblePlans = useMemo(
    () => plans.filter((plan) => matchesFilter(plan, filter)),
    [plans, filter]
  );

  const bestValueId = useMemo(() => {
    const comparable = plans.filter(
      (plan) => !isPlanExpired(plan) && pricePerWorker(plan) !== null
    );
    if (comparable.length < 2) return null;
    return comparable.reduce((a, b) =>
      pricePerWorker(b) < pricePerWorker(a) ? b : a
    )._id;
  }, [plans]);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#0b0f17] text-slate-100">
      {/* soft background glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* header */}
        <header className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#111827]/80 px-3 py-1 text-xs font-medium text-slate-400">
            <Zap size={12} className="text-sky-400" />
            FieldProof pricing
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl sm:leading-tight">
            Choose the plan that fits your team
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            Simple limits. Clear pricing. Upgrade or cancel whenever you need.
          </p>

          {/* trust row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Shield size={13} className="text-slate-400" />
              Secure checkout
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block" />
            <span>PKR pricing</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block" />
            <span>Change anytime</span>
          </div>

          {/* filters */}
          <div
            role="tablist"
            className="mt-8 inline-flex rounded-xl border border-slate-800 bg-[#111827] p-1"
          >
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition ${focusRing} ${
                  filter === key
                    ? "bg-sky-500/15 text-sky-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* current plan strip */}
        {mySubscription &&
          normalize(mySubscription.status) === "active" &&
          mySubscription.plan &&
          normalize(mySubscription.plan) !== "none" && (
            <div className="mx-auto mt-10 max-w-xl rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-center text-sm text-emerald-200/90">
              Active plan:{" "}
              <span className="font-semibold capitalize text-emerald-300">
                {mySubscription.plan}
              </span>
              {mySubscription.endsAt && (
                <span className="text-emerald-200/60">
                  {" "}
                  · ends{" "}
                  {new Date(mySubscription.endsAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          )}

        {/* grid / empty */}
        {visiblePlans.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-slate-800 bg-[#111827]/40 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-[#0b1220] text-slate-500">
              <PackageOpen size={24} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-white">
              No plans in this filter
            </h2>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Try All, or check back when new plans are published.
            </p>
            {filter !== "all" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`mt-5 rounded-xl bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/25 ${focusRing}`}
              >
                Show all plans
              </button>
            )}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlans.map((plan) => {
              const current = isCurrentPlan(plan, mySubscription);
              return (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  isCurrent={current}
                  isBestValue={plan._id === bestValueId && !current}
                  onChoose={handleChoosePlan}
                  onCancel={setPlanToCancel}
                />
              );
            })}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-slate-600">
          Prices in PKR · Free plan cannot be cancelled · Secure payments via
          Stripe
        </p>
      </div>

      {planToCancel && (
        <ConfirmCancel
          plan={planToCancel}
          onClose={() => setPlanToCancel(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}

export default AllPlans;