import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

function ChatLocked({ isManager = false }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80">
        <Lock className="h-6 w-6 text-slate-400" />
      </div>

      <h2 className="text-lg font-semibold text-white">Chat is locked</h2>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
        Team chat is available on{" "}
        <span className="text-slate-200">Pro</span> and{" "}
        <span className="text-slate-200">Enterprise</span> plans.
        {isManager
          ? " Upgrade to message your workers."
          : " Ask your manager to upgrade the team plan."}
      </p>

      {isManager && (
        <Link
          to="/manager/plans"
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-500"
        >
          View plans
        </Link>
      )}
    </div>
  );
}

export default ChatLocked;