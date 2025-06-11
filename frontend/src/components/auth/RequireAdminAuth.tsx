import { useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

export const RequireAdminAuth: React.FC<RequireAdminAuthProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isLoading) return;

      try {
        if (!isAuthenticated) {
          navigate('/admin-login', { state: { from: location } });
          return;
        }

        if (user?.role.toLowerCase() !== 'admin') {
          navigate('/', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Admin access check failed:', error);
        navigate('/admin-login', { state: { from: location } });
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, isLoading, user, navigate, location]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user?.role.toLowerCase() === 'admin') {
    return <>{children}</>;
  }

  return null;
};
