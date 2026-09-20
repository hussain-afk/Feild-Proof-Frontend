import { Loader2, ShieldCheck } from 'lucide-react'
import React from 'react'

function LoadingState() {
  return (
    <div className="h-screen w-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {/* Background Radial Glow */}
        <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="relative z-10 flex flex-col items-center max-w-sm w-full bg-[#111827]/80 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl text-center">
          
          {/* Animated Brand Logo Container */}
          <div className="relative flex items-center justify-center mb-6">
            {/* Outer Glowing Ripple */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md animate-ping" />
            
            <div className="relative p-4 bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-400/30 rounded-2xl shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title Branding */}
          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            Field<span className="text-blue-500">Proof</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mb-6">
            Authenticating Session & Syncing Data...
          </p>

          {/* Custom Sleek Progress Indicator */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden mb-4 relative">
            <div className="bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 h-full w-1/2 rounded-full animate-[shimmer_1.5s_infinite_linear] transform -translate-x-full" />
          </div>

          {/* Small Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-blue-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Connecting to Secure Gateway</span>
          </div>

        </div>

        {/* Tailored Keyframes via inline style tag for smooth shimmer animation */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
  )
}

export default LoadingState
