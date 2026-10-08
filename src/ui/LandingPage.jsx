import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShieldCheck,
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
} from "lucide-react";

/**
 * FieldProof landing page (header, all sections and footer in this one file)
 *
 * Setup:   npm i gsap
 * Route:   <Route path="/" element={<LandingPage />} />
 *          (your app already sends logged-in users from "/" to their dashboard)
 *
 * Palette: ink #0a1220 (page), ink-2 #0f1a2e (surface), line #1d2b45,
 *          mist #e8eef7 (text), steel #93a4bd (muted),
 *          signal #38bdf8 (the product), hi-vis #fbbf24 (the proof stamp and the final call to action)
 * Type:    Bricolage Grotesque for headings, Instrument Sans for everything else
 */

gsap.registerPlugin(ScrollTrigger);

const LOGIN_PATH = "/auth";
const REGISTER_PATH = "/auth";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

const NAV = [
  { label: "What you get", href: "#proof" },
  { label: "How it works", href: "#how" },
  { label: "Who uses it", href: "#roles" },
  { label: "Questions", href: "#faq" },
];

// Short, factual numbers shown right under the hero
const FACTS = [
  { icon: Crosshair, value: "50 m to 1 km", label: "Site radius you control" },
  { icon: Camera, value: "2 photos", label: "At check-in and check-out" },
  { icon: Zap, value: "Live", label: "Updates on every screen" },
  { icon: KeyRound, value: "6-digit code", label: "Email confirmation for workers" },
];

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

// tone decides the colour of the small status pill in the preview card
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
    a: "No. FieldProof runs in the phone's browser, so workers only need the link and their login.",
  },
  {
    q: "Who can see the activity log?",
    a: "Only admins. Managers and workers see their own tasks and notifications, nothing more.",
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

const FEED_LABEL = { in: "Check-in", out: "Check-out", task: "Task", delete: "Deleted" };

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ---- Header turns solid once the page is scrolled (not an animation, so always on) ----
      ScrollTrigger.create({
        trigger: document.body,
        start: "top -12",
        end: "bottom bottom",
        onToggle: (self) => setScrolled(self.isActive),
      });

      // ---- Mark the nav link of the section the reader is in ----
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

      // ---- Highlight the step the reader is on ----
      gsap.utils.toArray(".step").forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 62%",
          end: "bottom 62%",
          toggleClass: { targets: step, className: "is-active" },
        });
      });

      // ---- Only run the live feed while it is on screen ----
      ScrollTrigger.create({
        trigger: ".feed-box",
        start: "top 90%",
        end: "bottom 10%",
        onToggle: (self) => setFeedActive(self.isActive),
      });

      // ---- Everything below is real motion, so it is skipped for "reduce motion" ----
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1) The page-load moment: headline, then the visual, then the check-in story
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero-line", { yPercent: 105, duration: 0.9, stagger: 0.12 })
          .from(".hero-fade", { y: 18, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.5")
          .from(".hero-panel", { y: 30, opacity: 0, duration: 0.9 }, "-=0.9");

        // 2) The story in the hero panel: a worker walks into the radius, the stamp lands
        const story = gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: 1.2 });
        story
          .set(".worker-dot", { x: -130, y: -100, opacity: 0 })
          .set(".stamp", { opacity: 0, scale: 2, rotation: -26 })
          .set(".status-chip", { opacity: 0, y: 8 })
          .set(".photo-card", { opacity: 0, y: 10 })
          .to(".worker-dot", { opacity: 1, duration: 0.4 })
          .to(".worker-dot", { x: 30, y: 22, duration: 2.6, ease: "power2.inOut" })
          .to(".status-chip", { opacity: 1, y: 0, duration: 0.4 }, "-=0.5")
          .to(".photo-card", { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
          .to(".stamp", { opacity: 1, scale: 1, rotation: -10, duration: 0.26, ease: "power4.in" })
          .to(".hero-visual", { y: 4, duration: 0.07, yoyo: true, repeat: 1 })
          .to({}, { duration: 2.4 })
          .to([".stamp", ".status-chip", ".worker-dot", ".photo-card"], { opacity: 0, duration: 0.5 });

        gsap.fromTo(
          ".radar-ring",
          { scale: 0.3, opacity: 0.55 },
          { scale: 1.5, opacity: 0, duration: 3.4, ease: "power1.out", repeat: -1, stagger: 1.1 }
        );

        // 3) The route line fills as you scroll through the steps
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

        // 4) Thin reading progress under the header
        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.2 },
        });

        // 5) Cards and stats slide up once, the first time they are seen
        // (immediateRender: false means the content is NEVER hidden up front,
        //  so if a trigger does not fire, the card is still visible - no empty gaps)
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

    // Fonts change the page height, so measure again once they load
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, []);

  // Press Escape to close the mobile menu
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[#0a1220] text-[#e8eef7] antialiased"
      style={{ fontFamily: "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif" }}
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
        <Proof />
        <HowItWorks />
        <Roles />
        <Activity feedActive={feedActive} />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                        */
/* ------------------------------------------------------------------ */

// Small label + big title + short text, used at the top of every section
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
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38bdf8] text-[#0a1220] shadow-[0_0_24px_rgba(56,189,248,0.35)]">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">FieldProof</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                               */
/* ------------------------------------------------------------------ */

function Header({ menuOpen, setMenuOpen, scrolled, activeNav }) {
  const panelRef = useRef(null);

  // Slide the mobile menu in when it opens
  useEffect(() => {
    if (menuOpen && panelRef.current && !prefersReducedMotion()) {
      gsap.from(panelRef.current, { y: -12, opacity: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b border-transparent ${
        scrolled ? "is-scrolled" : ""
      } ${menuOpen ? "is-open" : ""}`}
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
                className={`relative rounded-md px-3.5 py-2 text-sm transition-colors ${
                  active ? "text-[#e8eef7]" : "text-[#93a4bd] hover:text-[#e8eef7]"
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
          <Link
            to={LOGIN_PATH}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#e8eef7] transition-colors hover:bg-white/5"
          >
            Log in
          </Link>
          <Link
            to={REGISTER_PATH}
            className="btn-primary rounded-lg bg-[#38bdf8] px-4 py-2 text-sm font-semibold text-[#0a1220] hover:bg-[#7dd3fc]"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#e8eef7] hover:bg-white/5 md:hidden"
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
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              to={LOGIN_PATH}
              className="rounded-lg border border-[#1d2b45] py-2.5 text-center text-sm font-medium"
            >
              Log in
            </Link>
            <Link
              to={REGISTER_PATH}
              className="rounded-lg bg-[#38bdf8] py-2.5 text-center text-sm font-semibold text-[#0a1220]"
            >
              Get started
            </Link>
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
      {/* soft glows behind the content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-[#38bdf8]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-64 h-[360px] w-[360px] rounded-full bg-[#38bdf8]/[0.06] blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
        <div>
          <p className="hero-fade mb-6 inline-flex items-center gap-2 rounded-full border border-[#1d2b45] bg-[#0f1a2e] py-1.5 pl-2 pr-4 text-xs font-medium text-[#93a4bd]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#38bdf8]/15 text-[#38bdf8]">
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
                was actually <span className="text-[#38bdf8]">there.</span>
              </span>
            </span>
          </h1>

          <p className="hero-fade mt-6 max-w-xl text-lg leading-8 text-[#93a4bd]">
            FieldProof checks every worker's GPS position and photo against the site you set, so
            attendance stops being a matter of trust.
          </p>

          <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={REGISTER_PATH}
              className="btn-primary group inline-flex items-center gap-2 rounded-lg bg-[#38bdf8] px-6 py-3 text-base font-semibold text-[#0a1220] hover:bg-[#7dd3fc]"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="rounded-lg border border-[#2a3b5a] px-6 py-3 text-base font-medium transition-colors hover:border-[#3d5380] hover:bg-white/5"
            >
              See how it works
            </a>
          </div>

          <p className="hero-fade mt-6 flex items-center gap-2 text-sm text-[#93a4bd]">
            <Smartphone className="h-4 w-4 shrink-0" />
            Runs in the browser on any phone. Nothing to install.
          </p>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

// The one memorable moment: a worker walks into the radius and the check-in stamp lands.
function HeroVisual() {
  return (
    <div className="hero-panel">
      <div
        role="img"
        aria-label="Animation: a worker walks toward a work site. When they are inside the radius, a check-in stamp appears."
        className="hero-visual relative h-[380px] overflow-hidden rounded-2xl border border-[#1d2b45] bg-[#0f1a2e] shadow-[0_30px_80px_-30px_rgba(56,189,248,0.25)] sm:h-[460px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,164,189,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(147,164,189,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        {/* top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-[#1d2b45] bg-[#0f1a2e]/95 px-4 py-3 text-xs text-[#93a4bd]">
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

        {/* radar */}
        <div className="absolute inset-0 grid place-items-center pt-8">
          <span className="radar-ring col-start-1 row-start-1 h-48 w-48 rounded-full border border-[#38bdf8]/60 sm:h-60 sm:w-60" />
          <span className="radar-ring col-start-1 row-start-1 h-48 w-48 rounded-full border border-[#38bdf8]/60 sm:h-60 sm:w-60" />
          <span className="radar-ring col-start-1 row-start-1 h-48 w-48 rounded-full border border-[#38bdf8]/60 sm:h-60 sm:w-60" />

          <span className="col-start-1 row-start-1 h-48 w-48 rounded-full border-2 border-dashed border-[#38bdf8]/70 bg-[#38bdf8]/[0.07] sm:h-60 sm:w-60" />

          <span className="relative z-10 col-start-1 row-start-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#38bdf8] text-[#0a1220] shadow-[0_0_36px_rgba(56,189,248,0.55)]">
            <MapPin className="h-6 w-6" strokeWidth={2.4} />
          </span>
        </div>

        {/* worker */}
        <span className="worker-dot absolute left-1/2 top-[calc(50%+16px)] -ml-2 -mt-2 h-4 w-4 rounded-full border-2 border-[#0a1220] bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.2)]" />

        {/* photo proof card */}
        <div className="photo-card absolute left-4 top-16 z-10 flex items-center gap-3 rounded-xl border border-[#2a3b5a] bg-[#0a1220]/90 p-2.5 pr-4 backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#38bdf8]/10 text-[#38bdf8]">
            <Camera className="h-5 w-5" />
          </span>
          <div className="text-xs">
            <p className="font-semibold text-[#e8eef7]">Photo saved</p>
            <p className="mt-0.5 text-[#93a4bd]">38 m from the pin</p>
          </div>
        </div>

        {/* status */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="status-chip rounded-lg border border-[#2a3b5a] bg-[#0a1220]/90 px-3 py-2 text-xs text-[#e8eef7] backdrop-blur">
            Ali Raza is inside the radius. Photo attached.
          </div>
        </div>

        {/* the stamp */}
        <div className="stamp absolute bottom-16 right-5 flex h-24 w-24 -rotate-[10deg] flex-col items-center justify-center rounded-full border-[3px] border-[#fbbf24] bg-[#fbbf24]/10 text-center text-[#fbbf24] sm:bottom-20 sm:right-8 sm:h-28 sm:w-28">
          <span className="font-display text-xs font-semibold">Checked in</span>
          <span className="font-display text-xl font-bold leading-tight">08:42</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Facts bar                                                            */
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

/* ------------------------------------------------------------------ */
/* What you get                                                         */
/* ------------------------------------------------------------------ */

function Proof() {
  return (
    <section id="proof" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="What you get"
          title="Every visit leaves proof behind"
          text="Workers check in and out from their phone. You get the evidence without chasing anyone for it."
          className="max-w-2xl"
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROOF.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="reveal card-hover group relative overflow-hidden rounded-2xl border border-[#1d2b45] bg-[#0f1a2e] p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#38bdf8]/15 bg-[#38bdf8]/10 text-[#38bdf8] transition-colors group-hover:bg-[#38bdf8] group-hover:text-[#0a1220]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 leading-7 text-[#93a4bd]">{text}</p>
            </li>
          ))}
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
          {/* the route: a grey track with a blue fill that grows as you scroll */}
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
                  <h3 className="step-title font-display text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
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
/* Roles                                                                */
/* ------------------------------------------------------------------ */

function Roles() {
  const [role, setRole] = useState("manager");
  const panelRef = useRef(null);
  const firstRender = useRef(true);

  // Fade the panel when the person switches tabs (an answer to their click)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (panelRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [role]);

  const current = ROLES[role];

  return (
    <section id="roles" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Who uses it"
          title="One product, three views"
          text="Everyone gets a dashboard built for their job and nothing that is not theirs."
        />

        <div
          role="tablist"
          aria-label="Choose a role"
          className="mt-10 inline-flex rounded-xl border border-[#1d2b45] bg-[#0f1a2e] p-1"
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
                  role === key ? "bg-[#38bdf8] text-[#0a1220]" : "text-[#93a4bd] hover:text-[#e8eef7]"
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

          {/* A small sample of what this role sees */}
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
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE[row.tone]}`}
                  >
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
/* Activity log                                                         */
/* ------------------------------------------------------------------ */

function Activity({ feedActive }) {
  return (
    <section className="border-y border-[#1d2b45] bg-[#0f1a2e] py-20 sm:py-28">
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

  // Add a new row every few seconds, only while the box is on screen
  useEffect(() => {
    if (!active || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, [active]);

  // Highlight the newest row when it arrives
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
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
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

  // Open and close the answer smoothly
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
      className={`rounded-xl border transition-colors duration-300 ${
        open ? "border-[#2a3b5a] bg-[#0f1a2e]" : "border-[#1d2b45] bg-[#0c1626] hover:border-[#2a3b5a]"
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
/* Final call to action                                                 */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#fbbf24] text-[#0a1220]">
      {/* hazard tape stripe, the hi-vis touch */}
      <div aria-hidden="true" className="hazard h-2.5 w-full" />

      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-20 md:flex-row md:items-center sm:py-24">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            See who is really on site today
          </h2>
          <p className="mt-3 text-lg leading-8 text-[#3b3410]">
            Create an account, add your first task and watch the first check-in arrive with its
            photo.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={REGISTER_PATH}
            className="group inline-flex items-center gap-2 rounded-lg bg-[#0a1220] px-6 py-3 text-base font-semibold text-[#e8eef7] transition-colors hover:bg-[#16233a]"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to={LOGIN_PATH}
            className="rounded-lg border-2 border-[#0a1220] px-6 py-3 text-base font-semibold transition-colors hover:bg-[#0a1220]/10"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                               */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-[#1d2b45] bg-[#0a1220] py-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#93a4bd]">
            Proof that your field team was where they said they were, with the time and the photo to
            show for it.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={[
            { label: "What you get", href: "#proof" },
            { label: "How it works", href: "#how" },
            { label: "Who uses it", href: "#roles" },
            { label: "Questions", href: "#faq" },
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
          className="inline-flex items-center gap-2 rounded-lg border border-[#1d2b45] px-3 py-1.5 transition-colors hover:border-[#2a3b5a] hover:text-[#e8eef7]"
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
              <a href={link.href} className="text-sm text-[#93a4bd] transition-colors hover:text-[#e8eef7]">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page-level CSS (fonts, header states, step highlight, small extras)  */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400..600&display=swap');

.font-display { font-family: 'Bricolage Grotesque', 'Instrument Sans', system-ui, sans-serif; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

::selection { background: rgba(56,189,248,.35); color: #fff; }

/* Keyboard focus: a clear ring on everything clickable */
a:focus-visible, button:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 3px;
  border-radius: 8px;
}

/* "Skip to content" link, only visible when focused with the keyboard */
.skip-link {
  position: fixed; left: 16px; top: -60px; z-index: 100;
  background: #38bdf8; color: #0a1220; font-weight: 600;
  padding: 10px 16px; border-radius: 8px; transition: top .2s ease;
}
.skip-link:focus { top: 16px; }

.site-header { transition: background-color .3s ease, border-color .3s ease, backdrop-filter .3s ease; }
.site-header.is-scrolled,
.site-header.is-open { background-color: rgba(10,18,32,.82); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom-color: #1d2b45; }

/* Primary button: lifts a little on hover */
.btn-primary { transition: background-color .2s ease, transform .2s ease, box-shadow .2s ease; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 30px -10px rgba(56,189,248,.6); }

/* Feature cards: soft lift and a blue glow on hover */
.card-hover { transition: border-color .3s ease, transform .3s ease, box-shadow .3s ease; }
.card-hover:hover { border-color: rgba(56,189,248,.4); transform: translateY(-3px); box-shadow: 0 20px 40px -24px rgba(56,189,248,.35); }

.step .step-dot { transition: background-color .3s ease, border-color .3s ease, color .3s ease; }
.step .step-title { transition: color .3s ease; }
.step.is-active .step-dot { background-color: #38bdf8; border-color: #38bdf8; color: #0a1220; }
.step:not(.is-active) .step-title { color: #cbd5e1; }

/* Hazard tape above the final call to action */
.hazard { background: repeating-linear-gradient(-45deg, #0a1220 0, #0a1220 14px, #fbbf24 14px, #fbbf24 28px); }
`;