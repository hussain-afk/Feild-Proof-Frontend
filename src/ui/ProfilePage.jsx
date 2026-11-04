import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { context } from "../context/context.jsx";
import useAuth from "../hooks/useAuth.jsx";
import VerifyEmailModal from "./VerifyEmailModal.jsx";
import LoadingState from "./LoadingState.jsx";
import {
  dismissPendingVerification,
  getPendingVerification,
} from "../services/verification.storage.js";
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Copy,
  Check,
  RotateCcw,
  CalendarDays,
  BadgeCheck,
  Crown,
  Shield,
  Briefcase,
  Users,
} from "lucide-react";

const MAX_AVATAR_MB = 5;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]";

const inputClass =
  "w-full h-11 rounded-xl bg-[#0b1220] border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition hover:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const fromUser = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  hourlyRate: user?.hourlyRate ?? "",
  password: "",
});

function getSubscriptionView(sub) {
  if (!sub || sub.plan === "none" || !sub.plan) {
    return {
      planLabel: "No plan",
      statusLabel: "None",
      active: false,
      endsLabel: null,
      limit: 0,
    };
  }

  const status = String(sub.status || "").toLowerCase();
  const endsAt = sub.endsAt ? new Date(sub.endsAt) : null;
  const expiredByDate =
    endsAt && sub.plan !== "free" && endsAt.getTime() < Date.now();

  const active = status === "active" && !expiredByDate;

  let endsLabel = null;
  if (sub.plan === "free") {
    endsLabel = "Lifetime";
  } else if (endsAt) {
    endsLabel = endsAt.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const planLabel =
    sub.plan === "trial"
      ? "Free trial"
      : String(sub.plan).charAt(0).toUpperCase() + String(sub.plan).slice(1);

  return {
    planLabel,
    statusLabel: active
      ? "Active"
      : status === "canceled"
        ? "Canceled"
        : "Expired",
    active,
    endsLabel,
    limit: sub.workerLimit ?? 0,
  };
}

function getPasswordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Too weak", bar: "bg-rose-400", text: "text-rose-400" },
    { label: "Weak", bar: "bg-rose-400", text: "text-rose-400" },
    { label: "Fair", bar: "bg-amber-400", text: "text-amber-400" },
    { label: "Good", bar: "bg-sky-400", text: "text-sky-400" },
    { label: "Strong", bar: "bg-emerald-400", text: "text-emerald-400" },
  ];
  return { score, ...levels[score] };
}

const ProfilePage = () => {
  const { updateProfile } = useAuth();
  const { user, setUser, isLoading, mySubscription } = useContext(context);
  const { id } = useParams();
  const userId = id || user?._id;

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [pendingChecked, setPendingChecked] = useState(false);

  if (user && !pendingChecked) {
    setPendingChecked(true);
    const pending = getPendingVerification(user.email);
    if (pending && !pending.dismissed && !user.isVerified) setVerifyOpen(true);
  }

  const [form, setForm] = useState(() => fromUser(user));
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const blobUrlRef = useRef(null);
  const messageTimerRef = useRef(null);

  const [syncedUser, setSyncedUser] = useState(user);
  if (user !== syncedUser) {
    setSyncedUser(user);
    setForm(fromUser(user));
    setAvatarPreview(user?.avatar || null);
  }

  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      clearTimeout(messageTimerRef.current);
    },
    []
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showMessage = (type, text, autoHide = false) => {
    clearTimeout(messageTimerRef.current);
    setMessage({ type, text });
    if (autoHide) {
      messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
    }
  };

  const clearPreviewUrl = () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = null;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please choose an image file (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      showMessage(
        "error",
        `Photo is too large. Choose an image under ${MAX_AVATAR_MB} MB.`
      );
      return;
    }

    clearPreviewUrl();
    blobUrlRef.current = URL.createObjectURL(file);
    setMessage(null);
    setAvatar(file);
    setAvatarPreview(blobUrlRef.current);
  };

  const initial = fromUser(user);
  const isDirty =
    form.name !== initial.name ||
    form.email !== initial.email ||
    form.phone !== initial.phone ||
    String(form.hourlyRate) !== String(initial.hourlyRate) ||
    form.password !== "" ||
    avatar !== null;

  const handleDiscard = () => {
    clearPreviewUrl();
    setForm(fromUser(user));
    setAvatar(null);
    setAvatarPreview(user?.avatar || null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateProfile(
        userId,
        form.name,
        form.email,
        form.phone,
        form.hourlyRate,
        form.password,
        avatar
      );
      setForm((f) => ({ ...f, password: "" }));
      setAvatar(null);
      showMessage("success", "Profile updated successfully.", true);
    } catch (error) {
      showMessage(
        "error",
        error.message || "Could not update your profile. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(String(userId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Worker";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const subView = getSubscriptionView(mySubscription);
  const strength = getPasswordStrength(form.password);

  if (isLoading || !user) {
    return (
      <LoadingState
        message="Loading profile"
        subtext="Preparing your account settings"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Account settings
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Update your personal details and keep your account secure.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          {/* SUMMARY */}
          <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] lg:sticky lg:top-8">
            {/* Banner */}
            <div className="h-20 bg-sky-500/10" />

            <div className="px-5 pb-5">
              <div className="-mt-14 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#111827] bg-slate-800">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-slate-600" />
                    )}
                  </div>

                  <label
                    htmlFor="avatar-input"
                    title="Change photo"
                    className="absolute bottom-0.5 right-0.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#111827] bg-sky-600 text-white shadow transition hover:bg-sky-500 focus-within:ring-2 focus-within:ring-sky-400"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Change profile photo</span>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="mt-3 flex max-w-full items-center gap-1.5 text-lg font-semibold text-white">
                  <span className="truncate">{form.name || "Your profile"}</span>
                  {user.isVerified && form.email === user.email && (
                    <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-sky-400" />
                  )}
                </h2>
                <p className="mt-0.5 max-w-full truncate text-sm text-slate-500">
                  {user.email}
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                  <Briefcase className="h-3 w-3" />
                  {roleLabel}
                </span>

                {avatar && (
                  <p className="mt-3 text-xs text-sky-400">
                    New photo selected. Save your changes to apply it.
                  </p>
                )}
              </div>

              <dl className="mt-5 space-y-3.5 border-t border-slate-800 pt-5 text-sm">
                <SummaryRow
                  icon={Mail}
                  label="Email"
                  value={form.email || "Not added"}
                  extra={
                    !user?.email ? null : form.email !== user.email ? (
                      <span className="mt-1 block text-xs text-slate-500">
                        Save your changes to verify the new email.
                      </span>
                    ) : user.isVerified ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVerifyOpen(true)}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-400 transition hover:text-amber-300"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Not verified. Verify now
                      </button>
                    )
                  }
                />
                <SummaryRow
                  icon={Phone}
                  label="Phone"
                  value={form.phone || "Not added"}
                />
                <SummaryRow
                  icon={DollarSign}
                  label="Hourly rate"
                  value={
                    form.hourlyRate !== ""
                      ? `$${form.hourlyRate} / hour`
                      : "Not set"
                  }
                />
                {memberSince && (
                  <SummaryRow
                    icon={CalendarDays}
                    label="Member since"
                    value={memberSince}
                  />
                )}
              </dl>

              {/* Subscription */}
              {user?.role === "manager" && (
                <div className="mt-5 border-t border-slate-800 pt-5">
                  <p className="mb-2.5 text-xs font-medium text-slate-500">
                    Subscription
                  </p>
                  <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10">
                          <Crown className="h-4.5 w-4.5 text-sky-400" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {subView.planLabel}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          subView.active
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                            : "border-rose-500/25 bg-rose-500/10 text-rose-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            subView.active ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {subView.statusLabel}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                      <p className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        {subView.limit > 0
                          ? `Up to ${subView.limit} workers`
                          : "No worker limit set"}
                      </p>
                      {subView.endsLabel && (
                        <p className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-slate-500" />
                          {subView.endsLabel === "Lifetime"
                            ? "Lifetime access"
                            : `Ends ${subView.endsLabel}`}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/manager/plans"
                      className="mt-3.5 flex h-9 w-full items-center justify-center rounded-lg bg-sky-600 text-xs font-medium text-white transition hover:bg-sky-500"
                    >
                      Manage plan
                    </Link>
                  </div>
                </div>
              )}

              {/* User ID */}
              <div className="mt-5 border-t border-slate-800 pt-5">
                <p className="text-xs text-slate-500">User ID</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate rounded-lg bg-[#0b1220] px-3 py-2 font-mono text-xs text-slate-300">
                    {userId || "N/A"}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    aria-label="Copy user ID"
                    title="Copy user ID"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]"
          >
            <FormSection
              icon={User}
              title="Personal details"
              subtitle="Your name and how we can reach you."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    id="full-name"
                    name="name"
                    label="Full name"
                    icon={User}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
                <Field
                  id="email"
                  name="email"
                  label="Email address"
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <Field
                  id="phone"
                  name="phone"
                  label="Phone number"
                  icon={Phone}
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                  autoComplete="tel"
                />
              </div>
            </FormSection>

            <FormSection
              icon={Briefcase}
              title="Work"
              subtitle="Used to work out your pay."
            >
              <div className="sm:max-w-xs">
                <Field
                  id="hourly-rate"
                  name="hourlyRate"
                  label="Hourly rate (USD per hour)"
                  icon={DollarSign}
                  inputMode="decimal"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  placeholder="25"
                />
              </div>
            </FormSection>

            <FormSection
              icon={Lock}
              title="Security"
              subtitle="Leave the password blank to keep your current one."
            >
              <div className="sm:max-w-sm">
                <Field
                  id="password"
                  name="password"
                  label="New password"
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                {strength && (
                  <div className="mt-3" aria-live="polite">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strength.bar : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1.5 text-xs ${strength.text}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Sticky action bar */}
            <div className="sticky bottom-0 space-y-3 border-t border-slate-800 bg-[#111827]/95 p-5 backdrop-blur sm:p-6">
              <FormMessage message={message} />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className="flex items-center gap-2 text-xs text-slate-500"
                  aria-live="polite"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isDirty ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  {isDirty
                    ? "You have unsaved changes."
                    : "All changes are saved."}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={!isDirty || isSubmitting}
                    className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none ${focusRing}`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Discard
                  </button>

                  <button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none ${focusRing}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <VerifyEmailModal
        isOpen={verifyOpen}
        onClose={() => {
          dismissPendingVerification();
          setVerifyOpen(false);
        }}
        email={user?.email || ""}
        onVerified={() => setUser((u) => ({ ...u, isVerified: true }))}
      />
    </div>
  );
};

function SummaryRow({ icon: Icon, label, value, extra }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0b1220]">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="truncate text-slate-200">{value}</dd>
        {extra}
      </div>
    </div>
  );
}

function FormSection({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="border-b border-slate-800 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
          <Icon className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  icon: Icon,
  mono,
  trailing,
  ...inputProps
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-200"
      >
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          required={required}
          className={`${inputClass} pl-10 ${trailing ? "pr-11" : "pr-3"} ${
            mono ? "font-mono" : ""
          }`}
          {...inputProps}
        />
        {trailing}
      </div>
    </div>
  );
}

function FormMessage({ message }) {
  if (!message) return null;

  const success = message.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
        success
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : "border-red-500/30 bg-red-500/10 text-red-200"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message.text}</p>
    </div>
  );
}

export default ProfilePage;