import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiClientError, appConfig, endpoints } from '@/lib/api';
import type { ApiResponse, LoginPayload, LoginResponse, User } from '@/types/api';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isLandlord: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get<ApiResponse<User>>(endpoints.auth.user);
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
        refreshUser().finally(() => setIsLoading(false));
    }, [refreshUser]);

    const login = useCallback(async (payload: LoginPayload) => {
        await api.ensureCsrfCookie();

        const response = await api.post<ApiResponse<LoginResponse>>(endpoints.auth.login, {
            email: payload.email,
            password: payload.password,
            remember: payload.remember === true,
        });
        setUser(response.data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post(endpoints.auth.logout);
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: !!user,
            isLandlord: appConfig.isLandlord,
            login,
            logout,
            refreshUser,
        }),
        [user, isLoading, login, logout, refreshUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
