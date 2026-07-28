import { Navigate, Outlet } from 'react-router-dom';
import { useLandlordAuth } from '@/providers/LandlordAuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

export function LandlordProtectedRoute() {
    const { isAuthenticated, isLoading } = useLandlordAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/landlord/login" replace />;
    }

    return <Outlet />;
}

export function LandlordGuestRoute() {
    const { isAuthenticated, isLoading } = useLandlordAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Skeleton className="h-12 w-48" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/landlord/dashboard" replace />;
    }

    return <Outlet />;
}
