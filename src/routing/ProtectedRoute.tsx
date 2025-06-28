import { useUser } from '@/store/store';
import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userAccessibleRoutes = ['/dashboard', '/device', '/device/', '/dashboard/'];
    const hasAccess = userAccessibleRoutes.includes(location.pathname);
    if (user?.role === 'User' && !hasAccess) {
      navigate('/dashboard');
    }
  }, [location, user]);

  return <Outlet />;
};

export default ProtectedRoute;
