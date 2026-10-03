
import React from "react";
import { ShieldCheck, LockKeyhole, Wifi, Database } from "lucide-react";

function LoadingState() {
  return (
    <div className="min-h-screen w-full bg-[#070b12] text-white flex items-center justify-center overflow-hidden relative">
      
      {/* Subtle Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(#94a3b8 1px, transparent 1px),
            linear-gradient(90deg, #94a3b8 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
        }}
      />

      {/* Ambient Background Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">

        {/* Logo Area */}
        <div className="relative mb-8">

          {/* Rotating Outer Ring */}
          <div className="absolute -inset-3 rounded-[28px] border border-blue-500/20 border-t-blue-400 animate-[spin_4s_linear_infinite]" />

          {/* Inner Ring */}
          <div className="absolute -inset-1.5 rounded-[22px] border border-slate-700/70" />

          {/* Logo */}
          <div className="relative w-20 h-20 rounded-[20px] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_15px_50px_rgba(37,99,235,0.25)]">
            <ShieldCheck
              size={38}
              strokeWidth={1.8}
              className="text-white"
            />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Field<span className="text-blue-500">Proof</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Secure field verification platform
          </p>
        </div>

        {/* Loading Section */}
        <div className="w-full">

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Securing your session
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Please wait while we prepare your workspace
              </p>
            </div>

            <span className="text-xs font-mono text-blue-400">
              SYNC
            </span>
          </div>

          {/* Progress */}
          <div className="relative w-full h-[3px] bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 rounded-full animate-[loading_1.8s_ease-in-out_infinite]" />
          </div>

          {/* Status Items */}
          <div className="mt-7 space-y-3">

            {/* Secure Connection */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
                <LockKeyhole
                  size={14}
                  className="text-blue-400"
                />
              </div>

              <div className="flex-1">
                <p className="text-xs text-slate-300">
                  Secure connection
                </p>
              </div>

              <span className="text-[10px] uppercase tracking-wider text-emerald-400">
                Ready
              </span>
            </div>

            {/* Gateway */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
                <Wifi
                  size={14}
                  className="text-blue-400"
                />
              </div>

              <div className="flex-1">
                <p className="text-xs text-slate-300">
                  Authentication gateway
                </p>
              </div>

              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse [animation-delay:200ms]" />
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse [animation-delay:400ms]" />
              </div>
            </div>

            {/* Data */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800/70 border border-slate-700/50 flex items-center justify-center">
                <Database
                  size={14}
                  className="text-slate-500"
                />
              </div>

              <div className="flex-1">
                <p className="text-xs text-slate-400">
                  Synchronizing workspace
                </p>
              </div>

              <span className="text-[10px] uppercase tracking-wider text-slate-600">
                Pending
              </span>
            </div>

          </div>
        </div>

        {/* Bottom Security Text */}
        <div className="mt-10 flex items-center gap-2 text-[10px] text-slate-600">
          <ShieldCheck size={12} />
          <span>Protected by FieldProof Security</span>
        </div>

      </div>

      {/* Bottom Version */}
      <div className="absolute bottom-5 left-0 right-0 text-center">
        <span className="text-[10px] tracking-[0.2em] uppercase text-slate-700">
          FieldProof • Secure Workspace
        </span>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-120%);
          }

          50% {
            transform: translateX(100%);
          }

          100% {
            transform: translateX(320%);
          }
        }
      `}</style>

    </div>
  );
}

export default LoadingState;