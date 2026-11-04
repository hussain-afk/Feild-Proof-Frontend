import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { context } from "../context/context";
import { Check, ChevronDown, Users, ClipboardList, PackageOpen } from "lucide-react";
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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17]";

/* ------------------------------------------------------------------ */
/* Plan Card                                                            */
/* ------------------------------------------------------------------ */

function PlanCard({ plan, isCurrent, isBestValue, onChoose, onCancel }) {
  const [showAll, setShowAll] = useState(false);
  const free = isFreePlan(plan);
  const available = !isPlanExpired(plan);
  const perWorker = pricePerWorker(plan);

  const features = Array.isArray(plan.features) ? plan.features : [];
  const visibleFeatures = showAll ? features : features.slice(0, 5);

  const border = isCurrent
    ? "border-emerald-500/60 bg-emerald-500/[0.04]"
    : isBestValue
      ? "border-sky-500/50 bg-sky-500/[0.04]"
      : "border-slate-800 bg-[#111827]";

  return (
    <article className={`flex flex-col rounded-3xl border p-7 ${border}`}>
      <div className="flex min-h-[28px] items-center justify-between gap-2">
        <h2 className="text-base font-medium capitalize text-slate-200">
          {plan.plan}
        </h2>
        {isCurrent ? (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
            Current
          </span>
        ) : isBestValue ? (
          <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300">
            Best value
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-normal tracking-tight text-white">
          {formatPrice(plan.price)}
        </span>
        <span className="text-sm text-slate-500">{getBillingText(plan)}</span>
      </div>
      <p className="mt-1.5 h-5 text-sm text-slate-500">
        {free
          ? "No card required"
          : perWorker
            ? `About Rs ${Math.round(perWorker).toLocaleString("en-PK")} per worker`
            : ""}
      </p>

      <div className="mt-5">
        {isCurrent ? (
          <>
            <div className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-500/40 text-sm font-medium text-emerald-300">
              <Check size={16} strokeWidth={2.5} />
              Your plan
            </div>
            {!free && (
              <button
                type="button"
                onClick={() => onCancel(plan)}
                className={`mt-2 h-10 w-full rounded-full text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 ${focusRing}`}
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
            className={`h-11 w-full rounded-full text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 ${focusRing} ${isBestValue
              ? "bg-sky-500 text-white hover:bg-sky-400"
              : "border border-sky-500/40 text-sky-300 hover:bg-sky-500/10"
              }`}
          >
            {available ? (free ? "Get started" : "Choose plan") : "Not available"}
          </button>
        )}
      </div>

      <dl className="mt-6 space-y-3 border-t border-slate-800 pt-5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2.5 text-slate-400">
            <Users size={16} /> Workers
          </dt>
          <dd className="font-medium text-slate-100">
            {toNumber(plan.workerLimit)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2.5 text-slate-400">
            <ClipboardList size={16} /> Tasks
          </dt>
          <dd className="font-medium text-slate-100">
            {toNumber(plan.taskLimit)}
          </dd>
        </div>
      </dl>

      {features.length > 0 && (
        <div className="mt-5 border-t border-slate-800 pt-5">
          <ul className="space-y-3">
            {visibleFeatures.map((feature, index) => (
              <li
                key={`${feature}-${index}`}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <Check
                  size={17}
                  className="mt-0.5 shrink-0 text-sky-400"
                  strokeWidth={2.5}
                />
                <span className="leading-5">{feature}</span>
              </li>
            ))}
          </ul>
          {features.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className={`mt-4 inline-flex items-center gap-1 rounded text-sm font-medium text-sky-400 hover:text-sky-300 ${focusRing}`}
            >
              {showAll ? "Show less" : `Show ${features.length - 5} more`}
              <ChevronDown
                size={16}
                className={`transition-transform ${showAll ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Cancel confirmation                                                  */
/* ------------------------------------------------------------------ */

function ConfirmCancel({ plan, onClose, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#111827] p-7"
      >
        <h2 id="cancel-title" className="text-lg font-medium text-white">
          Cancel your {plan.plan} plan?
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your team will lose the benefits of this plan. You can choose a plan
          again at any time.
        </p>
        <div className="mt-7 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`h-10 rounded-full px-5 text-sm font-medium text-sky-300 hover:bg-sky-500/10 ${focusRing}`}
          >
            Keep plan
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white hover:bg-rose-400 ${focusRing}`}
          >
            Cancel plan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                            */
/* ------------------------------------------------------------------ */

function AllPlans() {
  const { handleCancelSubscription, handleCreateCheckoutSession } =
    useSubscriptions();
  const { allPlans, mySubscription, syncUser } = useContext(context);

  const [searchParams, setSearchParams] = useSearchParams();
  const paymentHandled = useRef(false);

  const plans = useMemo(
    () => (Array.isArray(allPlans) ? allPlans : []),
    [allPlans]
  );

  const [filter, setFilter] = useState("all");
  const [planToCancel, setPlanToCancel] = useState(null);

  // Stripe wapas aaye: ?success=1  ya  ?canceled=1
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

      // Webhook plan DB mein laga chuka hoga — UI refresh
      if (typeof syncUser === "function") {
        syncUser();
      }

      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, syncUser]);

  const handleChoosePlan = async (plan) => {
    if (isFreePlan(plan)) {
      return;
    }

    console.log("Selected Plan:", plan);
    console.log("Selected Plan ID:", plan._id);

    try {
      const result = await handleCreateCheckoutSession(plan._id);

      console.log("Checkout API Result:", result);
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
    <div className="min-h-full bg-[#0b0f17] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <header className="text-center">
          <h1 className="text-3xl font-normal tracking-tight text-white sm:text-[40px] sm:leading-tight">
            Choose a plan that works for you
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-400">
            Pick a plan for your team. You can change or cancel a paid plan
            anytime.
          </p>

          <div
            role="tablist"
            className="mt-9 inline-flex rounded-full border border-slate-800 bg-[#111827] p-1"
          >
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition ${focusRing} ${filter === key
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {visiblePlans.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-slate-500">
              <PackageOpen size={24} />
            </div>
            <h2 className="mt-4 text-base font-medium text-white">
              No plans here yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Try another billing option.
            </p>
            {filter !== "all" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`mt-4 rounded-full px-4 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/10 ${focusRing}`}
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

        <p className="mt-10 text-center text-xs text-slate-500">
          Prices are in PKR. The free plan cannot be cancelled.
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