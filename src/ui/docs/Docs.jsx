import { useContext, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { context } from "../../context/context.jsx";

const DOCS = {
  worker: {
    label: "Worker",
    title: "Worker Guide",
    subtitle: "A complete guide for joining a team, completing field tasks, submitting proof, and reviewing decisions.",
    icon: UserCheck,
    sections: [
      {
        id: "start",
        title: "Getting started",
        icon: BookOpen,
        steps: [
          ["Register", "Open the sign-in page and select Register. Enter your name, email address, and password. A standard registration creates a worker account."],
          ["Verify your email", "Complete the email verification or 6-digit code flow shown after registration. A verified account can receive team invitations."],
          ["Open My invites", "After your first login, open My invites from the sidebar. Until you join a manager's team, My tasks and Reviewed tasks remain locked."],
          ["Join a team", "Review the manager's name and email, then select Accept or Reject on the invitation. Selecting Accept adds you to that manager's team."],
        ],
        note: "After accepting an invitation, the task dashboard and team-dependent pages become available.",
      },
      {
        id: "tasks",
        title: "My tasks",
        icon: ClipboardCheck,
        steps: [
          ["Find assigned work", "Open My tasks from the sidebar. The summary cards show total, pending, in-progress, and completed tasks."],
          ["Read task details", "Review the title, description, due date, assigned workers, and site location. A map link is available for tasks with valid coordinates."],
          ["Choose a proof photo", "Select a JPG, PNG, or other supported image for check-in or check-out. The image must be no larger than 10 MB."],
          ["Check in", "For a pending task, select a photo and tap Check in. Tasks with a site location require location permission from the browser or phone."],
          ["Check out", "After checking in, select a fresh photo and tap Check out. The location rules used for check-in may also apply to check-out."],
        ],
        note: "A task with a site location uses the configured latitude, longitude, and radius. If the GPS signal is weak, move to an open area and try again.",
      },
      {
        id: "gps",
        title: "GPS, photos, and geofencing",
        icon: MapPin,
        steps: [
          ["Allow location", "When prompted, allow Location access for FieldProof in the browser or device settings."],
          ["Use accurate location", "Do not use a mock or simulated location. Move outdoors or near a clear area if the GPS accuracy is poor."],
          ["Stay within the radius", "Check in only while you are inside the manager's configured work radius. Tasks outside the radius may be rejected."],
          ["Take a clear photo", "The photo should clearly show the work and its surrounding context. A blurry or unrelated image may cause rejection."],
        ],
        note: "If a task has no site location, check-in and check-out do not require the geofence, but a proof photo is still required.",
      },
      {
        id: "reviewed",
        title: "Reviewed tasks",
        icon: ShieldCheck,
        steps: [
          ["Open Reviewed tasks", "Open Reviewed tasks from the sidebar."],
          ["Filter the results", "Use All, Approved, or Rejected to filter your records. Use search to find a task or worker name."],
          ["Read the decision", "Open an approved record to review its payment summary or open a rejected record to read the manager's reason."],
          ["Download a payslip", "If an approved record includes a Download PDF action, use it to save the payslip."],
        ],
        note: "The Reviewed tasks page shows the approved and rejected records associated with your account.",
      },
      {
        id: "team-chat",
        title: "Chat and notifications",
        icon: MessageCircle,
        steps: [
          ["Open chat", "After joining a team, open Chat from the sidebar. Chat with the assigned team or manager as supported by your account."],
          ["Read notifications", "Use the bell in the page header to open task, invitation, and review notifications."],
          ["Enable notification sound", "Use the notification sound control when prompted. Browser audio permission may be required."],
          ["Restore connectivity", "If the Offline page appears, restore internet access and select Retry."],
        ],
        note: "Chat availability depends on the active plan and plan permissions.",
      },
      {
        id: "profile",
        title: "Profile and payments",
        icon: Users,
        steps: [
          ["Open your profile", "Select your name or avatar in the sidebar footer."],
          ["Update account details", "Change the allowed profile fields, including name, phone, avatar, or password."],
          ["Save payment details", "If prompted, enter the bank name, account or IBAN number, account holder name, and JazzCash or Easypaisa selection."],
          ["Verify account details", "Double-check all payment information before saving. Incorrect details may cause payment records to be wrong."],
        ],
        note: "Only enter payment details on your own account and review the final saved values carefully.",
      },
    ],
  },
  manager: {
    label: "Manager",
    title: "Manager Guide",
    subtitle: "A complete guide for access, team invitations, task creation, proof review, and reviewed payments.",
    icon: ShieldCheck,
    sections: [
      {
        id: "access",
        title: "Request and account access",
        icon: AlertCircle,
        steps: [
          ["Submit a manager request", "On the authentication page, select Manager request, then enter your name, email, and password."],
          ["Wait for approval", "Your account temporarily has the pending_manager role and shows the Approval pending page."],
          ["Sign in after approval", "After an admin approves the request, sign in again to open the manager workspace."],
          ["Update your profile", "Open Profile to maintain your name, phone, avatar, and password."],
        ],
        note: "A rejected or banned account cannot use the manager dashboard.",
      },
      {
        id: "team",
        title: "Build the team",
        icon: Users,
        steps: [
          ["Open Available workers", "Open Available workers from the sidebar. This page lists workers who do not yet belong to a manager."],
          ["Search workers", "Search by name or email. The page can switch between grid and list views."],
          ["Send an invitation", "Select Invite on a worker card. The invitation appears in Pending invites and is sent to the worker."],
          ["Track pending invitations", "Open Pending invites to review invitation status and the latest sent or received activity."],
          ["Wait for acceptance", "The worker accepts or rejects the invitation from My invites. Acceptance assigns the worker to your team."],
        ],
        note: "Team membership is created through invitation acceptance, not by entering an open manager ID during registration.",
      },
      {
        id: "create-task",
        title: "Create a field task",
        icon: ClipboardCheck,
        steps: [
          ["Open Create task", "Select Create task on the manager dashboard."],
          ["Enter task information", "Add a clear title and an optional description."],
          ["Select workers", "Select at least one worker. Search and select-all options are available."],
          ["Set a due date", "Choose the deadline date and time when required."],
          ["Add a site location", "Keep site location enabled, pick the site on the map, and set the work radius. Turn it off only if GPS is not required."],
          ["Submit the task", "Select Create task. Assigned workers receive a task update or notification."],
        ],
        note: "A location-enabled task requires valid coordinates. A task cannot be submitted without at least one selected worker.",
      },
      {
        id: "track-task",
        title: "Track and manage tasks",
        icon: Clock3,
        steps: [
          ["Filter the dashboard", "Use All, Pending, In progress, Completed, Approved, or Rejected."],
          ["Search", "Search by task title or site name."],
          ["Open task details", "Open a task card to review its workers, status, location, deadline, and progress."],
          ["Monitor progress", "Pending tasks wait for check-in; in-progress tasks are active; completed tasks wait for review; approved or rejected tasks are final decisions."],
        ],
        note: "Task status is synchronized from the backend workflow and should not be treated as a manual UI-only state.",
      },
      {
        id: "verification",
        title: "Verify worker proof",
        icon: MapPin,
        steps: [
          ["Open Verification", "Open Verification and Approval. Only completed check-in and check-out records are eligible for final review."],
          ["Review the worker", "Check the worker name, email, and assigned task."],
          ["Inspect both proofs", "Open the check-in and check-out photos, timestamps, GPS coordinates, and total hours."],
          ["Approve valid proof", "Select Approve when the evidence is complete and accurate."],
          ["Reject invalid proof", "Select Reject, enter a clear reason of up to 300 characters, and submit the decision."],
        ],
        note: "A rejection reason is required. All decisions remain available in Reviewed history.",
      },
      {
        id: "reviewed",
        title: "Reviewed history and payment",
        icon: ClipboardCheck,
        steps: [
          ["Open Review and Payment", "Open the Reviewed page to review approved and rejected decisions."],
          ["Inspect payslips", "Approved records may show hourly rate, working hours, payment account, total amount, and paid status."],
          ["Download PDF", "Use the PDF download action to save an approved payment record."],
          ["Review payment status", "Use the displayed status to confirm whether a payment is pending or paid."],
        ],
        note: "Payslips provide a payment record. Settlement details depend on the backend and configured payment workflow.",
      },
      {
        id: "plans-chat",
        title: "Plans and chat",
        icon: MessageCircle,
        steps: [
          ["Check the plan", "Open All Plans to view plan options and the active subscription."],
          ["Review chat access", "Chat may be unavailable on Free plans and available on eligible paid plans."],
          ["Use chat", "Open Chat to communicate with assigned team members and receive team updates."],
        ],
        note: "Do not bypass a plan restriction. Chat availability follows both the UI state and backend subscription permissions.",
      },
    ],
  },
  admin: {
    label: "Admin",
    title: "Admin Guide",
    subtitle: "A complete guide for managing users, manager requests, plans, and maintenance mode.",
    icon: Wrench,
    sections: [
      {
        id: "dashboard",
        title: "Admin dashboard",
        icon: ShieldCheck,
        steps: [
          ["Open the dashboard", "Open /admin to review platform summaries, users, tasks, and activity charts."],
          ["Check anomalies", "Look for unusual roles, banned accounts, pending requests, or maintenance changes."],
          ["Open operational pages", "Use the sidebar to manage users, requests, plans, and maintenance."],
        ],
      },
      {
        id: "users",
        title: "Manage users",
        icon: Users,
        steps: [
          ["Open Users", "Review all registered accounts."],
          ["Search and filter", "Search by name or email and filter for all, verified, or unverified users."],
          ["Edit a user", "Use Edit to update allowed fields such as name, email, phone, role, and hourly rate."],
          ["Ban a user", "Ban an account that should no longer use the platform. The account is redirected to the banned page."],
          ["Delete a user", "Use Delete only after confirming that the account is safe to remove."],
        ],
        note: "Change roles and delete accounts carefully. UI safeguards may apply to your own admin account.",
      },
      {
        id: "requests",
        title: "Manager requests",
        icon: UserCheck,
        steps: [
          ["Open Manager requests", "Review pending, approved, and rejected requests."],
          ["Read the request", "Verify name, email, phone, date, and any optional message."],
          ["Approve a request", "Approve a valid request to change the account from pending_manager to manager."],
          ["Reject a request", "Reject invalid or unsupported requests. The account does not receive manager access."],
          ["Ask the user to sign in", "After approval, the user may need to sign out and sign in again to refresh the role."],
        ],
        note: "Use the Pending filter to maintain an efficient approval queue.",
      },
      {
        id: "plans",
        title: "Plans and subscriptions",
        icon: ClipboardCheck,
        steps: [
          ["Open Add Plan", "Open the plan creation interface from the sidebar."],
          ["Enter plan details", "Configure the plan name, pricing, duration, limits, and enabled features supported by the form."],
          ["Review the impact", "Confirm chat and billing restrictions before publishing."],
          ["Save the plan", "Submit the form to make the plan available in the backend."],
        ],
        note: "Never expose Stripe keys or provider secrets in documentation or frontend source.",
      },
      {
        id: "maintenance",
        title: "Maintenance mode",
        icon: Wrench,
        steps: [
          ["Open Maintenance", "Open the maintenance settings page."],
          ["Configure the state", "Enable or disable maintenance and enter the public message."],
          ["Save the settings", "Submit the settings to broadcast the maintenance state."],
          ["Verify access", "Admins retain administrative access. Non-admin users may be shown the maintenance page."],
        ],
        note: "Use maintenance mode only when the platform needs to be paused for maintenance or an emergency.",
      },
      {
        id: "profile",
        title: "Admin account",
        icon: UserCheck,
        steps: [
          ["Open Profile", "Select the admin name or avatar in the sidebar footer."],
          ["Update account details", "Change allowed personal details, phone, avatar, or password."],
          ["Logout securely", "Use the logout action in the sidebar footer when you finish an admin session."],
        ],
      },
    ],
  },
};

function StepRow({ number, title, text }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 text-xs font-semibold text-sky-300">
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
      </div>
    </li>
  );
}

export default function Docs() {
  const { user } = useContext(context);
  const role = DOCS[user?.role] ? user.role : "worker";
  const guide = DOCS[role];
  const RoleIcon = guide.icon;
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(guide.sections[0]?.id);

  const active = useMemo(
    () => guide.sections.find((section) => section.id === activeId) || guide.sections[0],
    [activeId, guide.sections]
  );

  const filteredSections = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return guide.sections;
    return guide.sections.filter((section) =>
      `${section.title} ${section.steps.map((step) => step.join(" ")).join(" ")}`
        .toLowerCase()
        .includes(value)
    );
  }, [guide.sections, query]);

  return (
    <div className="min-h-full bg-[#0b0f17] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
              <RoleIcon className="h-6 w-6 text-sky-300" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                FieldProof documentation
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-white">{guide.title}</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">{guide.subtitle}</p>
            </div>
          </div>
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${guide.label.toLowerCase()} documentation`}
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#0b1220] pl-10 pr-4 text-sm text-white outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/15"
            />
          </label>
        </header>

        <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-800 bg-[#111827] p-2 lg:sticky lg:top-20">
            <nav aria-label={`${guide.label} documentation sections`}>
              {filteredSections.length ? (
                filteredSections.map((section) => {
                  const Icon = section.icon;
                  const selected = active?.id === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveId(section.id)}
                      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        selected
                          ? "bg-sky-500/10 text-sky-300"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{section.title}</span>
                      {selected && <ChevronDown className="h-4 w-4 -rotate-90" />}
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-4 text-sm text-slate-500">No matching section.</p>
              )}
            </nav>
          </aside>

          <main className="min-w-0">
            {active && (!query || filteredSections.some((section) => section.id === active.id)) ? (
              <article className="rounded-2xl border border-slate-800 bg-[#111827]">
                <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                      {(() => {
                        const Icon = active.icon;
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </div>
                    <h2 className="text-lg font-semibold text-white">{active.title}</h2>
                  </div>
                </div>
                <ol className="space-y-5 px-5 py-6 sm:px-6">
                  {active.steps.map((step, index) => (
                    <StepRow key={step[0]} number={index + 1} title={step[0]} text={step[1]} />
                  ))}
                </ol>
                {active.note && (
                  <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/[0.07] px-4 py-3.5 sm:mx-6">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                    <p className="text-sm leading-6 text-sky-100/80">{active.note}</p>
                  </div>
                )}
              </article>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-3 text-sm font-medium text-slate-300">No documentation match</p>
                <p className="mt-1 text-xs text-slate-500">Try another keyword or clear the search.</p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Clear search <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
