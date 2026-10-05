import { Routes, Route } from 'react-router-dom'
import toast from 'react-hot-toast'
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

const Routing = () => {
    const {user} = useContext(context)
    const ProtectedRoute = ({ children }) => {
        if (!user) {
            return <Navigate to="/" replace />;
        }
        return children;
    };
    const AdminProtectedRoute = ({ children }) => {
        if (!user || user.role !== "admin") {
            return <Navigate to="/" replace />;
        }
        return children;
    };
    return (
        <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/worker" element={<ProtectedRoute><WorkerRootLayout /></ProtectedRoute>} >
                <Route index element={<WorkerDashboard />} />
                <Route path="me/:id" element={<ProfilePage />} />
            </Route>
            <Route path="/manager" element={<ProtectedRoute><ManagerRootLayout /></ProtectedRoute>} >
                <Route index element={<ManagerDashboard />} />
                <Route path="verification" element={<VerificationPage />} />
                <Route path="me/:id" element={<ProfilePage />} />
            </Route>
            <Route path="/admin" element={<AdminProtectedRoute><AdminRootLayout /></AdminProtectedRoute>} >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
            </Route>
        </Routes>
    )
}
export default Routing