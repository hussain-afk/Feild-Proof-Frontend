import { useContext, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users, UserPlus, Ban, Clock } from "lucide-react";
import { context } from "../../../context/context.jsx";

// Setup: npm i recharts
// Where to put this file: src/ui/admin/components/DashboardCharts.jsx
// How to use it (in your admin Home page):  <DashboardCharts />

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

const RANGES = [7, 14, 30]; // the "last N days" buttons

// Colours of the charts (they match your dark theme)
const ROLE_META = {
  admin: { label: "Admin", color: "#a855f7" },
  manager: { label: "Manager", color: "#38bdf8" },
  worker: { label: "Worker", color: "#34d399" },
  pending_manager: { label: "Pending manager", color: "#fbbf24" },
};

const TYPE_META = {
  create: { label: "Created", color: "#34d399" },
  update: { label: "Updated", color: "#fbbf24" },
  delete: { label: "Deleted", color: "#fb7185" },
  check: { label: "Check-ins", color: "#38bdf8" },
  other: { label: "Other", color: "#64748b" },
};

const AXIS_TICK = { fill: "#64748b", fontSize: 12 };

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#0b1220",
    border: "1px solid #1e293b",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 12,
  },
  labelStyle: { color: "#94a3b8" },
  itemStyle: { color: "#e2e8f0" },
};

/* ------------------------------------------------------------------ */
/* Helpers (plain JavaScript, no React)                                 */
/* ------------------------------------------------------------------ */

// Same idea as your activity list: guess the type of an activity from its message
const getType = (message = "") => {
  const text = message.toLowerCase();
  if (/delet|remov/.test(text)) return "delete";
  if (/creat|add|assign|regist/.test(text)) return "create";
  if (/updat|edit|chang/.test(text)) return "update";
  if (/check/.test(text)) return "check";
  return "other";
};

// The last `count` days as dates, oldest first (the last one is today)
const lastDays = (count) =>
  Array.from({ length: count }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (count - 1 - index));
    return day;
  });

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

// How many items were created on each of the given days
// Result: [{ label: "12 Mar", value: 3 }, ...]
const countByDay = (items, days) => {
  const counts = {};
  items.forEach((item) => {
    if (!item.createdAt) return;
    const key = dayKey(new Date(item.createdAt));
    counts[key] = (counts[key] || 0) + 1;
  });

  return days.map((day) => ({
    label: day.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
    value: counts[dayKey(day)] || 0,
  }));
};

// Count the items of each kind. Result: [{ name, value, color }] (kinds with 0 are left out)
const countBy = (items, getKey, meta) => {
  const counts = {};
  items.forEach((item) => {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.keys(meta)
    .filter((key) => counts[key])
    .map((key) => ({ name: meta[key].label, value: counts[key], color: meta[key].color }));
};

const sum = (list) => list.reduce((total, item) => total + item.value, 0);

/* ------------------------------------------------------------------ */
/* Small components                                                     */
/* ------------------------------------------------------------------ */

// A white-ish box with a title that holds one chart
function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-800 bg-[#111827] p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Shown when a chart has no data yet
function NoData() {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-slate-600">
      No data yet
    </div>
  );
}

// A small number box
function MiniStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#111827] p-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-lg font-semibold leading-none text-white">{value}</p>
      </div>
    </div>
  );
}

// A round chart with the total in the middle and a list of the parts below it
function DonutChart({ data, centerLabel }) {
  const total = sum(data);
  if (total === 0) return <NoData />;

  return (
    <div>
      <div className="relative h-[190px]" role="img" aria-label={`${centerLabel}: ${total}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>

        {/* The total, in the hole of the donut */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-white">{total}</span>
          <span className="text-xs text-slate-500">{centerLabel}</span>
        </div>
      </div>

      {/* List of the parts */}
      <ul className="mt-3 space-y-1.5">
        {data.map((slice) => (
          <li key={slice.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
              {slice.name}
            </span>
            <span className="text-slate-300">
              {slice.value} <span className="text-slate-600">({Math.round((slice.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

function DashboardCharts() {
  const { allUsers, adminInfos, managerRequests } = useContext(context);
  const [range, setRange] = useState(14); // how many days the two big charts show

  // 1. Always work with arrays (the context can hold null while loading)
  const users = useMemo(() => (Array.isArray(allUsers) ? allUsers : []), [allUsers]);
  const activities = useMemo(() => (Array.isArray(adminInfos) ? adminInfos : []), [adminInfos]);
  const pendingRequests = Array.isArray(managerRequests) ? managerRequests.length : 0;

  // 2. Turn the lists into chart data (only recalculated when something changes)
  const charts = useMemo(() => {
    const days = lastDays(range);

    return {
      newUsers: countByDay(users, days),
      activityPerDay: countByDay(activities, days),
      byRole: countBy(users, (user) => user.role, ROLE_META),
      byVerified: countBy(
        users,
        (user) => (user.isVerified ? "verified" : "notVerified"),
        {
          verified: { label: "Verified", color: "#34d399" },
          notVerified: { label: "Not verified", color: "#fbbf24" },
        }
      ),
      byType: countBy(activities, (info) => getType(info.message), TYPE_META),
      banned: users.filter((user) => user.isBanned).length,
    };
  }, [users, activities, range]);

  const newInRange = sum(charts.newUsers);

  return (
    <div className="mb-6">
      {/* ===== Title + "last N days" buttons ===== */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <p className="text-xs text-slate-500">Users and activity at a glance</p>
        </div>

        <div className="flex rounded-lg border border-slate-800 bg-[#0f1624] p-1">
          {RANGES.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              aria-pressed={range === days}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                range === days ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* ===== Small numbers ===== */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat icon={Users} label="Total users" value={users.length} tone="border-sky-500/10 bg-sky-500/5 text-sky-400" />
        <MiniStat icon={UserPlus} label={`New in ${range} days`} value={newInRange} tone="border-emerald-500/10 bg-emerald-500/5 text-emerald-400" />
        <MiniStat icon={Clock} label="Pending manager requests" value={pendingRequests} tone="border-amber-500/10 bg-amber-500/5 text-amber-400" />
        <MiniStat icon={Ban} label="Banned users" value={charts.banned} tone="border-rose-500/10 bg-rose-500/5 text-rose-400" />
      </div>

      {/* ===== Two big charts ===== */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="New users" subtitle={`Registrations per day, last ${range} days`}>
          {users.length === 0 ? (
            <NoData />
          ) : (
            <div className="h-[220px]" role="img" aria-label={`New users per day, last ${range} days`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.newUsers} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="newUsersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="New users"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="url(#newUsersFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Activity" subtitle={`Events per day, last ${range} days`}>
          {activities.length === 0 ? (
            <NoData />
          ) : (
            <div className="h-[220px]" role="img" aria-label={`Events per day, last ${range} days`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.activityPerDay} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                  <Bar dataKey="value" name="Events" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ===== Three small charts ===== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChartCard title="Users by role" subtitle="Everyone registered">
          <DonutChart data={charts.byRole} centerLabel="users" />
        </ChartCard>

        <ChartCard title="Email verification" subtitle="Who confirmed their email">
          <DonutChart data={charts.byVerified} centerLabel="users" />
        </ChartCard>

        <ChartCard title="Activity by type" subtitle="All events in the log" className="md:col-span-2 lg:col-span-1">
          {charts.byType.length === 0 ? (
            <NoData />
          ) : (
            <div className="h-[286px]" role="img" aria-label="Number of events for each type">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.byType} layout="vertical" margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={72} />
                  <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                  <Bar dataKey="value" name="Events" radius={[0, 4, 4, 0]}>
                    {charts.byType.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

export default DashboardCharts;