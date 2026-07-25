import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) return <Navigate to="/admin/login" replace />;

  try {
    const decoded = JSON.parse(atob(adminToken.split('.')[1]));
    if (decoded.role !== 'ADMIN') {
      localStorage.removeItem('adminToken');
      return <Navigate to="/admin/login" replace />;
    }
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('adminToken');
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
