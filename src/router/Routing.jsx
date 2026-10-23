import { lazy, Suspense, useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { context } from "../context/context.jsx";
import useAuth from "../hooks/useAuth.jsx";
import LoadingState from "../ui/LoadingState.jsx";

// Every page is loaded only when the user opens it (each one becomes its own small file)
const AuthPage = lazy(() => import('../ui/AuthPage.jsx'))
const WorkerDashboard = lazy(() => import('../ui/worker/pages/HomePage.jsx'))
const ManagerDashboard = lazy(() => import('../ui/manager/pages/HomePage.jsx'))
const WorkerRootLayout = lazy(() => import('../ui/worker/WorkerRootLayout.jsx'))
const ManagerRootLayout = lazy(() => import('../ui/manager/ManagerRootLayout.jsx'))
const VerificationPage = lazy(() => import('../ui/manager/pages/VerificationPage.jsx'))
const ReviewedTasks = lazy(() => import('../ui/ReviewedTasks.jsx'))
const ProfilePage = lazy(() => import('../ui/ProfilePage.jsx'))
const AdminRootLayout = lazy(() => import('../ui/admin/AdminRootLayout.jsx'))
const AdminDashboard = lazy(() => import('../ui/admin/pages/HomePage.jsx'))
const AdminUsersPage = lazy(() => import('../ui/admin/pages/AllUsersPage.jsx'))
const LandingPage = lazy(() => import('../ui/LandingPage.jsx'))
const PendingPage = lazy(() => import('../ui/pendingManager/Pending.jsx'))
const AllRequests = lazy(() => import('../ui/admin/pages/AllRequests.jsx'))
const BannedPage = lazy(() => import('../ui/banned/Banned.jsx'))
const MaintenanceSettings = lazy(() => import('../ui/admin/pages/MaintenanceSettingPage.jsx'))

// Shows the loading state while the page file is downloading
const Page = ({ children }) => (
    <Suspense fallback={<LoadingState />}>{children}</Suspense>
);

const AuthProtectedRoute = ({ children, user }) => {
        if (user) {
            return <Navigate to={`/${user.role}`} replace />;
        }
        return children;
};

const RoleProtectedRoute = ({ children, role, user }) => {
        if (!user || user.role !== role) {
            return <Navigate to="/auth" replace />;
        }
        return children;
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
    const {user} = useContext(context)
    const { logout } = useAuth()
    return (
        <Routes>
            <Route path="/" element={<Page><LandingPage /></Page>} />
            <Route path="/banned" element={<BannedProtectedRoute user={user}><Page><BannedPage onLogout={logout} /></Page></BannedProtectedRoute>} />
            <Route path="/pending" element={<PendingProtectedRoute user={user}><Page><PendingPage /></Page></PendingProtectedRoute>} />
            <Route path="/auth" element={<Page><AuthProtectedRoute user={user}><AuthPage /></AuthProtectedRoute></Page>} />
            <Route path="/worker" element={<RoleProtectedRoute user={user} role="worker"><Page><WorkerRootLayout /></Page></RoleProtectedRoute>} >
                <Route index element={<Page><WorkerDashboard /></Page>} />
                <Route path="reviewed" element={<Page><ReviewedTasks /></Page>} />
                <Route path="me/:id" element={<RoleProtectedRoute user={user} role="worker"><Page><ProfilePage /></Page></RoleProtectedRoute>} />
            </Route>
            <Route path="/manager" element={<RoleProtectedRoute user={user} role="manager"><Page><ManagerRootLayout /></Page></RoleProtectedRoute>} >
                <Route index element={<Page><ManagerDashboard /></Page>} />
                <Route path="verification" element={<Page><VerificationPage /></Page>} />
                <Route path="reviewed" element={<Page><ReviewedTasks /></Page>} />
                <Route path="me/:id" element={<RoleProtectedRoute user={user} role="manager"><Page><ProfilePage /></Page></RoleProtectedRoute>} />
            </Route>
            <Route path="/admin" element={<AdminProtectedRoute user={user}><Page><AdminRootLayout /></Page></AdminProtectedRoute>} >
                <Route index element={<Page><AdminDashboard /></Page>} />
                <Route path="users" element={<Page><AdminUsersPage /></Page>} />
                <Route path="maintenance" element={<Page><MaintenanceSettings /></Page>} />
                <Route path="requests" element={<Page><AllRequests /></Page>} />
                <Route path="me/:id" element={<AdminProtectedRoute user={user}><Page><ProfilePage /></Page></AdminProtectedRoute>} />
            </Route>
        </Routes>
    )
}
export default Routing