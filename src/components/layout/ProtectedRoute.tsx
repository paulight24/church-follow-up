import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  /**
   * Permission code(s) required to access this route. A string[] is an OR
   * match — the user needs at least one of the listed codes (useful when a
   * page is reachable via more than one permission, e.g. a "view all" vs a
   * "view own" variant).
   */
  permission?: string | string[];
  roles?: UserRole[];
  children?: ReactNode;
}

function AccessDeniedState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <EmptyState
        icon={ShieldAlert}
        title="Access denied"
        description="You don't have permission to access this page. Please contact your administrator if you believe this is an error."
        action={
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    </div>
  );
}

export function ProtectedRoute({ permission, roles, children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasPermission, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission) {
    const permissionCodes = Array.isArray(permission) ? permission : [permission];
    if (!permissionCodes.some((code) => hasPermission(code))) {
      return <AccessDeniedState />;
    }
  }

  if (roles && roles.length > 0 && !roles.some((role) => hasRole(role))) {
    return <AccessDeniedState />;
  }

  return children ? <>{children}</> : <Outlet />;
}
