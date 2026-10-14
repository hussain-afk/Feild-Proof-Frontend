
import { ShieldCheck } from "lucide-react";

function LoadingState({
  message = "Loading FieldProof",
  subtext = "Preparing your workspace",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex min-h-screen w-full flex-col items-center justify-center gap-5 overflow-hidden bg-[#0d1320]/95 text-white"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.08] blur-[90px]" />

      {/* Spinner */}
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/15 border-t-blue-400 border-r-cyan-400/50 animate-spin [animation-duration:1.3s] motion-reduce:animate-none" />

        <div className="absolute inset-2.5 rounded-full border border-transparent border-b-blue-400 border-l-cyan-400/60 animate-spin [animation-direction:reverse] [animation-duration:1s] motion-reduce:animate-none" />

        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_25px_rgba(37,99,235,0.35)]">
          <ShieldCheck size={23} strokeWidth={1.8} />
        </div>
      </div>

      {/* Loading Text */}
      <div className="relative z-10 space-y-2 text-center">
        <h3 className="text-sm font-semibold tracking-wide text-slate-100">
          {message}
        </h3>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>{subtext}</span>
          <span className="flex gap-1" aria-hidden="true">
            <span className="h-1 w-1 animate-bounce rounded-full bg-blue-400 motion-reduce:animate-none" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms] motion-reduce:animate-none" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms] motion-reduce:animate-none" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
