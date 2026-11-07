import { useContext } from "react";
import { Link } from "react-router-dom";
import { context } from "../../../context/context.jsx";
import ChatPanel from "../../ChatPannel.jsx";
import { ArrowRight, MessageCircle, Users } from "lucide-react";

function WorkerChatPage() {
  const { user } = useContext(context);
  const managerId = user?.managerId?._id || user?.managerId;
  const managerName =
    user?.managerId?.name || "Your manager";

  if (!managerId) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/70">
          <Users className="h-7 w-7 text-slate-500" />
        </div>
        <p className="text-lg font-semibold text-white">No manager yet</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Join a team from Invites, then you can chat with your manager.
        </p>
        <Link
          to="/worker/my-invites"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-sky-600 px-6 text-sm font-medium text-white transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f19]"
        >
          View my invites
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Chat
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">Message your manager</p>
        </div>
      </header>

      <div className="h-[calc(100dvh-13rem)] min-h-[420px] max-h-[720px]">
        <ChatPanel
          otherUserId={managerId}
          otherName={managerName}
          myUserId={user?._id || user?.id}
        />
      </div>
    </div>
  );
}

export default WorkerChatPage;