import { Suspense, useContext } from "react";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { context } from "../context/context.jsx";
import useAuth from "../hooks/useAuth.jsx";
import LoadingState from "../ui/LoadingState.jsx";
import { lazyWithRetry } from "../utils/LazyWithRetry.jsx";

const AuthPage = lazyWithRetry(() => import("../ui/AuthPage.jsx"));
const WorkerDashboard = lazyWithRetry(() =>
  import("../ui/worker/pages/HomePage.jsx")
);
const ManagerDashboard = lazyWithRetry(() =>
  import("../ui/manager/pages/HomePage.jsx")
);
const WorkerRootLayout = lazyWithRetry(() =>
  import("../ui/worker/WorkerRootLayout.jsx")
);
const ManagerRootLayout = lazyWithRetry(() =>
  import("../ui/manager/ManagerRootLayout.jsx")
);
const VerificationPage = lazyWithRetry(() =>
  import("../ui/manager/pages/VerificationPage.jsx")
);
const ReviewedTasks = lazyWithRetry(() => import("../ui/ReviewedTasks.jsx"));
const ProfilePage = lazyWithRetry(() => import("../ui/ProfilePage.jsx"));
const AdminRootLayout = lazyWithRetry(() =>
  import("../ui/admin/AdminRootLayout.jsx")
);
const AdminDashboard = lazyWithRetry(() =>
  import("../ui/admin/pages/HomePage.jsx")
);
const AdminUsersPage = lazyWithRetry(() =>
  import("../ui/admin/pages/AllUsersPage.jsx")
);
const LandingPage = lazyWithRetry(() => import("../ui/LandingPage.jsx"));
const PendingPage = lazyWithRetry(() =>
  import("../ui/pendingManager/Pending.jsx")
);
const AllRequests = lazyWithRetry(() =>
  import("../ui/admin/pages/AllRequests.jsx")
);
const BannedPage = lazyWithRetry(() => import("../ui/banned/Banned.jsx"));
const AddPlanPage = lazyWithRetry(() =>
  import("../ui/admin/pages/AddPlanPage.jsx")
);
const AllPlansPage = lazyWithRetry(() =>
  import("../ui/manager/pages/AllPlansPage.jsx")
);
const ManagerChatPage = lazyWithRetry(() =>
  import("../ui/manager/pages/ChatPage.jsx")
);
const WorkerChatPage = lazyWithRetry(() =>
  import("../ui/worker/pages/ChatPage.jsx")
);
const MaintenanceSettings = lazyWithRetry(() =>
  import("../ui/admin/pages/MaintenanceSettingPage.jsx")
);
const AvalaibleWorkersPage = lazyWithRetry(() =>
  import("../ui/manager/pages/AvalaibleWorkersPage.jsx")
);
const ManagerPendingInvitesPage = lazyWithRetry(() =>
  import("../ui/manager/pages/PendingInvitesPage.jsx")
);
const WorkerPendingInvitesPage = lazyWithRetry(() =>
  import("../ui/worker/pages/MyInvitesPage.jsx")
);

const Page = ({ children }) => (
  <Suspense fallback={<LoadingState />}>{children}</Suspense>
);

const isFreeWorker = (user) =>
  user?.role === "worker" && !user?.managerId;

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
        <Route
          path="my-invites"
          element={
            <Page>
              <WorkerPendingInvitesPage />
            </Page>
          }
        />
        <Route
          path="me/:id"
          element={
            <Page>
              <ProfilePage />
            </Page>
          }
        />
        <Route
          path="chat"
          element={
            <Page>
              <WorkerChatPage />
            </Page>
          }
        />

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
        <Route path="plans" element={<Page><AllPlansPage /></Page>} />
        <Route path="chat" element={<Page><ManagerChatPage /></Page>} />
        <Route
          path="pending-invites"
          element={<Page><ManagerPendingInvitesPage /></Page>}
        />
        <Route path="reviewed" element={<Page><ReviewedTasks /></Page>} />
        <Route path="me/:id" element={<Page><ProfilePage /></Page>} />
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
        <Route
          path="maintenance"
          element={<Page><MaintenanceSettings /></Page>}
        />
        <Route path="requests" element={<Page><AllRequests /></Page>} />
        <Route path="add-plan" element={<Page><AddPlanPage /></Page>} />
        <Route path="me/:id" element={<Page><ProfilePage /></Page>} />
      </Route>
    </Routes>
  );
};

export default Routing;