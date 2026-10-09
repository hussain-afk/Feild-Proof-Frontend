import { useContext, useState } from "react";
import {
  Search,
  Pencil,
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

// Edit form ki fields. Nayi field chahiye to bas yahan ek line jodo
const FORM_FIELDS = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text", placeholder: "03001234567" },
  { name: "hourlyRate", label: "Hourly rate (USD)", type: "number", placeholder: "e.g. 30" },
];

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";

// "Ali Khan" -> "AK"
const getInitials = (name) =>
  (name || "U")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

/* ------------------------------------------------------------------ */
/* Chhote components                                                    */
/* ------------------------------------------------------------------ */

// User ki photo, ya photo na ho to naam ke pehle akshar
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

// Chhota rangeen label. Role aur verified, dono isi se bante hain
function Badge({ className, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}
    >
      {children}
    </span>
  );
}

// Role aur "verified ya nahi" ke labels
function UserBadges({ user }) {
  return (
    <>
      <Badge className={ROLE_STYLE[user.role] || "border-slate-700 bg-slate-800 text-slate-400"}>
        {user.role || "user"}
      </Badge>

      {user.isVerified ? (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </Badge>
      ) : (
        <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">
          <AlertCircle className="h-3.5 w-3.5" />
          Not verified
        </Badge>
      )}
    </>
  );
}

// Photo, naam aur email ek dabbe me (edit aur delete windows me use hota hai)
function UserSummary({ user }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0b1220] p-3">
      <Avatar user={user} size="h-11 w-11" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
    </div>
  );
}

// Upar ka ginti wala dabba. Dabane par list us hisaab se filter hoti hai
function StatTile({ label, value, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
        active
          ? "border-sky-500/50 bg-sky-500/10"
          : "border-slate-800 bg-[#111827] hover:border-slate-700"
      }`}
    >
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      </div>
      <Icon className="h-5 w-5 text-slate-500" />
    </button>
  );
}

function ErrorBox({ message }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Windows ke neeche wale do buttons (Cancel aur asli kaam). Edit aur Delete dono isi ko use karte hain
function ModalActions({ onCancel, onConfirm, busy, busyText, confirmText, confirmClass }) {
  return (
    <div className="flex gap-2 border-t border-slate-800 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type={onConfirm ? "button" : "submit"}
        onClick={onConfirm}
        disabled={busy}
        className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {busyText}
          </>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );
}

/**
 * Ek user ki ek row. Ye khud kuch edit ya delete nahi karta,
 * sirf parent ko batata hai (onEdit / onDelete) ke kis user par kaam karna hai.
 */
function UserRow({ user, isSelf, onEdit, onDelete }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-6">
      {/* Photo, naam, email */}
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

      {/* Role aur verified */}
      <div className="flex flex-wrap items-center gap-2">
        <UserBadges user={user} />
      </div>

      {/* Edit aur Delete */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onEdit(user)}
          title="Edit user"
          aria-label={`Edit ${user.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-500/10 hover:text-sky-400"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(user)}
          disabled={isSelf}
          title={isSelf ? "You cannot delete your own account" : "Delete user"}
          aria-label={`Delete ${user.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Baqi tafseel, naam ke theek neeche */}
      <div className="flex w-full flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400 sm:pl-[52px]">
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-slate-500" />
          {user.phone || "No phone"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-slate-500" />
          {user.hourlyRate ?? 0} per hour
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
          Joined {formatDate(user.createdAt)}
        </span>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const AllUsers = () => {
  // allUsers = saare users ki list, currentUser = jo abhi login hai
  const { allUsers = [], setAllUsers, user: currentUser } = useContext(context);
  const { updateUserProfileByAdmin } = useAdmin();
  const { deleteUser } = useAuth();

  // Search aur filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | admin | manager | worker
  const [statusFilter, setStatusFilter] = useState("all"); // all | verified | unverified

  // Edit
  const [userToEdit, setUserToEdit] = useState(null);
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ---------- Ginti aur filter ---------- */
  const verifiedCount = allUsers.filter((user) => user.isVerified).length;
  const unverifiedCount = allUsers.length - verifiedCount;

  const countRole = (role) =>
    role === "all" ? allUsers.length : allUsers.filter((user) => user.role === role).length;

  const text = search.trim().toLowerCase();

  const visibleUsers = allUsers.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (statusFilter === "verified" && !user.isVerified) return false;
    if (statusFilter === "unverified" && user.isVerified) return false;
    return `${user.name} ${user.email}`.toLowerCase().includes(text);
  });

  // Tile dabane par filter lag jata hai, dobara dabane par hat jata hai
  const toggleStatus = (status) => setStatusFilter(statusFilter === status ? "all" : status);

  /* ---------- Edit ---------- */
  const openEdit = (user) => {
    setEditError("");
    setUserToEdit(user);
    // Form me user ki maujooda values daal do, taake kuch khali na ho jaye
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      hourlyRate: user.hourlyRate ?? "",
      role: user.role || "worker",
    });
  };

  const closeEdit = () => setUserToEdit(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError("");

    try {
      const updated = await updateUserProfileByAdmin(
        userToEdit._id, // user ki id
        form.name,
        form.email,
        form.phone,
        form.hourlyRate,
        form.role
      );

      // Screen par list foran update karo
      setAllUsers((users) =>
        users.map((user) => (user._id === userToEdit._id ? { ...user, ...updated } : user))
      );
      closeEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Could not update this user.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- Delete ---------- */
  // Pehle sirf confirm window khulti hai, abhi kuch delete nahi hota
  const askToDelete = (user) => {
    setDeleteError("");
    setUserToDelete(user);
  };

  const closeDelete = () => setUserToDelete(null);

  // "Yes, delete" dabane par asli delete
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteUser(userToDelete._id); // user ki id

      // Screen ki list se bhi hata do
      setAllUsers((users) => users.filter((user) => user._id !== userToDelete._id));
      closeDelete();
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || "Could not delete this user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            See who is registered, who has verified their email, and manage their accounts.
          </p>
        </header>

        {/* ===== Ginti ke dabbe (dabane par filter lagta hai) ===== */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile
            label="All users"
            value={allUsers.length}
            icon={Users}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatTile
            label="Verified"
            value={verifiedCount}
            icon={BadgeCheck}
            active={statusFilter === "verified"}
            onClick={() => toggleStatus("verified")}
          />
          <StatTile
            label="Not verified"
            value={unverifiedCount}
            icon={AlertCircle}
            active={statusFilter === "unverified"}
            onClick={() => toggleStatus("unverified")}
          />
        </div>

        {/* ===== Search aur role ===== */}
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
                onClick={() => setRoleFilter(role)}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                  roleFilter === role ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {role}
                <span className="text-slate-500">{countRole(role)}</span>
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
                  onDelete={askToDelete}
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

      {/* ================= Edit window ================= */}
      <Modal isOpen={Boolean(userToEdit)} onClose={closeEdit} title="Update user">
        {userToEdit && (
          <form onSubmit={handleSave} className="space-y-4">
            <UserSummary user={userToEdit} />

            <div className="flex flex-wrap items-center gap-2">
              <UserBadges user={userToEdit} />
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

            {editError && <ErrorBox message={editError} />}

            <ModalActions
              onCancel={closeEdit}
              busy={isSaving}
              busyText="Saving..."
              confirmText="Save changes"
              confirmClass="bg-sky-600 hover:bg-sky-500"
            />
          </form>
        )}
      </Modal>

      {/* ================= Delete confirm window ================= */}
      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={isDeleting ? () => {} : closeDelete}
        title="Delete user"
      >
        {userToDelete && (
          <div className="space-y-4">
            <UserSummary user={userToDelete} />

            <p className="text-sm leading-relaxed text-slate-300">
              Are you sure you want to delete this user? This cannot be undone.
            </p>

            {deleteError && <ErrorBox message={deleteError} />}

            <ModalActions
              onCancel={closeDelete}
              onConfirm={handleDelete}
              busy={isDeleting}
              busyText="Deleting..."
              confirmText="Yes, delete"
              confirmClass="bg-red-600 hover:bg-red-500"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;