import { lazy, Suspense, useContext } from "react";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { context } from "../context/context.jsx";
import useAuth from "../hooks/useAuth.jsx";
import LoadingState from "../ui/LoadingState.jsx";

const AuthPage = lazy(() => import("../ui/AuthPage.jsx"));
const WorkerDashboard = lazy(() => import("../ui/worker/pages/HomePage.jsx"));
const ManagerDashboard = lazy(() => import("../ui/manager/pages/HomePage.jsx"));
const WorkerRootLayout = lazy(() => import("../ui/worker/WorkerRootLayout.jsx"));
const ManagerRootLayout = lazy(() => import("../ui/manager/ManagerRootLayout.jsx"));
const VerificationPage = lazy(() =>
  import("../ui/manager/pages/VerificationPage.jsx")
);
const ReviewedTasks = lazy(() => import("../ui/ReviewedTasks.jsx"));
const ProfilePage = lazy(() => import("../ui/ProfilePage.jsx"));
const AdminRootLayout = lazy(() => import("../ui/admin/AdminRootLayout.jsx"));
const AdminDashboard = lazy(() => import("../ui/admin/pages/HomePage.jsx"));
const AdminUsersPage = lazy(() => import("../ui/admin/pages/AllUsersPage.jsx"));
const LandingPage = lazy(() => import("../ui/LandingPage.jsx"));
const PendingPage = lazy(() => import("../ui/pendingManager/Pending.jsx"));
const AllRequests = lazy(() => import("../ui/admin/pages/AllRequests.jsx"));
const BannedPage = lazy(() => import("../ui/banned/Banned.jsx"));
const MaintenanceSettings = lazy(() =>
  import("../ui/admin/pages/MaintenanceSettingPage.jsx")
);
const AvalaibleWorkersPage = lazy(() =>
  import("../ui/manager/pages/AvalaibleWorkersPage.jsx")
);
const ManagerPendingInvitesPage = lazy(() =>
  import("../ui/manager/pages/PendingInvitesPage.jsx")
);
const WorkerPendingInvitesPage = lazy(() =>
  import("../ui/worker/pages/MyInvitesPage.jsx")
);

const Page = ({ children }) => (
  <Suspense fallback={<LoadingState />}>{children}</Suspense>
);

// Worker abhi kisi team mein nahi
const isFreeWorker = (user) =>
  user?.role === "worker" && !user?.managerId;

// Login ke baad kahan bhejna hai
const homePathFor = (user) => {
  if (!user) return "/auth";
  if (user.isBanned) return "/banned";
  if (user.role === "pending_manager") return "/pending";
  if (isFreeWorker(user)) return "/worker/my-invites";
  return `/${user.role}`;
};

const AuthProtectedRoute = ({ children, user }) => {
  if (user) {
    return <Navigate to={homePathFor(user)} replace />;
  }
  return children;
};

const RoleProtectedRoute = ({ children, role, user }) => {
  if (!user || user.role !== role) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Team wale pages — free worker ko invites pe bhejo
const RequireWorkerTeam = ({ user }) => {
  if (isFreeWorker(user)) {
    return <Navigate to="/worker/my-invites" replace />;
  }
  return <Outlet />;
};

const PendingProtectedRoute = ({ children, user }) => {
  if (!user || user.role !== "pending_manager") {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const BannedProtectedRoute = ({ children, user }) => {
  if (!user || !user.isBanned) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children, user }) => {
  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const Routing = () => {
  const { user } = useContext(context);
  const { logout } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Page><LandingPage /></Page>} />

      <Route
        path="/banned"
        element={
          <BannedProtectedRoute user={user}>
            <Page>
              <BannedPage onLogout={logout} />
            </Page>
          </BannedProtectedRoute>
        }
      />

      <Route
        path="/pending"
        element={
          <PendingProtectedRoute user={user}>
            <Page>
              <PendingPage />
            </Page>
          </PendingProtectedRoute>
        }
      />

      <Route
        path="/auth"
        element={
          <Page>
            <AuthProtectedRoute user={user}>
              <AuthPage />
            </AuthProtectedRoute>
          </Page>
        }
      />

      {/* -------- WORKER -------- */}
      <Route
        path="/worker"
        element={
          <RoleProtectedRoute user={user} role="worker">
            <Page>
              <WorkerRootLayout />
            </Page>
          </RoleProtectedRoute>
        }
      >
        {/* Free worker bhi yeh dekh sakta hai */}
        <Route
          path="my-invites"
          element={
            <Page>
              <WorkerPendingInvitesPage />
            </Page>
          }
        />

        {/* Optional: profile free worker ko bhi */}
        <Route
          path="me/:id"
          element={
            <Page>
              <ProfilePage />
            </Page>
          }
        />

        {/* Baaki pages — team zaroori */}
        <Route element={<RequireWorkerTeam user={user} />}>
          <Route
            index
            element={
              <Page>
                <WorkerDashboard />
              </Page>
            }
          />
          <Route
            path="reviewed"
            element={
              <Page>
                <ReviewedTasks />
              </Page>
            }
          />
        </Route>
      </Route>

      {/* -------- MANAGER -------- */}
      <Route
        path="/manager"
        element={
          <RoleProtectedRoute user={user} role="manager">
            <Page>
              <ManagerRootLayout />
            </Page>
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Page><ManagerDashboard /></Page>} />
        <Route path="verification" element={<Page><VerificationPage /></Page>} />
        <Route
          path="available-workers"
          element={<Page><AvalaibleWorkersPage /></Page>}
        />
        <Route
          path="pending-invites"
          element={<Page><ManagerPendingInvitesPage /></Page>}
        />
        <Route path="reviewed" element={<Page><ReviewedTasks /></Page>} />
        <Route
          path="me/:id"
          element={<Page><ProfilePage /></Page>}
        />
      </Route>

      {/* -------- ADMIN -------- */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute user={user}>
            <Page>
              <AdminRootLayout />
            </Page>
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Page><AdminDashboard /></Page>} />
        <Route path="users" element={<Page><AdminUsersPage /></Page>} />
        <Route path="maintenance" element={<Page><MaintenanceSettings /></Page>} />
        <Route path="requests" element={<Page><AllRequests /></Page>} />
        <Route path="me/:id" element={<Page><ProfilePage /></Page>} />
      </Route>
    </Routes>
  );
};

export default Routing;