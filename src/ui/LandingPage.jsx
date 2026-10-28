import { useEffect, useRef, useState } from "react";
import feildprooflogo from "../assets/fieldproof-logo.png";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShieldCheck,
  ClipboardCheck,
  MapPin,
  Camera,
  Radio,
  ClipboardList,
  ScrollText,
  Lock,
  Menu,
  X,
  ChevronDown,
  Check,
  Smartphone,
  ArrowRight,
  ArrowUp,
  Briefcase,
  Wrench,
  Crosshair,
  Timer,
  Zap,
  KeyRound,
  Download,
  Monitor,
} from "lucide-react";

/**
 * FieldProof landing page (header, all sections and footer in this one file)
 *
 * Setup:   npm i gsap
 * Route:   <Route path="/" element={<LandingPage />} />
 *
 * Palette: ink #0a1220, ink-2 #0f1a2e, line #1d2b45,
 *          mist #e8eef7, steel #93a4bd,
 *          signal #38bdf8, hi-vis #fbbf24
 * Type:    Bricolage Grotesque (headings), Instrument Sans (body)
 */

gsap.registerPlugin(ScrollTrigger);

const LOGIN_PATH = "/auth";
const REGISTER_PATH = "/auth";

// TODO: apna GitHub Release .exe link yahan paste karo
const DOWNLOAD_DESKTOP_URL =
  "https://github.com/hussain-afk/fieldproof-desktop-releases/releases/download/v1.0.0/FieldProof.Setup.1.0.0.exe";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

const NAV = [
  { label: "What you get", href: "#proof" },
  { label: "How it works", href: "#how" },
  { label: "Who uses it", href: "#roles" },
  { label: "Questions", href: "#faq" },
];

const FACTS = [
  { icon: Crosshair, value: "50 m to 1 km", label: "Site radius you control" },
  { icon: Camera, value: "2 photos", label: "At check-in and check-out" },
  { icon: Zap, value: "Live", label: "Updates on every screen" },
  { icon: KeyRound, value: "6-digit code", label: "Email confirmation for workers" },
];

// The kinds of work FieldProof is made for (the scrolling strip under the hero)
const USE_CASES = [
  "Site inspections",
  "Meter reading",
  "Equipment checks",
  "Safety walks",
  "Maintenance rounds",
  "Surveys and deliveries",
  "Audits",
  "Generator checks",
];

// Before and after
const CONTRAST = {
  without: [
    "Calling workers to ask if they reached the site",
    "Photos lost in chat groups",
    "Paper sheets and guessed hours",
    "Arguments about who did what",
  ],
  with: [
    "GPS position checked against your site radius",
    "Check-in and check-out photos saved with time and position",
    "Every action written to one timeline",
    "Proof ready to approve, or reject with a reason",
  ],
};

const PROOF = [
  {
    icon: MapPin,
    title: "Check-in only at the site",
    text: "Set a radius from 50 m to 1 km around the site. Workers outside it cannot check in, and a weak GPS signal is turned down instead of guessed.",
  },
  {
    icon: Camera,
    title: "A photo at both ends",
    text: "Check-in and check-out each need a photo. It is saved with the time and the worker's position.",
  },
  {
    icon: Radio,
    title: "Updates without refreshing",
    text: "New tasks, check-ins and notifications appear on every screen as they happen.",
  },
  {
    icon: ClipboardList,
    title: "One worker or a whole crew",
    text: "Pick the workers, set a deadline and pin the site on a free map. A task is complete once every assigned worker has checked out.",
  },
  {
    icon: ScrollText,
    title: "A log only admins can read",
    text: "Who created, assigned, checked in or deleted what, and when, in one timeline.",
  },
  {
    icon: Lock,
    title: "Accounts you can trust",
    text: "Workers confirm their email with a 6-digit code, and each role only sees its own dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Managers review the proof",
    text: "Managers can open submitted check-in and check-out evidence, approve it, or reject it with a required reason.",
  },
  {
    icon: ClipboardCheck,
    title: "A history of every decision",
    text: "Approved and rejected tasks stay available in a reviewed view, so workers and managers can check what happened later.",
  },
];

const STEPS = [
  {
    title: "Create the task and pin the site",
    text: "A manager names the job, picks the workers, sets a deadline and drops a pin on the map. The radius around the pin is the working area.",
    tag: "Manager",
  },
  {
    title: "The worker checks in on site",
    text: "On their phone, the worker takes a photo and taps check in. FieldProof compares their GPS position with your radius before it accepts.",
    tag: "Worker",
  },
  {
    title: "You see it as it happens",
    text: "The task turns to in progress on your screen and the proof is waiting when you open it. Checking out closes the visit with a second photo.",
    tag: "Live",
  },
];

const REVIEW_POINTS = [
  "Open the check-in and check-out photos side by side",
  "See the time and the GPS position of each one",
  "Approve in one tap, or reject with a reason that is required",
  "Every decision stays in the reviewed history",
];

const DESKTOP_POINTS = [
  "Its own window, separate from your browser tabs",
  "The same login as the website",
  "Optional: the browser version always works",
];

const ROLES = {
  manager: {
    label: "Manager",
    icon: Briefcase,
    heading: "Run today's work from one screen",
    points: [
      "Create tasks and pin sites on a map",
      "Assign one worker or a whole crew",
      "Watch check-ins and proof photos arrive",
      "Search and filter tasks by status",
      "Approve or reject submitted proof with a reason",
    ],
    previewTitle: "Today's tasks",
    preview: [
      { title: "Inspect generator", meta: "3 workers", status: "In progress", tone: "sky" },
      { title: "Weekly safety walk", meta: "1 worker", status: "Pending", tone: "amber" },
      { title: "Meter reading, Block C", meta: "2 workers", status: "Completed", tone: "emerald" },
    ],
  },
  worker: {
    label: "Worker",
    icon: Wrench,
    heading: "Know what is next and prove it",
    points: [
      "See assigned tasks with the site and deadline",
      "Check in and out with a photo",
      "Get a notification the moment a task is assigned",
      "See your own progress on every task",
      "Review approved and rejected tasks in one place",
    ],
    previewTitle: "My tasks",
    preview: [
      { title: "Inspect generator", meta: "Clifton Site Office", status: "Check in", tone: "sky" },
      { title: "Site audit", meta: "Korangi Depot", status: "Pending", tone: "amber" },
      { title: "Meter reading, Block C", meta: "Block C", status: "Completed", tone: "emerald" },
    ],
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    heading: "See everything that happens",
    points: [
      "Manage users and their roles",
      "Read the full activity log",
      "Keep an eye on every manager and worker",
      "Update or remove accounts when people leave",
    ],
    previewTitle: "Users",
    preview: [
      { title: "Bilal Ahmed", meta: "bilal@example.com", status: "Manager", tone: "sky" },
      { title: "Ali Raza", meta: "ali@example.com", status: "Worker", tone: "emerald" },
      { title: "Sara Khan", meta: "sara@example.com", status: "Worker", tone: "emerald" },
    ],
  },
};

const TONE = {
  sky: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
};

const FAQ = [
  {
    q: "What happens if a worker is outside the radius?",
    a: "FieldProof compares the worker's GPS position with the site radius you set. If they are outside it, check-in is blocked and they see how far away they are.",
  },
  {
    q: "Can a worker check in without GPS?",
    a: "Not for a task that has a site location. Tasks you create without a location skip the distance check, so GPS is optional there.",
  },
  {
    q: "Do workers need to install an app?",
    a: "No. FieldProof runs in the browser on any phone. Managers and office users can optionally install the Windows desktop app from this site for a dedicated window.",
  },
  {
    q: "Who can see the activity log?",
    a: "Only admins. Managers and workers see their own tasks and notifications, nothing more.",
  },
  {
    q: "Can a manager reject submitted proof?",
    a: "Yes. Managers can reject a check-in or check-out submission and must provide a reason. The decision is then available in the reviewed task history.",
  },
  {
    q: "Do I need a Google Maps account?",
    a: "No. Sites are pinned on a free OpenStreetMap map, with search, satellite view and pasted coordinates for places that are hard to find.",
  },
];

const FEED = [
  { type: "in", text: "Ali Raza checked in at Clifton Site Office" },
  { type: "task", text: "Bilal Ahmed assigned 3 workers to Inspect generator" },
  { type: "out", text: "Sara Khan checked out of Meter reading, Block C" },
  { type: "in", text: "Hamza Iqbal checked in at Korangi Depot" },
  { type: "out", text: "Ali Raza checked out of Site audit" },
  { type: "task", text: "Bilal Ahmed created Weekly safety walk" },
  { type: "delete", text: "Bilal Ahmed deleted Duplicate task" },
];

const FEED_DOT = {
  in: "bg-[#38bdf8]",
  out: "bg-emerald-400",
  task: "bg-[#fbbf24]",
  delete: "bg-rose-400",
};

const FEED_LABEL = {
  in: "Check-in",
  out: "Check-out",
  task: "Task",
  delete: "Deleted",
};

const FEED_WHEN = ["Just now", "2 min ago", "6 min ago", "11 min ago", "18 min ago"];

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const rootRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedActive, setFeedActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const [pastHero, setPastHero] = useState(false); // shows the sticky "Get started" bar on phones

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: "top -12",
        end: "bottom bottom",
        onToggle: (self) => setScrolled(self.isActive),
      });

      // After the hero, show the sticky bar (phones only)
      ScrollTrigger.create({
        trigger: "#top",
        start: "bottom 80px",
        end: "max",
        onToggle: (self) => setPastHero(self.isActive),
      });

      NAV.forEach((item) => {
        const section = document.querySelector(item.href);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) setActiveNav(item.href);
            else setActiveNav((current) => (current === item.href ? "" : current));
          },
        });
      });

      gsap.utils.toArray(".step").forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 62%",
          end: "bottom 62%",
          toggleClass: { targets: step, className: "is-active" },
        });
      });

      ScrollTrigger.create({
        trigger: ".feed-box",
        start: "top 90%",
        end: "bottom 10%",
        onToggle: (self) => setFeedActive(self.isActive),
      });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero-line", { yPercent: 105, duration: 0.9, stagger: 0.12 })
          .from(".hero-fade", { y: 18, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.5")
          .from(".hero-panel", { y: 30, opacity: 0, duration: 0.9 }, "-=0.9");

        // The story in the hero panel: a worker walks in, the stamp lands, the manager approves
        const story = gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: 1.2 });
        story
          .set(".worker-dot", { x: -130, y: -100, opacity: 0 })
          .set(".stamp", { opacity: 0, scale: 2, rotation: -26 })
          .set(".status-chip", { opacity: 0, y: 8 })
          .set(".photo-card", { opacity: 0, y: 10 })
          .set(".review-card", { opacity: 0, y: 10 })
          .to(".worker-dot", { opacity: 1, duration: 0.4 })
          .to(".worker-dot", { x: 30, y: 22, duration: 2.6, ease: "power2.inOut" })
          .to(".status-chip", { opacity: 1, y: 0, duration: 0.4 }, "-=0.5")
          .to(".photo-card", { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
          .to(".stamp", { opacity: 1, scale: 1, rotation: -10, duration: 0.26, ease: "power4.in" })
          .to(".hero-visual", { y: 4, duration: 0.07, yoyo: true, repeat: 1 })
          .to(".review-card", { opacity: 1, y: 0, duration: 0.45 }, "+=0.5")
          .to({}, { duration: 2 })
          .to([".stamp", ".status-chip", ".worker-dot", ".photo-card", ".review-card"], {
            opacity: 0,
            duration: 0.5,
          });

        gsap.fromTo(
          ".radar-ring",
          { scale: 0.3, opacity: 0.55 },
          { scale: 1.5, opacity: 0, duration: 3.4, ease: "power1.out", repeat: -1, stagger: 1.1 }
        );

        gsap.fromTo(
          ".steps-fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: { trigger: ".steps", start: "top 60%", end: "bottom 60%", scrub: 0.4 },
          }
        );

        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.2 },
        });

        // Things slide up the first time they are seen (they are never hidden up front, so no empty gaps)
        gsap.utils.toArray(".reveal").forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: (i % 3) * 0.08,
              ease: "power3.out",
              immediateRender: false,
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            }
          );
        });
      });
    }, rootRef);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[#0a1220] text-[#e8eef7] antialiased selection:bg-sky-400/30"
      style={{
        fontFamily: "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <style>{CSS}</style>

      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <div className="scroll-progress fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-[#38bdf8]" />

      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} scrolled={scrolled} activeNav={activeNav} />

      <main id="main">
        <Hero />
        <Facts />
        <UseCases />
        <Contrast />
        <Proof />
        <HowItWorks />
        <ReviewFlow />
        <Roles />
        <DesktopApp />
        <Activity feedActive={feedActive} />
        <Faq />
        <FinalCta />
      </main>

      <Footer />

      <StickyCta visible={pastHero && !menuOpen} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                        */
/* ------------------------------------------------------------------ */

function SectionHeading({ eyebrow, title, text, className = "" }) {
  return (
    <div className={className}>
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#38bdf8]">
        <span className="h-px w-6 bg-[#38bdf8]" />
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 max-w-xl text-lg leading-8 text-[#93a4bd]">{text}</p>}
    </div>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="FieldProof home">
      <img src={feildprooflogo} alt="FieldProof Logo" className="h-12 w-auto" decoding="async" />
    </a>
  );
}

function DownloadDesktopLink({ className = "", children }) {
  return (
    <a href={DOWNLOAD_DESKTOP_URL} className={className} rel="noopener noreferrer">
      {children}
    </a>
  );
}

// The soft light that follows the mouse inside a card
const followMouse = (event) => {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
};

/* ------------------------------------------------------------------ */
/* Header                                                               */
/* ------------------------------------------------------------------ */

function Header({ menuOpen, setMenuOpen, scrolled, activeNav }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (menuOpen && panelRef.current && !prefersReducedMotion()) {
      gsap.from(panelRef.current, { y: -12, opacity: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b border-transparent ${
        scrolled || menuOpen ? "is-scrolled" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = activeNav === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "true" : undefined}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-white" : "text-[#93a4bd] hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-[#38bdf8] transition-opacity duration-300 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <DownloadDesktopLink className="inline-flex items-center gap-1.5 rounded-xl border border-[#1d2b45] px-3.5 py-2.5 text-sm font-medium text-[#e8eef7] transition-colors hover:border-[#2a3b5a] hover:bg-white/5">
            <Download className="h-4 w-4" />
            Desktop
          </DownloadDesktopLink>
          <Link
            to={LOGIN_PATH}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#e8eef7] transition-colors hover:bg-white/5"
          >
            Log in
          </Link>
          <Link
            to={REGISTER_PATH}
            className="btn-primary rounded-xl bg-[#38bdf8] px-4 py-2.5 text-sm font-semibold text-[#0a1220] shadow-lg shadow-sky-500/20 hover:bg-[#7dd3fc]"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#e8eef7] hover:bg-white/5 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div ref={panelRef} className="border-t border-[#1d2b45] bg-[#0a1220] px-5 pb-5 pt-2 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex items-center justify-between border-b border-[#1d2b45] py-3.5 text-base text-[#e8eef7]"
              >
                {item.label}
                <ArrowRight className="h-4 w-4 text-[#93a4bd]" />
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <DownloadDesktopLink className="flex items-center justify-center gap-2 rounded-xl border border-[#1d2b45] py-2.5 text-center text-sm font-medium">
              <Download className="h-4 w-4" />
              Download for Windows
            </DownloadDesktopLink>
            <div className="grid grid-cols-2 gap-3">
              <Link to={LOGIN_PATH} className="rounded-xl border border-[#1d2b45] py-2.5 text-center text-sm font-medium">
                Log in
              </Link>
              <Link
                to={REGISTER_PATH}
                className="rounded-xl bg-[#38bdf8] py-2.5 text-center text-sm font-semibold text-[#0a1220]"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* Soft glows and a faint grid behind everything (decoration only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-[#38bdf8]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-64 h-[360px] w-[360px] rounded-full bg-[#38bdf8]/[0.06] blur-3xl"
      />
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
        <div>
          <p className="hero-fade mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#1d2b45] bg-[#0f1a2e]/80 py-1.5 pl-2 pr-4 text-xs font-medium text-[#93a4bd] backdrop-blur-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
              <MapPin className="h-3 w-3" strokeWidth={2.6} />
            </span>
            GPS and photo proof for field teams
          </p>

          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[4.4rem]">
            <span className="block overflow-hidden pb-[0.12em]">
              <span className="hero-line block">Know your field team</span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span className="hero-line block">
                was actually <span className="text-gradient">there.</span>
              </span>
            </span>
          </h1>

          <p className="hero-fade mt-6 max-w-xl text-lg leading-8 text-[#93a4bd]">
            FieldProof checks every worker&apos;s GPS position and photo against the site you set, so attendance
            stops being a matter of trust.
          </p>

          <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
            <Link
              to={REGISTER_PATH}
              className="btn-primary group inline-flex items-center gap-2 rounded-xl bg-[#38bdf8] px-7 py-3.5 text-base font-semibold text-[#0a1220] shadow-lg shadow-sky-500/25 hover:bg-[#7dd3fc]"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <DownloadDesktopLink className="inline-flex items-center gap-2 rounded-xl border border-[#2a3b5a] px-6 py-3.5 text-base font-medium text-[#e8eef7] transition-all hover:border-[#3d5380] hover:bg-white/[0.04]">
              <Download className="h-4 w-4" />
              Download for Windows
            </DownloadDesktopLink>
            <a
              href="#how"
              className="rounded-xl border border-[#2a3b5a] px-7 py-3.5 text-base font-medium text-[#e8eef7] transition-all hover:border-[#3d5380] hover:bg-white/[0.04]"
            >
              See how it works
            </a>
          </div>

          <p className="hero-fade mt-6 flex flex-col gap-2 text-sm text-[#93a4bd] sm:flex-row sm:items-center sm:gap-4">
            <span className="inline-flex items-center gap-2">
              <Smartphone className="h-4 w-4 shrink-0" />
              Runs in the browser on any phone.
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[#93a4bd]/50 sm:inline-block" />
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4 shrink-0" />
              Optional Windows desktop app for the office.
            </span>
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="hero-panel">
      <div
        role="img"
        aria-label="Animation: a worker walks toward a work site. When they are inside the radius, a check-in stamp appears and the manager approves it."
        className="hero-visual relative h-[380px] overflow-hidden rounded-2xl border border-[#1d2b45] bg-[#0f1a2e] shadow-[0_40px_100px_-40px_rgba(56,189,248,0.35)] sm:h-[460px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,164,189,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(147,164,189,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-[#1d2b45]/80 bg-[#0f1a2e]/90 px-4 py-3 text-xs text-[#93a4bd] backdrop-blur-sm">
          <span className="flex items-center gap-2 font-medium text-[#e8eef7]">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-[#1d2b45]" />
              <span className="h-2 w-2 rounded-full bg-[#1d2b45]" />
              <span className="h-2 w-2 rounded-full bg-[#1d2b45]" />
            </span>
            Inspect generator
          </span>
          <span className="rounded-md border border-[#1d2b45] bg-[#0a1220] px-2 py-0.5">Radius 100 m</span>
        </div>

        <div className="absolute inset-0 grid place-items-center pt-8">
          <span className="radar-ring col-start-1 row-start-1 h-48 w-48 rounded-full border border-[#38bdf8]/60 sm:h-60 sm:w-60" />
          <span className="radar-ring col-start-1 row-start-1 h-48 w-48 rounded-full border border-[#38bdf8]/60 sm:h-60 sm:w-60" />
          <span className="radar-ring col-start-1 row-start-1 h-48 w-48 rounded-full border border-[#38bdf8]/60 sm:h-60 sm:w-60" />

          <span className="col-start-1 row-start-1 h-48 w-48 rounded-full border-2 border-dashed border-[#38bdf8]/70 bg-[#38bdf8]/[0.07] sm:h-60 sm:w-60" />

          <span className="relative z-10 col-start-1 row-start-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#38bdf8] text-[#0a1220] shadow-[0_0_36px_rgba(56,189,248,0.55)]">
            <MapPin className="h-6 w-6" strokeWidth={2.4} />
          </span>
        </div>

        <span className="worker-dot absolute left-1/2 top-[calc(50%+16px)] -ml-2 -mt-2 h-4 w-4 rounded-full border-2 border-[#0a1220] bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.2)]" />

        <div className="photo-card absolute left-4 top-16 z-10 flex items-center gap-3 rounded-xl border border-[#2a3b5a] bg-[#0a1220]/90 p-2.5 pr-4 backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#38bdf8]/10 text-[#38bdf8]">
            <Camera className="h-5 w-5" />
          </span>
          <div className="text-xs">
            <p className="font-semibold text-[#e8eef7]">Photo saved</p>
            <p className="mt-0.5 text-[#93a4bd]">38 m from the pin</p>
          </div>
        </div>

        {/* The manager approves (appears after the stamp) */}
        <div className="review-card absolute right-4 top-16 z-10 hidden items-center gap-3 rounded-xl border border-emerald-400/30 bg-[#0a1220]/90 p-2.5 pr-4 backdrop-blur sm:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="text-xs">
            <p className="font-semibold text-[#e8eef7]">Manager review</p>
            <p className="mt-0.5 text-emerald-300">Approved</p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="status-chip rounded-lg border border-[#2a3b5a] bg-[#0a1220]/90 px-3 py-2 text-xs text-[#e8eef7] backdrop-blur">
            Ali Raza is inside the radius. Photo attached.
          </div>
        </div>

        <div className="stamp absolute bottom-16 right-5 flex h-24 w-24 -rotate-[10deg] flex-col items-center justify-center rounded-full border-[3px] border-[#fbbf24] bg-[#fbbf24]/[0.12] text-center text-[#fbbf24] shadow-[0_0_40px_rgba(251,191,36,0.25)] sm:bottom-20 sm:right-8 sm:h-28 sm:w-28">
          <span className="font-display text-xs font-semibold">Checked in</span>
          <span className="font-display text-xl font-bold leading-tight">08:42</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Facts, the use cases strip, and before / after                        */
/* ------------------------------------------------------------------ */

function Facts() {
  return (
    <section aria-label="Key facts" className="border-y border-[#1d2b45] bg-[#0c1626]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[#1d2b45] lg:grid-cols-4">
        {FACTS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="reveal flex items-center gap-4 bg-[#0c1626] px-5 py-7 sm:px-8">
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1d2b45] bg-[#0f1a2e] text-[#38bdf8] sm:flex">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
              <p className="mt-0.5 text-xs leading-5 text-[#93a4bd] sm:text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// A slow strip of the kinds of work FieldProof is made for. It stops when the mouse is on it.
function UseCases() {
  const chips = (hidden) =>
    USE_CASES.map((name) => (
      <li
        key={`${name}${hidden ? "-copy" : ""}`}
        aria-hidden={hidden || undefined}
        className="flex shrink-0 items-center gap-2.5 rounded-full border border-[#1d2b45] bg-[#0f1a2e] px-4 py-2 text-sm text-[#cbd5e1]"
      >
        <MapPin className="h-3.5 w-3.5 text-[#38bdf8]" />
        {name}
      </li>
    ));

  return (
    <section aria-label="Kinds of work" className="py-10">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#93a4bd]">
        Made for work like
      </p>
      <div className="marquee-mask overflow-hidden">
        <ul className="marquee flex w-max gap-3">
          {chips(false)}
          {chips(true)}
        </ul>
      </div>
    </section>
  );
}

function Contrast() {
  return (
    <section className="pb-20 pt-6 sm:pb-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Before and after"
          title="Stop guessing who was on site"
          text="Attendance on paper and in chat groups is a matter of trust. FieldProof turns it into evidence."
          className="max-w-2xl"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="reveal rounded-2xl border border-[#1d2b45] bg-[#0c1626] p-6 sm:p-8">
            <p className="font-display text-lg font-semibold text-[#93a4bd]">Without proof</p>
            <ul className="mt-5 space-y-4">
              {CONTRAST.without.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#93a4bd]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-400/10 text-rose-400">
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal rounded-2xl border border-[#38bdf8]/30 bg-gradient-to-br from-[#0f1a2e] to-[#0c1a2c] p-6 shadow-[0_30px_70px_-40px_rgba(56,189,248,0.5)] sm:p-8">
            <p className="font-display text-lg font-semibold text-[#38bdf8]">With FieldProof</p>
            <ul className="mt-5 space-y-4">
              {CONTRAST.with.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#e8eef7]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What you get                                                         */
/* ------------------------------------------------------------------ */

// A small picture of a site radius, for the first (big) card
function RadiusGraphic() {
  return (
    <div aria-hidden="true" className="relative hidden h-36 w-36 shrink-0 place-items-center sm:grid">
      <span className="absolute h-36 w-36 rounded-full border border-[#38bdf8]/20" />
      <span className="absolute h-24 w-24 rounded-full border border-dashed border-[#38bdf8]/50 bg-[#38bdf8]/[0.06]" />
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#38bdf8] text-[#0a1220] shadow-[0_0_24px_rgba(56,189,248,0.5)]">
        <MapPin className="h-4 w-4" strokeWidth={2.6} />
      </span>
      <span className="absolute bottom-3 right-5 h-3 w-3 rounded-full border-2 border-[#0f1a2e] bg-emerald-400" />
    </div>
  );
}

function Proof() {
  return (
    <section id="proof" className="scroll-mt-20 border-t border-[#1d2b45] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="What you get"
          title="Every visit leaves proof behind"
          text="Workers check in and out from their phone. You get the evidence without chasing anyone for it."
          className="max-w-2xl"
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROOF.map(({ icon: Icon, title, text }, index) => {
            const featured = index === 0; // the first card is wider and has a picture

            return (
              <li
                key={title}
                onMouseMove={followMouse}
                className={`reveal card-hover spotlight group relative overflow-hidden rounded-2xl border border-[#1d2b45] bg-[#0f1a2e] p-6 ${
                  featured ? "lg:col-span-2" : ""
                }`}
              >
                <div className={featured ? "flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between" : ""}>
                  <div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#38bdf8]/20 bg-[#38bdf8]/10 text-[#38bdf8] transition-all duration-300 group-hover:scale-105 group-hover:border-[#38bdf8]/40 group-hover:bg-[#38bdf8] group-hover:text-[#0a1220]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-white">{title}</h3>
                    <p className="mt-2.5 max-w-lg text-[15px] leading-7 text-[#93a4bd]">{text}</p>
                  </div>

                  {featured && <RadiusGraphic />}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                         */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-y border-[#1d2b45] bg-[#0f1a2e] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="How it works" title="From assignment to proof in three steps" />

        <ol className="steps relative mt-14">
          <span aria-hidden="true" className="absolute bottom-6 left-[19.5px] top-6 w-px bg-[#1d2b45]" />
          <span
            aria-hidden="true"
            className="steps-fill absolute bottom-6 left-[19.5px] top-6 w-px bg-[#38bdf8]"
          />

          {STEPS.map((step, index) => (
            <li key={step.title} className="step relative flex gap-6 pb-14 last:pb-0">
              <span className="step-dot relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1d2b45] bg-[#0f1a2e] font-display text-base font-bold text-[#93a4bd]">
                {index + 1}
              </span>
              <div className="pt-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="step-title font-display text-xl font-semibold tracking-tight">{step.title}</h3>
                  <span className="rounded-full border border-[#1d2b45] bg-[#0a1220] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#93a4bd]">
                    {step.tag}
                  </span>
                </div>
                <p className="mt-2 max-w-xl leading-7 text-[#93a4bd]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Review flow: the manager approves or rejects with a reason           */
/* ------------------------------------------------------------------ */

function ReviewMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1d2b45] bg-[#0a1220] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1d2b45] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">
            <ShieldCheck className="h-3 w-3" />
            Field audit
          </span>
          <span className="truncate text-sm font-semibold">Inspect generator</span>
        </div>
        <span className="shrink-0 rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
          Pending review
        </span>
      </div>

      {/* Check-in and check-out proof */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {[
          { label: "Check-in", time: "08:42", note: "38 m from the pin", tone: "text-[#38bdf8]" },
          { label: "Check-out", time: "12:57", note: "21 m from the pin", tone: "text-emerald-400" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[#1d2b45] bg-[#0f1a2e] p-3">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${item.tone}`}>{item.label}</p>
            <div className="mt-2 flex h-16 items-center justify-center rounded-lg border border-[#1d2b45] bg-[#0a1220] text-[#38bdf8]/60">
              <Camera className="h-6 w-6" />
            </div>
            <p className="mt-2 font-mono text-xs text-[#e8eef7]">{item.time}</p>
            <p className="text-[11px] text-[#93a4bd]">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Reject with a required reason */}
      <div className="border-t border-[#1d2b45] bg-[#0c1626] p-4">
        <p className="text-xs font-semibold text-[#cbd5e1]">
          Reason for rejection <span className="text-rose-400">*</span>
        </p>
        <div className="mt-2 rounded-lg border border-rose-400/30 bg-[#0a1220] px-3 py-2.5 text-xs leading-5 text-[#cbd5e1]">
          The check-out photo is blurry. Please take it again.
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <span className="flex h-9 items-center justify-center rounded-lg border border-[#2a3b5a] text-xs font-bold text-[#cbd5e1]">
            Cancel
          </span>
          <span className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white">
            <X className="h-3.5 w-3.5" />
            Confirm reject
          </span>
        </div>
      </div>

      <p className="border-t border-[#1d2b45] px-4 py-2 text-center text-[11px] text-[#5f7191]">Sample data</p>
    </div>
  );
}

function ReviewFlow() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20">
        <div className="reveal">
          <SectionHeading
            eyebrow="Review"
            title="Approve or reject, with a reason"
            text="Proof is only useful if someone checks it. Managers review every visit in one place, and every decision is recorded."
          />

          <ul className="mt-8 space-y-4">
            {REVIEW_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[#cbd5e1]">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal">
          <ReviewMock />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Roles                                                                */
/* ------------------------------------------------------------------ */

function Roles() {
  const [role, setRole] = useState("manager");
  const panelRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (panelRef.current && !prefersReducedMotion()) {
      gsap.fromTo(panelRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [role]);

  const current = ROLES[role];

  return (
    <section id="roles" className="scroll-mt-20 border-t border-[#1d2b45] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Who uses it"
          title="One product, three views"
          text="Everyone gets a dashboard built for their job and nothing that is not theirs."
        />

        <div
          role="tablist"
          aria-label="Choose a role"
          className="mt-10 inline-flex rounded-xl border border-[#1d2b45] bg-[#0a1220] p-1.5"
        >
          {Object.entries(ROLES).map(([key, item]) => {
            const Icon = item.icon;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`tab-${key}`}
                aria-selected={role === key}
                aria-controls="role-panel"
                onClick={() => setRole(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
                  role === key
                    ? "bg-[#38bdf8] text-[#0a1220] shadow-md shadow-sky-500/20"
                    : "text-[#93a4bd] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          ref={panelRef}
          id="role-panel"
          role="tabpanel"
          aria-labelledby={`tab-${role}`}
          className="mt-8 grid gap-10 rounded-2xl border border-[#1d2b45] bg-[#0f1a2e] p-6 sm:p-10 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <h3 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {current.heading}
            </h3>
            <ul className="mt-6 space-y-4">
              {current.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[#cbd5e1]">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#1d2b45] bg-[#0a1220]">
            <div className="flex items-center justify-between border-b border-[#1d2b45] px-4 py-3 text-sm">
              <span className="font-medium">{current.previewTitle}</span>
              <span className="text-xs text-[#93a4bd]">Sample data</span>
            </div>
            <ul className="divide-y divide-[#1d2b45]">
              {current.preview.map((row) => (
                <li key={row.title} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#e8eef7]">{row.title}</p>
                    <p className="mt-0.5 truncate text-xs text-[#93a4bd]">{row.meta}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE[row.tone]}`}>
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop app                                                          */
/* ------------------------------------------------------------------ */

function DesktopMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1d2b45] bg-[#0a1220] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
      {/* Title bar of the window */}
      <div className="flex items-center gap-2 border-b border-[#1d2b45] bg-[#0f1a2e] px-3 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1d2b45]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1d2b45]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1d2b45]" />
        </span>
        <span className="mx-auto text-[11px] font-medium text-[#93a4bd]">FieldProof</span>
        <span className="w-10" aria-hidden="true" />
      </div>

      <div className="grid sm:grid-cols-[130px_1fr]">
        {/* Menu */}
        <div className="hidden space-y-2 border-r border-[#1d2b45] p-3 sm:block">
          {["Tasks", "Verification", "My workers", "Reviewed"].map((item, index) => (
            <div
              key={item}
              className={`rounded-md px-2.5 py-1.5 text-xs ${
                index === 0 ? "bg-[#38bdf8]/15 font-medium text-[#38bdf8]" : "text-[#93a4bd]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Rows */}
        <ul className="divide-y divide-[#1d2b45]">
          {ROLES.manager.preview.map((row) => (
            <li key={row.title} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="truncate text-xs font-medium text-[#e8eef7]">{row.title}</span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${TONE[row.tone]}`}>
                {row.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-[#1d2b45] px-4 py-2 text-center text-[11px] text-[#5f7191]">Sample data</p>
    </div>
  );
}

function DesktopApp() {
  return (
    <section className="border-y border-[#1d2b45] bg-[#0c1626] py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20">
        <div className="reveal order-2 lg:order-1">
          <DesktopMock />
        </div>

        <div className="reveal order-1 lg:order-2">
          <SectionHeading
            eyebrow="Desktop app"
            title="Prefer a window of its own?"
            text="Managers and office users can install FieldProof on Windows. Workers in the field keep using the browser on their phone."
          />

          <ul className="mt-8 space-y-4">
            {DESKTOP_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[#cbd5e1]">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <DownloadDesktopLink className="btn-primary group mt-9 inline-flex items-center gap-2.5 rounded-xl bg-[#38bdf8] px-7 py-3.5 text-base font-semibold text-[#0a1220] shadow-lg shadow-sky-500/25 hover:bg-[#7dd3fc]">
            <Monitor className="h-4 w-4" />
            Download for Windows
          </DownloadDesktopLink>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Activity log                                                         */
/* ------------------------------------------------------------------ */

function Activity({ feedActive }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Activity log"
            title="One timeline for everything that happens"
            text="Check-ins, check-outs, new tasks and deletions are written to a log that admins can read. When someone asks who did what, there is an answer with a time on it."
          />
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-[#93a4bd]">
            <Timer className="h-4 w-4 text-[#38bdf8]" />
            Every entry is saved with its time.
          </p>
        </div>

        <ActivityFeed active={feedActive} />
      </div>
    </section>
  );
}

function ActivityFeed({ active }) {
  const [tick, setTick] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (tick === 0 || !listRef.current || prefersReducedMotion()) return;
    const newest = listRef.current.firstElementChild;
    gsap.fromTo(
      newest,
      { opacity: 0, y: -14, backgroundColor: "rgba(56,189,248,0.18)" },
      { opacity: 1, y: 0, backgroundColor: "rgba(56,189,248,0)", duration: 0.6, ease: "power2.out" }
    );
  }, [tick]);

  const rows = FEED_WHEN.map((when, i) => {
    const n = tick - i;
    const item = FEED[((n % FEED.length) + FEED.length) % FEED.length];
    return { key: n, when, ...item };
  });

  return (
    <div className="feed-box overflow-hidden rounded-2xl border border-[#1d2b45] bg-[#0a1220] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between border-b border-[#1d2b45] px-5 py-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Activity log
        </span>
        <span className="text-xs text-[#93a4bd]">Sample data</span>
      </div>

      <ul ref={listRef} aria-live="off">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-start gap-3 border-b border-[#1d2b45] px-5 py-3.5 last:border-b-0"
          >
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${FEED_DOT[row.type]}`} />
            <div className="flex-1">
              <p className="text-sm leading-6 text-[#e8eef7]">{row.text}</p>
              <p className="text-[11px] uppercase tracking-wider text-[#5f7191]">{FEED_LABEL[row.type]}</p>
            </div>
            <span className="shrink-0 pt-0.5 text-xs tabular-nums text-[#93a4bd]">{row.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-[#1d2b45] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="Questions" title="Questions people ask first" />

        <div className="mt-10 space-y-3">
          {FAQ.map((item, index) => (
            <FaqItem
              key={item.q}
              id={index}
              question={item.q}
              answer={item.a}
              open={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ id, question, answer, open, onToggle }) {
  const bodyRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    if (firstRender.current) {
      firstRender.current = false;
      gsap.set(el, { height: open ? "auto" : 0 });
      return;
    }

    gsap.to(el, {
      height: open ? "auto" : 0,
      duration: prefersReducedMotion() ? 0 : 0.35,
      ease: "power2.inOut",
    });
  }, [open]);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        open
          ? "border-[#2a3b5a] bg-[#0f1a2e] shadow-lg shadow-black/20"
          : "border-[#1d2b45] bg-[#0c1626] hover:border-[#2a3b5a]"
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-${id}`}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-display text-lg font-semibold tracking-tight transition-colors hover:text-[#38bdf8]"
        >
          {question}
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-[#93a4bd] transition-transform duration-300 ${
              open ? "rotate-180 text-[#38bdf8]" : ""
            }`}
          />
        </button>
      </h3>
      <div ref={bodyRef} id={`faq-${id}`} role="region" className="overflow-hidden">
        <p className="max-w-2xl px-5 pb-6 leading-7 text-[#93a4bd]">{answer}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Final call to action, footer and the sticky bar for phones           */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#fbbf24] text-[#0a1220]">
      <div aria-hidden="true" className="hazard h-3 w-full" />

      {/* Soft light shapes (decoration only) */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[#0a1220]/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 px-5 py-20 md:flex-row md:items-center sm:py-24">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            See who is really on site today
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#3b3410]/90">
            Create an account, add your first task and watch the first check-in arrive with its photo. Prefer a
            desktop window? Download the Windows app.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={REGISTER_PATH}
            className="group inline-flex items-center gap-2 rounded-xl bg-[#0a1220] px-7 py-3.5 text-base font-semibold text-[#e8eef7] shadow-xl shadow-black/20 transition hover:bg-[#16233a]"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <DownloadDesktopLink className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0a1220]/80 px-6 py-3.5 text-base font-semibold transition hover:bg-[#0a1220]/10">
            <Download className="h-4 w-4" />
            Download for Windows
          </DownloadDesktopLink>
          <Link
            to={LOGIN_PATH}
            className="rounded-xl border-2 border-[#0a1220]/80 px-7 py-3.5 text-base font-semibold transition hover:bg-[#0a1220]/10"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1d2b45] bg-[#0a1220] pb-24 pt-14 md:pb-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#93a4bd]">
            Proof that your field team was where they said they were, with the time and the photo to show for it.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={[
            { label: "What you get", href: "#proof" },
            { label: "How it works", href: "#how" },
            { label: "Who uses it", href: "#roles" },
            { label: "Questions", href: "#faq" },
            { label: "Download for Windows", href: DOWNLOAD_DESKTOP_URL, external: true },
          ]}
        />

        <FooterColumn
          title="Account"
          links={[
            { label: "Log in", to: LOGIN_PATH },
            { label: "Create an account", to: REGISTER_PATH },
          ]}
        />

        <FooterColumn
          title="Legal"
          links={[
            { label: "Privacy policy", to: "/privacy" },
            { label: "Terms of use", to: "/terms" },
          ]}
        />
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-[#1d2b45] px-5 pt-6 text-sm text-[#93a4bd] sm:flex-row sm:items-center">
        <span>&copy; {new Date().getFullYear()} FieldProof. All rights reserved.</span>
        <a
          href="#top"
          className="inline-flex items-center gap-2 rounded-xl border border-[#1d2b45] px-3 py-1.5 transition-colors hover:border-[#2a3b5a] hover:text-[#e8eef7]"
        >
          Back to top
          <ArrowUp className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link to={link.to} className="text-sm text-[#93a4bd] transition-colors hover:text-[#e8eef7]">
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-sm text-[#93a4bd] transition-colors hover:text-[#e8eef7]"
                {...(link.external ? { rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// A bar at the bottom of phones. It slides in after the hero.
function StickyCta({ visible }) {
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#1d2b45] bg-[#0a1220]/90 p-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <Link
          to={REGISTER_PATH}
          tabIndex={visible ? 0 : -1}
          className="btn-primary flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#38bdf8] text-sm font-semibold text-[#0a1220]"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to={LOGIN_PATH}
          tabIndex={visible ? 0 : -1}
          className="flex h-11 items-center rounded-xl border border-[#2a3b5a] px-4 text-sm font-medium"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page-level CSS                                                       */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400..600&display=swap');

.font-display {
  font-family: 'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif;
}

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

::selection {
  background: rgba(56, 189, 248, 0.35);
  color: #fff;
}

a:focus-visible,
button:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 3px;
  border-radius: 10px;
}

.skip-link {
  position: fixed;
  left: 16px;
  top: -60px;
  z-index: 100;
  background: #38bdf8;
  color: #0a1220;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 10px;
  transition: top 0.2s ease;
}
.skip-link:focus { top: 16px; }

.site-header {
  transition: background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
}
.site-header.is-scrolled {
  background-color: rgba(10, 18, 32, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom-color: #1d2b45;
  box-shadow: 0 4px 30px -10px rgba(0, 0, 0, 0.4);
}

/* "there." in the headline: the blue slowly slides */
.text-gradient {
  color: #38bdf8;
  background: linear-gradient(90deg, #38bdf8, #7dd3fc, #bae6fd, #38bdf8);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-slide 6s linear infinite;
}
@keyframes gradient-slide { to { background-position: 200% center; } }

/* A faint grid behind the hero that fades away at the edges */
.hero-grid {
  background-image:
    linear-gradient(rgba(147, 164, 189, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(147, 164, 189, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%);
  mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%);
}

.btn-primary {
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px -10px rgba(56, 189, 248, 0.55);
}

.card-hover {
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  border-color: rgba(56, 189, 248, 0.45);
  transform: translateY(-4px);
  box-shadow: 0 24px 48px -28px rgba(56, 189, 248, 0.4);
}

/* The soft light that follows the mouse inside a card */
.spotlight::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(56, 189, 248, 0.12), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.spotlight:hover::before { opacity: 1; }
.spotlight > * { position: relative; }

/* The strip of use cases */
.marquee { animation: marquee 45s linear infinite; }
.marquee:hover { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }
.marquee-mask {
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .marquee,
  .text-gradient { animation: none; }
}

.step .step-dot {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}
.step .step-title {
  transition: color 0.3s ease;
}
.step.is-active .step-dot {
  background-color: #38bdf8;
  border-color: #38bdf8;
  color: #0a1220;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
}
.step:not(.is-active) .step-title {
  color: #cbd5e1;
}

.hazard {
  background: repeating-linear-gradient(
    -45deg,
    #0a1220 0,
    #0a1220 14px,
    #fbbf24 14px,
    #fbbf24 28px
  );
}
`;