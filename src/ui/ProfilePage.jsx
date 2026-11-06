
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { context } from "../context/context.jsx";
import useAuth from "../hooks/useAuth.jsx";
import VerifyEmailModal from "./VerifyEmailModal.jsx";
import LoadingState from "./LoadingState.jsx";
import { dismissPendingVerification } from "../services/verification.storage.js";

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
  Briefcase,
  Users,
  Sparkles,
  Settings,
  ShieldCheck,
  ImagePlus,
  ArrowUpRight,
  CreditCard,
  Clock3,
  Fingerprint,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const MAX_AVATAR_MB = 5;

const inputClass =
  "w-full h-12 rounded-xl bg-[#0b1220] border border-slate-800/90 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 hover:border-slate-700 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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
    endsAt &&
    sub.plan !== "free" &&
    endsAt.getTime() < Date.now();

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
      : String(sub.plan).charAt(0).toUpperCase() +
        String(sub.plan).slice(1);

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

function getPasswordStrength(password) {
  if (!password) return null;

  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    {
      label: "Too weak",
      color: "bg-rose-400",
      text: "text-rose-400",
      width: "w-1/4",
    },
    {
      label: "Weak",
      color: "bg-rose-400",
      text: "text-rose-400",
      width: "w-1/4",
    },
    {
      label: "Fair",
      color: "bg-amber-400",
      text: "text-amber-400",
      width: "w-2/4",
    },
    {
      label: "Good",
      color: "bg-sky-400",
      text: "text-sky-400",
      width: "w-3/4",
    },
    {
      label: "Strong",
      color: "bg-emerald-400",
      text: "text-emerald-400",
      width: "w-full",
    },
  ];

  return {
    score,
    ...levels[score],
  };
}

/* ------------------------------------------------------------------ */
/* Reusable UI Components                                               */
/* ------------------------------------------------------------------ */

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  badge,
}) {
  return (
    <div className="mb-6 flex items-start gap-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/15 bg-sky-500/10">
        <Icon className="h-5 w-5 text-sky-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-white">
            {title}
          </h3>

          {badge && (
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-400">
              {badge}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
}) {
  return (
    <section className="border-b border-slate-800/80 p-5 sm:p-7">
      <SectionHeading
        icon={Icon}
        title={title}
        subtitle={subtitle}
        badge={badge}
      />

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
  trailing,
  ...inputProps
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold text-slate-300"
      >
        {label}

        {required && (
          <span className="ml-1 text-rose-400">*</span>
        )}
      </label>

      {hint && (
        <p className="mb-2 text-xs text-slate-500">
          {hint}
        </p>
      )}

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors" />

        <input
          id={id}
          required={required}
          className={`${inputClass} pl-10 ${
            trailing ? "pr-12" : "pr-3.5"
          }`}
          {...inputProps}
        />

        {trailing}
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  extra,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#0b1220]">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </dt>

        <dd className="mt-1 break-words text-sm font-medium text-slate-200">
          {value}
        </dd>

        {extra}
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
      className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
        success
          ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300"
          : "border-rose-500/20 bg-rose-500/[0.07] text-rose-300"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />

      <p className="leading-relaxed">
        {message.text}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subscription Card                                                    */
/* ------------------------------------------------------------------ */

function SubscriptionCard({ subscription }) {
  const sub = getSubscriptionView(subscription);

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-500/[0.07] blur-3xl" />

      <div className="relative p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Your subscription
          </span>

          <CreditCard className="h-4 w-4 text-slate-500" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10">
              <Crown className="h-5 w-5 text-amber-400" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">
                {sub.planLabel}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Current plan
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
              sub.active
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
            }`}
          >
            {sub.statusLabel}
          </span>
        </div>

        <div className="my-4 h-px bg-slate-800" />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Worker limit
            </span>

            <span className="font-medium text-slate-300">
              {sub.limit > 0
                ? `${sub.limit} workers`
                : "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              Validity
            </span>

            <span className="font-medium text-slate-300">
              {sub.endsLabel || "Not available"}
            </span>
          </div>
        </div>

        <Link
          to="/manager/plans"
          className={`mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 text-xs font-semibold text-sky-400 transition hover:border-sky-400/40 hover:bg-sky-500/15 ${focusRing}`}
        >
          Manage subscription
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile Page                                                         */
/* ------------------------------------------------------------------ */

const ProfilePage = () => {
  const { updateProfile } = useAuth();

  const {
    user,
    setUser,
    isLoading,
    mySubscription,
  } = useContext(context);

  const { id } = useParams();
  const userId = id || user?._id;

  const [verifyOpen, setVerifyOpen] = useState(false);

  const [form, setForm] = useState(() => fromUser(user));
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || null
  );

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const blobUrlRef = useRef(null);
  const messageTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

  /* Sync profile data when context user changes */
  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(fromUser(user));
    setAvatarPreview(user.avatar || null);
    setAvatar(null);
  }, [user]);

  /* Cleanup timers and preview URLs */
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      clearTimeout(messageTimerRef.current);
      clearTimeout(copyTimerRef.current);
    };
  }, []);

  const clearPreviewUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    blobUrlRef.current = null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showMessage = (type, text, autoHide = false) => {
    clearTimeout(messageTimerRef.current);

    setMessage({ type, text });

    if (autoHide) {
      messageTimerRef.current = setTimeout(() => {
        setMessage(null);
      }, 3500);
    }
  };

  /* Avatar upload */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage(
        "error",
        "Please choose an image file (JPG, PNG or WEBP)."
      );
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

    const previewUrl = URL.createObjectURL(file);

    blobUrlRef.current = previewUrl;

    setMessage(null);
    setAvatar(file);
    setAvatarPreview(previewUrl);
  };

  /* Detect unsaved changes */
  const initial = fromUser(user);

  const isDirty =
    form.name !== initial.name ||
    form.email !== initial.email ||
    form.phone !== initial.phone ||
    String(form.hourlyRate) !== String(initial.hourlyRate) ||
    form.password !== "" ||
    avatar !== null;

  /* Discard changes */
  const handleDiscard = () => {
    clearPreviewUrl();

    setForm(fromUser(user));
    setAvatar(null);
    setAvatarPreview(user?.avatar || null);
    setShowPassword(false);
    setMessage(null);
  };

  /* Save profile */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isDirty || isSubmitting) return;

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

      clearPreviewUrl();

      setForm((prev) => ({
        ...prev,
        password: "",
      }));

      setAvatar(null);
      setShowPassword(false);

      showMessage(
        "success",
        "Your profile has been updated successfully.",
        true
      );
    } catch (error) {
      showMessage(
        "error",
        error.message || "Could not update your profile. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Copy user ID */
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(String(userId));

      setCopied(true);

      clearTimeout(copyTimerRef.current);

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      showMessage(
        "error",
        "Unable to copy ID. Please copy it manually."
      );
    }
  };

  /* Derived values */
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Worker";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

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
    <div className="min-h-screen bg-[#080d17] text-slate-100">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-sky-500/[0.035] blur-[120px]" />
        <div className="absolute -right-40 top-80 h-96 w-96 rounded-full bg-indigo-500/[0.035] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Page heading */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/[0.07] px-3 py-1.5">
              <Settings className="h-3.5 w-3.5 text-sky-400" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-400">
                Account management
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Account settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              Manage your personal information, update your profile
              and keep your account secure.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-slate-800 bg-[#111827]/80 px-3.5 py-2.5 sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />

            <span className="text-xs font-medium text-slate-300">
              Account settings
            </span>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[350px_minmax(0,1fr)]">
          {/* -------------------------------------------------------- */}
          {/* LEFT PROFILE SIDEBAR                                     */}
          {/* -------------------------------------------------------- */}

          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-[#111827] shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)]">
              {/* Profile banner */}
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-sky-600/30 via-blue-900/20 to-indigo-900/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.18),transparent_45%)]" />

                <div className="absolute -right-8 -top-14 h-48 w-48 rounded-full border border-white/[0.06]" />

                <div className="absolute -right-2 -top-8 h-36 w-36 rounded-full border border-white/[0.06]" />

                <div className="absolute bottom-4 left-5 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-sky-300" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">
                    Your workspace identity
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="-mt-12 flex items-end justify-between">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-[4px] border-[#111827] bg-slate-800 shadow-xl">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-slate-500" />
                      )}
                    </div>

                    <label
                      htmlFor="avatar-input"
                      title="Change profile photo"
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-[3px] border-[#111827] bg-sky-600 text-white shadow-lg transition hover:bg-sky-500"
                    >
                      <Camera className="h-4 w-4" />

                      <span className="sr-only">
                        Change profile photo
                      </span>

                      <input
                        id="avatar-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {user.isVerified && (
                    <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />

                      <span className="text-[10px] font-semibold text-emerald-400">
                        Verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Name and role */}
                <div className="mt-4">
                  <h2 className="break-words text-xl font-bold tracking-tight text-white">
                    {form.name || "Your profile"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {user.email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-400">
                      <Briefcase className="h-3.5 w-3.5" />
                      {roleLabel}
                    </span>

                    {memberSince && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {memberSince}
                      </span>
                    )}
                  </div>

                  {avatar && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/[0.07] p-3">
                      <ImagePlus className="h-4 w-4 shrink-0 text-sky-400" />

                      <p className="text-xs leading-relaxed text-sky-300">
                        New photo selected. Save changes to apply it.
                      </p>
                    </div>
                  )}
                </div>

                {/* Account information */}
                <div className="mt-6 border-t border-slate-800 pt-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Account information
                    </p>

                    <Fingerprint className="h-4 w-4 text-slate-600" />
                  </div>

                  <dl className="space-y-4">
                    <SummaryRow
                      icon={Mail}
                      label="Email address"
                      value={form.email || "Not added"}
                      extra={
                        !user?.email ? null : form.email !== user.email ? (
                          <span className="mt-1 block text-xs text-amber-400">
                            Save changes to update your email.
                          </span>
                        ) : user.isVerified ? (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Email verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVerifyOpen(true)}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 transition hover:text-amber-300"
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            Verify your email
                          </button>
                        )
                      }
                    />

                    <SummaryRow
                      icon={Phone}
                      label="Phone number"
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
                  </dl>
                </div>

                {/* Subscription */}
                {user?.role === "manager" && (
                  <SubscriptionCard subscription={mySubscription} />
                )}

                {/* User ID */}
                <div className="mt-6 border-t border-slate-800 pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Unique account ID
                    </p>

                    <Fingerprint className="h-4 w-4 text-slate-600" />
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0b1220] p-2">
                    <p className="min-w-0 flex-1 truncate px-1 font-mono text-[11px] text-slate-400">
                      {userId || "N/A"}
                    </p>

                    <button
                      type="button"
                      onClick={handleCopyId}
                      aria-label="Copy user ID"
                      title="Copy user ID"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-400"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {copied && (
                    <p className="mt-2 text-right text-[10px] font-medium text-emerald-400">
                      ID copied successfully
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security information card */}
            <div className="rounded-2xl border border-slate-800/90 bg-[#111827] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Keep your account secure
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Use a strong password and keep your email address up to date.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* -------------------------------------------------------- */}
          {/* RIGHT SETTINGS FORM                                      */}
          {/* -------------------------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            className="min-w-0 overflow-hidden rounded-2xl border border-slate-800/90 bg-[#111827] shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)]"
          >
            {/* Form top header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-5 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    Profile information
                  </h2>

                  <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    Settings
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Edit your account details below.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0b1220] px-3 py-2">
                <Clock3 className="h-3.5 w-3.5 text-slate-500" />

                <span className="text-[10px] font-medium text-slate-400">
                  Changes are not automatic
                </span>
              </div>
            </div>

            {/* Personal details */}
            <FormSection
              icon={User}
              title="Personal details"
              subtitle="Update your name and contact information."
              badge="01"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    id="full-name"
                    name="name"
                    label="Full name"
                    icon={User}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
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
                  placeholder="Enter phone number"
                  autoComplete="tel"
                />
              </div>
            </FormSection>

            {/* Work */}
            <FormSection
              icon={Briefcase}
              title="Work information"
              subtitle="Manage your hourly rate and work-related details."
              badge="02"
            >
              <div className="sm:max-w-sm">
                <Field
                  id="hourly-rate"
                  name="hourlyRate"
                  label="Hourly rate (USD)"
                  icon={DollarSign}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                />

                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  This rate is used for your work-related pay calculations.
                </p>
              </div>
            </FormSection>

            {/* Security */}
            <FormSection
              icon={Lock}
              title="Security settings"
              subtitle="Change your password to keep your account protected."
              badge="03"
            >
              <div className="sm:max-w-md">
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
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                {!form.password && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Leave this field empty if you do not want to change your password.
                  </p>
                )}

                {strength && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-[#0b1220] p-3.5">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        Password strength
                      </span>

                      <span className={`text-xs font-semibold ${strength.text}`}>
                        {strength.label}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            i <= strength.score
                              ? strength.color
                              : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                      Use at least 8 characters, uppercase and lowercase letters,
                      numbers and special characters.
                    </p>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Save changes bar */}
            <div className="sticky bottom-0 z-10 border-t border-slate-800 bg-[#111827]/95 p-4 backdrop-blur-xl sm:p-6">
              <FormMessage message={message} />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full ${
                      isDirty ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  >
                    {isDirty && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-40" />
                    )}
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      {isDirty
                        ? "Unsaved changes"
                        : "Everything is up to date"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {isDirty
                        ? "Save your changes before leaving."
                        : "Your profile information is saved."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={!isDirty || isSubmitting}
                    className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none ${focusRing}`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Discard
                  </button>

                  <button
                    type="submit"
                    disabled={!isDirty || isSubmitting}
                    className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 text-xs font-semibold text-white shadow-lg shadow-sky-950/30 transition hover:from-sky-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:flex-none ${focusRing}`}
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

      {/* Email verification */}
      <VerifyEmailModal
        isOpen={verifyOpen}
        onClose={() => {
          dismissPendingVerification();
          setVerifyOpen(false);
        }}
        email={user?.email || ""}
        onVerified={() => {
          setUser((prev) => ({
            ...prev,
            isVerified: true,
          }));
        }}
      />
    </div>
  );
};

export default ProfilePage;
