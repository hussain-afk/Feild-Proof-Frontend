import { useState, useContext } from "react";
import useAuth from "../hooks/useAuth";
import { context } from "../context/context.jsx";
import feildproofLogo from "../assets/fieldproof-logo.png";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Camera,
  Receipt,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  UserCog,
  ArrowRight,
  Info,
} from "lucide-react";
import LoadingState from "../ui/LoadingState.jsx";

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const MANAGER_REQUEST_ROLE = "pending_manager";

const FIELDS = {
  name: {
    label: "Full name",
    icon: User,
    type: "text",
    placeholder: "Your full name",
    autoComplete: "name",
  },
  email: {
    label: "Email address",
    icon: Mail,
    type: "email",
    placeholder: "name@company.com",
    autoComplete: "email",
  },
  password: {
    label: "Password",
    icon: Lock,
    type: "password",
    placeholder: "Enter your password",
  },
};

const MODES = {
  login: {
    tab: "Sign in",
    icon: LogIn,
    title: "Welcome back",
    text: "Sign in to open your dashboard.",
    button: "Sign in",
    fields: ["email", "password"],
    successText: "",
  },
  signup: {
    tab: "Register",
    icon: UserPlus,
    title: "Create your account",
    text: "Register as a worker. A manager can invite you to their team later.",
    button: "Create account",
    fields: ["name", "email", "password"],
    successText: "Registration successful. You can sign in now.",
  },
  managerRequest: {
    tab: "Manager request",
    icon: UserCog,
    title: "Request manager access",
    text: "Create your account and request manager access.",
    button: "Create account and request access",
    fields: ["name", "email", "password"],
    successText:
      "Your account was created and your manager request was sent. An admin will review it.",
    info: "An admin reviews every manager request before access is given.",
  },
};

const FEATURES = [
  {
    icon: MapPin,
    title: "GPS geo-fencing",
    text: "Check-ins count only inside the site radius.",
  },
  {
    icon: Camera,
    title: "Live verification",
    text: "Photo and attendance proof on every visit.",
  },
  {
    icon: Receipt,
    title: "Automated invoicing",
    text: "Tracked hours turn into clear billing.",
  },
];

const EMPTY_FORM = { name: "", email: "", password: "" };

const inputClass =
  "h-11 w-full rounded-xl border border-slate-800/80 bg-[#0a0f1a] pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition-all duration-200 hover:border-slate-700 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/15";

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/25">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className="text-lg font-semibold tracking-tight text-white">
          Field<span className="text-sky-400">Proof</span>
        </p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Workforce platform
        </p>
      </div> */}
      <img src={feildproofLogo} alt="FieldProof Logo" className="h-20 w-auto" />
    </div>
  );
}

function Field({ id, label, icon: Icon, type = "text", hint, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-slate-500"
      >
        {label}
        <span aria-hidden="true" className="ml-0.5 text-rose-400">
          *
        </span>
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

        <input
          id={id}
          required
          type={isPassword && visible ? "text" : type}
          className={`${inputClass} ${isPassword ? "pr-12" : ""}`}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-200"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function Notice({ notice }) {
  if (!notice) return null;

  const success = notice.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
          : "border-rose-500/25 bg-rose-500/10 text-rose-200"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="leading-relaxed">{notice.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function AuthPage() {
  const { isLoading } = useContext(context);
  const { register, login } = useAuth();

  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const mode = MODES[authMode];

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const switchMode = (key) => {
    setAuthMode(key);
    setNotice(null);
    setForm((prev) => ({ ...prev, password: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice(null);

    const values = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    const hasEmptyField = mode.fields.some((key) => !values[key]);
    if (hasEmptyField) {
      setNotice({ type: "error", text: "Please fill in all the fields." });
      return;
    }

    setLoading(true);

    try {
      if (authMode === "login") {
        await login(values.email, values.password);
      }

      if (authMode === "signup") {
        // No managerId — worker joins a team later via manager invite
        await register(values.name, values.email, values.password);
      }

      if (authMode === "managerRequest") {
        await register(
          values.name,
          values.email,
          values.password,
          MANAGER_REQUEST_ROLE
        );
      }

      if (mode.successText) {
        setNotice({ type: "success", text: mode.successText });
        setForm(EMPTY_FORM);
      }
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#070a12] px-4 py-8 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-600/8 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0c1220] shadow-2xl shadow-black/40 lg:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-sky-950/40 via-[#0c1220] to-[#070a12] p-10 lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage:
                "radial-gradient(ellipse at top left, black 15%, transparent 65%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at top left, black 15%, transparent 65%)",
            }}
          />

          <div className="relative">
            <Logo />

            <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-[11px] font-medium text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              Live attendance verification
            </span>

            <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-white">
              Work verification and
              <span className="mt-1 block text-slate-400">
                automated invoicing
              </span>
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Real-time attendance, GPS geo-fenced logs and automated invoicing
              for your field teams.
            </p>

            <ul className="mt-10 space-y-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex items-start gap-3.5 rounded-2xl border border-slate-800/60 bg-[#0a0f1a]/60 p-4 transition hover:border-sky-500/25"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 text-xs text-slate-600">
            &copy; {new Date().getFullYear()} FieldProof. All rights reserved.
          </p>
        </aside>

        <main className="p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <div
              role="tablist"
              aria-label="Account options"
              className="mb-8 grid grid-cols-3 gap-1 rounded-xl border border-slate-800/80 bg-[#0a0f1a] p-1"
            >
              {Object.entries(MODES).map(([key, item]) => {
                const TabIcon = item.icon;
                const active = authMode === key;

                return (
                  <button
                    key={key}
                    id={`tab-${key}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="auth-form"
                    onClick={() => switchMode(key)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2.5 text-center text-[11px] font-medium leading-tight transition sm:flex-row sm:gap-2 sm:px-2 sm:text-sm ${
                      active
                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <TabIcon className="h-4 w-4 shrink-0" />
                    {item.tab}
                  </button>
                );
              })}
            </div>

            <div className="mb-7 space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {mode.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-500">
                {mode.text}
              </p>
            </div>

            <form
              id="auth-form"
              role="tabpanel"
              aria-labelledby={`tab-${authMode}`}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode.fields.map((key) => (
                <Field
                  key={key}
                  id={`auth-${key}`}
                  {...FIELDS[key]}
                  autoComplete={
                    key === "password"
                      ? authMode === "login"
                        ? "current-password"
                        : "new-password"
                      : FIELDS[key].autoComplete
                  }
                  value={form[key]}
                  onChange={handleChange(key)}
                />
              ))}

              {mode.info && (
                <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm text-sky-200">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="leading-relaxed">{mode.info}</p>
                </div>
              )}

              <div aria-live="polite">
                <Notice notice={notice} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-medium text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-500 hover:shadow-sky-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1220] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode.button}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {authMode === "login" ? (
                <>
                  New to FieldProof?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-sky-400 transition hover:text-sky-300"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-medium text-sky-400 transition hover:text-sky-300"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
              <Lock className="h-3 w-3" />
              Secure access to your FieldProof workspace
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthPage;