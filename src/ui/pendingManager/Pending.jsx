import { useContext } from "react";
import { context } from "../../context/context.jsx";
import useAuth from "../../hooks/useAuth.jsx";
import { LogOut, ShieldCheck, Clock3, Info } from "lucide-react";

function Pending() {
  const { user } = useContext(context);
  const { logout } = useAuth();

  const isPending = user?.role === "pending_manager";

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      role="status"
      className="fixed inset-0 z-[2000] flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-[#0b0f17] px-4 py-10 text-white"
    >
      {/* soft background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.07] blur-[100px]"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/25 bg-sky-500/10">
          <ShieldCheck className="h-8 w-8 text-sky-400" strokeWidth={1.8} />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Approval pending
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
          Your manager request is with the admin team. You will get access to
          the manager dashboard after it is approved.
        </p>

        {user?.name && (
          <p className="mt-2 text-xs text-slate-500">
            Signed in as{" "}
            <span className="font-medium text-slate-300">{user.name}</span>
          </p>
        )}

        {/* Badge */}
        <div className="mt-6 flex justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              isPending
                ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isPending ? "animate-pulse bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <Clock3 className="h-3.5 w-3.5" />
            {isPending ? "Waiting for approval" : "Approved"}
          </span>
        </div>

        {/* Info box */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-4 text-left">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
              <Info className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                What happens next?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                An admin will review your request. After approval, sign in again
                to open your manager workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 text-sm font-medium text-slate-200 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>

        <p className="mt-5 text-xs text-slate-600">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
}

export default Pending;