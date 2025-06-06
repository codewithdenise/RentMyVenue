import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface RequireAuthRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RequireAuthRole: React.FC<RequireAuthRoleProps> = ({
  children,
  allowedRoles,
  redirectTo = '/',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateAccess = async () => {
      if (isLoading) return;

      try {
        // Not authenticated, redirect to login
        if (!isAuthenticated || !user) {
          navigate('/admin-login', { state: { from: location } });
          return;
        }
      } catch (error) {
        console.error('Access validation failed:', error);
        navigate('/admin-login', { state: { from: location } });
      }
    };

    validateAccess();
  }, [isAuthenticated, isLoading, user, navigate, location, allowedRoles, redirectTo]);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Only render if authenticated and role is valid
  if (isAuthenticated && user && allowedRoles.includes(user.role.toLowerCase() as UserRole)) {
    return <>{children}</>;
  }

  // Otherwise render nothing while redirect happens
  return null;
};
