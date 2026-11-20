import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Briefcase,
  MapPin,
  Camera,
  ClipboardCheck,
  UserPlus,
  LogIn,
  Menu,
  X,
  ArrowRight,
  Smartphone,
  Monitor,
  AlertCircle,
  Radio,
  ListTodo,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";

const AUTH_PATH = "/auth";

const SECTIONS = [
  { id: "intro", label: "What is FieldProof" },
  { id: "roles", label: "Roles" },
  { id: "start", label: "Get started" },
  { id: "worker", label: "Worker guide" },
  { id: "manager", label: "Manager guide" },
  { id: "admin", label: "Admin guide" },
  { id: "checkin", label: "Check-in & check-out" },
  { id: "invites", label: "Team invites" },
  { id: "review", label: "Approve & reject" },
  { id: "plans", label: "Plans & limits" },
  { id: "devices", label: "Web, desktop & mobile" },
  { id: "tips", label: "Tips & problems" },
];

function DocumentationPage() {
  const [openNav, setOpenNav] = useState(false);
  const [active, setActive] = useState("intro");

  useEffect(() => {
    const onScroll = () => {
      let current = "intro";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 120) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (id) => {
    setOpenNav(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#0a1220] text-slate-200">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#1d2b45] bg-[#0a1220]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            FieldProof
            <span className="hidden text-xs font-normal text-slate-500 sm:inline">Docs</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={AUTH_PATH}
              className="hidden h-9 items-center rounded-lg bg-sky-600 px-3 text-sm font-medium text-white transition hover:bg-sky-500 sm:inline-flex"
            >
              Open app
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 lg:hidden"
              onClick={() => setOpenNav((v) => !v)}
              aria-label="Toggle menu"
            >
              {openNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:py-10">
        {/* Side nav — desktop */}
        <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-52 shrink-0 overflow-y-auto lg:block">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            On this page
          </p>
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.id)}
                className={`flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                  active === s.id
                    ? "bg-sky-500/10 font-medium text-sky-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        {openNav && (
          <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setOpenNav(false)}>
            <div
              className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-slate-800 bg-[#0f1a2e] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Contents</p>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(s.id)}
                  className="mb-0.5 flex w-full rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                >
                  {s.label}
                </button>
              ))}
              <Link
                to={AUTH_PATH}
                className="mt-4 flex h-10 items-center justify-center rounded-lg bg-sky-600 text-sm font-medium text-white"
              >
                Open app
              </Link>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 space-y-16 pb-24">
          {/* INTRO */}
          <section id="intro" className="scroll-mt-24">
            <p className="text-sm font-medium text-sky-400">Documentation</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              FieldProof user guide
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
              FieldProof helps field teams prove they were at the job site. Workers check in and
              check out with GPS and a photo. Managers assign tasks and approve work. Admins run
              the platform.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoPill icon={MapPin} title="Location proof" text="GPS at check-in and check-out" />
              <InfoPill icon={Camera} title="Photo proof" text="Work photos attached to each visit" />
              <InfoPill icon={ClipboardCheck} title="Manager review" text="Approve or reject with a reason" />
            </div>
          </section>

          {/* ROLES */}
          <section id="roles" className="scroll-mt-24">
            <SectionTitle icon={Users} title="Roles" subtitle="Three types of accounts" />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <RoleCard
                icon={Briefcase}
                role="Worker"
                points={[
                  "Joins a manager’s team by invite",
                  "Sees only own tasks",
                  "Checks in / out with GPS + photo",
                  "Sees invites, notifications, reviewed work",
                ]}
              />
              <RoleCard
                icon={ListTodo}
                role="Manager"
                points={[
                  "Creates tasks and assigns workers",
                  "Optional site location + radius",
                  "Reviews check-ins and payslip info",
                  "Invites free workers to the team",
                  "Plan limits how many workers you can have",
                ]}
              />
              <RoleCard
                icon={ShieldCheck}
                role="Admin"
                points={[
                  "Sees all users and activity",
                  "Approves or rejects manager requests",
                  "Can ban users",
                  "Can turn maintenance mode on or off",
                ]}
              />
            </div>
            <Callout type="info" className="mt-4">
              New manager accounts often start as <strong className="text-slate-200">pending manager</strong>{" "}
              until an admin approves them. After approval they use the manager dashboard.
            </Callout>
          </section>

          {/* GET STARTED */}
          <section id="start" className="scroll-mt-24">
            <SectionTitle icon={LogIn} title="Get started" subtitle="Create an account and sign in" />
            <ol className="mt-6 space-y-4">
              <Step n={1} title="Open FieldProof">
                Go to the website and open <strong className="text-slate-200">Sign in / Create account</strong>{" "}
                (or open the desktop app, which loads the same site).
              </Step>
              <Step n={2} title="Create an account">
                Enter your full name, email, and password. You do <strong className="text-slate-200">not</strong>{" "}
                enter a Manager ID at signup. Workers stay free until a manager invites them.
              </Step>
              <Step n={3} title="Choose the right signup path">
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
                  <li>
                    <strong className="text-slate-300">Worker</strong> — normal register, then wait for an invite
                    or use My invites.
                  </li>
                  <li>
                    <strong className="text-slate-300">Manager</strong> — request manager access (pending until
                    admin approves).
                  </li>
                </ul>
              </Step>
              <Step n={4} title="Verify email if asked">
                Some features need a verified email. Open your profile, request a code, and enter it.
                Check spam if the email is late.
              </Step>
              <Step n={5} title="Sign in next time">
                Use the same email and password. Stay logged in on a private device only.
              </Step>
            </ol>
          </section>

          {/* WORKER */}
          <section id="worker" className="scroll-mt-24">
            <SectionTitle icon={Briefcase} title="Worker guide" subtitle="Day-to-day for field staff" />
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-400">
              <p>
                After login, workers land on <strong className="text-slate-200">My field tasks</strong>.
                If you have not joined a manager yet, some menu items may stay locked until you accept an invite.
              </p>
              <h3 className="text-base font-semibold text-white">What you will use</h3>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-slate-200">My tasks</strong> — assigned jobs, status, due date, site.
                </li>
                <li>
                  <strong className="text-slate-200">My invites</strong> — manager invitations; accept or reject.
                </li>
                <li>
                  <strong className="text-slate-200">Notifications</strong> — new tasks and review results.
                </li>
                <li>
                  <strong className="text-slate-200">Reviewed / history</strong> — approved or rejected work and
                  payslip details when available.
                </li>
                <li>
                  <strong className="text-slate-200">Profile</strong> — name, phone, password, email verify, avatar.
                </li>
              </ul>
              <h3 className="text-base font-semibold text-white">Typical day</h3>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Open the app and check notifications.</li>
                <li>Open a pending task and read the site and due time.</li>
                <li>At the site: take a photo → <strong className="text-slate-200">Check in</strong>.</li>
                <li>Finish work → new photo → <strong className="text-slate-200">Check out</strong>.</li>
                <li>Wait for the manager to approve or reject.</li>
              </ol>
              <Callout type="warn">
                Allow <strong className="text-slate-200">location permission</strong> in the browser or phone
                settings. Without GPS, tasks that require a site location cannot be checked in.
              </Callout>
            </div>
          </section>

          {/* MANAGER */}
          <section id="manager" className="scroll-mt-24">
            <SectionTitle icon={ListTodo} title="Manager guide" subtitle="Tasks, team, and reviews" />
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-400">
              <p>
                Managers act as a small company: your workers are linked to you with{" "}
                <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sky-300">managerId</code>. You only
                see your own team and tasks.
              </p>
              <h3 className="text-base font-semibold text-white">Main screens</h3>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-slate-200">Field tasks</strong> — create, filter, open details, delete.
                </li>
                <li>
                  <strong className="text-slate-200">Verification</strong> — pending check-in/out reviews.
                </li>
                <li>
                  <strong className="text-slate-200">Reviewed tasks</strong> — approved / rejected history and
                  payslips.
                </li>
                <li>
                  <strong className="text-slate-200">Available workers</strong> — free workers you can invite.
                </li>
                <li>
                  <strong className="text-slate-200">Pending invites</strong> — invites you already sent.
                </li>
              </ul>
              <h3 className="text-base font-semibold text-white">Create a task</h3>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Open Field tasks → Create (or similar button).</li>
                <li>Add title, description, due date.</li>
                <li>Assign one or more workers from your team.</li>
                <li>
                  Optional: set a <strong className="text-slate-200">site location</strong> and radius so
                  workers must be near the pin to check in.
                </li>
                <li>Save. Workers get the task (and a notification when the system sends one).</li>
              </ol>
            </div>
          </section>

          {/* ADMIN */}
          <section id="admin" className="scroll-mt-24">
            <SectionTitle icon={ShieldCheck} title="Admin guide" subtitle="Platform control" />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-400">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-slate-200">Overview / activity</strong> — recent platform events.
                </li>
                <li>
                  <strong className="text-slate-200">Users</strong> — search, edit, ban, delete as needed.
                </li>
                <li>
                  <strong className="text-slate-200">Manager requests</strong> — approve (user becomes manager)
                  or reject.
                </li>
                <li>
                  <strong className="text-slate-200">Maintenance</strong> — put the site in “we will be back”
                  mode. Admins can still sign in to turn it off.
                </li>
              </ul>
              <Callout type="warn">
                Ban and delete are strong actions. Prefer ban when you only need to block access.
              </Callout>
            </div>
          </section>

          {/* CHECK IN */}
          <section id="checkin" className="scroll-mt-24">
            <SectionTitle
              icon={MapPin}
              title="Check-in & check-out"
              subtitle="How proof is captured"
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-400">
              <p>Each completed visit usually has two moments:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
                  <p className="font-semibold text-sky-300">Check-in</p>
                  <p className="mt-2 text-slate-400">
                    Worker attaches a photo, app reads GPS, server stores time, location, and image.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
                  <p className="font-semibold text-emerald-300">Check-out</p>
                  <p className="mt-2 text-slate-400">
                    Same idea when work ends. Hours can be calculated between check-in and check-out.
                  </p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-white">Rules workers should know</h3>
              <ul className="list-disc space-y-2 pl-5">
                <li>Photo is required for check-in and check-out.</li>
                <li>
                  If the task has a site pin, you should be inside the allowed radius (weak GPS may fail —
                  move outdoors and retry).
                </li>
                <li>If the task has no site, GPS may still be sent when the phone provides it.</li>
                <li>After both steps, the manager reviews the verification.</li>
              </ul>
            </div>
          </section>

          {/* INVITES */}
          <section id="invites" className="scroll-mt-24">
            <SectionTitle icon={UserPlus} title="Team invites" subtitle="How workers join a manager" />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-400">
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  Worker registers <strong className="text-slate-200">without</strong> a manager.
                </li>
                <li>
                  Manager opens <strong className="text-slate-200">Available workers</strong> and sends{" "}
                  <strong className="text-slate-200">Invite</strong>.
                </li>
                <li>
                  Worker opens <strong className="text-slate-200">My invites</strong> → Accept or Reject.
                </li>
                <li>
                  On accept, the worker is linked to that manager and appears in the manager’s team list.
                  Sidebar locks unlock for team features.
                </li>
              </ol>
              <Callout type="info">
                A worker can only belong to <strong className="text-slate-200">one</strong> manager at a time.
                You cannot invite someone who already has a manager.
              </Callout>
            </div>
          </section>

          {/* REVIEW */}
          <section id="review" className="scroll-mt-24">
            <SectionTitle
              icon={ClipboardCheck}
              title="Approve & reject"
              subtitle="Manager review of field proof"
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-400">
              <p>On the verification screen the manager sees check-in/out photos, map points, and hours.</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-emerald-300">Approve</strong> — work is accepted; payslip data may be
                  created (hours × rate).
                </li>
                <li>
                  <strong className="text-rose-300">Reject</strong> — you must give a reason; worker can be asked
                  to redo check-in when the product allows it.
                </li>
              </ul>
              <p>
                Approved and rejected items also appear under <strong className="text-slate-200">Reviewed tasks</strong>.
                Where a payslip exists, use <strong className="text-slate-200">View payslip</strong>.
              </p>
            </div>
          </section>

          {/* PLANS */}
          <section id="plans" className="scroll-mt-24">
            <SectionTitle icon={BadgeCheck} title="Plans & limits" subtitle="Manager subscription basics" />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-400">
              <p>
                Managers may be on a <strong className="text-slate-200">free</strong> or paid plan. Plans mainly
                limit how many workers you can add (for example a small free limit and a higher pro limit).
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>If you hit the worker limit, upgrade or free a seat before inviting more people.</li>
                <li>Expired paid plans may block invites until you renew or switch to free (with free limits).</li>
                <li>Billing is handled through the payment provider configured on the platform (e.g. Stripe).</li>
              </ul>
            </div>
          </section>

          {/* DEVICES */}
          <section id="devices" className="scroll-mt-24">
            <SectionTitle
              icon={Monitor}
              title="Web, desktop & mobile"
              subtitle="Where you can run FieldProof"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <DeviceCard
                icon={Monitor}
                title="Website"
                text="Use Chrome or Edge on a computer. Best for managers and admins."
              />
              <DeviceCard
                icon={Monitor}
                title="Desktop app"
                text="Windows installer from the site when offered. Same account; opens the live web app in a window."
              />
              <DeviceCard
                icon={Smartphone}
                title="Phone"
                text="Open the site in the mobile browser. For GPS check-in, allow location and use HTTPS. Install as PWA if your browser offers Add to Home Screen."
              />
            </div>
          </section>

          {/* TIPS */}
          <section id="tips" className="scroll-mt-24">
            <SectionTitle icon={AlertCircle} title="Tips & common problems" subtitle="Quick fixes" />
            <div className="mt-6 space-y-3">
              <Faq q="Location permission denied">
                Browser site settings → allow Location for FieldProof. On phones, also enable system GPS.
              </Faq>
              <Faq q="GPS accuracy too weak">
                Stand outdoors, wait a few seconds, retry check-in. Indoors GPS is often too rough for site radius.
              </Faq>
              <Faq q="I registered but have no tasks">
                Workers need a manager invite first, then assigned tasks. Check My invites.
              </Faq>
              <Faq q="Manager request still pending">
                An admin must approve you. You stay on the pending screen until that happens.
              </Faq>
              <Faq q="Site says under maintenance">
                Only admins can open the app fully. Use Check again later, or Admin sign-in if you are an admin.
              </Faq>
              <Faq q="Invite button fails / limit reached">
                Your plan worker limit may be full. Remove a worker or upgrade the plan.
              </Faq>
              <Faq q="Email code not arriving">
                Check spam/junk. Resend from profile. Confirm the email address is typed correctly.
              </Faq>
            </div>

            <div className="mt-10 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 text-center">
              <h3 className="text-lg font-semibold text-white">Ready to try FieldProof?</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Create an account or sign in to open your dashboard.
              </p>
              <Link
                to={AUTH_PATH}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-500"
              >
                Go to sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <footer className="border-t border-slate-800 pt-8 text-center text-xs text-slate-600">
            FieldProof documentation · For product support contact your administrator
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ---------- small UI pieces ---------- */

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#111827] text-sky-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <div className="flex items-center gap-2 text-sky-400">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-semibold text-slate-100">{title}</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}

function RoleCard({ icon: Icon, role, points }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-sky-400" />
        <h3 className="font-semibold text-white">{role}</h3>
      </div>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-sm text-slate-400">
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 text-sm font-semibold text-sky-300">
        {n}
      </span>
      <div>
        <p className="font-medium text-slate-100">{title}</p>
        <div className="mt-1 text-sm leading-relaxed text-slate-400">{children}</div>
      </div>
    </li>
  );
}

function Callout({ type = "info", children, className = "" }) {
  const styles =
    type === "warn"
      ? "border-amber-500/20 bg-amber-500/5 text-amber-100/90"
      : "border-sky-500/20 bg-sky-500/5 text-slate-300";
  const Icon = type === "warn" ? AlertCircle : Radio;
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
      <div>{children}</div>
    </div>
  );
}

function DeviceCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
      <Icon className="h-5 w-5 text-sky-400" />
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}

function Faq({ q, children }) {
  return (
    <details className="group rounded-xl border border-slate-800 bg-[#111827] px-4 py-3">
      <summary className="cursor-pointer list-none font-medium text-slate-100 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {q}
          <span className="text-slate-500 transition group-open:rotate-90">
            <ChevronRight className="h-4 w-4" />
          </span>
        </span>
      </summary>
      <p className="mt-2 border-t border-slate-800 pt-2 text-sm text-slate-400">{children}</p>
    </details>
  );
}

export default DocumentationPage;