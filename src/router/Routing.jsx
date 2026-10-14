import { Routes, Route } from 'react-router-dom'
import {useContext} from 'react'
import {context} from '../context/context.jsx'
import AuthPage from '../ui/AuthPage.jsx'
import { Navigate } from 'react-router-dom'
import WorkerDashboard from '../ui/worker/pages/HomePage.jsx'
import ManagerDashboard from '../ui/manager/pages/HomePage.jsx'
import WorkerRootLayout from '../ui/worker/WorkerRootLayout.jsx'
import ManagerRootLayout from '../ui/manager/ManagerRootLayout.jsx'
import VerificationPage from '../ui/manager/pages/VerificationPage.jsx'
import ProfilePage from '../ui/ProfilePage.jsx'
import AdminRootLayout from '../ui/admin/AdminRootLayout.jsx'
import AdminDashboard from '../ui/admin/pages/HomePage.jsx'
import AdminUsersPage from '../ui/admin/pages/AllUsersPage.jsx'
import LandingPage from '../ui/LandingPage.jsx'
import PendingPage from '../ui/pendingManager/Pending.jsx'
import AllRequests from '../ui/admin/pages/AllRequests.jsx'
import BannedPage from '../ui/banned/Banned.jsx'
import useAuth from '../hooks/useAuth.jsx'

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/banned" element={<BannedProtectedRoute user={user}><BannedPage onLogout={logout} /></BannedProtectedRoute>} />
            <Route path="/pending" element={<PendingProtectedRoute user={user}><PendingPage /></PendingProtectedRoute>} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/worker" element={<RoleProtectedRoute user={user} role="worker"><WorkerRootLayout /></RoleProtectedRoute>} >
                <Route index element={<WorkerDashboard />} />
                <Route path="me/:id" element={<RoleProtectedRoute user={user} role="worker"><ProfilePage /></RoleProtectedRoute>} />
            </Route>
            <Route path="/manager" element={<RoleProtectedRoute user={user} role="manager"><ManagerRootLayout /></RoleProtectedRoute>} >
                <Route index element={<ManagerDashboard />} />
                <Route path="verification" element={<VerificationPage />} />
                <Route path="me/:id" element={<RoleProtectedRoute user={user} role="manager"><ProfilePage /></RoleProtectedRoute>} />
            </Route>
            <Route path="/admin" element={<AdminProtectedRoute user={user}><AdminRootLayout /></AdminProtectedRoute>} >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="requests" element={<AllRequests />} />
                <Route path="me/:id" element={<AdminProtectedRoute user={user}><ProfilePage /></AdminProtectedRoute>} />
            </Route>
        </Routes>
    )
}
export default Routing