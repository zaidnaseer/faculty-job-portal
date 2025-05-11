import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user || !allowedRoles.includes(user.role)) {
    alert("You don't have permission to access this page");
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
