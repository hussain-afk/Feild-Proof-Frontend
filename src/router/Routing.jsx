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

const RoleProtectedRoute = ({ children, role, user }) => {
        if (!user || user.role !== role) {
            return <Navigate to="/" replace />;
        }
        return children;
};

const AdminProtectedRoute = ({ children, user }) => {
        if (!user || user.role !== "admin") {
            return <Navigate to="/" replace />;
        }
        return children;
};

const Routing = () => {
    const {user} = useContext(context)
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
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
            </Route>
        </Routes>
    )
}
export default Routing