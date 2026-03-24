import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AdminUserDetail from './pages/AdminUserDetail';

// ✅ Loading spinner — ek jagah define karo
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="spinner" />
  </div>
);

// ✅ Logged OUT hona chahiye (login/register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// ✅ Logged IN hona chahiye
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
};

// ✅ Admin hi access kar sake
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* "/" pe aaye to smart redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes — logged in hain to dashboard */}
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Private routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin"          element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/user/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}