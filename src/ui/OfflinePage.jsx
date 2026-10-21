import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  WifiOff,
  Wifi,
  Plane,
  Signal,
  RefreshCw,
  ShieldCheck,
  Clock3,
  ArrowRight,
  RadioTower,
} from "lucide-react";

const tips = [
  {
    icon: Wifi,
    title: "Check your Wi-Fi",
    text: "Make sure your device is connected to a network.",
    color: "blue",
  },
  {
    icon: Plane,
    title: "Airplane mode",
    text: "Make sure airplane mode is switched off.",
    color: "violet",
  },
  {
    icon: Signal,
    title: "Check your signal",
    text: "Move somewhere with better network coverage.",
    color: "emerald",
  },
];

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

function OfflinePage({
  checking = false,
  offlineSince,
  onRetry,
}) {
  const rootRef = useRef(null);
  const [failedOnce, setFailedOnce] = useState(false);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const mm = gsap.matchMedia();

    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        tl.fromTo(
          ".fp-header",
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.45 }
        )
          .fromTo(
            ".fp-copy > *",
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.1 },
            "-=0.1"
          )
          .fromTo(
            ".fp-illustration",
            { opacity: 0, scale: 0.92, x: 20 },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              duration: 0.75,
            },
            "-=0.55"
          )
          .fromTo(
            ".fp-tip",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
            "-=0.25"
          )
          .fromTo(
            ".fp-footer",
            { opacity: 0 },
            { opacity: 1, duration: 0.4 },
            "-=0.15"
          );

        gsap.to(".fp-float", {
          y: -9,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(".fp-signal-ring", {
          scale: 1.13,
          opacity: 0.25,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      },
      rootRef
    );

    return () => {
      mm.revert();
      document.body.style.overflow = oldOverflow;
    };
  }, []);

  const handleRetry = async () => {
    if (checking || !onRetry) return;

    setFailedOnce(false);

    try {
      const connected = await onRetry();
      if (!connected) setFailedOnce(true);
    } catch {
      setFailedOnce(true);
    }
  };

  return (
    <main
      ref={rootRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="fp-offline-title"
      className="fixed inset-0 z-[3000] overflow-x-hidden overflow-y-auto bg-[#070b15] text-white"
    >
      {/* Background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.09] blur-[120px]" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-sky-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-[-200px] right-[-100px] h-96 w-96 rounded-full bg-indigo-600/[0.08] blur-[110px]" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1500px] flex-col px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <header className="fp-header flex min-h-[76px] items-center justify-between border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="text-[17px] font-bold tracking-tight">
                Field<span className="text-sky-400">Proof</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Field Operations Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-red-400/15 bg-red-500/[0.06] px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>
            <span className="text-xs font-medium text-red-300">
              Offline
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="grid flex-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:py-12">
          {/* Left content */}
          <div className="fp-copy relative z-10 mx-auto w-full max-w-2xl lg:mx-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/15 bg-red-500/[0.06] px-3.5 py-2">
              <WifiOff size={14} className="text-red-400" />
              <span className="text-xs font-medium text-red-300">
                No internet connection
              </span>
            </div>

            <h1
              id="fp-offline-title"
              className="max-w-xl text-4xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-5xl md:text-6xl xl:text-7xl"
            >
              You're
              <br className="hidden sm:block" />{" "}
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                offline.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              Looks like your internet connection has dropped.
              Don't worry — your workspace is waiting for you.
              Reconnect to get back to work.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRetry}
                disabled={checking || !onRetry}
                className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition duration-200 hover:-translate-y-0.5 hover:from-sky-400 hover:to-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={checking ? "animate-spin" : ""}
                />
                {checking ? "Checking connection..." : "Try again"}
                {!checking && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-[#101827]/80 px-6 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <RefreshCw size={15} />
                Reload page
              </button>
            </div>

            {/* Connection details */}
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/[0.08] pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/70 bg-[#101827] text-slate-400">
                  <Clock3 size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Connection lost</p>
                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {offlineSince ? formatTime(offlineSince) : "Waiting to reconnect"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/70 bg-[#101827] text-sky-400">
                  <RadioTower size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Network status</p>
                  <p role="status" aria-live="polite" className="mt-1 text-sm font-medium text-slate-200">
                    {checking
                      ? "Checking..."
                      : failedOnce
                        ? "Still disconnected"
                        : "Waiting for network"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right illustration */}
          <div className="fp-illustration relative mx-auto flex min-h-[280px] w-full max-w-[520px] items-center justify-center sm:min-h-[360px] lg:min-h-[470px]">
            <div className="fp-signal-ring absolute h-[230px] w-[230px] rounded-full border border-sky-400/20 bg-blue-500/[0.025] sm:h-[330px] sm:w-[330px]" />

            <div className="absolute h-[180px] w-[180px] rounded-full bg-blue-500/[0.12] blur-[70px] sm:h-[260px] sm:w-[260px]" />

            {/* Decorative network nodes */}
            <span className="absolute left-[13%] top-[24%] h-2 w-2 rounded-full bg-sky-400/70 shadow-[0_0_18px_rgba(56,189,248,0.5)]" />
            <span className="absolute right-[14%] top-[20%] h-1.5 w-1.5 rounded-full bg-blue-300/70" />
            <span className="absolute bottom-[25%] left-[20%] h-1.5 w-1.5 rounded-full bg-indigo-300/70" />

            {/* Main icon composition */}
            <div className="fp-float relative z-10 flex h-48 w-48 items-center justify-center sm:h-64 sm:w-64">
              <div className="absolute inset-0 rounded-[3rem] border border-sky-400/15 bg-gradient-to-br from-sky-400/[0.08] via-blue-500/[0.03] to-indigo-500/[0.09] shadow-[0_0_90px_rgba(37,99,235,0.08)]" />

              <div className="absolute inset-5 rounded-[2.4rem] border border-slate-700/40 bg-[#0b1220]/80" />

              <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-sky-400/20 bg-gradient-to-br from-sky-500/15 to-blue-600/10 text-sky-300 shadow-[0_0_55px_rgba(56,189,248,0.12)] sm:h-36 sm:w-36">
                <WifiOff
                  size={66}
                  strokeWidth={1.2}
                  className="sm:h-[78px] sm:w-[78px]"
                />
              </div>

              <div className="absolute -right-2 top-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/20 bg-[#24131c] text-red-400 shadow-lg shadow-black/30 sm:-right-3 sm:top-10 sm:h-14 sm:w-14">
                <span className="text-2xl font-light">×</span>
              </div>

              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-700/70 bg-[#101827] px-4 py-2 text-[11px] font-medium text-slate-400 shadow-xl">
                Connection unavailable
              </div>
            </div>

            {/* Floating status card */}
            <div className="absolute right-0 top-[13%] hidden rounded-2xl border border-slate-700/70 bg-[#0d1320]/90 p-3 shadow-2xl backdrop-blur sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
                  <WifiOff size={17} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Network lost</p>
                  <p className="mt-1 text-[10px] text-slate-500">Connection interrupted</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[15%] left-0 hidden rounded-2xl border border-slate-700/70 bg-[#0d1320]/90 p-3 shadow-2xl backdrop-blur sm:block">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-sky-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">FieldProof</p>
                  <p className="mt-1 text-[10px] text-slate-500">Ready to reconnect</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick fixes */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                Quick solutions
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
                Let's get you back online
              </h2>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">
              3 things to check
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {tips.map(({ icon: Icon, title, text, color }, index) => {
              const iconColors = {
                blue: "bg-blue-500/10 text-blue-400 border-blue-400/15",
                violet: "bg-violet-500/10 text-violet-400 border-violet-400/15",
                emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-400/15",
              };

              return (
                <article
                  key={title}
                  className="fp-tip group flex items-start gap-4 rounded-2xl border border-slate-800/90 bg-[#0d1320]/80 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-sky-500/25 hover:bg-[#111a2b] sm:p-5"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconColors[color]}`}>
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-600">
                        0{index + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-200">
                        {title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="fp-footer mt-auto flex flex-col items-center justify-between gap-3 border-t border-white/[0.07] py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">
            © FieldProof · Field Operations Platform
          </p>

          <p className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={14} className="text-sky-500" />
            Your workspace is waiting for you.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default OfflinePage;