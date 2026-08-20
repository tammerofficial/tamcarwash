import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { isTenantContext } from '@/lib/tenancy';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export function GuestRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export function MarketingRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const tenantPublic = isTenantContext();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        );
    }

    // Platform marketing home: send logged-in users to dashboard.
    // Tenant public home: always show landing for guests and authenticated users.
    if (isAuthenticated && !tenantPublic) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
