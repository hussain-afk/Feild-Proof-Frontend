import { useContext, useState } from "react";
import { Search, Pencil, Trash2, Users, Loader2, AlertCircle } from "lucide-react";
import { context } from "../../../context/context.jsx";
import Modal from "../../Modal.jsx";
import useAdmin from "../../../hooks/useAdmin.jsx";
import useAuth from "../../../hooks/useAuth.jsx";

/* ------------------------------------------------------------------ */
/* Chhoti cheezein (styles aur helper functions)                        */
/* ------------------------------------------------------------------ */

const FILTERS = ["all", "admin", "manager", "worker"];

const ROLE_STYLE = {
  admin: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  manager: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  worker: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

// Table ke columns ki chaudai. Header aur har row me wahi use hoti hai, taake columns seedhe rahein
const GRID = "md:grid-cols-[2fr_2fr_1fr_1fr_1fr_88px]";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-800 bg-[#0b1220] px-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";

// "Ali Khan" -> "AK"
const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("")
    : "U";

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

// Role ka rangeen label (admin / manager / worker)
function RoleBadge({ role }) {
  const style = ROLE_STYLE[role?.toLowerCase()] || "border-slate-700 bg-slate-800 text-slate-400";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {role || "user"}
    </span>
  );
}

// Label ke saath input
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

/**
 * Ek user ki ek row.
 *
 * Props (parent se aane wali cheezein):
 *   user     -> is row ke user ka poora data (isme user._id us user ki id hai)
 *   isSelf   -> true ho to ye wahi user hai jo abhi login hai (usko delete nahi karne dete)
 *   onEdit   -> Edit button dabane par ye function chalta hai
 *   onDelete -> Delete button dabane par ye function chalta hai
 *
 * Ye component khud kuch delete nahi karta. Wo sirf parent ko batata hai
 * "is user ko delete karna hai", aur parent (AllUsers) asli kaam karta hai.
 */
function UserRow({ user, isSelf, onEdit, onDelete }) {
  return (
    <div
      className={`relative grid gap-3 px-4 py-4 transition-colors hover:bg-white/[0.02] md:items-center md:px-6 ${GRID}`}
    >
      {/* Naam aur photo */}
      <div className="flex min-w-0 items-center gap-3 pr-20 md:pr-0">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{user.name || "Unknown user"}</p>
          <p className="truncate text-xs text-slate-500 md:hidden">{user.email}</p>
        </div>
      </div>

      {/* Email aur phone (sirf bari screen par) */}
      <div className="hidden min-w-0 md:block">
        <p className="truncate text-sm text-slate-300">{user.email || "No email"}</p>
        <p className="mt-0.5 text-xs text-slate-500">{user.phone || "No phone"}</p>
      </div>

      {/* Role, rate aur joined date */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:contents">
        <div>
          <RoleBadge role={user.role} />
        </div>
        <p className="text-slate-300">
          ${user.hourlyRate ?? 0}
          <span className="text-xs text-slate-500">/hr</span>
        </p>
        <p className="text-xs text-slate-400 md:text-sm">{formatDate(user.createdAt)}</p>
      </div>

      {/* Edit aur Delete buttons */}
      <div className="absolute right-3 top-4 flex gap-1 md:static md:justify-end">
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const AllUsers = () => {
  // allUsers = saare users ki list. currentUser = jo abhi login hai
  const { allUsers = [], setAllUsers, user: currentUser } = useContext(context);
  const { updateUserProfileByAdmin } = useAdmin();
  const { deleteUser } = useAuth();

  // ----- Search aur filter -----
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // ----- Edit -----
  const [userToEdit, setUserToEdit] = useState(null); // jis user ko edit kar rahe hain
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // ----- Delete -----
  const [userToDelete, setUserToDelete] = useState(null); // jis user ko delete karna hai
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ---------- Search aur filter lagana ---------- */
  const text = search.trim().toLowerCase();

  const visibleUsers = allUsers.filter((user) => {
    const roleMatches = roleFilter === "all" || user.role === roleFilter;
    const textMatches = `${user.name} ${user.email}`.toLowerCase().includes(text);
    return roleMatches && textMatches;
  });

  const countFor = (role) =>
    role === "all" ? allUsers.length : allUsers.filter((user) => user.role === role).length;

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
        userToEdit._id, // <-- user ki id
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
  // Step 1: Delete icon dabaya -> confirm window kholo (abhi kuch delete nahi hua)
  const askToDelete = (user) => {
    setDeleteError("");
    setUserToDelete(user);
  };

  const closeDelete = () => setUserToDelete(null);

  // Step 2: "Yes, delete" dabaya -> asli delete
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      // userToDelete poora user hai. Uski id "_id" me hoti hai.
      await deleteUser(userToDelete._id);

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
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* ================= Header ================= */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            View and manage everyone registered in the system.
          </p>
        </header>

        {/* ================= Search aur role filter ================= */}
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
            {FILTERS.map((role) => {
              const active = roleFilter === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                    active ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {role}
                  <span className={active ? "text-slate-300" : "text-slate-500"}>{countFor(role)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= Users ki list ================= */}
        <div className="rounded-xl border border-slate-800 bg-[#111827]">
          {/* Column ke naam (sirf bari screen par) */}
          <div
            className={`hidden gap-3 rounded-t-xl border-b border-slate-800 bg-[#0e1522] px-6 py-3 text-xs font-medium text-slate-500 md:grid ${GRID}`}
          >
            <span>User</span>
            <span>Contact</span>
            <span>Role</span>
            <span>Hourly rate</span>
            <span>Joined</span>
            <span />
          </div>

          {visibleUsers.length > 0 ? (
            <div className="divide-y divide-slate-800/70">
              {/* map = list ke har user ke liye ek UserRow banao.
                  Yahan "user" ek user ka data hai, aur user._id uski id */}
              {visibleUsers.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  isSelf={user._id === currentUser?._id}
                  onEdit={openEdit}
                  onDelete={askToDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-200">No users found</p>
              <p className="mt-1 text-xs text-slate-500">Try a different search or role filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= Edit window ================= */}
      <Modal isOpen={Boolean(userToEdit)} onClose={closeEdit} title="Update user">
        {userToEdit && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Kis user ko edit kar rahe hain */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0b1220] p-3">
              <Avatar user={userToEdit} size="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{userToEdit.name}</p>
                <p className="truncate text-xs text-slate-500">Joined {formatDate(userToEdit.createdAt)}</p>
              </div>
              <RoleBadge role={userToEdit.role} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Email">
                <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Phone">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                  className={inputClass}
                />
              </Field>

              <Field label="Hourly rate (USD)">
                <input
                  name="hourlyRate"
                  type="number"
                  min="0"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  placeholder="e.g. 30"
                  className={inputClass}
                />
              </Field>

              <Field label="Role">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="worker">Worker</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </div>

            {editError && <ErrorBox message={editError} />}

            <div className="flex gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={closeEdit}
                disabled={isSaving}
                className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
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
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0b1220] p-3">
              <Avatar user={userToDelete} size="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{userToDelete.name}</p>
                <p className="truncate text-xs text-slate-500">{userToDelete.email}</p>
              </div>
              <RoleBadge role={userToDelete.role} />
            </div>

            <p className="text-sm leading-relaxed text-slate-300">
              Are you sure you want to delete this user? This cannot be undone.
            </p>

            {deleteError && <ErrorBox message={deleteError} />}

            <div className="flex gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={closeDelete}
                disabled={isDeleting}
                className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, delete"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Laal error ka dabba
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

export default AllUsers;