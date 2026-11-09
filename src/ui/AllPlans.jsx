
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
  CreditCard,
  Crown,
  CalendarDays,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import useSubscriptions from "../hooks/useSubscriptions";
import { getMySubscription } from "../api/billing.api";

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
  { key: "all", label: "All plans" },
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
      className={`flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-200 ${
        isCurrent
          ? "border-emerald-500/40 bg-[#0f1a14]"
          : isBestValue
            ? "border-sky-500/40 bg-[#0c1524]"
            : "border-slate-800 bg-[#111827] hover:border-slate-700"
      }`}
    >
      {/* Top accent */}
      <div
        className={`h-1 w-full ${
          isCurrent
            ? "bg-emerald-500"
            : isBestValue
              ? "bg-sky-500"
              : "bg-slate-800"
        }`}
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Heading */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${
                isCurrent
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : isBestValue
                    ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
                    : "border-slate-700 bg-slate-800/70 text-slate-400"
              }`}
            >
              {isCurrent ? (
                <CheckCircle2 size={20} />
              ) : isBestValue ? (
                <Crown size={20} />
              ) : (
                <Zap size={20} />
              )}
            </div>

            <h2 className="text-xl font-semibold capitalize text-white">
              {plan.plan}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {free ? "Starter access" : "Full field team access"}
            </p>
          </div>

          {isCurrent ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <Check size={12} />
              Current
            </span>
          ) : isBestValue ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300">
              <Sparkles size={12} />
              Best value
            </span>
          ) : null}
        </div>

        {/* Price */}
        <div className="mt-7 border-b border-slate-800 pb-6">
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-4xl font-bold tracking-tight text-white">
              {formatPrice(plan.price)}
            </span>

            <span className="mb-1 text-sm text-slate-500">
              {getBillingText(plan)}
            </span>
          </div>

          <p className="mt-2 min-h-5 text-sm text-slate-500">
            {free
              ? "No credit card required"
              : perWorker
                ? `Approximately Rs ${Math.round(perWorker).toLocaleString("en-PK")} per worker`
                : "\u00a0"}
          </p>
        </div>

        {/* Button */}
        <div className="mt-6">
          {isCurrent ? (
            <>
              <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
                <CheckCircle2 size={16} />
                Your active plan
              </div>

              {!free && (
                <button
                  type="button"
                  onClick={() => onCancel(plan)}
                  className={`mt-2 h-10 w-full rounded-xl text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 ${focusRing}`}
                >
                  Cancel subscription
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              disabled={!available}
              onClick={() => onChoose(plan)}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-800/60 disabled:text-slate-500 ${focusRing} ${
                isBestValue
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : free
                    ? "border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    : "border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
              }`}
            >
              {available
                ? free
                  ? "Get started free"
                  : "Choose this plan"
                : "Not available"}

              {available && <ArrowRight size={15} />}
            </button>
          )}
        </div>

        {/* Limits */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <Users size={14} className="text-sky-400" />
              Workers
            </div>

            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {toNumber(plan.workerLimit)}
            </p>

            <p className="mt-1 text-[11px] text-slate-600">
              Team members
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <ClipboardList size={14} className="text-sky-400" />
              Tasks
            </div>

            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {toNumber(plan.taskLimit)}
            </p>

            <p className="mt-1 text-[11px] text-slate-600">
              Task capacity
            </p>
          </div>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="mt-6 flex-1 border-t border-slate-800 pt-5">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              What's included
            </p>

            <ul className="space-y-3">
              {visibleFeatures.map((feature, index) => (
                <li
                  key={`${feature}-${index}`}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
                    <Check size={11} strokeWidth={3} />
                  </span>

                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            {features.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 ${focusRing}`}
              >
                {showAll
                  ? "Show less"
                  : `View ${features.length - 4} more features`}

                <ChevronDown
                  size={14}
                  className={showAll ? "rotate-180" : ""}
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
/* Cancel Modal                                                         */
/* ------------------------------------------------------------------ */

function ConfirmCancel({ plan, onClose, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] shadow-2xl"
      >
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              <X size={22} />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className={`rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white ${focusRing}`}
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
            Subscription cancellation
          </p>

          <h2
            id="cancel-title"
            className="mt-2 text-xl font-semibold text-white"
          >
            Cancel {plan.plan} plan?
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Your team will lose this plan's limits and benefits. You can
            subscribe again anytime.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`h-11 rounded-xl border border-slate-700 px-5 text-sm font-medium text-slate-300 hover:bg-slate-800 ${focusRing}`}
          >
            Keep my plan
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-500 ${focusRing}`}
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

  const {
    allPlans,
    mySubscription,
    setMySubscription,
    syncUser,
    refresh,
  } = useContext(context);

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

      const sessionId = searchParams.get("session_id");

      const waitForWebhookUpdate = async () => {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          try {
            const subscription = await getMySubscription();

            if (
              subscription &&
              (!sessionId || subscription.stripeSessionId === sessionId)
            ) {
              setMySubscription(subscription);
              setSearchParams({}, { replace: true });
              return;
            }
          } catch (error) {
            console.error("Subscription refresh after payment failed:", error);
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (typeof refresh === "function") {
          await refresh({ force: true });
        } else if (typeof syncUser === "function") {
          await syncUser();
        }

        setSearchParams({}, { replace: true });
      };

      waitForWebhookUpdate();
    }
  }, [searchParams, setSearchParams, setMySubscription, syncUser, refresh]);

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

  const activeSubscription =
    mySubscription &&
    normalize(mySubscription.status) === "active" &&
    mySubscription.plan &&
    normalize(mySubscription.plan) !== "none";

  return (
    <div className="relative min-h-full overflow-hidden bg-[#0b0f17] text-slate-100">
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

        {/* Header */}
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-300">
            <Sparkles size={14} />
            FIELDPROOF PRICING
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Choose the plan that fits
            <span className="block text-sky-400">your team</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Manage your workforce, organize field tasks, and scale your
            operations with a plan that fits your team.
          </p>

          {/* Trust indicators */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Shield size={15} className="text-emerald-400" />
              Secure checkout
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <CreditCard size={15} className="text-sky-400" />
              PKR pricing
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Zap size={15} className="text-amber-400" />
              Flexible plans
            </div>
          </div>

          {/* Filters */}
          <div
            role="tablist"
            className="mt-9 inline-flex w-full max-w-md rounded-xl border border-slate-800 bg-[#111827] p-1 sm:w-auto"
          >
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`flex-1 rounded-lg px-5 py-3 text-xs font-semibold transition-colors sm:flex-none sm:px-7 sm:text-sm ${focusRing} ${
                  filter === key
                    ? "bg-sky-500 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Active subscription */}
        {activeSubscription && (
          <div className="mx-auto mt-9 max-w-3xl rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Active subscription
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-white">
                    {mySubscription.plan} plan
                  </p>
                </div>
              </div>

              {mySubscription.endsAt && (
                <div className="flex items-center gap-2 text-xs text-emerald-200/80">
                  <CalendarDays size={15} />

                  <span>
                    Ends{" "}
                    {new Date(mySubscription.endsAt).toLocaleDateString(
                      "en-PK",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section heading */}
        <div className="mb-6 mt-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">
              Pricing plans
            </p>

            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              Explore your options
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Find the features and capacity your team needs.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-800 bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-slate-400">
            {visiblePlans.length}{" "}
            {visiblePlans.length === 1 ? "plan" : "plans"} available
          </span>
        </div>

        {/* Plans */}
        {visiblePlans.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-800 bg-[#111827]/50 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-800 bg-[#0b1220] text-slate-500">
              <PackageOpen size={24} />
            </div>

            <h2 className="mt-4 text-base font-semibold text-white">
              No plans in this filter
            </h2>

            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Try All plans, or check back when new plans are published.
            </p>

            {filter !== "all" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`mt-5 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 ${focusRing}`}
              >
                Show all plans
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
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

        {/* Footer */}
        <div className="mt-12 border-t border-slate-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 sm:justify-start">
                <Shield size={14} className="text-emerald-400" />
                Secure and flexible subscriptions
              </div>

              <p className="mt-2 text-[11px] text-slate-600">
                Prices in PKR · Free plan cannot be cancelled · Secure payments
                via Stripe
              </p>
            </div>

            <span className="text-[11px] text-slate-600">
              FieldProof Subscription Plans
            </span>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
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