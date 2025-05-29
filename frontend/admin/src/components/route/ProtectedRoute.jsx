// ProtectedRoute.jsx
import { useProfileStore } from '../../stores/ProfileStore';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useProfileStore();

  if (loading) {
    return null; // or a loading spinner if preferred
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
