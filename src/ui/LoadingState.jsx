function LoadingState({
  message = "Loading FieldProof",
  subtext = "Preparing your workspace",
  fullScreen = true, // false: sirf page ke hisse mein dikhe (sidebar/header na dhake)
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full flex-col items-center justify-center text-center text-slate-100 ${
        fullScreen
          ? "fixed inset-0 z-[9999] min-h-screen bg-[#070a12]"
          : "min-h-[60vh]"
      }`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500 motion-reduce:animate-none" />

      <p className="mt-5 text-base font-semibold text-white">{message}</p>
      <p className="mt-1 text-sm text-slate-400">{subtext}</p>
    </div>
  );
}

export default LoadingState;