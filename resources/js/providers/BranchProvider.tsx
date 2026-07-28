import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import type { Branch, PaginatedResponse } from '@/types/api';

interface BranchContextValue {
    branches: Branch[];
    selectedBranchId: number | null;
    setSelectedBranchId: (id: number | null) => void;
    isLoading: boolean;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);
const STORAGE_KEY = 'tammer_selected_branch';

export function BranchProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLandlord, isLoading: authLoading } = useAuth();
    const [selectedBranchId, setSelectedBranchIdState] = useState<number | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? Number(stored) : null;
    });

    const { data, isLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Branch>>(endpoints.branches, { per_page: 50 });
            return response.data;
        },
        enabled: isAuthenticated && !isLandlord && !authLoading,
        retry: false,
    });

    const branches = data ?? [];

    useEffect(() => {
        if (branches.length > 0 && !selectedBranchId) {
            setSelectedBranchIdState(branches[0].id);
        }
    }, [branches, selectedBranchId]);

    const setSelectedBranchId = (id: number | null) => {
        setSelectedBranchIdState(id);
        if (id) {
            localStorage.setItem(STORAGE_KEY, String(id));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const value = useMemo(
        () => ({ branches, selectedBranchId, setSelectedBranchId, isLoading }),
        [branches, selectedBranchId, isLoading],
    );

    return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch() {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch must be used within BranchProvider');
    }
    return context;
}

export function useBranchQueryParams() {
    const { selectedBranchId } = useBranch();
    return selectedBranchId ? { branch_id: selectedBranchId } : {};
}
