import { ReactNode } from 'react';
import { Role } from '../types';
import { useAuthStore } from '../store/authStore';

export function RoleGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) {
    return (
      <div className="card text-center">
        <p className="text-slate-500">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
