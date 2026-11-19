import { ShieldCheck } from "lucide-react";

/**
 * Props:
 *  - message:    main line
 *  - subtext:    smaller line below it
 *  - fullScreen: true (default) covers the whole screen, exactly like before.
 *                false fits inside the page area (sidebar/header stay visible).
 */
function LoadingState({
  message = "Loading FieldProof",
  subtext = "Preparing your workspace",
  fullScreen = true,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex w-full flex-col items-center justify-center overflow-hidden text-slate-100 ${
        fullScreen
          ? "fixed inset-0 z-[9999] min-h-screen bg-[#070a12]"
          : "relative min-h-[60vh] bg-transparent"
      }`}
    >
      {/* Background: halka dotted grid + ek soft roshni (sirf full screen par) */}
      {fullScreen && (
        <>
          <div aria-hidden="true" className="fp-loading-grid pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.10),transparent_50%)]"
          />
        </>
      )}

      {/* Content 150ms baad fade-in hota hai, taake tez load par screen flash na kare */}
      <div className="fp-loading-content relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo mark */}
        <div className="relative h-24 w-24">
          <div
            aria-hidden="true"
            className="fp-loading-glow absolute -inset-5 rounded-full bg-sky-500/25 blur-2xl"
          />

          {/* Track + gradient arc */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-[3px] border-white/[0.06]"
          />
          <div aria-hidden="true" className="fp-loading-ring absolute inset-0 rounded-full" />

          {/* Tile */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-400 to-sky-700 text-white shadow-lg shadow-sky-950/60 ring-1 ring-white/25">
              <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* Text */}
        <p className="mt-8 text-lg font-semibold tracking-tight text-white">
          {message}
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">
          {subtext}
        </p>

        {/* Indeterminate progress bar */}
        <div
          aria-hidden="true"
          className="mt-7 h-1 w-48 overflow-hidden rounded-full bg-white/[0.07]"
        >
          <div className="fp-loading-bar h-full w-2/5 rounded-full" />
        </div>

        {/* 8 second ke baad hi dikhta hai */}
        <p className="fp-loading-slow mt-6 max-w-xs text-xs leading-relaxed text-slate-500">
          This is taking longer than usual. Please check your connection.
        </p>
      </div>

      {fullScreen && (
        <div className="absolute bottom-8 flex items-center gap-2 text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="text-xs font-semibold tracking-wide">
            Field<span className="text-sky-500/70">Proof</span>
          </span>
        </div>
      )}

      <style>{`
        @keyframes fp-loading-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fp-loading-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fp-loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes fp-loading-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }

        .fp-loading-content {
          animation: fp-loading-fade 400ms ease-out 150ms both;
        }
        .fp-loading-slow {
          animation: fp-loading-fade 400ms ease-out 8s both;
        }

        /* Smooth gradient arc (conic gradient + mask) */
        .fp-loading-ring {
          background: conic-gradient(
            from 0deg,
            rgba(56, 189, 248, 0) 0deg,
            rgba(56, 189, 248, 0.15) 140deg,
            #38bdf8 320deg,
            #bae6fd 360deg
          );
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
          animation: fp-loading-spin 1.1s linear infinite;
        }

        .fp-loading-glow {
          animation: fp-loading-glow 2.4s ease-in-out infinite;
        }

        .fp-loading-bar {
          background: linear-gradient(90deg, rgba(56,189,248,0), #38bdf8, rgba(56,189,248,0));
          animation: fp-loading-slide 1.4s ease-in-out infinite;
        }

        .fp-loading-grid {
          background-image: radial-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 68%);
          mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 68%);
        }

        @media (prefers-reduced-motion: reduce) {
          /* Delay barkarar rakhte hain, sirf harkat band */
          .fp-loading-content,
          .fp-loading-slow { animation-duration: 1ms; }
          .fp-loading-ring,
          .fp-loading-glow { animation: none; }
          .fp-loading-bar { animation: none; transform: translateX(75%); }
        }
      `}</style>
    </div>
  );
}

export default LoadingState;