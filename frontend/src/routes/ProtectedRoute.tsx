import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user, initialized, fetchMe } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token && !initialized && !user) {
      void fetchMe();
    }
  }, [token, initialized, user, fetchMe]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
