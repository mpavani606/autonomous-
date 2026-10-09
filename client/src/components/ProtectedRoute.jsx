import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isCheckingSession, user } = useAuth();
  if (isCheckingSession) {
    return <div className="auth-shell" role="status">Checking your session...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  if (!requiredRole && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default ProtectedRoute;
