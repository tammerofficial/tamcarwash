import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiClientError, endpoints } from '@/lib/api';
import type { ApiResponse, User } from '@/types/api';

interface LandlordAuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const LandlordAuthContext = createContext<LandlordAuthContextValue | undefined>(undefined);

export function LandlordAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get<ApiResponse<User>>(endpoints.landlord.user);
            setUser(response.data);
        } catch (error: unknown) {
            if (error instanceof ApiClientError && error.status === 401) {
                setUser(null);
                return;
            }
            setUser(null);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                await api.ensureCsrfCookie();
                if (!cancelled) {
                    await refreshUser();
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [refreshUser]);

    const login = useCallback(async (email: string, password: string, remember = false) => {
        await api.ensureCsrfCookie();
        const response = await api.post<ApiResponse<{ user: User }>>(
            endpoints.landlord.login,
            { email, password, remember },
            undefined,
            { baseUrl: 'landlord' },
        );
        setUser(response.data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post(endpoints.landlord.logout, undefined, undefined, { baseUrl: 'landlord' });
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshUser,
        }),
        [user, isLoading, login, logout, refreshUser],
    );

    return <LandlordAuthContext.Provider value={value}>{children}</LandlordAuthContext.Provider>;
}

export function useLandlordAuth() {
    const context = useContext(LandlordAuthContext);
    if (!context) {
        throw new Error('useLandlordAuth must be used within LandlordAuthProvider');
    }
    return context;
}
