import { ShieldCheck } from "lucide-react";

function LoadingState({
  message = "Loading FieldProof",
  subtext = "Preparing your workspace",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#070a12] text-slate-100"
    >
      {/* Soft ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.07] blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-indigo-500/[0.05] blur-[80px]" />
      </div>

      {/* Spinner + logo */}
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-slate-800/80" />

        {/* Spinning arc */}
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-sky-400 border-r-sky-400/40 [animation-duration:1.1s] motion-reduce:animate-none" />

        {/* Inner reverse arc */}
        <div className="absolute inset-3 animate-spin rounded-full border border-transparent border-b-sky-500/50 border-l-cyan-400/40 [animation-direction:reverse] [animation-duration:1.6s] motion-reduce:animate-none" />

        {/* Center logo */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-lg shadow-sky-600/30">
          <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 space-y-3 text-center">
        <h3 className="text-base font-semibold tracking-tight text-white">
          {message}
        </h3>

        <div className="flex items-center justify-center gap-2.5 text-sm text-slate-500">
          <span>{subtext}</span>
          <span className="flex gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400 [animation-duration:0.9s] motion-reduce:animate-none" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400/70 [animation-delay:150ms] [animation-duration:0.9s] motion-reduce:animate-none" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400/40 [animation-delay:300ms] [animation-duration:0.9s] motion-reduce:animate-none" />
          </span>
        </div>
      </div>

      {/* Subtle bottom brand */}
      <p className="absolute bottom-8 text-[11px] font-medium uppercase tracking-widest text-slate-600">
        Field<span className="text-sky-500/70">Proof</span>
      </p>
    </div>
  );
}

export default LoadingState;