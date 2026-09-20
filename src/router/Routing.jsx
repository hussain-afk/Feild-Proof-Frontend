import { Routes, Route } from 'react-router-dom'
import {useContext} from 'react'
import {context} from '../context/context.jsx'
import AuthPage from '../ui/AuthPage.jsx'
import { Navigate } from 'react-router-dom'
import WorkerDashboard from '../ui/worker/pages/HomePage.jsx'
import ManagerDashboard from '../ui/manager/pages/HomePage.jsx'
import WorkerRootLayout from '../ui/worker/WorkerRootLayout.jsx'
import ManagerRootLayout from '../ui/manager/ManagerRootLayout.jsx'

const Routing = () => {
    const {user} = useContext(context)
    const ProtectedRoute = ({ children }) => {
        if (!user) {
            return <Navigate to="/auth" replace />;
        }
        return children;
    };
    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/worker" element={<ProtectedRoute><WorkerRootLayout /></ProtectedRoute>} >
                <Route index element={<WorkerDashboard />} />
            </Route>
            <Route path="/manager" element={<ProtectedRoute><ManagerRootLayout /></ProtectedRoute>} >
                <Route index element={<ManagerDashboard />} />
            </Route>
        </Routes>
    )
}
export default Routing