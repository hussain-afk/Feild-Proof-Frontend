import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Lock,
  MessageSquare,
  Power,
  RefreshCw,
  ShieldCheck,
  Timer,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import {
  getMaintenanceStatus,
  setMaintenance,
} from "../../../api/maintenance.api.js";

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const DURATIONS = [
  { id: "30", label: "30 minutes", minutes: 30, description: "Quick system update", icon: Zap },
  { id: "60", label: "1 hour", minutes: 60, description: "Standard maintenance", icon: Clock3 },
  { id: "120", label: "2 hours", minutes: 120, description: "Major system update", icon: Wrench },
  { id: "until", label: "Until turned off", minutes: null, description: "You decide when it ends", icon: Power },
];

const CUSTOM_MIN = 5; // minutes
const CUSTOM_MAX = 1440; // 24 hours

// One click fills the message box
const TEMPLATES = [
  { label: "Planned update", text: "We are updating FieldProof to make it faster and more reliable. We will be back shortly." },
  { label: "Database work", text: "We are running scheduled database maintenance. Your data is safe and the app will return soon." },
  { label: "Urgent fix", text: "We are fixing an issue as quickly as we can. Thank you for your patience." },
];

const DEFAULT_MESSAGE = "We are making FieldProof better. We will be back soon.";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

// 3725000 ms -> "01:02:05"
function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// 90 -> "1 hour 30 minutes", null -> "until you turn it off"
function durationText(minutes) {
  if (!minutes) return "until you turn it off";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts = [];
  if (h) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} minute${m > 1 ? "s" : ""}`);
  return parts.join(" ");
}

// A clock that ticks every second, only while `enabled` is true (it does not call the server)
function useNow(enabled) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    const initialUpdate = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(initialUpdate);
      clearInterval(timer);
    };
  }, [enabled]);

  return now;
}

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

// Grey boxes shown while the page loads (same shape as the real page)
function LoadingSkeleton() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10" aria-busy="true">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-5 w-40 rounded-full bg-white/[0.06]" />
          <div className="h-10 w-72 rounded-xl bg-white/[0.06]" />
          <div className="h-4 w-96 max-w-full rounded-lg bg-white/[0.04]" />
        </div>
        <div className="h-52 rounded-3xl bg-white/[0.04]" />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-96 rounded-3xl bg-white/[0.04]" />
          <div className="h-96 rounded-3xl bg-white/[0.04]" />
        </div>
      </div>
      <p className="sr-only">Loading maintenance settings</p>
    </main>
  );
}

// The big status card at the top, with a live countdown while maintenance is active
function StatusHero({ status, now, sessionStart, lastUpdated }) {
  const isActive = Boolean(status?.active);
  const endsAt = status?.endsAt ? new Date(status.endsAt).getTime() : null;
  const remaining = endsAt ? endsAt - now : null;

  // Progress needs a start time: the server's, or the moment we switched it on in this session
  const startsAt = status?.startsAt ? new Date(status.startsAt).getTime() : sessionStart;
  const progress =
    endsAt && startsAt && endsAt > startsAt
      ? Math.min(100, Math.max(0, ((now - startsAt) / (endsAt - startsAt)) * 100))
      : null;

  const tone = isActive
    ? {
        wrap: "border-red-400/20 bg-gradient-to-br from-red-500/[0.10] via-[#11131c] to-[#0b0f17]",
        icon: "bg-red-400/10 text-red-300",
        dot: "animate-pulse bg-red-400",
        text: "text-red-300",
      }
    : {
        wrap: "border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.08] via-[#11131c] to-[#0b0f17]",
        icon: "bg-emerald-400/10 text-emerald-300",
        dot: "bg-emerald-400",
        text: "text-emerald-300",
      };

  return (
    <section
      aria-live="polite"
      className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${tone.wrap}`}
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/[0.04]" />
      <div className="pointer-events-none absolute -right-2 -top-6 h-36 w-36 rounded-full border border-white/[0.04]" />

      <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone.icon}`}>
              {isActive ? <Wrench className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
            </div>

            <div>
              <p className="text-sm text-slate-400">Platform status</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                <h2 className="text-2xl font-bold">
                  {isActive ? "Maintenance active" : "All systems available"}
                </h2>
              </div>
            </div>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-400">
            {isActive
              ? "Maintenance mode is on. Managers and workers see the maintenance page. Admins keep full access."
              : "Maintenance mode is off. Everyone can use the platform as usual."}
          </p>

          {/* Who is affected */}
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admins: full access
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                isActive
                  ? "border-red-400/20 bg-red-400/[0.07] text-red-300"
                  : "border-white/10 bg-white/[0.04] text-slate-400"
              }`}
            >
              {isActive ? <Lock className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
              Managers and workers: {isActive ? "blocked" : "normal access"}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="min-w-56 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
          <p className="text-xs font-medium text-slate-500">
            {isActive ? (endsAt ? "Time remaining" : "Maintenance window") : "Availability"}
          </p>

          {isActive && endsAt ? (
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-red-300">
              {formatClock(remaining)}
            </p>
          ) : (
            <div className={`mt-2 flex items-center gap-2 text-lg font-semibold ${tone.text}`}>
              {isActive ? <Timer className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              {isActive ? "No end time set" : "Online"}
            </div>
          )}

          {isActive && progress !== null && (
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-red-400 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">{Math.round(progress)}% of the window used</p>
            </div>
          )}

          {isActive && endsAt && (
            <p className="mt-3 text-xs text-slate-500">
              Ends at {new Date(endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5" />
          {lastUpdated ? `Last checked ${new Date(lastUpdated).toLocaleTimeString()}` : "Status not checked yet"}
        </span>
      </div>
    </section>
  );
}

// The duration tiles (+ a custom number of minutes)
function DurationPicker({ choice, setChoice, customMinutes, setCustomMinutes, customError, disabled }) {
  const tileClass = (selected) =>
    `group relative rounded-2xl border p-4 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50 ${
      selected
        ? "border-sky-400/50 bg-sky-400/[0.08] shadow-[0_0_24px_rgba(56,189,248,0.06)]"
        : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
    }`;

  const radio = (selected) => (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
        selected ? "border-sky-400 bg-sky-400 text-[#071019]" : "border-white/15 text-transparent"
      }`}
    >
      {selected && <Check className="h-3 w-3" />}
    </span>
  );

  const iconBox = (selected, Icon) => (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
        selected ? "bg-sky-400/15 text-sky-300" : "bg-white/[0.05] text-slate-400 group-hover:text-slate-200"
      }`}
    >
      <Icon className="h-5 w-5" />
    </div>
  );

  return (
    <div role="radiogroup" aria-label="Maintenance duration" className="grid gap-3 sm:grid-cols-2">
      {DURATIONS.map(({ id, label, description, icon: Icon }) => {
        const selected = choice === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => setChoice(id)}
            className={tileClass(selected)}
          >
            <div className="flex items-start justify-between gap-3">
              {iconBox(selected, Icon)}
              {radio(selected)}
            </div>
            <h4 className="mt-4 font-semibold">{label}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          </button>
        );
      })}

      {/* Custom */}
      <div
        role="radio"
        aria-checked={choice === "custom"}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setChoice("custom")}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setChoice("custom");
          }
        }}
        className={`${tileClass(choice === "custom")} cursor-pointer sm:col-span-2`}
      >
        <div className="flex items-start justify-between gap-3">
          {iconBox(choice === "custom", Timer)}
          {radio(choice === "custom")}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold">Custom duration</h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Between {CUSTOM_MIN} minutes and 24 hours
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="number"
              inputMode="numeric"
              min={CUSTOM_MIN}
              max={CUSTOM_MAX}
              value={customMinutes}
              disabled={disabled}
              onFocus={() => setChoice("custom")}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setChoice("custom");
                setCustomMinutes(e.target.value);
              }}
              aria-label="Custom duration in minutes"
              className="h-10 w-24 rounded-xl border border-white/10 bg-[#0b0f17] px-3 text-center text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            />
            minutes
          </label>
        </div>

        {choice === "custom" && customError && (
          <p className="mt-3 text-xs text-amber-300">{customError}</p>
        )}
      </div>
    </div>
  );
}

// What the visitor will see (a small mock of the maintenance page)
function PreviewCard({ message, minutes }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f17]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 inline-flex items-center gap-1.5 rounded-md bg-black/30 px-3 py-1 text-[11px] text-slate-500">
          <Lock className="h-3 w-3" />
          What users will see
        </span>
      </div>

      <div className="px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
          <Wrench className="h-6 w-6" />
        </div>
        <h4 className="text-base font-semibold">We will be right back</h4>
        <p className="mx-auto mt-2 max-w-xs whitespace-pre-line break-words text-sm leading-6 text-slate-400">
          {message.trim() || DEFAULT_MESSAGE}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          {minutes ? `Back in about ${durationText(minutes)}` : "Back as soon as possible"}
        </div>
      </div>
    </div>
  );
}

// The "Are you sure?" window (replaces the browser's plain confirm box)
function ConfirmDialog({ confirm, minutes, message, busy, onCancel, onConfirm }) {
  useEffect(() => {
    if (!confirm) return undefined;
    const onKey = (e) => e.key === "Escape" && !busy && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirm, busy, onCancel]);

  if (!confirm) return null;

  const enabling = confirm.enabling;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0f131c] p-6 shadow-2xl"
      >
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            enabling ? "bg-red-400/10 text-red-300" : "bg-emerald-400/10 text-emerald-300"
          }`}
        >
          {enabling ? <Power className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
        </div>

        <h3 id="confirm-title" className="text-xl font-semibold">
          {enabling ? "Turn maintenance on?" : "Turn maintenance off?"}
        </h3>

        <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
          {enabling ? (
            <>
              <li className="flex gap-2.5">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                Duration: {minutes ? durationText(minutes) : "until you turn it off"}
              </li>
              <li className="flex gap-2.5">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                Managers and workers will lose access and see the maintenance page.
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                Admins keep full access.
              </li>
              <li className="flex gap-2.5">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="line-clamp-3">Message: {message.trim() || DEFAULT_MESSAGE}</span>
              </li>
            </>
          ) : (
            <li className="flex gap-2.5">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              Managers and workers can use the platform again right away.
            </li>
          )}
        </ul>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              enabling ? "bg-red-500 hover:bg-red-400" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Please wait..." : enabling ? "Yes, turn on" : "Yes, turn off"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function MaintenanceSettings() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [choice, setChoice] = useState("60"); // "30" | "60" | "120" | "until" | "custom"
  const [customMinutes, setCustomMinutes] = useState("45");
  const [confirm, setConfirm] = useState(null); // { enabling: true | false } or null
  const [sessionStart, setSessionStart] = useState(null); // when we switched it on in this session

  const isActive = Boolean(status?.active);
  const now = useNow(isActive); // ticks only while maintenance is on

  // Minutes for the chosen duration (null = until turned off)
  const custom = Number(customMinutes);
  const customError =
    Number.isInteger(custom) && custom >= CUSTOM_MIN && custom <= CUSTOM_MAX
      ? ""
      : `Enter a whole number from ${CUSTOM_MIN} to ${CUSTOM_MAX}.`;

  const minutes =
    choice === "custom" ? custom : DURATIONS.find((item) => item.id === choice)?.minutes ?? null;

  const canActivate = !saving && !(choice === "custom" && customError);

  /* ---------- Load ---------- */
  const loadStatus = useCallback(async () => {
    try {
      setError("");
      const data = await getMaintenanceStatus();
      setStatus(data);
      setMessage(data.message || "");
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load maintenance status. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStatus]);

  // When the countdown reaches zero, ask the server once whether maintenance really ended
  const askedAfterEnd = useRef(false);
  useEffect(() => {
    const endsAt = status?.endsAt ? new Date(status.endsAt).getTime() : null;

    if (isActive && endsAt && now >= endsAt && !askedAfterEnd.current) {
      askedAfterEnd.current = true;
      loadStatus();
    }
    if (!isActive || (endsAt && now < endsAt)) askedAfterEnd.current = false;
  }, [isActive, status?.endsAt, now, loadStatus]);

  // The green message goes away by itself
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  /* ---------- Turn on / off ---------- */
  const applyChange = async () => {
    const enabling = Boolean(confirm?.enabling);

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await setMaintenance({
        enabled: enabling,
        message: message.trim(),
        minutes: enabling ? minutes : null,
      });

      setStatus(data);
      setMessage(data.message || "");
      setLastUpdated(Date.now());
      setSessionStart(enabling ? Date.now() : null);
      setConfirm(null);

      setNotice(
        enabling
          ? "Maintenance mode is now on."
          : "Maintenance mode is off. Everyone can use the platform again."
      );
    } catch (err) {
      setConfirm(null);
      setError(err.response?.data?.message || "The request failed. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white sm:px-6 lg:px-10 lg:py-10">
      {/* Background glow */}
      {/* <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-sky-500/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-500/[0.06] blur-[110px]" /> */}

      <div className="relative mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.07] px-3 py-1.5 text-xs font-medium text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              FieldProof control center
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Maintenance <span className="text-slate-500">control</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Choose when the platform is unavailable, tell users why, and bring it back with one click.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStatus}
            disabled={saving}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-sky-400/30 hover:bg-sky-400/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh status
          </button>
        </header>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 text-red-200/70">{error}</p>
              <button type="button" onClick={loadStatus} className="mt-3 font-semibold underline underline-offset-4">
                Try again
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-300"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-auto rounded-md p-1 text-emerald-200/70 hover:text-white"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Status */}
        <StatusHero status={status} now={now} sessionStart={sessionStart} lastUpdated={lastUpdated} />

        {/* Settings */}
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Duration */}
          <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">How long?</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Pick a duration. Maintenance ends by itself when the time is up.
                </p>
              </div>
            </div>

            <DurationPicker
              choice={choice}
              setChoice={setChoice}
              customMinutes={customMinutes}
              setCustomMinutes={setCustomMinutes}
              customError={customError}
              disabled={saving}
            />

            <button
              type="button"
              disabled={!canActivate}
              onClick={() => setConfirm({ enabling: true })}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Power className="h-5 w-5" />
              {isActive ? "Update maintenance" : "Turn maintenance on"}
            </button>
          </section>

          {/* Message */}
          <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">What do users see?</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">Write the message, or start from a template.</p>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  disabled={saving}
                  onClick={() => setMessage(template.text)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/[0.08] hover:text-white disabled:opacity-50"
                >
                  {template.label}
                </button>
              ))}
            </div>

            <label htmlFor="maintenance-message" className="sr-only">
              Maintenance message
            </label>
            <textarea
              id="maintenance-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={500}
              rows={5}
              placeholder={DEFAULT_MESSAGE}
              disabled={saving}
              className="w-full resize-y rounded-2xl border border-white/10 bg-[#0b0f17] p-4 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/[0.06] disabled:opacity-50"
            />

            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>Be clear and short.</span>
              <span className={message.length >= 480 ? "text-amber-300" : ""}>{message.length}/500</span>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-slate-500">Preview</p>
              <PreviewCard message={message} minutes={minutes} />
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-600">
              The message is saved when you turn maintenance on or off.
            </p>
          </section>
        </div>

        {/* Turn off */}
        <section className="flex flex-col justify-between gap-5 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Bring the platform back</h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Turn maintenance off now, before the timer ends, and let managers and workers in again.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving || !isActive}
            onClick={() => setConfirm({ enabling: false })}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Turn maintenance off
          </button>
        </section>

        <footer className="pb-3 text-center text-xs text-slate-600">FieldProof admin, maintenance management</footer>
      </div>

      <ConfirmDialog
        confirm={confirm}
        minutes={minutes}
        message={message}
        busy={saving}
        onCancel={() => setConfirm(null)}
        onConfirm={applyChange}
      />
    </main>
  );
}