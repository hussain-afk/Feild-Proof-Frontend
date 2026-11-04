import { useState } from "react";
import useAdmin from "../../../hooks/useAdmin.jsx";
import {
  Package,
  ListChecks,
  DollarSign,
  CalendarDays,
  Users,
  ClipboardList,
  Loader2,
  Plus,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const PLAN_OPTIONS = ["free", "trial", "basic", "enterprise", "pro"];
const STATUS_OPTIONS = ["active", "inactive", "expired"];
const CURRENCY_SYMBOL = "$";

const FEATURE_SUGGESTIONS = [
  "GPS check-in",
  "Photo proof",
  "Invites",
  "Chat",
  "Activity log",
  "Reports",
];

const STATUS_STYLE = {
  active: {
    dot: "bg-emerald-400",
    on: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  },
  inactive: {
    dot: "bg-slate-400",
    on: "border-slate-500/50 bg-slate-500/10 text-slate-200",
    badge: "border-slate-600/40 bg-slate-700/30 text-slate-300",
  },
  expired: {
    dot: "bg-red-400",
    on: "border-red-500/40 bg-red-500/10 text-red-300",
    badge: "border-red-500/25 bg-red-500/10 text-red-300",
  },
};

const EMPTY_PLAN = {
  plan: "free",
  features: "",
  price: "0",
  days: "0",
  workerLimit: "",
  taskLimit: "",
  status: "inactive",
};

const NUMBER_FIELDS = [
  {
    name: "price",
    label: "Price",
    icon: DollarSign,
    placeholder: "0",
    step: "1",
  },
  {
    name: "days",
    label: "Duration (days)",
    icon: CalendarDays,
    placeholder: "30",
  },
  {
    name: "workerLimit",
    label: "Worker limit",
    icon: Users,
    placeholder: "5",
  },
  {
    name: "taskLimit",
    label: "Task limit",
    icon: ClipboardList,
    placeholder: "100",
  },
];

const inputClass =
  "h-11 w-full rounded-xl border bg-[#0b1220] pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:ring-2";
const okInput = "border-slate-800 focus:border-sky-500 focus:ring-sky-500/20";
const badInput = "border-red-500/50 focus:border-red-500 focus:ring-red-500/20";

const splitFeatures = (text) =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatDuration = (days, plan) => {
  if (plan === "free" || Number(days) === 0) return "lifetime";
  const number = Number(days);
  if (!number) return "";
  if (number === 30) return "per month";
  if (number === 365) return "per year";
  return `for ${number} ${number === 1 ? "day" : "days"}`;
};

function Field({ id, label, icon: Icon, error, children, hint }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-400"
      >
        {label}
        <span aria-hidden="true" className="ml-0.5 text-red-400">
          *
        </span>
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        {children}
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-[11px] text-slate-600">{hint}</p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-400"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function PlanPreview({ data, features }) {
  const isFree = data.plan === "free";
  const price = isFree ? 0 : Number(data.price) || 0;
  const status = STATUS_STYLE[data.status];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
      <div className="border-b border-slate-800 bg-[#0e1522] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-sky-300">
            <Package className="h-3 w-3" />
            {data.plan}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${status.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {data.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold tracking-tight text-white">
            {isFree ? "Free" : `${CURRENCY_SYMBOL}${price.toLocaleString()}`}
          </span>
          <span className="text-sm text-slate-500">
            {formatDuration(data.days, data.plan)}
          </span>
        </p>

        {isFree && (
          <p className="mt-2 text-xs text-emerald-400/90">
            Lifetime access · no expiry
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Users className="h-3 w-3" />
              Workers
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {data.workerLimit === "" ? "-" : Number(data.workerLimit)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ClipboardList className="h-3 w-3" />
              Tasks
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {data.taskLimit === "" ? "-" : Number(data.taskLimit)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2.5 text-xs font-medium text-slate-400">
            What is included
          </p>
          {features.length === 0 ? (
            <p className="text-xs text-slate-600">
              The features you add will show here.
            </p>
          ) : (
            <ul className="space-y-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-slate-300"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AddPlan() {
  const { handleAddPlan } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [planData, setPlanData] = useState(EMPTY_PLAN);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const features = splitFeatures(planData.features);
  const isFree = planData.plan === "free";
  const isUntouched =
    JSON.stringify(planData) === JSON.stringify(EMPTY_PLAN);

  const setField = (name, value) => {
    setPlanData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "plan" && value === "free"
        ? { price: "0", days: "0" }
        : {}),
    }));
    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
      ...(name === "plan" && value === "free"
        ? { price: undefined, days: undefined }
        : {}),
    }));
    setSubmitError("");
  };

  const onChange = (e) => setField(e.target.name, e.target.value);

  const addFeature = (feature) => {
    if (features.some((item) => item.toLowerCase() === feature.toLowerCase()))
      return;
    setField("features", [...features, feature].join(", "));
  };

  const reset = () => {
    setPlanData(EMPTY_PLAN);
    setErrors({});
    setSubmitError("");
  };

  const validate = () => {
    const found = {};

    NUMBER_FIELDS.forEach(({ name, label }) => {
      // free: price + days auto lifetime — skip strict empty check
      if (isFree && (name === "price" || name === "days")) return;

      const value = planData[name];
      if (value === "") found[name] = `Enter the ${label.toLowerCase()}`;
      else if (Number(value) < 0) found[name] = "It can not be below 0";
    });

    return found;
  };

  const addPlan = async (e) => {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      setBusy(true);
      setSubmitError("");

      const payload = {
        plan: planData.plan,
        features: planData.features,
        price: isFree ? 0 : Number(planData.price),
        days: isFree ? 0 : Number(planData.days), // 0 = lifetime
        workerLimit: Number(planData.workerLimit),
        taskLimit: Number(planData.taskLimit),
        status: planData.status,
      };

      await handleAddPlan(payload);
      toast.success(
        isFree ? "Free plan created (lifetime)" : "Plan created"
      );
      reset();
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not create the plan."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full text-slate-100">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
            <Package className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Add plan
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Create a catalog plan. Free plans get lifetime access.
            </p>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <form
            onSubmit={addPlan}
            noValidate
            className="rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6"
          >
            <fieldset>
              <legend className="text-sm font-semibold text-white">
                Plan type
              </legend>
              <p className="mt-0.5 text-xs text-slate-500">
                Free = lifetime (price 0, no expiry).
              </p>

              <div
                role="radiogroup"
                aria-label="Plan type"
                className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5"
              >
                {PLAN_OPTIONS.map((option) => {
                  const selected = planData.plan === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setField("plan", option)}
                      className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium capitalize transition ${
                        selected
                          ? "border-sky-500/50 bg-sky-500/10 text-sky-300"
                          : "border-slate-800 bg-[#0b1220] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-7 border-t border-slate-800 pt-6">
              <h2 className="text-sm font-semibold text-white">
                Price and limits
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {isFree
                  ? "Price and duration are locked for lifetime free."
                  : "How much it costs and what it allows."}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {NUMBER_FIELDS.map(
                  ({ name, label, icon, placeholder, step }) => {
                    const locked =
                      isFree && (name === "price" || name === "days");
                    return (
                      <Field
                        key={name}
                        id={name}
                        label={label}
                        icon={icon}
                        error={errors[name]}
                        hint={
                          locked
                            ? name === "days"
                              ? "0 = lifetime access"
                              : "Always free"
                            : undefined
                        }
                      >
                        <input
                          id={name}
                          name={name}
                          type="number"
                          min="0"
                          step={step}
                          inputMode="numeric"
                          value={planData[name]}
                          onChange={onChange}
                          placeholder={placeholder}
                          disabled={locked}
                          aria-invalid={Boolean(errors[name])}
                          className={`${inputClass} ${
                            errors[name] ? badInput : okInput
                          } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
                        />
                      </Field>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-7 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="features"
                    className="text-sm font-semibold text-white"
                  >
                    Features
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Separate each feature with a comma.
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-slate-800 bg-[#0b1220] px-2.5 py-0.5 text-xs text-slate-400">
                  {features.length}{" "}
                  {features.length === 1 ? "feature" : "features"}
                </span>
              </div>

              <div className="relative mt-3">
                <ListChecks className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <textarea
                  id="features"
                  name="features"
                  rows={3}
                  value={planData.features}
                  onChange={onChange}
                  placeholder="Comma separated, e.g. GPS check-in, Photo proof"
                  className="w-full resize-none rounded-xl border border-slate-800 bg-[#0b1220] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-600">
                  <Sparkles className="h-3 w-3" />
                  Quick add:
                </span>
                {FEATURE_SUGGESTIONS.map((feature) => {
                  const added = features.some(
                    (item) => item.toLowerCase() === feature.toLowerCase()
                  );
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => addFeature(feature)}
                      disabled={added}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300 disabled:cursor-default disabled:border-sky-500/20 disabled:bg-sky-500/10 disabled:text-sky-300"
                    >
                      {added ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 border-t border-slate-800 pt-6">
              <h2 className="text-sm font-semibold text-white">Status</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Is the plan available right now?
              </p>

              <div
                role="radiogroup"
                aria-label="Status"
                className="mt-3 grid grid-cols-3 gap-2"
              >
                {STATUS_OPTIONS.map((option) => {
                  const selected = planData.status === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setField("status", option)}
                      className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium capitalize transition ${
                        selected
                          ? STATUS_STYLE[option].on
                          : "border-slate-800 bg-[#0b1220] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_STYLE[option].dot}`}
                      />
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy || isUntouched}
                onClick={reset}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex h-11 min-w-36 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add plan
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              <h2 className="text-sm font-semibold text-white">Live preview</h2>
            </div>
            <PlanPreview data={planData} features={features} />
            <p className="mt-3 text-xs text-slate-500">
              Free shows lifetime access. Other plans show duration.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AddPlan;