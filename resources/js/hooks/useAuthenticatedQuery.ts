import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';

export function useAuthenticatedQuery<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends readonly unknown[] = readonly unknown[],
>(
    options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
    const { isAuthenticated, isLandlord, isLoading: authLoading } = useAuth();
    const enabled =
        (options.enabled ?? true) && isAuthenticated && !isLandlord && !authLoading;

    return useQuery({
        ...options,
        enabled,
        retry: options.retry ?? false,
    });
}
