import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  permission?: string;
  roles?: UserRole[];
  children?: ReactNode;
}

function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <ShieldAlert className="h-8 w-8 text-rose-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="mb-8 text-sm text-slate-500">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ permission, roles, children }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasPermission, hasRole } = useAuth();

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

  if (permission && !hasPermission(permission)) {
    return <ForbiddenPage />;
  }

  if (roles && roles.length > 0 && !roles.some((role) => hasRole(role))) {
    return <ForbiddenPage />;
  }

  return children ? <>{children}</> : <Outlet />;
}
