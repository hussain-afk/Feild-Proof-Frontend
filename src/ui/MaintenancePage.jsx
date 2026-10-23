import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wrench, RefreshCw, ShieldCheck, Clock } from "lucide-react";

function MaintenancePage({ status, onCheck }) {
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(null);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    const initialUpdate = setTimeout(updateNow, 0);
    const timer = setInterval(updateNow, 60000);

    return () => {
      clearTimeout(initialUpdate);
      clearInterval(timer);
    };
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    await onCheck();
    setTimeout(() => setChecking(false), 600);
  };

  const minutesLeft = status.endsAt && now != null
    ? Math.max(1, Math.ceil((new Date(status.endsAt) - now) / 60000))
    : null;

  const timeLabel =
    minutesLeft == null
      ? null
      : minutesLeft >= 60
        ? `about ${Math.round(minutesLeft / 60)} hour${Math.round(minutesLeft / 60) === 1 ? "" : "s"}`
        : `about ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`;

  return (
    <div
      role="alert"
      className="fixed inset-0 z-[3000] flex items-center justify-center overflow-y-auto bg-[#070a12] p-4 text-slate-100"
    >
      {/* Soft glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.07] blur-3xl"
      />

      <div className="relative my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0c1220] shadow-2xl shadow-black/40">
        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-400" />

        <div className="p-6 text-center sm:p-8">
          {/* Brand */}
          <div className="mb-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-sky-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            FieldProof
          </div>

          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/25 bg-sky-500/10 text-sky-400 shadow-[0_0_32px_rgba(56,189,248,0.15)]">
            <Wrench className="h-7 w-7" strokeWidth={1.75} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
            We&apos;ll be back soon
          </h1>

          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-400">
            {status?.message ||
              "We're doing a short upgrade. Thanks for your patience."}
          </p>

          {timeLabel && (
            <div className="mt-6 flex items-center justify-center gap-2.5 rounded-xl border border-slate-800/80 bg-[#0a0f1a] px-4 py-3.5">
              <Clock className="h-4 w-4 shrink-0 text-sky-400" />
              <p className="text-sm text-slate-300">
                Back in <span className="font-medium text-white">{timeLabel}</span>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-medium text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw
              className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Checking..." : "Check again"}
          </button>

          <p className="mt-4 text-[11px] leading-relaxed text-slate-600">
            This page will open the site by itself when maintenance ends.
          </p>

          <div className="mt-6 border-t border-slate-800/80 pt-5">
            <Link
              to="/auth"
              className="text-xs font-medium text-slate-500 transition hover:text-sky-400"
            >
              Admin sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;