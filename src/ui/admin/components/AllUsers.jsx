import { useContext, useState } from "react";
import {
  Search,
  Pencil,
  Ban,
  Trash2,
  Users,
  Loader2,
  AlertCircle,
  BadgeCheck,
  Phone,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { context } from "../../../context/context.jsx";
import Modal from "../../Modal.jsx";
import LoadingState from "../../LoadingState.jsx";
import useAdmin from "../../../hooks/useAdmin.jsx";
import useAuth from "../../../hooks/useAuth.jsx";

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const ROLES = ["admin", "manager", "worker"];

const ROLE_STYLE = {
  admin: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  manager: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  worker: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

// The three number boxes at the top (click one to filter the list)
const TILES = [
  { id: "all", label: "All users", icon: Users },
  { id: "verified", label: "Verified", icon: BadgeCheck },
  { id: "unverified", label: "Not verified", icon: AlertCircle },
];

// Fields of the edit form. To add a field, add one line here
const FORM_FIELDS = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text", placeholder: "03001234567" },
  { name: "hourlyRate", label: "Hourly rate (USD)", type: "number", placeholder: "e.g. 30" },
];

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const badgeClass =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";

// "Ali Khan" -> "AK"
const getInitials = (name) =>
  (name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

// One filter for the whole list: "all", a role, "verified" or "unverified"
const matchesFilter = (user, filter) => {
  if (filter === "all") return true;
  if (filter === "verified") return Boolean(user.isVerified);
  if (filter === "unverified") return !user.isVerified;
  return user.role === filter;
};

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

// The photo of the user, or the first letters of the name
function Avatar({ user, size = "h-10 w-10" }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${size} shrink-0 rounded-full border border-slate-700 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300`}
    >
      {getInitials(user.name)}
    </div>
  );
}

// Role label, verified label, and a red "Banned" label when the user is banned
function UserBadges({ user }) {
  return (
    <>
      <span className={`${badgeClass} ${ROLE_STYLE[user.role] || "border-slate-700 bg-slate-800 text-slate-400"}`}>
        {user.role || "user"}
      </span>

      {user.isVerified ? (
        <span className={`${badgeClass} border-emerald-500/20 bg-emerald-500/10 text-emerald-400`}>
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </span>
      ) : (
        <span className={`${badgeClass} border-amber-500/20 bg-amber-500/10 text-amber-400`}>
          <AlertCircle className="h-3.5 w-3.5" />
          Not verified
        </span>
      )}

      {user.isBanned && (
        <span className={`${badgeClass} border-red-500/30 bg-red-500/10 text-red-400`}>
          <Ban className="h-3.5 w-3.5" />
          Banned
        </span>
      )}
    </>
  );
}

// A small round button with an icon (Edit, Ban, Delete)
function IconButton({ icon: Icon, label, onClick, disabled, hover }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 ${hover}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

// One row of the list. It does nothing by itself: it only tells the page which user was clicked.
function UserRow({ user, isSelf, onEdit, onBan, onDelete }) {
  const details = [
    [Phone, user.phone || "No phone"],
    [DollarSign, `${user.hourlyRate ?? 0} per hour`],
    [CalendarDays, `Joined ${formatDate(user.createdAt)}`],
  ];

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-6">
      {/* Photo, name, email */}
      <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {user.name || "Unknown user"}
            {isSelf && <span className="ml-2 text-xs font-normal text-slate-500">(you)</span>}
          </p>
          <p className="truncate text-xs text-slate-500">{user.email || "No email"}</p>
        </div>
      </div>

      {/* Role, verified and banned */}
      <div className="flex flex-wrap items-center gap-2">
        <UserBadges user={user} />
      </div>

      {/* Edit, Ban and Delete */}
      <div className="flex gap-1">
        <IconButton
          icon={Pencil}
          label="Edit user"
          onClick={() => onEdit(user)}
          hover="hover:bg-sky-500/10 hover:text-sky-400"
        />
        <IconButton
          icon={Ban}
          label={isSelf ? "You cannot ban your own account" : "Ban user"}
          onClick={() => onBan(user)}
          disabled={isSelf}
          hover="hover:bg-amber-500/10 hover:text-amber-400"
        />
        <IconButton
          icon={Trash2}
          label={isSelf ? "You cannot delete your own account" : "Delete user"}
          onClick={() => onDelete(user)}
          disabled={isSelf}
          hover="hover:bg-red-500/10 hover:text-red-400"
        />
      </div>

      {/* More details, right under the name */}
      <div className="flex w-full flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400 sm:pl-[52px]">
        {details.map(([Icon, text]) => (
          <span key={text} className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-slate-500" />
            {text}
          </span>
        ))}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const AllUsers = () => {
  // allUsers = the list of all users, currentUser = the person who is logged in
  const { allUsers = [], setAllUsers, user: currentUser, isLoading } = useContext(context);
  const { updateUserProfileByAdmin, handleBanUser } = useAdmin();
  const { deleteUser } = useAuth();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // The open window: { type: "edit" | "delete", user }, or null when no window is open
  const [action, setAction] = useState(null);
  const [form, setForm] = useState({}); // values of the edit form
  const [busy, setBusy] = useState(false); // saving or deleting
  const [error, setError] = useState("");

  const isEdit = action?.type === "edit";

  /* ---------- List ---------- */
  const text = search.trim().toLowerCase();

  const visibleUsers = allUsers.filter(
    (user) => matchesFilter(user, filter) && `${user.name} ${user.email}`.toLowerCase().includes(text)
  );

  const countFor = (key) => allUsers.filter((user) => matchesFilter(user, key)).length;

  /* ---------- Open and close the window ---------- */
  const openEdit = (user) => {
    setError("");
    setAction({ type: "edit", user });
    // Start the form with the current values, so nothing becomes empty by mistake
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      hourlyRate: user.hourlyRate ?? "",
      role: user.role || "worker",
    });
  };

  const openDelete = (user) => {
    setError("");
    setAction({ type: "delete", user });
  };

  const closeAction = () => setAction(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ---------- Save and Delete (they share the same steps) ---------- */
  // Shows "busy", runs the task, closes the window, or shows the error
  const run = async (task, fallbackMessage) => {
    setBusy(true);
    setError("");

    try {
      await task();
      closeAction();
    } catch (err) {
      setError(err.response?.data?.message || err.message || fallbackMessage);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    run(async () => {
      const updated = await updateUserProfileByAdmin(
        action.user._id,
        form.name,
        form.email,
        form.phone,
        form.hourlyRate,
        form.role
      );

      // Update the list on the screen right away
      setAllUsers((users) =>
        users.map((user) => (user._id === action.user._id ? { ...user, ...updated } : user))
      );
    }, "Could not update this user.");
  };

  const handleDelete = (e) => {
    e.preventDefault();

    run(async () => {
      await deleteUser(action.user._id);

      // Remove the user from the list on the screen too
      setAllUsers((users) => users.filter((user) => user._id !== action.user._id));
    }, "Could not delete this user.");
  };

  /* ---------- Ban ---------- */
  // TODO: write your ban logic here. `user` is the user whose Ban button was clicked.
  // (The button is already on every row, and it is disabled for your own account.)
  const handleBan = async (user) => {
    console.log("Ban clicked for:", user._id);
    run(async () => {
      const updated = await handleBanUser(user._id);

      // Update the list on the screen right away
      setAllUsers((users) =>
        users.map((u) =>
          u._id === user._id
            ? { ...u, isBanned: !u.isBanned }
            : u
        )
      );
    }, "Could not ban this user.");
  };

  if (isLoading) {
    return (
      <LoadingState
        message="Loading users"
        subtext="Syncing your workspace"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            See who is registered, who has verified their email, and manage their accounts.
          </p>
        </header>

        {/* ===== Number boxes (click one to filter) ===== */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TILES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${filter === id
                ? "border-sky-500/50 bg-sky-500/10"
                : "border-slate-800 bg-[#111827] hover:border-slate-700"
                }`}
            >
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{countFor(id)}</p>
              </div>
              <Icon className="h-5 w-5 text-slate-500" />
            </button>
          ))}
        </div>

        {/* ===== Search and role ===== */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search users"
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="flex overflow-x-auto rounded-lg border border-slate-800 bg-[#0f1624] p-1">
            {["all", ...ROLES].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFilter(role)}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${filter === role ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {role}
                <span className="text-slate-500">{countFor(role)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== List ===== */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111827]">
          {visibleUsers.length > 0 ? (
            <ul className="divide-y divide-slate-800/70">
              {visibleUsers.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  isSelf={user._id === currentUser?._id}
                  onEdit={openEdit}
                  onBan={handleBan}
                  onDelete={openDelete}
                />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <Users className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm font-medium text-slate-200">No users found</p>
              <p className="mt-1 text-xs text-slate-500">Try a different search or filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= One window for both Edit and Delete ================= */}
      <Modal
        isOpen={Boolean(action)}
        onClose={busy ? () => { } : closeAction}
        title={isEdit ? "Update user" : "Delete user"}
      >
        {action && (
          <form onSubmit={isEdit ? handleSave : handleDelete} className="space-y-4">
            {/* Who we are working on */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0b1220] p-3">
              <Avatar user={action.user} size="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{action.user.name}</p>
                <p className="truncate text-xs text-slate-500">{action.user.email}</p>
              </div>
            </div>

            {isEdit ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <UserBadges user={action.user} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {FORM_FIELDS.map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-300">{field.label}</span>
                      <input
                        name={field.name}
                        type={field.type}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        min={field.type === "number" ? 0 : undefined}
                        className={inputClass}
                      />
                    </label>
                  ))}

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-300">Role</span>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer capitalize`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-slate-300">
                Are you sure you want to delete this user? This cannot be undone.
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Cancel and the main button */}
            <div className="flex gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={closeAction}
                disabled={busy}
                className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isEdit ? "bg-sky-600 hover:bg-sky-500" : "bg-red-600 hover:bg-red-500"
                  }`}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Saving..." : "Deleting..."}
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Yes, delete"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;